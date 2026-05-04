"""
畅点餐 - 会员中心路由
包含: 会员等级、积分管理、余额充值、积分兑换
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.models import User, MemberLevel, PointsLog, Coupon, UserCoupon
from app.auth import require_auth
from app.utils.wxpay import wxpay_simulator

router = APIRouter(tags=["会员"])


@router.get("/levels", response_model=schemas.ResponseModel)
def list_member_levels(db: Session = Depends(get_db)):
    """获取所有会员等级列表"""
    levels = (
        db.query(MemberLevel)
        .order_by(MemberLevel.min_points.asc())
        .all()
    )
    return {"code": 200, "message": "success", "data": levels}


@router.get("/me", response_model=schemas.ResponseModel)
def get_member_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """获取当前用户的会员信息（等级、积分、余额）"""
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在"
        )

    # 获取会员等级信息
    level = (
        db.query(MemberLevel)
        .filter(MemberLevel.id == user.member_level_id)
        .first()
    )

    # 获取下一个等级
    next_level = (
        db.query(MemberLevel)
        .filter(MemberLevel.min_points > user.points)
        .order_by(MemberLevel.min_points.asc())
        .first()
    )

    data = {
        "user_id": user.id,
        "nickname": user.nickname,
        "avatar": user.avatar,
        "phone": user.phone,
        "points": user.points,
        "balance": round(user.balance, 2),
        "member_level": {
            "id": level.id if level else 1,
            "name": level.name if level else "普通会员",
            "discount": level.discount if level else 1.0,
            "icon": level.icon if level else "",
        },
        "next_level": {
            "name": next_level.name if next_level else "已达到最高等级",
            "min_points": next_level.min_points if next_level else None,
            "points_needed": (
                next_level.min_points - user.points
                if next_level
                else 0
            ),
        },
        "total_points_earned": (
            db.query(func.coalesce(func.sum(PointsLog.points), 0))
            .filter(PointsLog.user_id == user.id, PointsLog.type == "earn")
            .scalar()
        ),
    }

    return {"code": 200, "message": "success", "data": data}


@router.post("/recharge", response_model=schemas.ResponseModel)
def recharge_balance(
    request: schemas.RechargeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """余额充值（模拟支付）"""
    if request.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="充值金额必须大于0"
        )

    # 模拟支付流程
    order_no = wxpay_simulator.generate_order_no()
    pay_params = wxpay_simulator.create_pay_params(
        order_no=order_no,
        amount=request.amount,
        description="余额充值",
    )

    # 模拟支付成功，直接到账
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="用户不存在"
        )

    old_balance = user.balance
    user.balance += request.amount

    # 记录积分（充值送积分，1元=1积分）
    points_earned = int(request.amount)
    if points_earned > 0:
        user.points += points_earned
        points_log = PointsLog(
            user_id=user.id,
            type="earn",
            points=points_earned,
            description=f"充值赠送积分，金额¥{request.amount}",
        )
        db.add(points_log)

    # 创建支付记录
    payment = models.Payment(
        order_no=order_no,
        transaction_id=wxpay_simulator.generate_transaction_id(),
        user_id=user.id,
        amount=request.amount,
        pay_type=request.pay_type,
        status="success",
        paid_at=datetime.now(),
    )
    db.add(payment)
    db.commit()

    return {
        "code": 200,
        "message": "充值成功",
        "data": {
            "order_no": order_no,
            "amount": request.amount,
            "old_balance": round(old_balance, 2),
            "new_balance": round(user.balance, 2),
            "points_earned": points_earned,
            "pay_type": request.pay_type,
        },
    }


@router.get("/points-log", response_model=schemas.ResponseModel)
def get_points_log(
    type: Optional[str] = Query(None, description="类型: earn获得 use使用 refund退回"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """获取积分历史记录"""
    query = db.query(PointsLog).filter(
        PointsLog.user_id == current_user.id
    )

    if type:
        query = query.filter(PointsLog.type == type)

    total = query.count()
    logs = (
        query.order_by(PointsLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # 计算积分统计
    earn_total = (
        db.query(func.coalesce(func.sum(PointsLog.points), 0))
        .filter(
            PointsLog.user_id == current_user.id,
            PointsLog.type == "earn",
        )
        .scalar()
    )
    use_total = (
        db.query(func.coalesce(func.sum(PointsLog.points), 0))
        .filter(
            PointsLog.user_id == current_user.id,
            PointsLog.type == "use",
        )
        .scalar()
    )

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "stats": {
                "total_earned": earn_total,
                "total_used": use_total,
                "current_points": current_user.points,
            },
            "items": logs,
        },
    }


@router.post("/points/use", response_model=schemas.ResponseModel)
def use_points(
    points: int = Query(..., gt=0, description="要使用的积分数量"),
    order_id: Optional[int] = Query(None, description="关联订单ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """使用积分抵扣
    假设: 100积分 = 1元
    """
    if current_user.points < points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"积分不足，当前积分: {current_user.points}",
        )

    # 计算抵扣金额
    deduction = round(points / 100, 2)

    # 扣减积分
    user = db.query(User).filter(User.id == current_user.id).first()
    user.points -= points

    description = f"积分抵扣订单，使用{points}积分抵扣¥{deduction}"
    if order_id:
        description = f"订单#{order_id}积分抵扣，使用{points}积分抵扣¥{deduction}"

    points_log = PointsLog(
        user_id=user.id,
        type="use",
        points=points,
        description=description,
    )
    db.add(points_log)
    db.commit()

    return {
        "code": 200,
        "message": "积分使用成功",
        "data": {
            "points_used": points,
            "deduction_amount": deduction,
            "remaining_points": user.points,
            "order_id": order_id,
        },
    }


@router.post("/exchange", response_model=schemas.ResponseModel)
def exchange_points_for_coupon(
    coupon_id: int,
    points_cost: int = Query(..., gt=0, description="兑换所需积分"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """积分兑换优惠券"""
    if current_user.points < points_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"积分不足，需要{points_cost}积分，当前{current_user.points}",
        )

    # 验证优惠券存在且可用
    coupon = db.query(Coupon).filter(
        Coupon.id == coupon_id,
        Coupon.status == 1,
    ).first()

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="优惠券不存在或已禁用",
        )

    # 检查是否已兑换过（每人限领）
    existing = (
        db.query(UserCoupon)
        .filter(
            UserCoupon.user_id == current_user.id,
            UserCoupon.coupon_id == coupon_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已兑换过该优惠券",
        )

    # 检查发放数量
    if coupon.total_count > 0:
        claimed_count = (
            db.query(UserCoupon)
            .filter(UserCoupon.coupon_id == coupon_id)
            .count()
        )
        if claimed_count >= coupon.total_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该优惠券已被兑换完",
            )

    # 扣减积分
    user = db.query(User).filter(User.id == current_user.id).first()
    user.points -= points_cost

    # 创建用户优惠券
    user_coupon = UserCoupon(
        user_id=user.id,
        coupon_id=coupon.id,
        status="unused",
    )
    db.add(user_coupon)

    # 记录积分使用
    points_log = PointsLog(
        user_id=user.id,
        type="use",
        points=points_cost,
        description=f"积分兑换优惠券: {coupon.title}，消耗{points_cost}积分",
    )
    db.add(points_log)
    db.commit()

    return {
        "code": 200,
        "message": "兑换成功",
        "data": {
            "coupon_id": coupon.id,
            "coupon_title": coupon.title,
            "points_cost": points_cost,
            "remaining_points": user.points,
            "user_coupon_id": user_coupon.id,
        },
    }
