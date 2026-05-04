"""
畅点餐 - 库存管理路由
低库存预警、库存摘要、库存调整
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.database import get_db
from app import models, schemas
from app.models import Dish, Store
from app.auth import require_auth

router = APIRouter(tags=["库存管理"])


@router.get("/low-stock", response_model=schemas.ResponseModel)
def get_low_stock_dishes(
    store_id: int = Query(..., description="门店ID"),
    threshold: int = Query(10, ge=0, description="库存阈值，默认10"),
    db: Session = Depends(get_db),
):
    """获取低库存菜品列表（库存 <= threshold）

    - 返回库存不足或已售罄的菜品
    - 按库存量升序排列（最紧缺的在前）
    """
    # 验证门店存在
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="门店不存在"
        )

    dishes = (
        db.query(Dish)
        .filter(
            Dish.store_id == store_id,
            Dish.stock <= threshold,
        )
        .order_by(Dish.stock.asc())
        .all()
    )

    result = []
    for dish in dishes:
        stock_status = "out_of_stock" if dish.stock == 0 else "low_stock" if dish.stock <= threshold else "normal"
        result.append({
            "id": dish.id,
            "name": dish.name,
            "category_id": dish.category_id,
            "price": dish.price,
            "stock": dish.stock,
            "status": dish.status,
            "stock_status": stock_status,
            "is_featured": dish.is_featured,
            "sales_count": dish.sales_count,
        })

    return {
        "code": 200,
        "message": "success",
        "data": {
            "store_id": store_id,
            "threshold": threshold,
            "count": len(result),
            "items": result,
        },
    }


@router.get("/summary", response_model=schemas.ResponseModel)
def get_inventory_summary(
    store_id: int = Query(..., description="门店ID"),
    threshold: int = Query(10, ge=0, description="低库存阈值"),
    db: Session = Depends(get_db),
):
    """获取门店库存摘要统计

    返回：
    - total_items: 菜品总数量
    - low_stock_count: 低库存菜品数（stock <= threshold 且 stock > 0）
    - out_of_stock_count: 售罄菜品数（stock == 0）
    - normal_stock_count: 正常库存菜品数（stock > threshold）
    """
    # 验证门店存在
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="门店不存在"
        )

    total_items = (
        db.query(func.count(Dish.id))
        .filter(Dish.store_id == store_id)
        .scalar()
    ) or 0

    out_of_stock_count = (
        db.query(func.count(Dish.id))
        .filter(Dish.store_id == store_id, Dish.stock == 0)
        .scalar()
    ) or 0

    low_stock_count = (
        db.query(func.count(Dish.id))
        .filter(
            Dish.store_id == store_id,
            Dish.stock > 0,
            Dish.stock <= threshold,
        )
        .scalar()
    ) or 0

    normal_stock_count = (
        db.query(func.count(Dish.id))
        .filter(Dish.store_id == store_id, Dish.stock > threshold)
        .scalar()
    ) or 0

    return {
        "code": 200,
        "message": "success",
        "data": {
            "store_id": store_id,
            "threshold": threshold,
            "total_items": total_items,
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
            "normal_stock_count": normal_stock_count,
        },
    }


@router.put("/dishes/{id}/stock", response_model=schemas.ResponseModel)
def update_dish_stock(
    id: int,
    req: schemas.StockUpdateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """更新菜品库存数量

    - quantity: 新库存值（>= 0）
    - 库存为 0 时自动将菜品标记为售罄（status=2）
    - 从 0 补货时自动恢复上架（status=1）
    """
    dish = db.query(Dish).filter(Dish.id == id).first()
    if not dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    old_stock = dish.stock
    dish.stock = req.quantity

    # 自动更新菜品状态
    if req.quantity <= 0:
        dish.status = 2  # 售罄
    elif old_stock == 0 and req.quantity > 0 and dish.status == 2:
        # 从售罄恢复为有库存，自动上架
        dish.status = 1  # 上架

    db.commit()
    db.refresh(dish)

    return {
        "code": 200,
        "message": "库存更新成功",
        "data": {
            "id": dish.id,
            "name": dish.name,
            "old_stock": old_stock,
            "new_stock": dish.stock,
            "status": dish.status,
        },
    }


@router.post("/dishes/{id}/restock", response_model=schemas.ResponseModel)
def restock_dish(
    id: int,
    add_quantity: int = Query(..., ge=1, description="增加的库存数量"),
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """补货（在现有库存基础上增加）"""
    dish = db.query(Dish).filter(Dish.id == id).first()
    if not dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    old_stock = dish.stock
    dish.stock += add_quantity

    # 如果之前是售罄状态，补货后恢复上架
    if old_stock == 0 and dish.status == 2:
        dish.status = 1

    db.commit()
    db.refresh(dish)

    return {
        "code": 200,
        "message": "补货成功",
        "data": {
            "id": dish.id,
            "name": dish.name,
            "old_stock": old_stock,
            "added": add_quantity,
            "new_stock": dish.stock,
            "status": dish.status,
        },
    }
