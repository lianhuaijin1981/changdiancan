"""
畅点餐 - 财务报表路由
提供日/月/年维度的财务数据统计
数据来源: Order 和 Payment 模型
"""
from datetime import datetime, timedelta, date
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, text

from app.database import get_db
from app.models import Order, Payment, Store, User

router = APIRouter(prefix="/finance", tags=["财务报表"])


# ── 辅助函数 ────────────────────────────────────────────────────

def _safe_float(value) -> float:
    """安全转换为 float"""
    if value is None:
        return 0.0
    return round(float(value), 2)


def _get_date_boundaries(year: int, month: int = None, day: int = None):
    """获取日期范围的起止时间"""
    if day:
        start = datetime(year, month, day, 0, 0, 0)
        end = datetime(year, month, day, 23, 59, 59)
    elif month:
        start = datetime(year, month, 1, 0, 0, 0)
        # 下个月第一天减去1秒
        if month == 12:
            end = datetime(year + 1, 1, 1, 0, 0, 0) - timedelta(seconds=1)
        else:
            end = datetime(year, month + 1, 1, 0, 0, 0) - timedelta(seconds=1)
    else:
        start = datetime(year, 1, 1, 0, 0, 0)
        end = datetime(year + 1, 1, 1, 0, 0, 0) - timedelta(seconds=1)
    return start, end


def _get_prev_period(year: int, month: int = None):
    """获取上一周期"""
    if month:
        if month == 1:
            return year - 1, 12
        return year, month - 1
    return year - 1, None


# ── 日度报表 ────────────────────────────────────────────────────

