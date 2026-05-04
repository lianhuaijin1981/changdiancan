"""
畅点餐 - 订单管理路由（完整订单生命周期）
订单状态流: pending -> paid -> preparing -> ready -> served -> completed
异常状态: cancelled, refunding, refunded
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, text
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app import models, schemas
from app.models import (
    Order, OrderItem, Dish, Store, User, Coupon, UserCoupon,
    PointsLog, Payment,
)
from app.auth import require_auth, get_optional_user
from app.utils.wxpay import wxpay_simulator

router = APIRouter(tags=["订单"])

# 合法的订单状态流转
VALID_STATUS_TRANSITIONS = {
    "pending": ["paid", "cancelled"],
    "paid": ["preparing", "refunding", "cancelled"],
    "preparing": ["ready", "refunding"],
    "ready": ["served", "refunding"],
    "served": ["completed", "refunding"],
    "completed": [],
    "cancelled": [],
    "refunding": ["refunded", "paid"],
    "refunded": [],
}

CANCELABLE_STATUSES = ["pending", "paid"]
REFUNDABLE_STATUSES = ["paid", "preparing", "ready", "served"]


def generate_order_no() -> str:
    """生成订单编号"""
    return wxpay_simulator.generate_order_no()


def calculate_coupon_discount(
    coupon: Coupon, total_amount: float
) -> float:
    """计算优惠券优惠金额"""
    if total_amount < coupon.min_amount:
        return 0.0

    if coupon.type == "amount":
        # 满减券
        return min(coupon.discount_amount, total_amount)
    elif coupon.type == "discount":
        # 折扣券 (discount_amount 是折扣率，如 0.8 表示八折)
        discount = total_amount * (1 - coupon.discount_amount)
        return round(discount, 2)
    elif coupon.type == "percent":
        # 百分比折扣
        discount = total_amount * (coupon.discount_amount / 100)
        return round(discount, 2)

    return 0.0


def validate_status_transition(current: str, new: str) -> bool:
    """验证状态流转是否合法"""
    if current == new:
        return True
    valid_next = VALID_STATUS_TRANSITIONS.get(current, [])
    return new in valid_next


@router.post("/", response_model=schemas.ResponseModel)
def create_order(
    order_req: schemas.OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """创建订单
    1. 校验商品和库存
    2. 计算订单金额
    3. 应用优惠券
    4. 生成订单号并创建订单
    """
    if not order_req.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="订单商品不能为空"
        )

    # 验证门店
    store = db.query(Store).filter(Store.id == order_req.store_id).first()
    if not store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="门店不存在"
        )

    # 验证桌台（堂食必传）
    if order_req.order_type == "dine_in" and not order_req.table_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="堂食订单必须选择桌台",
        )

    # 校验商品、库存，计算小计
    total_amount = 0.0
    order_items_data = []

    for item in order_req.items:
        dish = (
            db.query(Dish)
            .filter(
                Dish.id == item.dish_id,
                Dish.store_id == order_req.store_id,
            )
            .first()
        )
        if not dish:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"菜品 ID {item.dish_id} 不存在",
            )
        if dish.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"菜品 '{dish.name}' 库存不足，剩余 {dish.stock}",
            )
        if dish.status == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"菜品 '{dish.name}' 已下架",
            )

        # 计算单项价格（考虑规格加价）
        unit_price = dish.price
        if item.specs and dish.specs:
            for spec in dish.specs:
                selected = item.specs.get(spec["name"], "")
                for opt in spec.get("options", []):
                    if opt.get("name") == selected:
                        unit_price += opt.get("extra_price", 0)

        subtotal = round(unit_price * item.quantity, 2)
        total_amount += subtotal

        order_items_data.append({
            "dish_id": dish.id,
            "dish_name": dish.name,
            "dish_image": dish.image,
            "price": unit_price,
            "quantity": item.quantity,
            "specs": item.specs or {},
            "subtotal": subtotal,
        })

    total_amount = round(total_amount, 2)
    discount_amount = 0.0
    coupon_id = order_req.coupon_id

    # 应用优惠券
    if coupon_id and current_user:
        user_coupon = (
            db.query(UserCoupon)
            .filter(
                UserCoupon.user_id == current_user.id,
                UserCoupon.coupon_id == coupon_id,
                UserCoupon.status == "unused",
            )
            .first()
        )
        if not user_coupon:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="优惠券无效或已使用",
            )

        coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
        if coupon:
            # 检查有效期
            now = datetime.now()
            if coupon.start_date and now < coupon.start_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="优惠券尚未生效",
                )
            if coupon.end_date and now > coupon.end_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="优惠券已过期",
                )
            # 检查最低消费
            if total_amount < coupon.min_amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"订单金额未达到优惠券使用门槛 ¥{coupon.min_amount}",
                )

            discount_amount = calculate_coupon_discount(coupon, total_amount)

    # 外卖配送费
    delivery_fee = 0.0
    if order_req.order_type == "delivery":
        delivery_fee = store.delivery_fee or 0.0
        total_amount += delivery_fee

    pay_amount = round(total_amount - discount_amount, 2)
    if pay_amount < 0:
        pay_amount = 0.0

    # 创建订单
    order = Order(
        order_no=generate_order_no(),
        user_id=current_user.id if current_user else None,
        store_id=order_req.store_id,
        table_id=order_req.table_id,
        order_type=order_req.order_type,
        status="pending",
        total_amount=total_amount,
        discount_amount=discount_amount,
        pay_amount=pay_amount,
        pay_type=order_req.pay_type or "wechat",
        pay_status="unpaid",
        remark=order_req.remark,
        delivery_name=order_req.delivery_name or "",
        delivery_phone=order_req.delivery_phone or "",
        delivery_address=order_req.delivery_address or "",
        delivery_fee=delivery_fee,
    )
    db.add(order)
    db.flush()  # 获取 order.id

    # 创建订单项
    for item_data in order_items_data:
        item_data["order_id"] = order.id
        db_item = OrderItem(**item_data)
        db.add(db_item)

        # 扣减库存
        db.query(Dish).filter(Dish.id == item_data["dish_id"]).update(
            {Dish.stock: Dish.stock - item_data["quantity"]}
        )

    db.commit()
    db.refresh(order)

    # 标记优惠券为已使用（如果使用了）
    if discount_amount > 0 and coupon_id and current_user:
        user_coupon = (
            db.query(UserCoupon)
            .filter(
                UserCoupon.user_id == current_user.id,
                UserCoupon.coupon_id == coupon_id,
                UserCoupon.status == "unused",
            )
            .first()
        )
        if user_coupon:
            user_coupon.status = "used"
            user_coupon.used_at = datetime.now()
            db.query(Coupon).filter(Coupon.id == coupon_id).update(
                {Coupon.used_count: Coupon.used_count + 1}
            )
            db.commit()

    # 构建响应
    items_resp = [
        {
            "id": item.id,
            "dish_id": item.dish_id,
            "dish_name": item.dish_name,
            "dish_image": item.dish_image,
            "price": item.price,
            "quantity": item.quantity,
            "specs": item.specs,
            "subtotal": item.subtotal,
            "status": item.status,
        }
        for item in order.items
    ]

    return {
        "code": 200,
        "message": "订单创建成功",
        "data": {
            "id": order.id,
            "order_no": order.order_no,
            "total_amount": order.total_amount,
            "discount_amount": order.discount_amount,
            "pay_amount": order.pay_amount,
            "status": order.status,
            "items": items_resp,
        },
    }


@router.get("/", response_model=schemas.ResponseModel)
def list_orders(
    status: Optional[str] = Query(None, description="订单状态"),
    store_id: Optional[int] = Query(None, description="门店ID"),
    user_id: Optional[int] = Query(None, description="用户ID"),
    order_type: Optional[str] = Query(None, description="订单类型"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """订单列表（带分页和筛选）"""
    query = db.query(Order)

    if status:
        query = query.filter(Order.status == status)
    if store_id:
        query = query.filter(Order.store_id == store_id)
    if user_id:
        query = query.filter(Order.user_id == user_id)
    if order_type:
        query = query.filter(Order.order_type == order_type)

    total = query.count()
    orders = (
        query.options()
        .order_by(Order.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # 手动加载 items
    result = []
    for order in orders:
        items = (
            db.query(OrderItem)
            .filter(OrderItem.order_id == order.id)
            .all()
        )
        order_dict = {
            "id": order.id,
            "order_no": order.order_no,
            "user_id": order.user_id,
            "store_id": order.store_id,
            "table_id": order.table_id,
            "order_type": order.order_type,
            "status": order.status,
            "total_amount": order.total_amount,
            "discount_amount": order.discount_amount,
            "pay_amount": order.pay_amount,
            "pay_type": order.pay_type,
            "pay_status": order.pay_status,
            "pay_time": order.pay_time,
            "remark": order.remark,
            "delivery_address": order.delivery_address,
            "delivery_name": order.delivery_name,
            "delivery_phone": order.delivery_phone,
            "delivery_fee": order.delivery_fee,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "items": [
                {
                    "id": item.id,
                    "dish_id": item.dish_id,
                    "dish_name": item.dish_name,
                    "dish_image": item.dish_image,
                    "price": item.price,
                    "quantity": item.quantity,
                    "specs": item.specs,
                    "subtotal": item.subtotal,
                    "status": item.status,
                }
                for item in items
            ],
        }
        result.append(order_dict)

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": result,
        },
    }


@router.get("/{id}", response_model=schemas.ResponseModel)
def get_order(id: int, db: Session = Depends(get_db)):
    """获取订单详情"""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="订单不存在"
        )

    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )

    data = {
        "id": order.id,
        "order_no": order.order_no,
        "user_id": order.user_id,
        "store_id": order.store_id,
        "table_id": order.table_id,
        "order_type": order.order_type,
        "status": order.status,
        "total_amount": order.total_amount,
        "discount_amount": order.discount_amount,
        "pay_amount": order.pay_amount,
        "pay_type": order.pay_type,
        "pay_status": order.pay_status,
        "pay_time": order.pay_time,
        "remark": order.remark,
        "cancel_reason": order.cancel_reason,
        "delivery_address": order.delivery_address,
        "delivery_name": order.delivery_name,
        "delivery_phone": order.delivery_phone,
        "delivery_fee": order.delivery_fee,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
        "items": [
            {
                "id": item.id,
                "dish_id": item.dish_id,
                "dish_name": item.dish_name,
                "dish_image": item.dish_image,
                "price": item.price,
                "quantity": item.quantity,
                "specs": item.specs,
                "subtotal": item.subtotal,
                "status": item.status,
            }
            for item in items
        ],
    }

    return {"code": 200, "message": "success", "data": data}


@router.put("/{id}/status", response_model=schemas.ResponseModel)
def update_order_status(
    id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """更新订单状态（带状态流转验证）"""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="订单不存在"
        )

    new_status = status_update.status
    current_status = order.status

    # 验证状态流转
    if not validate_status_transition(current_status, new_status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不能从 '{current_status}' 变更为 '{new_status}'",
        )

    order.status = new_status
    order.updated_at = datetime.now()

    # 状态变更附带逻辑
    if new_status == "paid":
        order.pay_status = "paid"
        order.pay_time = datetime.now()
    elif new_status == "completed":
        order.pay_status = "paid"
    elif new_status == "refunded":
        order.pay_status = "refunded"

    db.commit()
    db.refresh(order)

    return {
        "code": 200,
        "message": "订单状态更新成功",
        "data": {
            "id": order.id,
            "status": order.status,
            "previous_status": current_status,
        },
    }


@router.post("/{id}/cancel", response_model=schemas.ResponseModel)
def cancel_order(
    id: int,
    reason: str = "",
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    """取消订单（仅在允许的状态下）"""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="订单不存在"
        )

    if order.status not in CANCELABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"当前状态 '{order.status}' 不允许取消",
        )

    # 恢复库存
    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )
    for item in items:
        db.query(Dish).filter(Dish.id == item.dish_id).update(
            {Dish.stock: Dish.stock + item.quantity}
        )

    # 如果已支付，标记为退款
    if order.pay_status == "paid":
        order.status = "refunding"
        order.cancel_reason = reason or "用户取消"
    else:
        order.status = "cancelled"
        order.cancel_reason = reason or "用户取消"

    order.updated_at = datetime.now()
    db.commit()
    db.refresh(order)

    return {
        "code": 200,
        "message": "订单取消成功",
        "data": {
            "id": order.id,
            "status": order.status,
            "cancel_reason": order.cancel_reason,
        },
    }


@router.post("/{id}/refund", response_model=schemas.ResponseModel)
def refund_order(
    id: int,
    reason: str = "",
    db: Session = Depends(get_db),
):
    """订单退款"""
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="订单不存在"
        )

    if order.status not in REFUNDABLE_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"当前状态 '{order.status}' 不允许退款",
        )

    if order.pay_status != "paid":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="未支付订单无法退款",
        )

    # 调用退款
    refund_result = wxpay_simulator.process_refund(
        order.order_no, order.pay_amount, reason or "用户申请退款"
    )

    if refund_result["status"] != "success":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="退款处理失败",
        )

    # 恢复库存
    items = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == order.id)
        .all()
    )
    for item in items:
        db.query(Dish).filter(Dish.id == item.dish_id).update(
            {Dish.stock: Dish.stock + item.quantity}
        )

    order.status = "refunded"
    order.pay_status = "refunded"
    order.cancel_reason = reason or "已退款"
    order.updated_at = datetime.now()

    # 创建支付记录
    payment = Payment(
        order_no=order.order_no,
        transaction_id=refund_result.get("refund_no", ""),
        user_id=order.user_id,
        amount=-order.pay_amount,
        pay_type=order.pay_type,
        status="refunded",
        refunded_at=datetime.now(),
    )
    db.add(payment)
    db.commit()
    db.refresh(order)

    return {
        "code": 200,
        "message": "退款成功",
        "data": {
            "id": order.id,
            "status": order.status,
            "refund_amount": order.pay_amount,
            "refund_no": refund_result.get("refund_no"),
        },
    }


@router.get("/stats", response_model=schemas.ResponseModel)
def get_order_stats(
    store_id: int = Query(..., description="门店ID"),
    db: Session = Depends(get_db),
):
    """订单统计（今日/本周/本月）"""
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    def get_stats(start_time: datetime, end_time: datetime):
        query = db.query(Order).filter(
            Order.store_id == store_id,
            Order.created_at >= start_time,
            Order.created_at < end_time,
            Order.status.notin_(["cancelled", "refunded"]),
        )
        count = query.count()
        total = (
            db.query(func.coalesce(func.sum(Order.pay_amount), 0.0))
            .filter(
                Order.store_id == store_id,
                Order.created_at >= start_time,
                Order.created_at < end_time,
                Order.status.notin_(["cancelled", "refunded"]),
            )
            .scalar()
        )
        return {"count": count, "amount": round(float(total), 2)}

    stats = {
        "today": get_stats(today_start, now + timedelta(days=1)),
        "week": get_stats(week_start, now + timedelta(days=1)),
        "month": get_stats(month_start, now + timedelta(days=1)),
        # 各状态订单数
        "status_counts": {},
    }

    # 各状态统计
    status_list = [
        "pending", "paid", "preparing", "ready",
        "served", "completed", "cancelled", "refunding", "refunded",
    ]
    for s in status_list:
        cnt = (
            db.query(Order)
            .filter(Order.store_id == store_id, Order.status == s)
            .count()
        )
        stats["status_counts"][s] = cnt

    return {"code": 200, "message": "success", "data": stats}


@router.post("/add-item", response_model=schemas.ResponseModel)
def add_item_to_order(
    order_id: int,
    dish_id: int,
    quantity: int = 1,
    specs: Optional[dict] = None,
    db: Session = Depends(get_db),
):
    """临时加菜（向已有订单添加菜品）"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="订单不存在"
        )

    # 只允许在特定状态下加菜
    if order.status not in ["paid", "preparing", "ready"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"当前订单状态 '{order.status}' 不允许加菜",
        )

    dish = db.query(Dish).filter(Dish.id == dish_id).first()
    if not dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="菜品不存在"
        )

    if dish.stock < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"菜品 '{dish.name}' 库存不足",
        )

    # 计算价格（考虑规格）
    unit_price = dish.price
    if specs and dish.specs:
        for spec in dish.specs:
            selected = specs.get(spec["name"], "")
            for opt in spec.get("options", []):
                if opt.get("name") == selected:
                    unit_price += opt.get("extra_price", 0)

    subtotal = round(unit_price * quantity, 2)

    # 创建订单项
    order_item = OrderItem(
        order_id=order.id,
        dish_id=dish.id,
        dish_name=dish.name,
        dish_image=dish.image,
        price=unit_price,
        quantity=quantity,
        specs=specs or {},
        subtotal=subtotal,
        status="pending",
    )
    db.add(order_item)

    # 扣减库存
    dish.stock -= quantity

    # 更新订单金额
    order.total_amount = round(order.total_amount + subtotal, 2)
    order.pay_amount = round(order.pay_amount + subtotal, 2)
    order.updated_at = datetime.now()

    db.commit()
    db.refresh(order_item)
    db.refresh(order)

    return {
        "code": 200,
        "message": "加菜成功",
        "data": {
            "order_id": order.id,
            "order_no": order.order_no,
            "new_total": order.total_amount,
            "new_pay_amount": order.pay_amount,
            "added_item": {
                "id": order_item.id,
                "dish_name": order_item.dish_name,
                "quantity": order_item.quantity,
                "subtotal": order_item.subtotal,
            },
        },
    }
