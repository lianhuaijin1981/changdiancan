"""
畅点餐 - 菜品管理路由
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional

from app.database import get_db
from app import models, schemas
from app.models import Dish, Category, Store
from app.auth import require_auth, get_optional_user
from app.routers.audit import create_audit_log

router = APIRouter(tags=["菜品"])


@router.get("/", response_model=schemas.ResponseModel)
def list_dishes(
    store_id: int = Query(..., description="门店ID"),
    category_id: Optional[int] = Query(None, description="分类ID"),
    status: Optional[int] = Query(None, description="状态: 0下架 1上架 2售罄"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    db: Session = Depends(get_db),
):
    """获取菜品列表，支持分类、状态、关键词筛选"""
    query = db.query(Dish, Category.name.label("category_name")).join(
        Category, Dish.category_id == Category.id
    ).filter(Dish.store_id == store_id)

    if category_id:
        query = query.filter(Dish.category_id == category_id)
    if status is not None:
        query = query.filter(Dish.status == status)
    if keyword:
        query = query.filter(
            or_(
                Dish.name.contains(keyword),
                Dish.description.contains(keyword),
                Dish.tags.contains(keyword),
            )
        )

    results = query.order_by(Dish.is_featured.desc(), Dish.created_at.desc()).all()

    dishes = []
    for dish, category_name in results:
        dish_dict = {
            "id": dish.id,
            "store_id": dish.store_id,
            "category_id": dish.category_id,
            "name": dish.name,
            "description": dish.description,
            "image": dish.image,
            "price": dish.price,
            "original_price": dish.original_price,
            "stock": dish.stock,
            "status": dish.status,
            "specs": dish.specs,
            "tags": dish.tags,
            "is_featured": dish.is_featured,
            "sales_count": dish.sales_count,
            "created_at": dish.created_at,
            "category_name": category_name,
        }
        dishes.append(dish_dict)

    return {"code": 200, "message": "success", "data": dishes}


@router.get("/{id}", response_model=schemas.ResponseModel)
def get_dish(id: int, db: Session = Depends(get_db)):
    """获取菜品详情"""
    result = (
        db.query(Dish, Category.name.label("category_name"))
        .join(Category, Dish.category_id == Category.id)
        .filter(Dish.id == id)
        .first()
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    dish, category_name = result
    data = {
        "id": dish.id,
        "store_id": dish.store_id,
        "category_id": dish.category_id,
        "name": dish.name,
        "description": dish.description,
        "image": dish.image,
        "price": dish.price,
        "original_price": dish.original_price,
        "stock": dish.stock,
        "status": dish.status,
        "specs": dish.specs,
        "tags": dish.tags,
        "is_featured": dish.is_featured,
        "sales_count": dish.sales_count,
        "created_at": dish.created_at,
        "category_name": category_name,
    }

    return {"code": 200, "message": "success", "data": data}


@router.post("/", response_model=schemas.ResponseModel)
def create_dish(
    dish: schemas.DishCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """创建菜品"""
    # 验证门店是否存在
    store = db.query(Store).filter(Store.id == dish.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="门店不存在"
        )

    # 验证分类是否存在且属于该门店
    category = (
        db.query(Category)
        .filter(
            Category.id == dish.category_id,
            Category.store_id == dish.store_id,
        )
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="分类不存在或不属于该门店",
        )

    db_dish = Dish(**dish.model_dump())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)

    return {"code": 200, "message": "菜品创建成功", "data": db_dish}


@router.put("/{id}", response_model=schemas.ResponseModel)
def update_dish(
    id: int,
    dish_update: schemas.DishUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """更新菜品（带审计日志）"""
    db_dish = db.query(Dish).filter(Dish.id == id).first()
    if not db_dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    old_data = {
        "name": db_dish.name,
        "price": db_dish.price,
        "stock": db_dish.stock,
        "status": db_dish.status,
    }

    update_data = dish_update.model_dump(exclude_unset=True)

    # 如果更新分类，验证分类存在
    if "category_id" in update_data:
        store_id = update_data.get("store_id", db_dish.store_id)
        category = (
            db.query(Category)
            .filter(
                Category.id == update_data["category_id"],
                Category.store_id == store_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="分类不存在或不属于该门店",
            )

    # 如果更新门店，验证门店存在
    if "store_id" in update_data:
        store = db.query(Store).filter(Store.id == update_data["store_id"]).first()
        if not store:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="门店不存在"
            )

    for field, value in update_data.items():
        setattr(db_dish, field, value)

    db.commit()
    db.refresh(db_dish)

    # 记录审计日志
    update_fields = ", ".join([f"{k}={v}" for k, v in update_data.items()])
    try:
        create_audit_log(
            db,
            action="update_dish",
            target_type="dish",
            target_id=db_dish.id,
            detail=f"更新菜品 '{db_dish.name}'，修改字段: {update_fields}，修改前: {old_data}",
            user_id=current_user.id if current_user else None,
        )
    except Exception:
        pass  # 审计日志失败不影响主业务

    return {"code": 200, "message": "菜品更新成功", "data": db_dish}


@router.delete("/{id}", response_model=schemas.ResponseModel)
def delete_dish(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """软删除菜品（将状态设为下架）"""
    db_dish = db.query(Dish).filter(Dish.id == id).first()
    if not db_dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    db_dish.status = 0
    db.commit()

    return {"code": 200, "message": "菜品已下架", "data": {"id": id}}


@router.put("/{id}/stock", response_model=schemas.ResponseModel)
def update_stock(
    id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """更新菜品库存"""
    db_dish = db.query(Dish).filter(Dish.id == id).first()
    if not db_dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    db_dish.stock = quantity
    # 自动更新售罄状态
    if quantity <= 0:
        db_dish.status = 2
    elif db_dish.status == 2:
        db_dish.status = 1

    db.commit()
    db.refresh(db_dish)

    return {
        "code": 200,
        "message": "库存更新成功",
        "data": {"id": id, "stock": db_dish.stock, "status": db_dish.status},
    }


@router.put("/{id}/status", response_model=schemas.ResponseModel)
def toggle_status(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """切换菜品上下架状态"""
    db_dish = db.query(Dish).filter(Dish.id == id).first()
    if not db_dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    # 切换状态: 下架(0) <-> 上架(1)
    if db_dish.status == 1:
        db_dish.status = 0
    elif db_dish.status == 0:
        db_dish.status = 1
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="售罄状态的菜品无法直接上下架，请先补充库存",
        )

    db.commit()
    db.refresh(db_dish)

    status_map = {0: "已下架", 1: "已上架"}
    return {
        "code": 200,
        "message": f"菜品{status_map.get(db_dish.status, '')}",
        "data": {"id": id, "status": db_dish.status},
    }


@router.put("/{id}/featured", response_model=schemas.ResponseModel)
def toggle_featured(
    id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_auth),
):
    """切换菜品推荐状态"""
    db_dish = db.query(Dish).filter(Dish.id == id).first()
    if not db_dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    db_dish.is_featured = not db_dish.is_featured
    db.commit()
    db.refresh(db_dish)

    return {
        "code": 200,
        "message": f"菜品已{'设为推荐' if db_dish.is_featured else '取消推荐'}",
        "data": {"id": id, "is_featured": db_dish.is_featured},
    }


@router.get("/featured/list", response_model=schemas.ResponseModel)
def list_featured_dishes(
    store_id: int = Query(..., description="门店ID"),
    db: Session = Depends(get_db),
):
    """获取推荐菜品列表"""
    results = (
        db.query(Dish, Category.name.label("category_name"))
        .join(Category, Dish.category_id == Category.id)
        .filter(
            Dish.store_id == store_id,
            Dish.is_featured == True,
            Dish.status == 1,
        )
        .order_by(Dish.sales_count.desc())
        .all()
    )

    dishes = []
    for dish, category_name in results:
        dish_dict = {
            "id": dish.id,
            "store_id": dish.store_id,
            "category_id": dish.category_id,
            "name": dish.name,
            "description": dish.description,
            "image": dish.image,
            "price": dish.price,
            "original_price": dish.original_price,
            "stock": dish.stock,
            "status": dish.status,
            "specs": dish.specs,
            "tags": dish.tags,
            "is_featured": dish.is_featured,
            "sales_count": dish.sales_count,
            "created_at": dish.created_at,
            "category_name": category_name,
        }
        dishes.append(dish_dict)

    return {"code": 200, "message": "success", "data": dishes}
