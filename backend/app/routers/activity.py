"""
畅点餐 - 营销活动路由
支持秒杀、拼团、限时特价、第二份半价、充值赠送等活动
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.models import Activity
from app.auth import require_auth

router = APIRouter(tags=["营销活动"])


@router.get("/", response_model=schemas.ResponseModel)
def list_activities(
    store_id: Optional[int] = Query(None, description="门店ID"),
    status: Optional[int] = Query(None, description="活动状态: 0未开始 1进行中 2已结束 3已停用"),
    type: Optional[str] = Query(None, description="活动类型: seckill秒杀 group拼团 limit限时特价 second_half第二份半价 recharge充值赠送"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db),
):
    """
    活动列表
    - 支持按门店、状态、类型筛选
    - 分页返回
    """
    query = db.query(Activity)

    if store_id is not None:
        query = query.filter(Activity.store_id == store_id)
    if status is not None:
        query = query.filter(Activity.status == status)
    if type is not None:
        query = query.filter(Activity.type == type)

    total = query.count()
    activities = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "code": 200,
        "message": "success",
        "data": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "items": activities,
        },
    }


@router.get("/{id}", response_model=schemas.ResponseModel)
def get_activity(
    id: int,
    db: Session = Depends(get_db),
):
    """
    活动详情
    - 获取单个活动的详细信息
    """
    activity = db.query(Activity).filter(Activity.id == id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活动不存在",
        )

    return {
        "code": 200,
        "message": "success",
        "data": activity,
    }


@router.post("/", response_model=schemas.ResponseModel, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity_in: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_auth),
):
    """
    创建活动
    - 支持类型: seckill秒杀 group拼团 limit限时特价 second_half第二份半价 recharge充值赠送
    """
    activity = Activity(
        store_id=activity_in.store_id,
        title=activity_in.title,
        type=activity_in.type,
        config=activity_in.config,
        start_time=activity_in.start_time,
        end_time=activity_in.end_time,
        status=0,  # 默认未开始
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {
        "code": 201,
        "message": "活动创建成功",
        "data": activity,
    }


@router.put("/{id}", response_model=schemas.ResponseModel)
def update_activity(
    id: int,
    activity_in: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_auth),
):
    """
    更新活动
    - 更新活动信息
    """
    activity = db.query(Activity).filter(Activity.id == id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活动不存在",
        )

    update_data = activity_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    db.commit()
    db.refresh(activity)

    return {
        "code": 200,
        "message": "活动更新成功",
        "data": activity,
    }


@router.delete("/{id}", response_model=schemas.ResponseModel)
def delete_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_auth),
):
    """
    删除活动
    - 从数据库中删除活动记录
    """
    activity = db.query(Activity).filter(Activity.id == id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活动不存在",
        )

    db.delete(activity)
    db.commit()

    return {
        "code": 200,
        "message": "活动删除成功",
        "data": {"id": id},
    }


@router.get("/now/list", response_model=schemas.ResponseModel)
def get_ongoing_activities(
    store_id: int = Query(..., description="门店ID"),
    db: Session = Depends(get_db),
):
    """
    当前进行中的活动
    - 查询指定门店当前正在进行的活动列表
    """
    now = datetime.now()

    activities = (
        db.query(Activity)
        .filter(Activity.store_id == store_id)
        .filter(Activity.start_time <= now)
        .filter(Activity.end_time >= now)
        .filter(Activity.status == 1)
        .all()
    )

    return {
        "code": 200,
        "message": "success",
        "data": activities,
    }


@router.post("/{id}/join", response_model=schemas.ResponseModel)
def join_activity(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_auth),
):
    """
    参与活动
    - 用户参与活动（如创建拼团）
    - 根据活动类型执行不同的参与逻辑
    """
    activity = db.query(Activity).filter(Activity.id == id).first()
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活动不存在",
        )

    now = datetime.now()
    if activity.start_time and activity.start_time > now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活动尚未开始",
        )
    if activity.end_time and activity.end_time < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活动已结束",
        )
    if activity.status != 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="活动当前不可参与",
        )

    # 根据活动类型处理不同的参与逻辑
    result_data: Dict[str, Any] = {
        "activity_id": id,
        "type": activity.type,
        "title": activity.title,
    }

    if activity.type == "seckill":
        result_data["action"] = "参与秒杀成功"
        result_data["message"] = "秒杀资格已锁定，请在规定时间内完成下单"

    elif activity.type == "group":
        result_data["action"] = "发起拼团成功"
        result_data["message"] = "拼团已创建，邀请好友参与"
        result_data["group_info"] = activity.config.get("group_info", {})

    elif activity.type == "limit":
        result_data["action"] = "参与活动成功"
        result_data["message"] = f"限时特价活动已生效，请在活动期内下单"

    elif activity.type == "second_half":
        result_data["action"] = "参与活动成功"
        result_data["message"] = "第二份半价优惠已生效"

    elif activity.type == "recharge":
        result_data["action"] = "参与活动成功"
        result_data["message"] = "充值赠送活动已生效"
        config = activity.config or {}
        result_data["bonus"] = config.get("bonus_amount", 0)

    else:
        result_data["action"] = "参与活动成功"
        result_data["message"] = "活动参与成功"

    return {
        "code": 200,
        "message": "参与活动成功",
        "data": result_data,
    }
