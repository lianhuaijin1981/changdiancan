"""
畅点餐 - 骑手端简化版路由
骑手只能操作自己所属门店的配送订单
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import Optional, List

from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash, verify_password, create_access_token, verify_token
from app.routers.auth import security

router = APIRouter()


def get_current_rider(
    credentials=Depends(security),
    db: Session = Depends(get_db)
):
    """获取当前登录骑手"""
    if not credentials:
        raise HTTPException(status_code=401, detail="未提供认证令牌")
    rider_id = verify_token(credentials.credentials)
    if not rider_id:
        raise HTTPException(status_code=401, detail="无效的认证令牌")
    rider = db.query(models.Rider).filter(models.Rider.id == rider_id).first()
    if not rider:
        raise HTTPException(status_code=401, detail="骑手不存在")
    return rider


@router.post("/login")
async def rider_login(
    data: schemas.RiderLogin,
    db: Session = Depends(get_db),
):
    """骑手登录"""
    rider = db.query(models.Rider).filter(models.Rider.phone == data.phone).first()
    if not rider or not verify_password(data.password, rider.password_hash):
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    token = create_access_token({"sub": str(rider.id), "type": "rider"})
    store = db.query(models.Store).filter(models.Store.id == rider.store_id).first()

    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "rider_id": rider.id,
            "name": rider.name,
            "store_id": rider.store_id,
            "store_name": store.name if store else "",
        }
    }


@router.get("/orders")
async def get_rider_orders(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    rider = Depends(get_current_rider),
):
    """获取骑手可接的配送订单（仅限本店）"""
    query = db.query(models.Order).filter(
        models.Order.store_id == rider.store_id,
        models.Order.order_type == "delivery"
    )

    if status:
        query = query.filter(models.Order.status == status)
    else:
        query = query.filter(models.Order.status.in_(["paid", "preparing", "ready", "delivering"]))

    orders = query.order_by(desc(models.Order.created_at)).all()

    result = []
    for o in orders:
        delivery = db.query(models.DeliveryOrder).filter(
            models.DeliveryOrder.order_id == o.id
        ).first()
        result.append({
            "id": o.id,
            "order_no": o.order_no,
            "status": o.status,
            "pay_amount": o.pay_amount,
            "delivery_address": o.delivery_address,
            "delivery_name": o.delivery_name,
            "delivery_phone": o.delivery_phone,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "items": [{"dish_name": i.dish_name, "quantity": i.quantity} for i in o.items],
            "delivery_status": delivery.status if delivery else "waiting",
            "delivery_fee": o.delivery_fee,
        })

    return { "code": 200, "message": "success", "data": result }


@router.post("/orders/{order_id}/accept")
async def accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    rider = Depends(get_current_rider),
):
    """骑手接单"""
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.store_id == rider.store_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="订单不存在")

    # 创建配送记录
    delivery = models.DeliveryOrder(
        order_id=order_id,
        rider_id=rider.id,
        status="accepted",
    )
    db.add(delivery)

    order.status = "delivering"
    db.commit()

    return { "code": 200, "message": "接单成功", "data": {"order_id": order_id} }


@router.post("/orders/{order_id}/pickup")
async def pickup_order(
    order_id: int,
    db: Session = Depends(get_db),
    rider = Depends(get_current_rider),
):
    """确认到店取餐"""
    delivery = db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.order_id == order_id,
        models.DeliveryOrder.rider_id == rider.id
    ).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="配送单不存在")

    delivery.status = "picked_up"
    delivery.pickup_time = datetime.now()
    db.commit()

    return { "code": 200, "message": "已到店取餐", "data": {"order_id": order_id} }


@router.post("/orders/{order_id}/deliver")
async def deliver_order(
    order_id: int,
    db: Session = Depends(get_db),
    rider = Depends(get_current_rider),
):
    """确认送达"""
    delivery = db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.order_id == order_id,
        models.DeliveryOrder.rider_id == rider.id
    ).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="配送单不存在")

    delivery.status = "delivered"
    delivery.deliver_time = datetime.now()

    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if order:
        order.status = "completed"

    db.commit()

    return { "code": 200, "message": "已确认送达", "data": {"order_id": order_id} }


@router.get("/me")
async def rider_me(
    db: Session = Depends(get_db),
    rider = Depends(get_current_rider),
):
    """获取骑手信息"""
    store = db.query(models.Store).filter(models.Store.id == rider.store_id).first()
    today_orders = db.query(models.DeliveryOrder).filter(
        models.DeliveryOrder.rider_id == rider.id,
        models.DeliveryOrder.status == "delivered"
    ).count()

    return {
        "code": 200,
        "message": "success",
        "data": {
            "id": rider.id,
            "name": rider.name,
            "phone": rider.phone,
            "status": rider.status,
            "store_id": rider.store_id,
            "store_name": store.name if store else "",
            "today_orders": today_orders,
        }
    }


@router.put("/location")
async def update_location(
    lat: float,
    lng: float,
    db: Session = Depends(get_db),
    rider = Depends(get_current_rider),
):
    """更新骑手位置"""
    rider.current_lat = lat
    rider.current_lng = lng
    db.commit()
    return { "code": 200, "message": "位置已更新", "data": {"lat": lat, "lng": lng} }
