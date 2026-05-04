"""
畅点餐 - 数据统计路由
为商家后台提供营业额、订单、菜品销量、会员分析等数据统计
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case, and_
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from app.database import get_db
from app import models, schemas
from app.auth import require_auth

router = APIRouter()


def _get_date_range(range_type: str) -> tuple:
    """获取日期范围"""
    now = datetime.now()
    if range_type == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif range_type == "yesterday":
        yesterday = now - timedelta(days=1)
        start = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end = yesterday.replace(hour=23, minute=59, second=59)
    elif range_type == "week":
        start = now - timedelta(days=7)
        end = now
    elif range_type == "month":
        start = now - timedelta(days=30)
        end = now
    else:
        start = now - timedelta(days=7)
        end = now
    return start, end


@router.get("/summary", response_model=schemas.ResponseModel)
async def get_dashboard_summary(
    store_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user = Depends(require_auth),
):
    """数据概览卡片"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    query = db.query(models.Order)
    if store_id:
        query = query.filter(models.Order.store_id == store_id)

    # 今日数据
    today_orders = query.filter(models.Order.created_at >= today_start).all()
    today_revenue = sum(o.pay_amount for o in today_orders if o.pay_status == "paid")
    today_order_count = len([o for o in today_orders if o.pay_status == "paid"])

    # 去重顾客数（今日）
    today_customers = len(set(
        o.user_id for o in today_orders
        if o.user_id and o.pay_status == "paid"
    ))

    # 待处理订单
    pending_orders = query.filter(
        models.Order.status.in_(["pending", "paid", "preparing"])
    ).count()

    # 会员总数
    total_members = db.query(models.User).count()

    # 本周营收
    week_orders = query.filter(
        models.Order.created_at >= week_start,
        models.Order.pay_status == "paid"
    ).all()
    week_revenue = sum(o.pay_amount for o in week_orders)

    # 本月营收
    month_orders = query.filter(
        models.Order.created_at >= month_start,
        models.Order.pay_status == "paid"
    ).all()
    month_revenue = sum(o.pay_amount for o in month_orders)

    return {
        "code": 200,
        "message": "success",
        "data": {
            "today_revenue": round(today_revenue, 2),
            "today_orders": today_order_count,
            "today_customers": today_customers,
            "pending_orders": pending_orders,
            "total_members": total_members,
            "week_revenue": round(week_revenue, 2),
            "month_revenue": round(month_revenue, 2),
        }
    }


@router.get("/revenue", response_model=schemas.ResponseModel)
async def get_revenue_stats(
    store_id: Optional[int] = Query(None),
    range_type: str = Query("week", regex="^(today|week|month)$"),
    db: Session = Depends(get_db),
    user = Depends(require_auth),
):
    """营收趋势统计"""
    start, end = _get_date_range(range_type)

    query = db.query(models.Order).filter(
        models.Order.created_at >= start,
        models.Order.created_at <= end,
        models.Order.pay_status == "paid"
    )
    if store_id:
        query = query.filter(models.Order.store_id == store_id)

    orders = query.order_by(models.Order.created_at).all()

    # 按日期聚合
    daily_stats: Dict[str, Dict[str, float]] = {}
    for order in orders:
        date_str = order.created_at.strftime("%Y-%m-%d")
        if date_str not in daily_stats:
            daily_stats[date_str] = {"revenue": 0, "order_count": 0, "refund_amount": 0}
        daily_stats[date_str]["revenue"] += order.pay_amount
        daily_stats[date_str]["order_count"] += 1

    # 补充空日期
    current = start
    while current.date() <= end.date():
        date_str = current.strftime("%Y-%m-%d")
        if date_str not in daily_stats:
            daily_stats[date_str] = {"revenue": 0, "order_count": 0, "refund_amount": 0}
        current += timedelta(days=1)

    # 排序并转为列表
    result = []
    for date_str in sorted(daily_stats.keys()):
        stats = daily_stats[date_str]
        result.append(schemas.RevenueStats(
            date=date_str,
            revenue=round(stats["revenue"], 2),
            order_count=stats["order_count"],
            refund_amount=round(stats["refund_amount"], 2),
        ))

    return {
        "code": 200,
        "message": "success",
        "data": {
            "range": range_type,
            "total_revenue": round(sum(s.revenue for s in result), 2),
            "total_orders": sum(s.order_count for s in result),
            "daily_stats": [s.model_dump() for s in result],
        }
    }


