"""
畅点餐 - 骑手配送路由
处理骑手登录、接单、取餐、配送、位置更新等
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta

from app.database import get_db
from app import models, schemas
from app.models import Rider, Order, DeliveryOrder
from app.auth import verify_password, get_password_hash, create_access_token

router = APIRouter(tags=["骑手"])


async def get_current_rider(
    token: str = Query(..., description="骑手认证Token"),
    db: Session = Depends(get_db),
) -> Rider:
    """获取当前登录骑手"""
    from jose import JWTError, jwt
    from app.config import get_settings
    settings = get_settings()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的骑手认证信息",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        rider_id: int = payload.get("rider_id")
        token_type: str = payload.get("type")
        if rider_id is None or token_type != "rider":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    rider = db.query(Rider).filter(Rider.id == rider_id).first()
    if rider is None:
        raise credentials_exception
    return rider


@router.post("/login", response_model=schemas.ResponseModel)
def rider_login(
    login_data: schemas.RiderLogin,
    db: Session = Depends(get_db),
):
    """
    骑手登录
    - 使用手机号+密码登录
    - 返回骑手认证Token
    """
    rider = db.query(Rider).filter(Rider.phone == login_data.phone).first()
    if not rider:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
        )

    if not verify_password(login_data.password, rider.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
        )

    # 生成骑手专属Token
    access_token = create_access_token(
        data={
            "rider_id": rider.id,
            "type": "rider",
            "name": rider.name,
        },
        expires_delta=timedelta(hours=12),
    )

    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 43200,  # 12小时
            "rider": {
                "id": rider.id,
                "name": rider.name,
                "phone": rider.phone,
                "status": rider.status,
            },
        },
    }


@router.get("/orders", response_model=schemas.ResponseModel)
def list_available_orders(
    store_id: Optional[int] = Query(None, description="门店ID筛选"),
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    获取待接单的配送订单列表
    - 查询附近门店待接单的配送订单
    """
    query = (
        db.query(DeliveryOrder)
        .filter(DeliveryOrder.status == "waiting")
        .filter(DeliveryOrder.rider_id.is_(None))
    )

    if store_id:
        # 关联订单表查询门店
        query = query.join(Order).filter(Order.store_id == store_id)

    delivery_orders = query.order_by(DeliveryOrder.created_at.desc()).all()

    result = []
    for do in delivery_orders:
        order = db.query(Order).filter(Order.id == do.order_id).first()
        if order:
            result.append({
                "delivery_id": do.id,
                "order_id": do.order_id,
                "order_no": order.order_no,
                "delivery_address": do.delivery_address,
                "fee": do.fee,
                "lat": do.lat,
                "lng": do.lng,
                "created_at": do.created_at.isoformat() if do.created_at else None,
                "delivery_name": order.delivery_name,
                "delivery_phone": order.delivery_phone,
                "pay_amount": order.pay_amount,
            })

    return {
        "code": 200,
        "message": "success",
        "data": result,
    }


@router.post("/orders/{id}/accept", response_model=schemas.ResponseModel)
def accept_delivery_order(
    id: int,
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    骑手接单
    - 骑手接受配送订单
    """
    delivery = db.query(DeliveryOrder).filter(DeliveryOrder.id == id).first()
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配送订单不存在",
        )

    if delivery.status != "waiting":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该订单已被接单或不可接单",
        )

    # 骑手接单
    delivery.rider_id = current_rider.id
    delivery.status = "accepted"

    # 更新骑手状态为忙碌
    current_rider.status = "busy"

    db.commit()
    db.refresh(delivery)

    return {
        "code": 200,
        "message": "接单成功",
        "data": {
            "delivery_id": delivery.id,
            "order_id": delivery.order_id,
            "rider_id": current_rider.id,
            "status": delivery.status,
        },
    }


@router.post("/orders/{id}/pickup", response_model=schemas.ResponseModel)
def confirm_pickup(
    id: int,
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    确认取餐
    - 骑手到达餐厅确认已取餐
    """
    delivery = db.query(DeliveryOrder).filter(
        DeliveryOrder.id == id,
        DeliveryOrder.rider_id == current_rider.id,
    ).first()
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配送订单不存在或不属于当前骑手",
        )

    if delivery.status not in ["accepted", "waiting"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前状态不可确认取餐",
        )

    now = datetime.now()
    delivery.status = "picked_up"
    delivery.pickup_time = now

    # 同步更新主订单状态
    order = db.query(Order).filter(Order.id == delivery.order_id).first()
    if order:
        order.status = "delivering"

    db.commit()

    return {
        "code": 200,
        "message": "确认取餐成功",
        "data": {
            "delivery_id": delivery.id,
            "status": "picked_up",
            "pickup_time": now.isoformat(),
        },
    }


