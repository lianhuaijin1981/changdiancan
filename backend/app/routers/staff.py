"""
畅点餐 - 店员(厨房)路由
处理店员登录、订单制作管理、出餐确认等
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta, date
from sqlalchemy import func

from app.database import get_db
from app import models, schemas
from app.models import Staff, Order, OrderItem
from app.auth import verify_password, get_password_hash, create_access_token

router = APIRouter(tags=["店员"])


async def get_current_staff(
    token: str = Query(..., description="店员认证Token"),
    db: Session = Depends(get_db),
) -> Staff:
    """获取当前登录店员"""
    from jose import JWTError, jwt
    from app.config import get_settings
    settings = get_settings()

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的店员认证信息",
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        staff_id: int = payload.get("staff_id")
        token_type: str = payload.get("type")
        if staff_id is None or token_type != "staff":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if staff is None:
        raise credentials_exception
    return staff


@router.post("/login", response_model=schemas.ResponseModel)
def staff_login(
    login_data: schemas.StaffLogin,
    db: Session = Depends(get_db),
):
    """
    店员登录
    - 使用手机号+密码登录
    - 返回店员认证Token
    """
    staff = db.query(Staff).filter(Staff.phone == login_data.phone).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
        )

    if not verify_password(login_data.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
        )

    if staff.status != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被禁用",
        )

    # 生成店员专属Token
    access_token = create_access_token(
        data={
            "staff_id": staff.id,
            "type": "staff",
            "name": staff.name,
            "role": staff.role,
        },
        expires_delta=timedelta(hours=8),
    )

    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 28800,  # 8小时
            "staff": {
                "id": staff.id,
                "name": staff.name,
                "phone": staff.phone,
                "role": staff.role,
                "store_id": staff.store_id,
                "status": staff.status,
            },
        },
    }


@router.get("/orders", response_model=schemas.ResponseModel)
def list_kitchen_orders(
    store_id: int = Query(..., description="门店ID"),
    status: Optional[str] = Query(None, description="状态筛选: pending/paid/preparing/ready"),
    db: Session = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    """
    获取厨房待处理订单列表
    - 查询门店的待制作、制作中、待上菜的订单
    """
    # 验证店员是否属于该门店
    if current_staff.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看其他门店订单",
        )

    query = db.query(Order).filter(Order.store_id == store_id)

    # 厨房关注的订单状态
    if status:
        query = query.filter(Order.status == status)
    else:
        # 默认查询厨房需要处理的订单
        query = query.filter(
            Order.status.in_(["paid", "preparing", "ready"])
        )

    orders = query.order_by(Order.created_at.asc()).all()

    result = []
    for order in orders:
        items = []
        for item in order.items:
            items.append({
                "id": item.id,
                "dish_id": item.dish_id,
                "dish_name": item.dish_name,
                "dish_image": item.dish_image,
                "quantity": item.quantity,
                "specs": item.specs,
                "subtotal": item.subtotal,
                "status": item.status,
            })

        result.append({
            "id": order.id,
            "order_no": order.order_no,
            "order_type": order.order_type,
            "status": order.status,
            "pay_status": order.pay_status,
            "total_amount": order.total_amount,
            "pay_amount": order.pay_amount,
            "remark": order.remark,
            "table_id": order.table_id,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "items": items,
        })

    return {
        "code": 200,
        "message": "success",
        "data": result,
    }


@router.put("/orders/{id}/prepare", response_model=schemas.ResponseModel)
def start_prepare_order(
    id: int,
    db: Session = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    """
    开始制作订单
    - 将订单状态从已支付更新为制作中
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在",
        )

    # 验证店员是否属于该门店
    if current_staff.store_id != order.store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作其他门店订单",
        )

    if order.status not in ["pending", "paid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"当前订单状态为 {order.status}，不可开始制作",
        )

    order.status = "preparing"

    # 同时更新订单项的状态
    for item in order.items:
        if item.status == "pending":
            item.status = "preparing"

    db.commit()

    return {
        "code": 200,
        "message": "开始制作订单",
        "data": {
            "order_id": order.id,
            "order_no": order.order_no,
            "status": "preparing",
        },
    }


