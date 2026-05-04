"""
畅点餐 - 审计日志路由
记录所有关键业务操作，支持查询和追溯
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Optional
from datetime import datetime, timedelta, date

from app.database import get_db
from app import models, schemas
from app.models import AuditLog, User
from app.auth import require_auth, get_optional_user

router = APIRouter(tags=["审计日志"])


def create_audit_log(
    db: Session,
    action: str,
    target_type: str = "",
    target_id: Optional[int] = None,
    detail: str = "",
    user_id: Optional[int] = None,
    user_type: str = "user",
    ip_address: str = "",
) -> AuditLog:
    """创建审计日志记录（内部工具函数）

    可在其他路由中调用此函数记录操作日志，例如：
        from app.routers.audit import create_audit_log
        create_audit_log(db, action="create_order", target_type="order",
                         target_id=order.id, detail=f"创建订单 {order.order_no}",
                         user_id=current_user.id if current_user else None)
    """
    log = AuditLog(
        user_id=user_id,
        user_type=user_type,
        action=action,
        target_type=target_type,
        target_id=target_id,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.post("/log", response_model=schemas.ResponseModel)
def log_action(
    log_data: schemas.AuditLogCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """手动创建审计日志记录"""
    log = AuditLog(
        user_id=log_data.user_id or (current_user.id if current_user else None),
        user_type=log_data.user_type,
        action=log_data.action,
        target_type=log_data.target_type or "",
        target_id=log_data.target_id,
        detail=log_data.detail or "",
        ip_address=log_data.ip_address or "",
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    return {
        "code": 200,
        "message": "日志记录成功",
        "data": {"id": log.id, "action": log.action},
    }


@router.get("/logs", response_model=schemas.ResponseModel)
def list_logs(
    user_id: Optional[int] = Query(None, description="用户ID"),
    user_type: Optional[str] = Query(None, description="用户类型: user/merchant/rider/admin"),
    action: Optional[str] = Query(None, description="操作类型"),
    target_type: Optional[str] = Query(None, description="目标类型: order/dish/store"),
    target_id: Optional[int] = Query(None, description="目标ID"),
    start_date: Optional[str] = Query(None, description="开始日期 YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期 YYYY-MM-DD"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """查询审计日志列表（支持多种筛选条件）"""
    query = db.query(AuditLog)

    # 筛选条件
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    if user_type:
        query = query.filter(AuditLog.user_type == user_type)
    if action:
        query = query.filter(AuditLog.action == action)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)
    if target_id:
        query = query.filter(AuditLog.target_id == target_id)

    # 日期范围筛选
    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(AuditLog.created_at >= start_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="开始日期格式错误，应为 YYYY-MM-DD",
            )
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(AuditLog.created_at < end_dt)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="结束日期格式错误，应为 YYYY-MM-DD",
            )

    total = query.count()
    logs = (
        query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": logs,
        },
    }


@router.get("/stats", response_model=schemas.ResponseModel)
def log_statistics(
    start_date: Optional[str] = Query(None, description="开始日期 YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="结束日期 YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """审计日志统计（按操作类型分组）"""
    query = db.query(
        AuditLog.action,
        func.count(AuditLog.id).label("count"),
    )

    if start_date:
        try:
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(AuditLog.created_at >= start_dt)
        except ValueError:
            pass
    if end_date:
        try:
            end_dt = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
            query = query.filter(AuditLog.created_at < end_dt)
        except ValueError:
            pass

    results = query.group_by(AuditLog.action).all()

    stats = {action: count for action, count in results}
    stats["total"] = sum(stats.values())

    return {"code": 200, "message": "success", "data": stats}