@router.get("/daily")
def daily_report(
    store_id: int = Query(..., description="门店ID"),
    date: str = Query(..., description="日期 (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    日度财务报表
    - revenue: 营业收入
    - order_count: 订单数量
    - avg_order_value: 客单价
    - refund_amount: 退款金额
    - new_customers: 新增顾客数
    - payment_breakdown: 支付方式分布
    - order_type_breakdown: 订单类型分布
    - hourly_breakdown: 24小时分布
    """
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
        year, month, day = dt.year, dt.month, dt.day
    except ValueError:
        raise HTTPException(status_code=400, detail="date 格式应为 YYYY-MM-DD")

    start, end = _get_date_boundaries(year, month, day)

    # 门店验证
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    # 1. 基础订单统计（排除已取消和已退款）
    base_filters = [
        Order.store_id == store_id,
        Order.created_at >= start,
        Order.created_at <= end,
    ]

    # 有效订单（已完成/已支付等）
    valid_order_filter = base_filters + [Order.status.notin_(["cancelled", "refunded"])]

    # 总营收 = 有效订单实付金额之和
    revenue = (
        db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
        .filter(and_(*valid_order_filter))
        .scalar()
    )

    # 订单总数（有效）
    order_count = (
        db.query(func.count(Order.id))
        .filter(and_(*valid_order_filter))
        .scalar()
    )

    # 客单价
    avg_order_value = _safe_float(revenue) / order_count if order_count > 0 else 0.0

    # 退款金额
    refund_filter = base_filters + [Order.status == "refunded"]
    refund_amount = (
        db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
        .filter(and_(*refund_filter))
        .scalar()
    )

    # 新增顾客数
    new_customers = (
        db.query(func.count(User.id))
        .filter(
            User.created_at >= start,
            User.created_at <= end,
        )
        .scalar()
    )

    # 2. 支付方式分布
    payment_breakdown = (
        db.query(
            Order.pay_type,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.pay_amount), 0.0).label("amount"),
        )
        .filter(and_(*valid_order_filter))
        .group_by(Order.pay_type)
        .all()
    )

    payment_methods = []
    pay_type_map = {"wechat": "微信支付", "balance": "余额支付", "": "未选择"}
    for pb in payment_breakdown:
        payment_methods.append({
            "type": pb.pay_type or "",
            "type_name": pay_type_map.get(pb.pay_type, pb.pay_type or "其他"),
            "count": pb.count,
            "amount": _safe_float(pb.amount),
        })

    # 3. 订单类型分布
    type_breakdown = (
        db.query(
            Order.order_type,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.pay_amount), 0.0).label("amount"),
        )
        .filter(and_(*valid_order_filter))
        .group_by(Order.order_type)
        .all()
    )

    order_types = []
    type_map = {"dine_in": "堂食", "takeaway": "自提", "delivery": "外卖"}
    for tb in type_breakdown:
        order_types.append({
            "type": tb.order_type,
            "type_name": type_map.get(tb.order_type, tb.order_type),
            "count": tb.count,
            "amount": _safe_float(tb.amount),
        })

    # 4. 24小时时段分布
    hourly_data = []
    for hour in range(24):
        h_start = start.replace(hour=hour, minute=0, second=0)
        h_end = start.replace(hour=hour, minute=59, second=59)
        h_count = (
            db.query(func.count(Order.id))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= h_start,
                Order.created_at <= h_end,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        h_revenue = (
            db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= h_start,
                Order.created_at <= h_end,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        hourly_data.append({
            "hour": hour,
            "count": h_count,
            "revenue": _safe_float(h_revenue),
        })

    # 5. 各状态订单数量
    status_counts = {}
    for s in ["pending", "paid", "preparing", "ready", "served", "completed", "cancelled", "refunded"]:
        cnt = (
            db.query(func.count(Order.id))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= start,
                Order.created_at <= end,
                Order.status == s,
            )
            .scalar()
        )
        status_counts[s] = cnt

    return {
        "code": 200,
        "message": "success",
        "data": {
            "date": date,
            "store_id": store_id,
            "store_name": store.name,
            "revenue": _safe_float(revenue),
            "order_count": order_count,
            "avg_order_value": round(avg_order_value, 2),
            "refund_amount": _safe_float(refund_amount),
            "new_customers": new_customers,
            "payment_breakdown": payment_methods,
            "order_type_breakdown": order_types,
            "hourly_breakdown": hourly_data,
            "status_counts": status_counts,
        },
    }


# ── 月度报表 ────────────────────────────────────────────────────

@router.get("/monthly")
def monthly_report(
    store_id: int = Query(..., description="门店ID"),
    year: int = Query(..., ge=2000, le=2100, description="年份"),
    month: int = Query(..., ge=1, le=12, description="月份 (1-12)"),
    db: Session = Depends(get_db),
):
    """
    月度财务报表
    - daily_breakdown: 每日数据列表
    - total_revenue: 总营收
    - total_orders: 总订单数
    - avg_order_value: 月均客单价
    - payment_method_breakdown: 支付方式汇总
    - order_type_breakdown: 订单类型汇总
    - day_count: 实际营业天数
    """
    start, end = _get_date_boundaries(year, month)

    # 门店验证
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    # 获取该月有多少天
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    days_in_month = (next_month - start).days

    # 每日数据
    daily_list = []
    total_revenue = 0.0
    total_orders = 0
    business_days = 0

    for day in range(1, days_in_month + 1):
        day_start = datetime(year, month, day, 0, 0, 0)
        day_end = datetime(year, month, day, 23, 59, 59)

        day_revenue = (
            db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= day_start,
                Order.created_at <= day_end,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        day_orders = (
            db.query(func.count(Order.id))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= day_start,
                Order.created_at <= day_end,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        day_refund = (
            db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= day_start,
                Order.created_at <= day_end,
                Order.status == "refunded",
            )
            .scalar()
        )

        rev = _safe_float(day_revenue)
        total_revenue += rev
        total_orders += day_orders
        if day_orders > 0:
            business_days += 1

        daily_list.append({
            "date": f"{year}-{month:02d}-{day:02d}",
            "revenue": rev,
            "order_count": day_orders,
            "refund_amount": _safe_float(day_refund),
            "avg_order_value": round(rev / day_orders, 2) if day_orders > 0 else 0.0,
        })

    # 月均客单价
    avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

    # 支付方式分布（整月）
    valid_filter = [
        Order.store_id == store_id,
        Order.created_at >= start,
        Order.created_at <= end,
        Order.status.notin_(["cancelled", "refunded"]),
    ]

    payment_breakdown = (
        db.query(
            Order.pay_type,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.pay_amount), 0.0).label("amount"),
        )
        .filter(and_(*valid_filter))
        .group_by(Order.pay_type)
        .all()
    )

    pay_type_map = {"wechat": "微信支付", "balance": "余额支付", "": "未选择"}
    payment_methods = [
        {
            "type": pb.pay_type or "",
            "type_name": pay_type_map.get(pb.pay_type, pb.pay_type or "其他"),
            "count": pb.count,
            "amount": _safe_float(pb.amount),
        }
        for pb in payment_breakdown
    ]

    # 订单类型分布（整月）
    type_breakdown = (
        db.query(
            Order.order_type,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.pay_amount), 0.0).label("amount"),
        )
        .filter(and_(*valid_filter))
        .group_by(Order.order_type)
        .all()
    )

    type_map = {"dine_in": "堂食", "takeaway": "自提", "delivery": "外卖"}
    order_types = [
        {
            "type": tb.order_type,
            "type_name": type_map.get(tb.order_type, tb.order_type),
            "count": tb.count,
            "amount": _safe_float(tb.amount),
        }
        for tb in type_breakdown
    ]

    # 退款总额
    refund_total = (
        db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
        .filter(
            Order.store_id == store_id,
            Order.created_at >= start,
            Order.created_at <= end,
            Order.status == "refunded",
        )
        .scalar()
    )

    return {
        "code": 200,
        "message": "success",
        "data": {
            "year": year,
            "month": month,
            "store_id": store_id,
            "store_name": store.name,
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "avg_order_value": avg_order_value,
            "refund_total": _safe_float(refund_total),
            "business_days": business_days,
            "days_in_month": days_in_month,
            "daily_breakdown": daily_list,
            "payment_method_breakdown": payment_methods,
            "order_type_breakdown": order_types,
        },
    }


# ── 年度报表 ────────────────────────────────────────────────────

@router.get("/yearly")
def yearly_report(
    store_id: int = Query(..., description="门店ID"),
    year: int = Query(..., ge=2000, le=2100, description="年份"),
    db: Session = Depends(get_db),
):
    """
    年度财务报表
    - monthly_summary: 每月汇总列表
    - total_revenue: 年度总营收
    - total_orders: 年度总订单数
    - avg_order_value: 年均客单价
    - prev_year_comparison: 与去年同比
    - payment_method_breakdown: 支付方式年度汇总
    - order_type_breakdown: 订单类型年度汇总
    """
    start, end = _get_date_boundaries(year)
    prev_year = year - 1
    prev_start, prev_end = _get_date_boundaries(prev_year)

    # 门店验证
    store = db.query(Store).filter(Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="门店不存在")

    # 每月数据
    monthly_list = []
    total_revenue = 0.0
    total_orders = 0

    for m in range(1, 13):
        m_start, m_end = _get_date_boundaries(year, m)

        m_revenue = (
            db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= m_start,
                Order.created_at <= m_end,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        m_orders = (
            db.query(func.count(Order.id))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= m_start,
                Order.created_at <= m_end,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        m_refund = (
            db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= m_start,
                Order.created_at <= m_end,
                Order.status == "refunded",
            )
            .scalar()
        )

        rev = _safe_float(m_revenue)
        total_revenue += rev
        total_orders += m_orders

        monthly_list.append({
            "month": m,
            "month_name": f"{m}月",
            "revenue": rev,
            "order_count": m_orders,
            "refund_amount": _safe_float(m_refund),
            "avg_order_value": round(rev / m_orders, 2) if m_orders > 0 else 0.0,
        })

    avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

    # ── 同比去年 ───────────────────────────────────────────────

    prev_revenue = (
        db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
        .filter(
            Order.store_id == store_id,
            Order.created_at >= prev_start,
            Order.created_at <= prev_end,
            Order.status.notin_(["cancelled", "refunded"]),
        )
        .scalar()
    )
    prev_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.store_id == store_id,
            Order.created_at >= prev_start,
            Order.created_at <= prev_end,
            Order.status.notin_(["cancelled", "refunded"]),
        )
        .scalar()
    )
    prev_refund = (
        db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
        .filter(
            Order.store_id == store_id,
            Order.created_at >= prev_start,
            Order.created_at <= prev_end,
            Order.status == "refunded",
        )
        .scalar()
    )

    prev_revenue_f = _safe_float(prev_revenue)
    prev_orders_n = prev_orders or 0

    # 计算增长率
    revenue_growth = 0.0
    if prev_revenue_f > 0:
        revenue_growth = round((total_revenue - prev_revenue_f) / prev_revenue_f * 100, 2)

    order_growth = 0.0
    if prev_orders_n > 0:
        order_growth = round((total_orders - prev_orders_n) / prev_orders_n * 100, 2)

    # ── 支付方式年度汇总 ────────────────────────────────────────

    valid_filter = [
        Order.store_id == store_id,
        Order.created_at >= start,
        Order.created_at <= end,
        Order.status.notin_(["cancelled", "refunded"]),
    ]

    payment_breakdown = (
        db.query(
            Order.pay_type,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.pay_amount), 0.0).label("amount"),
        )
        .filter(and_(*valid_filter))
        .group_by(Order.pay_type)
        .all()
    )

    pay_type_map = {"wechat": "微信支付", "balance": "余额支付", "": "未选择"}
    payment_methods = [
        {
            "type": pb.pay_type or "",
            "type_name": pay_type_map.get(pb.pay_type, pb.pay_type or "其他"),
            "count": pb.count,
            "amount": _safe_float(pb.amount),
            "percentage": 0.0,
        }
        for pb in payment_breakdown
    ]
    # 计算百分比
    for pm in payment_methods:
        if total_revenue > 0:
            pm["percentage"] = round(pm["amount"] / total_revenue * 100, 2)

    # ── 订单类型年度汇总 ────────────────────────────────────────

    type_breakdown = (
        db.query(
            Order.order_type,
            func.count(Order.id).label("count"),
            func.coalesce(func.sum(Order.pay_amount), 0.0).label("amount"),
        )
        .filter(and_(*valid_filter))
        .group_by(Order.order_type)
        .all()
    )

    type_map = {"dine_in": "堂食", "takeaway": "自提", "delivery": "外卖"}
    order_types = [
        {
            "type": tb.order_type,
            "type_name": type_map.get(tb.order_type, tb.order_type),
            "count": tb.count,
            "amount": _safe_float(tb.amount),
            "percentage": round(_safe_float(tb.amount) / total_revenue * 100, 2) if total_revenue > 0 else 0.0,
        }
        for tb in type_breakdown
    ]

    # 退款总额
    refund_total = (
        db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
        .filter(
            Order.store_id == store_id,
            Order.created_at >= start,
            Order.created_at <= end,
            Order.status == "refunded",
        )
        .scalar()
    )

    return {
        "code": 200,
        "message": "success",
        "data": {
            "year": year,
            "store_id": store_id,
            "store_name": store.name,
            "total_revenue": round(total_revenue, 2),
            "total_orders": total_orders,
            "avg_order_value": avg_order_value,
            "refund_total": _safe_float(refund_total),
            "monthly_summary": monthly_list,
            "prev_year_comparison": {
                "prev_year": prev_year,
                "prev_revenue": prev_revenue_f,
                "prev_orders": prev_orders_n,
                "prev_refund": _safe_float(prev_refund),
                "revenue_growth_rate": revenue_growth,
                "order_growth_rate": order_growth,
                "revenue_change": round(total_revenue - prev_revenue_f, 2),
            },
            "payment_method_breakdown": payment_methods,
            "order_type_breakdown": order_types,
        },
    }
