"""
畅点餐 - 商家路由
处理商家注册、登录、工作台数据
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import get_password_hash, verify_password, create_access_token, require_auth

router = APIRouter()


@router.post("/register", response_model=schemas.ResponseModel)
async def merchant_register(
    data: schemas.RegisterRequest,
    db: Session = Depends(get_db),
):
    """商家注册：同时创建门店和商家账号"""
    # 检查手机号是否已被注册为店员
    existing = db.query(models.Staff).filter(models.Staff.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="该手机号已被注册")

    # 创建默认门店
    store = models.Store(
        name="我的店铺",
        address="",
        phone=data.phone,
        business_hours="09:00-22:00",
        status=1,
    )
    db.add(store)
    db.flush()

    # 创建商家账号（role=manager，对应店长权限）
    staff = models.Staff(
        store_id=store.id,
        name=data.nickname or "店长",
        phone=data.phone,
        password_hash=get_password_hash(data.password),
        role="manager",
        status=1,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)

    # 生成 token
    token = create_access_token({"sub": str(staff.id), "type": "merchant", "store_id": store.id})

    return {
        "code": 200,
        "message": "注册成功",
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "store_id": store.id,
            "staff_id": staff.id,
            "store_name": store.name,
        }
    }


@router.post("/login", response_model=schemas.ResponseModel)
async def merchant_login(
    data: schemas.LoginRequest,
    db: Session = Depends(get_db),
):
    """商家登录"""
    staff = db.query(models.Staff).filter(models.Staff.phone == data.phone).first()
    if not staff or not verify_password(data.password, staff.password_hash):
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    if staff.status == 0:
        raise HTTPException(status_code=403, detail="账号已被禁用")

    store = db.query(models.Store).filter(models.Store.id == staff.store_id).first()

    token = create_access_token({"sub": str(staff.id), "type": "merchant", "store_id": staff.store_id})

    return {
        "code": 200,
        "message": "登录成功",
        "data": {
            "access_token": token,
            "token_type": "bearer",
            "store_id": staff.store_id,
            "staff_id": staff.id,
            "name": staff.name,
            "role": staff.role,
            "store_name": store.name if store else "",
        }
    }


@router.get("/me", response_model=schemas.ResponseModel)
async def merchant_me(
    db: Session = Depends(get_db),
    staff = Depends(require_auth),  # 复用现有认证
):
    """获取当前商家信息"""
    store = db.query(models.Store).filter(models.Store.id == staff.store_id).first()
    return {
        "code": 200,
        "message": "success",
        "data": {
            "staff_id": staff.id,
            "name": staff.name,
            "phone": staff.phone,
            "role": staff.role,
            "store_id": staff.store_id,
            "store_name": store.name if store else "",
            "store_status": store.status if store else 0,
        }
    }


@router.get("/dashboard", response_model=schemas.ResponseModel)
async def merchant_dashboard(
    db: Session = Depends(get_db),
    staff = Depends(require_auth),
):
    """商家工作台数据概览"""
    store_id = staff.store_id
    from datetime import datetime, timedelta
    now = datetime.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # 今日订单统计
    today_orders = db.query(models.Order).filter(
        models.Order.store_id == store_id,
        models.Order.created_at >= today_start
    ).all()
    today_count = len(today_orders)
    today_revenue = sum(o.pay_amount for o in today_orders if o.pay_status == "paid")

    # 待处理订单
    pending = db.query(models.Order).filter(
        models.Order.store_id == store_id,
        models.Order.status.in_(["pending", "paid", "preparing"])
    ).count()

    # 桌台状态
    total_tables = db.query(models.Table).filter(models.Table.store_id == store_id).count()
    occupied_tables = db.query(models.Table).filter(
        models.Table.store_id == store_id,
        models.Table.status == "occupied"
    ).count()

    # 本周营收
    week_start = now - timedelta(days=7)
    week_orders = db.query(models.Order).filter(
        models.Order.store_id == store_id,
        models.Order.created_at >= week_start,
        models.Order.pay_status == "paid"
    ).all()
    week_revenue = sum(o.pay_amount for o in week_orders)

    return {
        "code": 200,
        "message": "success",
        "data": {
            "today_count": today_count,
            "today_revenue": round(today_revenue, 2),
            "pending_orders": pending,
            "total_tables": total_tables,
            "occupied_tables": occupied_tables,
            "week_revenue": round(week_revenue, 2),
        }
    }
