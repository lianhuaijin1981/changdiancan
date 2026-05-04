"""
畅点餐 - 微信支付模拟路由
处理支付统一下单、回调通知、退款、查询等
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.models import Order, Payment
from app.auth import require_auth
from app.utils.wxpay import wxpay_simulator

router = APIRouter(tags=["支付"])


@router.post("/unified-order", response_model=schemas.ResponseModel)
def create_unified_order(
    request: schemas.UnifiedOrderRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_auth),
):
    """
    统一下单：创建微信支付参数
    - 前端调用此接口获取支付参数
    - 然后使用 pay_params 调起微信支付
    - 支付成功后调用 /notify 接口通知后端
    """
    # 查找订单
    order = db.query(Order).filter(Order.order_no == request.order_no).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在",
        )

    if order.pay_status == "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="订单已支付",
        )

    # 创建微信支付参数
    pay_result = wxpay_simulator.create_pay_params(
        order_no=order.order_no,
        amount=order.pay_amount,
        description=f"畅点餐订单-{order.order_no}",
    )

    # 查找或创建支付记录
    payment = db.query(Payment).filter(Payment.order_no == order.order_no).first()
    if not payment:
        payment = Payment(
            order_no=order.order_no,
            user_id=current_user.id,
            amount=order.pay_amount,
            pay_type=request.pay_type,
            status="pending",
        )
        db.add(payment)
    else:
        payment.status = "pending"

    db.commit()

    return {
        "code": 200,
        "message": "统一下单成功",
        "data": {
            "pay_params": pay_result["pay_params"],
            "prepay_id": pay_result["prepay_id"],
            "order_no": pay_result["order_no"],
            "amount": pay_result["amount"],
        },
    }


@router.post("/notify", response_model=schemas.ResponseModel)
def handle_pay_notify(
    notify_data: Dict[str, Any],
    db: Session = Depends(get_db),
):
    """
    支付回调通知（模拟）
    - 微信支付成功后回调此接口
    - 更新订单状态为已支付，更新支付记录状态
    """
    result = wxpay_simulator.process_notify(notify_data)

    if result["status"] != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="支付回调处理失败",
        )

    order_no = result["order_no"]

    # 查找订单
    order = db.query(Order).filter(Order.order_no == order_no).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在",
        )

    # 查找支付记录
    payment = db.query(Payment).filter(Payment.order_no == order_no).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="支付记录不存在",
        )

    # 更新订单状态
    now = datetime.now()
    order.status = "paid"
    order.pay_status = "paid"
    order.pay_time = now

    # 更新支付记录
    payment.status = "success"
    payment.transaction_id = result.get("transaction_id", "")
    payment.paid_at = now

    db.commit()
    db.refresh(payment)

    return {
        "code": 200,
        "message": "支付成功",
        "data": {
            "order_no": order_no,
            "status": "paid",
            "paid_at": now.isoformat(),
        },
    }


@router.post("/refund", response_model=schemas.ResponseModel)
def process_refund(
    order_no: str,
    refund_amount: Optional[float] = None,
    reason: str = "",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_auth),
):
    """
    申请退款
    - 处理订单退款
    - 更新订单状态和支付记录
    """
    order = db.query(Order).filter(Order.order_no == order_no).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在",
        )

    if order.pay_status != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="订单未支付，无法退款",
        )

    # 默认全额退款
    actual_refund_amount = refund_amount or order.pay_amount

    payment = db.query(Payment).filter(Payment.order_no == order_no).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="支付记录不存在",
        )

    # 调用微信退款接口（模拟）
    result = wxpay_simulator.process_refund(
        order_no=order_no,
        refund_amount=actual_refund_amount,
        reason=reason,
    )

    if result["status"] != "success":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="退款处理失败",
        )

    # 更新订单状态
    order.status = "refunded"
    order.pay_status = "refunded"

    # 更新支付记录
    payment.status = "refunded"
    payment.refunded_at = datetime.now()

    db.commit()

    return {
        "code": 200,
        "message": "退款成功",
        "data": {
            "order_no": order_no,
            "refund_no": result["refund_no"],
            "refund_amount": actual_refund_amount,
            "reason": reason,
            "refunded_at": result["refunded_at"],
        },
    }


@router.get("/status/{order_no}", response_model=schemas.ResponseModel)
def get_payment_status(
    order_no: str,
    db: Session = Depends(get_db),
):
    """
    查询支付状态
    - 根据商户订单号查询支付状态
    """
    payment = db.query(Payment).filter(Payment.order_no == order_no).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="支付记录不存在",
        )

    # 同时查询微信侧状态
    wx_result = wxpay_simulator.query_order(order_no)

    return {
        "code": 200,
        "message": "查询成功",
        "data": {
            "order_no": payment.order_no,
            "transaction_id": payment.transaction_id,
            "amount": payment.amount,
            "pay_type": payment.pay_type,
            "status": payment.status,
            "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
            "refunded_at": payment.refunded_at.isoformat() if payment.refunded_at else None,
            "wx_trade_state": wx_result.get("trade_state"),
        },
    }