@router.post("/orders/{id}/deliver", response_model=schemas.ResponseModel)
def confirm_deliver(
    id: int,
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    确认送达
    - 骑手将餐品送达给顾客
    """
    delivery = db.query(DeliveryOrder).filter(
        DeliveryOrder.id == id,
        DeliveryOrder.rider_id == current_rider.id,
    ).first()
    if not delivery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="配送订单不存在或不属于当前骑手",
        )

    if delivery.status != "picked_up":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="当前状态不可确认送达",
        )

    now = datetime.now()
    delivery.status = "delivered"
    delivery.deliver_time = now

    # 同步更新主订单状态为已完成
    order = db.query(Order).filter(Order.id == delivery.order_id).first()
    if order:
        order.status = "completed"

    # 骑手恢复在线状态
    current_rider.status = "online"

    db.commit()

    return {
        "code": 200,
        "message": "确认送达成功",
        "data": {
            "delivery_id": delivery.id,
            "status": "delivered",
            "deliver_time": now.isoformat(),
        },
    }


@router.put("/location", response_model=schemas.ResponseModel)
def update_location(
    location: schemas.RiderUpdateLocation,
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    更新骑手位置
    - 实时上报骑手当前经纬度
    """
    current_rider.current_lat = location.lat
    current_rider.current_lng = location.lng

    db.commit()

    return {
        "code": 200,
        "message": "位置更新成功",
        "data": {
            "rider_id": current_rider.id,
            "lat": location.lat,
            "lng": location.lng,
            "updated_at": datetime.now().isoformat(),
        },
    }


@router.get("/my-orders", response_model=schemas.ResponseModel)
def get_my_delivery_orders(
    status: Optional[str] = Query(None, description="状态筛选: waiting/accepted/picked_up/delivered"),
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    获取骑手的配送订单
    - 查询当前骑手已接的配送订单
    """
    query = db.query(DeliveryOrder).filter(
        DeliveryOrder.rider_id == current_rider.id,
    )

    if status:
        query = query.filter(DeliveryOrder.status == status)
    else:
        # 默认查询进行中的订单（不含已送达）
        query = query.filter(DeliveryOrder.status.in_(["accepted", "picked_up", "delivering"]))

    delivery_orders = query.order_by(DeliveryOrder.created_at.desc()).all()

    result = []
    for do in delivery_orders:
        order = db.query(Order).filter(Order.id == do.order_id).first()
        item = {
            "delivery_id": do.id,
            "order_id": do.order_id,
            "status": do.status,
            "delivery_address": do.delivery_address,
            "fee": do.fee,
            "lat": do.lat,
            "lng": do.lng,
            "pickup_time": do.pickup_time.isoformat() if do.pickup_time else None,
            "deliver_time": do.deliver_time.isoformat() if do.deliver_time else None,
            "created_at": do.created_at.isoformat() if do.created_at else None,
        }
        if order:
            item.update({
                "order_no": order.order_no,
                "delivery_name": order.delivery_name,
                "delivery_phone": order.delivery_phone,
                "pay_amount": order.pay_amount,
                "store_id": order.store_id,
            })
        result.append(item)

    return {
        "code": 200,
        "message": "success",
        "data": result,
    }


@router.put("/status", response_model=schemas.ResponseModel)
def update_rider_status(
    new_status: str = Query(..., description="新状态: online在线 offline离线 busy忙碌"),
    db: Session = Depends(get_db),
    current_rider: Rider = Depends(get_current_rider),
):
    """
    更新骑手状态
    - online: 在线可接单
    - offline: 离线
    - busy: 忙碌中（配送中）
    """
    if new_status not in ["online", "offline", "busy"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的状态值，可选: online/offline/busy",
        )

    current_rider.status = new_status
    db.commit()

    return {
        "code": 200,
        "message": "状态更新成功",
        "data": {
            "rider_id": current_rider.id,
            "status": new_status,
            "updated_at": datetime.now().isoformat(),
        },
    }
