"""
畅点餐 - 优惠券管理路由
包含: 优惠券CRUD、用户领券、用券、券验证
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.models import Coupon, UserCoupon, User, Order
from app.auth import require_auth, get_optional_user

router = APIRouter(tags=["优惠券"])


@router.get("/", response_model=schemas.ResponseModel)
def list_coupons(
    store_id: Optional[int] = Query(None, description="门店ID（不传则查通用券）"),
    status: Optional[int] = Query(1, description="状态: 0禁用 1启用"),
    db: Session = Depends(get_db),
):
    """获取门店可用的优惠券列表"""
    query = db.query(Coupon)

    if store_id:
        # 查指定门店的券 + 通用券
        query = query.filter(
            (Coupon.store_id == store_id) | (Coupon.store_id == None)
        )
    else:
        query = query.filter(Coupon.store_id == None)

    if status is not None:
        query = query.filter(Coupon.status == status)

    # 过滤有效期
    now = datetime.now()
    query = query.filter(
        (Coupon.start_date == None) | (Coupon.start_date <= now),
        (Coupon.end_date == None) | (Coupon.end_date >= now),
    )

    coupons = query.order_by(Coupon.created_at.desc()).all()

    # 补充统计信息
    result = []
    for coupon in coupons:
        claimed_count = (
            db.query(UserCoupon)
            .filter(UserCoupon.coupon_id == coupon.id)
            .count()
        )
        coupon_dict = {
            "id": coupon.id,
            "store_id": coupon.store_id,
            "title": coupon.title,
            "type": coupon.type,
            "min_amount": coupon.min_amount,
            "discount_amount": coupon.discount_amount,
            "total_count": coupon.total_count,
            "used_count": coupon.used_count,
            "limit_per_user": coupon.limit_per_user,
            "start_date": coupon.start_date,
            "end_date": coupon.end_date,
            "status": coupon.status,
            "created_at": coupon.created_at,
            "remaining": (
                coupon.total_count - claimed_count
                if coupon.total_count > 0
                else -1  # -1 表示不限量
            ),
            "claimed_count": claimed_count,
        }
        result.append(coupon_dict)

    return {"code": 200, "message": "success", "data": result}


@router.get("/{id}", response_model=schemas.ResponseModel)
def get_coupon(id: int, db: Session = Depends(get_db)):
    """获取优惠券详情"""
    coupon = db.query(Coupon).filter(Coupon.id == id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="优惠券不存在"
        )

    claimed_count = (
        db.query(UserCoupon)
        .filter(UserCoupon.coupon_id == coupon.id)
        .count()
    )

    data = {
        "id": coupon.id,
        "store_id": coupon.store_id,
        "title": coupon.title,
        "type": coupon.type,
        "min_amount": coupon.min_amount,
        "discount_amount": coupon.discount_amount,
        "total_count": coupon.total_count,
        "used_count": coupon.used_count,
        "limit_per_user": coupon.limit_per_user,
        "start_date": coupon.start_date,
        "end_date": coupon.end_date,
        "status": coupon.status,
        "created_at": coupon.created_at,
        "remaining": (
            coupon.total_count - claimed_count
            if coupon.total_count > 0
            else -1
        ),
    }

    return {"code": 200, "message": "success", "data": data}


@router.post("/", response_model=schemas.ResponseModel)
def create_coupon(
    coupon: schemas.CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """创建新优惠券（管理员）"""
    db_coupon = Coupon(**coupon.model_dump())
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)

    return {"code": 200, "message": "优惠券创建成功", "data": db_coupon}


@router.put("/{id}", response_model=schemas.ResponseModel)
def update_coupon(
    id: int,
    coupon_update: schemas.CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """更新优惠券"""
    db_coupon = db.query(Coupon).filter(Coupon.id == id).first()
    if not db_coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="优惠券不存在"
        )

    update_data = coupon_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_coupon, field, value)

    db.commit()
    db.refresh(db_coupon)

    return {"code": 200, "message": "优惠券更新成功", "data": db_coupon}


@router.delete("/{id}", response_model=schemas.ResponseModel)
def delete_coupon(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """删除优惠券"""
    db_coupon = db.query(Coupon).filter(Coupon.id == id).first()
    if not db_coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="优惠券不存在"
        )

    db.delete(db_coupon)
    db.commit()

    return {"code": 200, "message": "优惠券删除成功", "data": {"id": id}}


@router.post("/{id}/claim", response_model=schemas.ResponseModel)
def claim_coupon(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """用户领取优惠券"""
    coupon = db.query(Coupon).filter(Coupon.id == id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="优惠券不存在"
        )

    if coupon.status != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="优惠券已禁用"
        )

    # 检查有效期
    now = datetime.now()
    if coupon.start_date and now < coupon.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="优惠券尚未开始"
        )
    if coupon.end_date and now > coupon.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="优惠券已过期"
        )

    # 检查是否已领取
    existing = (
        db.query(UserCoupon)
        .filter(
            UserCoupon.user_id == current_user.id,
            UserCoupon.coupon_id == id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="您已领取过该优惠券",
        )

    # 检查每人限领
    if coupon.limit_per_user > 0:
        user_claimed = (
            db.query(UserCoupon)
            .filter(
                UserCoupon.user_id == current_user.id,
                UserCoupon.coupon_id == id,
            )
            .count()
        )
        if user_claimed >= coupon.limit_per_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"该优惠券每人限领{coupon.limit_per_user}张",
            )

    # 检查总发放数量
    if coupon.total_count > 0:
        total_claimed = (
            db.query(UserCoupon)
            .filter(UserCoupon.coupon_id == id)
            .count()
        )
        if total_claimed >= coupon.total_count:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该优惠券已被领完",
            )

    # 创建用户优惠券
    user_coupon = UserCoupon(
        user_id=current_user.id,
        coupon_id=coupon.id,
        status="unused",
    )
    db.add(user_coupon)
    db.commit()
    db.refresh(user_coupon)

    return {
        "code": 200,
        "message": "优惠券领取成功",
        "data": {
            "user_coupon_id": user_coupon.id,
            "coupon_id": coupon.id,
            "title": coupon.title,
            "status": user_coupon.status,
        },
    }


@router.get("/my", response_model=schemas.ResponseModel)
def get_my_coupons(
    status: Optional[str] = Query(None, description="状态: unused未使用 used已使用 expired已过期"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """获取当前用户的优惠券列表"""
    query = (
        db.query(UserCoupon, Coupon)
        .join(Coupon, UserCoupon.coupon_id == Coupon.id)
        .filter(UserCoupon.user_id == current_user.id)
    )

    if status:
        query = query.filter(UserCoupon.status == status)
    else:
        # 默认返回未使用的
        query = query.filter(UserCoupon.status == "unused")

    # 过滤已过期的
    now = datetime.now()
    query = query.filter(
        (Coupon.end_date == None) | (Coupon.end_date >= now)
    )

    total = query.count()
    results = (
        query.order_by(Coupon.end_date.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    coupons = []
    for user_coupon, coupon in results:
        coupons.append(
            {
                "id": user_coupon.id,
                "coupon_id": coupon.id,
                "title": coupon.title,
                "type": coupon.type,
                "min_amount": coupon.min_amount,
                "discount_amount": coupon.discount_amount,
                "status": user_coupon.status,
                "end_date": coupon.end_date,
                "used_at": user_coupon.used_at,
                "created_at": user_coupon.created_at,
            }
        )

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": coupons,
        },
    }


@router.post("/{id}/use", response_model=schemas.ResponseModel)
def use_coupon(
    id: int,
    order_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """使用优惠券"""
    user_coupon = (
        db.query(UserCoupon)
        .filter(
            UserCoupon.id == id,
            UserCoupon.user_id == current_user.id,
        )
        .first()
    )
    if not user_coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="优惠券不存在"
        )

    if user_coupon.status == "used":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="优惠券已使用"
        )

    # 检查有效期
    coupon = db.query(Coupon).filter(Coupon.id == user_coupon.coupon_id).first()
    now = datetime.now()
    if coupon.end_date and now > coupon.end_date:
        user_coupon.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="优惠券已过期"
        )

    user_coupon.status = "used"
    user_coupon.used_at = now
    db.commit()

    return {
        "code": 200,
        "message": "优惠券使用成功",
        "data": {
            "user_coupon_id": user_coupon.id,
            "coupon_id": coupon.id,
            "title": coupon.title,
            "order_id": order_id,
            "used_at": user_coupon.used_at,
        },
    }


@router.post("/validate", response_model=schemas.ResponseModel)
def validate_coupon(
    coupon_id: int = Query(..., description="优惠券ID"),
    order_amount: float = Query(..., gt=0, description="订单金额"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_auth),
):
    """验证优惠券是否可用于指定订单金额"""
    # 检查用户是否拥有该券
    user_coupon = (
        db.query(UserCoupon)
        .filter(
            UserCoupon.coupon_id == coupon_id,
            UserCoupon.user_id == current_user.id,
        )
        .first()
    )

    if not user_coupon:
        return {
            "code": 400,
            "message": "您未拥有该优惠券",
            "data": {"valid": False},
        }

    if user_coupon.status == "used":
        return {
            "code": 400,
            "message": "优惠券已使用",
            "data": {"valid": False},
        }

    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        return {
            "code": 404,
            "message": "优惠券不存在",
            "data": {"valid": False},
        }

    if coupon.status != 1:
        return {
            "code": 400,
            "message": "优惠券已禁用",
            "data": {"valid": False},
        }

    # 检查有效期
    now = datetime.now()
    if coupon.start_date and now < coupon.start_date:
        return {
            "code": 400,
            "message": "优惠券尚未生效",
            "data": {"valid": False},
        }
    if coupon.end_date and now > coupon.end_date:
        return {
            "code": 400,
            "message": "优惠券已过期",
            "data": {"valid": False},
        }

    # 检查最低消费
    if order_amount < coupon.min_amount:
        return {
            "code": 400,
            "message": f"订单金额¥{order_amount}未达到最低消费¥{coupon.min_amount}",
            "data": {
                "valid": False,
                "min_amount": coupon.min_amount,
                "order_amount": order_amount,
            },
        }

    # 计算优惠金额
    if coupon.type == "amount":
        discount = min(coupon.discount_amount, order_amount)
    elif coupon.type == "discount":
        discount = round(order_amount * (1 - coupon.discount_amount), 2)
    elif coupon.type == "percent":
        discount = round(order_amount * (coupon.discount_amount / 100), 2)
    else:
        discount = 0.0

    final_amount = round(order_amount - discount, 2)

    return {
        "code": 200,
        "message": "优惠券可用",
        "data": {
            "valid": True,
            "coupon_id": coupon.id,
            "title": coupon.title,
            "type": coupon.type,
            "order_amount": order_amount,
            "discount_amount": discount,
            "final_amount": final_amount,
            "min_amount": coupon.min_amount,
        },
    }
