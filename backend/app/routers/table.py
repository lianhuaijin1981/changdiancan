"""
畅点餐 - 桌台路由
处理桌台的增删改查、二维码生成及状态更新
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app import schemas
from app.models import Table, Store

router = APIRouter(tags=["桌台"])

# ---- 允许的桌台状态常量 ----
VALID_TABLE_STATUSES = {"free", "occupied", "locked"}


# ---- 列出门店的所有桌台 ----

@router.get("/", response_model=List[schemas.TableResponse])
def list_tables(
    store_id: int = Query(..., description="门店ID"),
    db: Session = Depends(get_db),
):
    """根据门店ID获取桌台列表"""
    # 校验门店是否存在
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    return (
        db.query(Table)
        .filter(Table.store_id == store_id)
        .order_by(Table.table_no)
        .all()
    )


# ---- 获取桌台详情 ----

@router.get("/{id}", response_model=schemas.TableResponse)
def get_table(
    id: int,
    db: Session = Depends(get_db),
):
    """根据ID获取桌台详情"""
    table = db.query(Table).filter(Table.id == id).first()
    if not table:
        raise HTTPException(status_code=404, detail="桌台不存在")
    return table


# ---- 创建桌台 ----

@router.post("/", response_model=schemas.TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(
    req: schemas.TableCreate,
    db: Session = Depends(get_db),
):
    """为指定门店创建桌台"""
    # 校验门店是否存在
    store = db.query(Store).filter(Store.id == req.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    # 校验桌号是否在同一门店内重复
    existing = (
        db.query(Table)
        .filter(Table.store_id == req.store_id, Table.table_no == req.table_no)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"桌号 '{req.table_no}' 在该门店已存在",
        )

    table = Table(
        store_id=req.store_id,
        table_no=req.table_no,
        capacity=req.capacity,
    )
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


# ---- 更新桌台 ----

@router.put("/{id}", response_model=schemas.TableResponse)
def update_table(
    id: int,
    req: schemas.TableUpdate,
    db: Session = Depends(get_db),
):
    """更新桌台信息"""
    table = db.query(Table).filter(Table.id == id).first()
    if not table:
        raise HTTPException(status_code=404, detail="桌台不存在")

    # 如果更新桌号，校验唯一性
    if req.table_no is not None and req.table_no != table.table_no:
        existing = (
            db.query(Table)
            .filter(Table.store_id == table.store_id, Table.table_no == req.table_no)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"桌号 '{req.table_no}' 在该门店已存在",
            )
        table.table_no = req.table_no

    if req.capacity is not None:
        table.capacity = req.capacity

    if req.status is not None:
        if req.status not in VALID_TABLE_STATUSES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的状态值，可选: {VALID_TABLE_STATUSES}",
            )
        table.status = req.status

    db.commit()
    db.refresh(table)
    return table


# ---- 删除桌台 ----

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table(
    id: int,
    db: Session = Depends(get_db),
):
    """删除桌台"""
    table = db.query(Table).filter(Table.id == id).first()
    if not table:
        raise HTTPException(status_code=404, detail="桌台不存在")

    db.delete(table)
    db.commit()
    return None


# ---- 生成桌台二维码 ----

@router.get("/{id}/qrcode")
def get_table_qrcode(
    id: int,
    db: Session = Depends(get_db),
):
    """
    生成桌台二维码字符串
    格式: canting://store/{store_id}/table/{table_id}
    """
    table = db.query(Table).filter(Table.id == id).first()
    if not table:
        raise HTTPException(status_code=404, detail="桌台不存在")

    qrcode_str = f"canting://store/{table.store_id}/table/{table.id}"
    return {"qr_code": qrcode_str}


# ---- 更新桌台状态 ----

@router.put("/{id}/status")
def update_table_status(
    id: int,
    status: str = Query(..., description="状态: free空闲 occupied占用 locked锁定"),
    db: Session = Depends(get_db),
):
    """更新桌台状态"""
    table = db.query(Table).filter(Table.id == id).first()
    if not table:
        raise HTTPException(status_code=404, detail="桌台不存在")

    if status not in VALID_TABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的状态值，可选: {VALID_TABLE_STATUSES}",
        )

    table.status = status
    db.commit()
    db.refresh(table)
    return {"id": table.id, "status": table.status, "message": "桌台状态更新成功"}
