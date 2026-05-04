"""
畅点餐 - 分类路由
处理菜品分类的增删改查、显示/隐藏切换及排序调整
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app import schemas
from app.models import Category, Store

router = APIRouter(tags=["分类"])


# ---- 列出门店的所有分类 ----

@router.get("/", response_model=List[schemas.CategoryResponse])
def list_categories(
    store_id: int = Query(..., description="门店ID"),
    db: Session = Depends(get_db),
):
    """根据门店ID获取分类列表，按 sort_order 升序排列"""
    # 校验门店是否存在
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    return (
        db.query(Category)
        .filter(Category.store_id == store_id)
        .order_by(Category.sort_order.asc())
        .all()
    )


# ---- 获取分类详情 ----

@router.get("/{id}", response_model=schemas.CategoryResponse)
def get_category(
    id: int,
    db: Session = Depends(get_db),
):
    """根据ID获取分类详情"""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return category


# ---- 创建分类 ----

@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    req: schemas.CategoryCreate,
    db: Session = Depends(get_db),
):
    """为指定门店创建菜品分类"""
    # 校验门店是否存在
    store = db.query(Store).filter(Store.id == req.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    # 校验同门店下分类名是否重复
    existing = (
        db.query(Category)
        .filter(Category.store_id == req.store_id, Category.name == req.name)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"分类名称 '{req.name}' 在该门店已存在",
        )

    category = Category(
        store_id=req.store_id,
        name=req.name,
        sort_order=req.sort_order,
        icon=req.icon,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ---- 更新分类 ----

@router.put("/{id}", response_model=schemas.CategoryResponse)
def update_category(
    id: int,
    req: schemas.CategoryUpdate,
    db: Session = Depends(get_db),
):
    """更新分类信息"""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    # 如果更新名称，校验唯一性（同门店内）
    if req.name is not None and req.name != category.name:
        existing = (
            db.query(Category)
            .filter(
                Category.store_id == category.store_id,
                Category.name == req.name,
                Category.id != id,
            )
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"分类名称 '{req.name}' 在该门店已存在",
            )
        category.name = req.name

    if req.sort_order is not None:
        category.sort_order = req.sort_order

    if req.icon is not None:
        category.icon = req.icon

    db.commit()
    db.refresh(category)
    return category


# ---- 删除分类 ----

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    id: int,
    db: Session = Depends(get_db),
):
    """删除分类（级联删除关联的菜品）"""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    db.delete(category)
    db.commit()
    return None


# ---- 切换分类显示/隐藏状态 ----

@router.put("/{id}/status")
def toggle_category_status(
    id: int,
    status: int = Query(..., ge=0, le=1, description="状态: 0隐藏 1显示"),
    db: Session = Depends(get_db),
):
    """切换分类的显示/隐藏状态"""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    category.status = status
    db.commit()
    db.refresh(category)
    return {
        "id": category.id,
        "name": category.name,
        "status": category.status,
        "message": "分类已显示" if status == 1 else "分类已隐藏",
    }


# ---- 更新分类排序 ----

@router.put("/{id}/sort")
def update_sort_order(
    id: int,
    sort_order: int = Query(..., ge=0, description="排序值，越小越靠前"),
    db: Session = Depends(get_db),
):
    """更新分类的排序值"""
    category = db.query(Category).filter(Category.id == id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    category.sort_order = sort_order
    db.commit()
    db.refresh(category)
    return {
        "id": category.id,
        "name": category.name,
        "sort_order": category.sort_order,
        "message": "排序更新成功",
    }