@router.get("/dishes", response_model=schemas.ResponseModel)
async def get_dish_ranking(
    store_id: Optional[int] = Query(None),
    range_type: str = Query("week", regex="^(today|week|month)$"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user = Depends(require_auth),
):
    """菜品销量排行"""
    start, end = _get_date_range(range_type)

    # 关联查询 order_items + orders 按时间筛选
    query = db.query(
        models.OrderItem.dish_id,
        models.OrderItem.dish_name,
        func.sum(models.OrderItem.quantity).label("total_sales"),
        func.sum(models.OrderItem.subtotal).label("total_revenue"),
    ).join(
        models.Order, models.OrderItem.order_id == models.Order.id
    ).filter(
        models.Order.created_at >= start,
        models.Order.created_at <= end,
        models.Order.pay_status == "paid"
    )

    if store_id:
        query = query.filter(models.Order.store_id == store_id)

    results = query.group_by(
        models.OrderItem.dish_id,
        models.OrderItem.dish_name
    ).order_by(
        desc("total_sales")
    ).limit(limit).all()

    rankings = []
    for idx, row in enumerate(results, 1):
        rankings.append({
            "rank": idx,
            "dish_id": row.dish_id,
            "dish_name": row.dish_name,
            "total_sales": int(row.total_sales or 0),
            "total_revenue": round(float(row.total_revenue or 0), 2),
        })

    return {
        "code": 200,
        "message": "success",
        "data": {
            "range": range_type,
            "rankings": rankings,
        }
    }


@router.get("/members", response_model=schemas.ResponseModel)
async def get_member_stats(
    db: Session = Depends(get_db),
    user = Depends(require_auth),
):
    """会员消费分析"""
    # 按等级统计
    results = db.query(
        models.MemberLevel.id,
        models.MemberLevel.name,
        func.count(models.User.id).label("member_count"),
        func.coalesce(func.sum(models.Order.pay_amount), 0).label("total_consumption"),
    ).outerjoin(
        models.User, models.User.member_level_id == models.MemberLevel.id
    ).outerjoin(
        models.Order, and_(
            models.Order.user_id == models.User.id,
            models.Order.pay_status == "paid"
        )
    ).group_by(
        models.MemberLevel.id,
        models.MemberLevel.name
    ).order_by(models.MemberLevel.min_points).all()

    member_stats = []
    total_members = 0
    total_consumption = 0

    for row in results:
        member_count = int(row.member_count or 0)
        consumption = float(row.total_consumption or 0)
        total_members += member_count
        total_consumption += consumption

        member_stats.append({
            "level_id": row.id,
            "level_name": row.name,
            "member_count": member_count,
            "total_consumption": round(consumption, 2),
            "avg_consumption": round(consumption / member_count, 2) if member_count > 0 else 0,
        })

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total_members": total_members,
            "total_consumption": round(total_consumption, 2),
            "avg_consumption_per_member": round(total_consumption / total_members, 2) if total_members > 0 else 0,
            "level_stats": member_stats,
        }
    }


@router.get("/orders-by-hour", response_model=schemas.ResponseModel)
async def get_orders_by_hour(
    store_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user = Depends(require_auth),
):
    """按小时统计订单分布（今日）"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    query = db.query(models.Order).filter(
        models.Order.created_at >= today_start
    )
    if store_id:
        query = query.filter(models.Order.store_id == store_id)

    orders = query.all()

    # 24小时分布
    hourly = {f"{h:02d}:00": {"orders": 0, "revenue": 0.0} for h in range(24)}
    for order in orders:
        hour_key = order.created_at.strftime("%H:00")
        hourly[hour_key]["orders"] += 1
        if order.pay_status == "paid":
            hourly[hour_key]["revenue"] += order.pay_amount

    result = []
    for h in range(24):
        key = f"{h:02d}:00"
        result.append({
            "hour": key,
            "orders": hourly[key]["orders"],
            "revenue": round(hourly[key]["revenue"], 2),
        })

    return {
        "code": 200,
        "message": "success",
        "data": result,
    }


@router.get("/order-types", response_model=schemas.ResponseModel)
async def get_order_type_distribution(
    store_id: Optional[int] = Query(None),
    range_type: str = Query("week", regex="^(today|week|month)$"),
    db: Session = Depends(get_db),
    user = Depends(require_auth),
):
    """订单类型分布（堂食/外卖/自提）"""
    start, end = _get_date_range(range_type)

    query = db.query(
        models.Order.order_type,
        func.count(models.Order.id).label("count"),
        func.coalesce(func.sum(models.Order.pay_amount), 0).label("revenue"),
    ).filter(
        models.Order.created_at >= start,
        models.Order.created_at <= end,
        models.Order.pay_status == "paid"
    )
    if store_id:
        query = query.filter(models.Order.store_id == store_id)

    results = query.group_by(models.Order.order_type).all()

    type_names = {
        "dine_in": "堂食",
        "takeaway": "自提",
        "delivery": "外卖",
    }

    distribution = []
    for row in results:
        distribution.append({
            "type": row.order_type,
            "type_name": type_names.get(row.order_type, row.order_type),
            "count": int(row.count or 0),
            "revenue": round(float(row.revenue or 0), 2),
        })

    return {
        "code": 200,
        "message": "success",
        "data": distribution,
    }
