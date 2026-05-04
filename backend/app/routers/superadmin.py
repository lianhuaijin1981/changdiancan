"""
畅点餐 - 超级管理员路由
SaaS总后台：管理所有商家、查看平台数据、版本控制
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional

from app.database import get_db
from app import models, schemas
from app.auth import require_auth

router = APIRouter()


def require_superadmin(staff=Depends(require_auth)):
    """超级管理员权限校验"""
    if staff.role != "superadmin":
        raise HTTPException(status_code=403, detail="需要超级管理员权限")
    return staff


@router.get("/dashboard", response_model=schemas.ResponseModel)
async def super_dashboard(
    db: Session = Depends(get_db),
    admin = Depends(require_superadmin),
):
    """超级管理员仪表盘：平台级数据统计"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # 商家总数
    total_stores = db.query(models.Store).count()
    active_stores = db.query(models.Store).filter(models.Store.status == 1).count()

    # 订单统计
    total_orders = db.query(models.Order).count()
    today_orders = db.query(models.Order).filter(models.Order.created_at >= today_start).count()
    month_orders = db.query(models.Order).filter(models.Order.created_at >= month_start).count()

    # 营收统计
    today_revenue = db.query(func.coalesce(func.sum(models.Order.pay_amount), 0)).filter(
        models.Order.created_at >= today_start,
        models.Order.pay_status == "paid"
    ).scalar()

    month_revenue = db.query(func.coalesce(func.sum(models.Order.pay_amount), 0)).filter(
        models.Order.created_at >= month_start,
        models.Order.pay_status == "paid"
    ).scalar()

    total_revenue = db.query(func.coalesce(func.sum(models.Order.pay_amount), 0)).filter(
        models.Order.pay_status == "paid"
    ).scalar()

    # 用户/会员统计
    total_users = db.query(models.User).count()
    total_riders = db.query(models.Rider).count()
    total_staff = db.query(models.Staff).count()

    return {
        "code": 200,
        "message": "success",
        "data": {
            "stores": { "total": total_stores, "active": active_stores },
            "orders": { "total": total_orders, "today": today_orders, "month": month_orders },
            "revenue": { "today": round(float(today_revenue), 2), "month": round(float(month_revenue), 2), "total": round(float(total_revenue), 2) },
            "users": { "total": total_users, "riders": total_riders, "staff": total_staff },
        }
    }


@router.get("/stores", response_model=schemas.ResponseModel)
async def list_all_stores(
    status: Optional[int] = Query(None),
    keyword: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    admin = Depends(require_superadmin),
):
    """获取所有商家列表"""
    query = db.query(models.Store)
    
    if status is not None:
        query = query.filter(models.Store.status == status)
    if keyword:
        query = query.filter(models.Store.name.contains(keyword))
    
    total = query.count()
    stores = query.order_by(desc(models.Store.created_at)).offset((page - 1) * page_size).limit(page_size).all()

    # 补充每个商家的订单和营收数据
    store_list = []
    for s in stores:
        order_count = db.query(models.Order).filter(models.Order.store_id == s.id).count()
        revenue = db.query(func.coalesce(func.sum(models.Order.pay_amount), 0)).filter(
            models.Order.store_id == s.id,
            models.Order.pay_status == "paid"
        ).scalar()
        store_list.append({
            "id": s.id,
            "name": s.name,
            "phone": s.phone,
            "address": s.address,
            "status": s.status,
            "template_id": s.template_id,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "order_count": order_count,
            "revenue": round(float(revenue), 2),
        })

    return {
        "code": 200,
        "message": "success",
        "data": {
            "items": store_list,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    }


@router.put("/stores/{store_id}/status", response_model=schemas.ResponseModel)
async def toggle_store_status(
    store_id: int,
    status: int,
    db: Session = Depends(get_db),
    admin = Depends(require_superadmin),
):
    """启用/禁用商家"""
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="商家不存在")
    store.status = status
    db.commit()
    return { "code": 200, "message": "success", "data": { "id": store_id, "status": status } }


@router.get("/revenue-trend", response_model=schemas.ResponseModel)
async def platform_revenue_trend(
    days: int = Query(30, ge=7, le=365),
    db: Session = Depends(get_db),
    admin = Depends(require_superadmin),
):
    """平台营收趋势（最近N天）"""
    end = datetime.now()
    start = end - timedelta(days=days)
    
    results = db.query(
        func.date(models.Order.created_at).label("date"),
        func.count(models.Order.id).label("order_count"),
        func.coalesce(func.sum(models.Order.pay_amount), 0).label("revenue"),
    ).filter(
        models.Order.created_at >= start,
        models.Order.pay_status == "paid"
    ).group_by(func.date(models.Order.created_at)).order_by("date").all()

    data = []
    for r in results:
        data.append({
            "date": str(r.date),
            "orders": int(r.order_count),
            "revenue": round(float(r.revenue), 2),
        })

    return { "code": 200, "message": "success", "data": data }


@router.get("/top-stores", response_model=schemas.ResponseModel)
async def top_stores(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    admin = Depends(require_superadmin),
):
    """营收排行最高的商家"""
    results = db.query(
        models.Store.id,
        models.Store.name,
        func.coalesce(func.sum(models.Order.pay_amount), 0).label("revenue"),
        func.count(models.Order.id).label("order_count"),
    ).outerjoin(
        models.Order, models.Order.store_id == models.Store.id
    ).filter(
        models.Order.pay_status == "paid"
    ).group_by(models.Store.id).order_by(desc("revenue")).limit(limit).all()

    data = []
    for idx, r in enumerate(results, 1):
        data.append({
            "rank": idx,
            "id": r.id,
            "name": r.name,
            "revenue": round(float(r.revenue), 2),
            "orders": int(r.order_count),
        })

    return { "code": 200, "message": "success", "data": data }


@router.get("/template-distribution", response_model=schemas.ResponseModel)
async def template_distribution(
    db: Session = Depends(get_db),
    admin = Depends(require_superadmin),
):
    """模板使用分布"""
    results = db.query(
        models.Store.template_id,
        func.count(models.Store.id).label("count"),
    ).group_by(models.Store.template_id).all()

    data = {r.template_id: int(r.count) for r in results}
    return { "code": 200, "message": "success", "data": data }
