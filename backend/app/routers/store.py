"""
畅点餐 - 门店路由
处理门店的增删改查、公告管理及状态切换
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app import schemas
from app.models import Store

router = APIRouter(tags=["门店"])


# ---- 列出所有门店 ----

@router.get("/", response_model=List[schemas.StoreResponse])
def list_stores(
    status: Optional[int] = Query(None, description="按状态筛选: 0关闭 1营业 2休息"),
    db: Session = Depends(get_db),
):
    """获取门店列表，可选按状态筛选"""
    query = db.query(Store)
    if status is not None:
        query = query.filter(Store.status == status)
    return query.order_by(Store.created_at.desc()).all()


# ---- 获取门店详情 ----

@router.get("/{id}", response_model=schemas.StoreResponse)
def get_store(
    id: int,
    db: Session = Depends(get_db),
):
    """根据 ID 获取门店详情"""
    store = db.query(Store).filter(Store.id == id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")
    return store


# ---- 创建门店 ----

@router.post("/", response_model=schemas.StoreResponse, status_code=status.HTTP_201_CREATED)
def create_store(
    req: schemas.StoreCreate,
    db: Session = Depends(get_db),
):
    """创建新门店"""
    store = Store(**req.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return store


# ---- 更新门店 ----

@router.put("/{id}", response_model=schemas.StoreResponse)
def update_store(
    id: int,
    req: schemas.StoreUpdate,
    db: Session = Depends(get_db),
):
    """更新门店信息"""
    store = db.query(Store).filter(Store.id == id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(store, field, value)

    db.commit()
    db.refresh(store)
    return store


# ---- 删除门店 ----

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_store(
    id: int,
    db: Session = Depends(get_db),
):
    """删除门店（级联删除关联的桌台、分类、菜品）"""
    store = db.query(Store).filter(Store.id == id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    db.delete(store)
    db.commit()
    return None


# ---- 获取门店公告 ----

@router.get("/{id}/announcement")
def get_announcement(
    id: int,
    db: Session = Depends(get_db),
):
    """获取门店公告"""
    store = db.query(Store).filter(Store.id == id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")
    return {"announcement": store.announcement or ""}


# ---- 更新门店公告 ----

@router.put("/{id}/announcement")
def update_announcement(
    id: int,
    announcement: str = "",
    db: Session = Depends(get_db),
):
    """更新门店公告"""
    store = db.query(Store).filter(Store.id == id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    store.announcement = announcement
    db.commit()
    db.refresh(store)
    return {"announcement": store.announcement}


# ---- 切换门店营业状态 ----

@router.put("/{id}/status")
def toggle_store_status(
    id: int,
    status: int = Query(..., ge=0, le=2, description="状态: 0关闭 1营业 2休息"),
    db: Session = Depends(get_db),
):
    """切换门店营业状态"""
    store = db.query(Store).filter(Store.id == id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    store.status = status
    db.commit()
    db.refresh(store)
    return {"id": store.id, "status": store.status, "message": "状态更新成功"}