@router.put("/orders/{id}/complete", response_model=schemas.ResponseModel)
def complete_order(
    id: int,
    db: Session = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    """
    完成订单制作
    - 将订单状态从制作中更新为待上菜
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在",
        )

    if current_staff.store_id != order.store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作其他门店订单",
        )

    if order.status != "preparing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"当前订单状态为 {order.status}，不可标记为完成",
        )

    order.status = "ready"

    # 更新所有订单项为已完成
    for item in order.items:
        item.status = "completed"

    db.commit()

    return {
        "code": 200,
        "message": "订单制作完成",
        "data": {
            "order_id": order.id,
            "order_no": order.order_no,
            "status": "ready",
        },
    }


@router.put("/orders/{id}/serve", response_model=schemas.ResponseModel)
def serve_order(
    id: int,
    db: Session = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    """
    确认上菜
    - 将订单状态从待上菜更新为已上菜
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单不存在",
        )

    if current_staff.store_id != order.store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作其他门店订单",
        )

    if order.status != "ready":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"当前订单状态为 {order.status}，不可确认上菜",
        )

    order.status = "served"

    db.commit()

    return {
        "code": 200,
        "message": "确认上菜成功",
        "data": {
            "order_id": order.id,
            "order_no": order.order_no,
            "status": "served",
        },
    }


@router.get("/stats", response_model=schemas.ResponseModel)
def get_kitchen_stats(
    store_id: int = Query(..., description="门店ID"),
    db: Session = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    """
    厨房今日统计
    - 今日总订单数、待制作数、制作中数、已完成数
    """
    if current_staff.store_id != store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权查看其他门店统计",
        )

    today = date.today()
    today_start = datetime.combine(today, datetime.min.time())
    today_end = datetime.combine(today, datetime.max.time())

    # 今日总订单数
    total_orders = (
        db.query(func.count(Order.id))
        .filter(Order.store_id == store_id)
        .filter(Order.created_at >= today_start)
        .filter(Order.created_at <= today_end)
        .scalar()
    )

    # 待制作（已支付但未开始制作）
    pending_count = (
        db.query(func.count(Order.id))
        .filter(Order.store_id == store_id)
        .filter(Order.status == "paid")
        .scalar()
    )

    # 制作中
    preparing_count = (
        db.query(func.count(Order.id))
        .filter(Order.store_id == store_id)
        .filter(Order.status == "preparing")
        .scalar()
    )

    # 已完成（待上菜+已上菜+已完成）
    completed_count = (
        db.query(func.count(Order.id))
        .filter(Order.store_id == store_id)
        .filter(Order.status.in_(["ready", "served", "completed"]))
        .scalar()
    )

    # 待上菜
    ready_count = (
        db.query(func.count(Order.id))
        .filter(Order.store_id == store_id)
        .filter(Order.status == "ready")
        .scalar()
    )

    return {
        "code": 200,
        "message": "success",
        "data": {
            "store_id": store_id,
            "date": today.isoformat(),
            "total_orders": total_orders or 0,
            "pending": pending_count or 0,
            "preparing": preparing_count or 0,
            "ready": ready_count or 0,
            "completed": completed_count or 0,
            "in_progress": (pending_count or 0) + (preparing_count or 0),
        },
    }


@router.put("/items/{id}/status", response_model=schemas.ResponseModel)
def update_order_item_status(
    id: int,
    new_status: str = Query(..., description="新状态: pending/preparing/completed"),
    db: Session = Depends(get_db),
    current_staff: Staff = Depends(get_current_staff),
):
    """
    更新单个菜品项的状态
    - 将某个菜品的制作状态更新
    """
    if new_status not in ["pending", "preparing", "completed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="无效的状态值，可选: pending/preparing/completed",
        )

    item = db.query(OrderItem).filter(OrderItem.id == id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="订单项不存在",
        )

    # 验证店员是否属于该订单对应的门店
    order = db.query(Order).filter(Order.id == item.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="关联订单不存在",
        )

    if current_staff.store_id != order.store_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权操作其他门店订单",
        )

    item.status = new_status
    db.commit()

    return {
        "code": 200,
        "message": "菜品状态更新成功",
        "data": {
            "item_id": item.id,
            "dish_name": item.dish_name,
            "status": new_status,
            "order_id": order.id,
        },
    }
