"""
畅点餐 - 认证路由
处理用户注册、登录、Token刷新、微信登录及个人信息管理
安全加固版本：支持 refresh_token 刷新机制
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import get_settings
from app.database import get_db
from app import schemas
from app.models import User, MemberLevel
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_access_token,
    verify_refresh_token,
    require_auth,
    get_optional_user,
)

settings = get_settings()
router = APIRouter(tags=["认证"])

# 限流器实例（在 main.py 中初始化）
limiter = Limiter(key_func=get_remote_address)


# ---- 辅助函数 ----

def _build_token_response(user: User, include_refresh: bool = False) -> schemas.TokenResponse:
    """构建 Token 响应"""
    access_token = create_access_token(data={"sub": str(user.id)})

    resp_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        "user": {
            "id": user.id,
            "phone": user.phone or "",
            "nickname": user.nickname,
            "avatar": user.avatar,
            "member_level_id": user.member_level_id,
        },
    }

    if include_refresh:
        refresh_token = create_refresh_token(data={"sub": str(user.id)})
        resp_data["refresh_token"] = refresh_token

    return schemas.TokenResponse(**resp_data)


def _check_phone_exists(db: Session, phone: str, exclude_id: int = None) -> bool:
    """检查手机号是否已注册"""
    query = db.query(User).filter(User.phone == phone)
    if exclude_id:
        query = query.filter(User.id != exclude_id)
    return query.first() is not None


# ---- 注册 ----

@router.post("/register", response_model=schemas.TokenResponse)
@limiter.limit(f"{settings.RATE_LIMIT_AUTH_PER_MINUTE}/minute")  # 认证接口限流
async def register(
    request: Request,
    req: schemas.RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    手机号 + 密码注册
    限流：每分钟最多 {RATE_LIMIT_AUTH_PER_MINUTE} 次
    """
    # 检查手机号是否已注册
    if _check_phone_exists(db, req.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该手机号已注册",
        )

    # 创建用户，密码哈希存储，默认会员等级为 1
    user = User(
        phone=req.phone,
        password_hash=get_password_hash(req.password),
        nickname=req.nickname or f"用户{req.phone[-4:]}",
        member_level_id=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 生成 Token（包含 refresh_token）
    return _build_token_response(user, include_refresh=True)


# ---- 登录 ----

@router.post("/login", response_model=schemas.TokenResponse)
@limiter.limit(f"{settings.RATE_LIMIT_AUTH_PER_MINUTE}/minute")  # 认证接口限流
async def login(
    request: Request,
    req: schemas.LoginRequest,
    db: Session = Depends(get_db),
):
    """
    手机号 + 密码登录
    限流：每分钟最多 {RATE_LIMIT_AUTH_PER_MINUTE} 次
    """
    user = db.query(User).filter(User.phone == req.phone).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
        )
    if not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="该账号未设置密码，请使用微信登录",
        )
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="手机号或密码错误",
        )

    # 生成 Token（包含 refresh_token）
    return _build_token_response(user, include_refresh=True)


# ---- Token 刷新 ----

@router.post("/refresh", response_model=schemas.TokenResponse)
@limiter.limit(f"{settings.RATE_LIMIT_AUTH_PER_MINUTE}/minute")
async def refresh_token(
    request: Request,
    req: schemas.RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    使用 Refresh Token 获取新的 Access Token
    限流：每分钟最多 {RATE_LIMIT_AUTH_PER_MINUTE} 次
    """
    # 验证 refresh_token
    user_id = verify_refresh_token(req.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh Token 无效或已过期，请重新登录",
        )

    # 获取用户
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在",
        )

    # 生成新的 Token 对（返回新的 refresh_token 以支持 refresh_token 轮换）
    return _build_token_response(user, include_refresh=True)


# ---- 微信登录（模拟） ----

@router.post("/wechat-login", response_model=schemas.TokenResponse)
@limiter.limit(f"{settings.RATE_LIMIT_AUTH_PER_MINUTE}/minute")
async def wechat_login(
    request: Request,
    req: schemas.WechatLoginRequest,
    db: Session = Depends(get_db),
):
    """
    模拟微信登录
    - 接收微信授权 code，解析出 openid
    - 若用户不存在则自动创建（无密码，依赖微信身份）
    - 返回 JWT Token
    """
    # 模拟：将 code 的 MD5 前 28 位作为 openid
    import hashlib

    fake_openid = "wx_" + hashlib.md5(req.code.encode()).hexdigest()[:28]

    user = db.query(User).filter(User.openid == fake_openid).first()

    if not user:
        # 拉取用户信息（模拟）
        nickname = ""
        avatar = ""
        if req.userInfo:
            nickname = req.userInfo.get("nickName", "")
            avatar = req.userInfo.get("avatarUrl", "")

        user = User(
            openid=fake_openid,
            nickname=nickname or f"用户{fake_openid[-6:]}",
            avatar=avatar,
            member_level_id=1,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # 更新用户信息（如果提供了）
        if req.userInfo:
            if req.userInfo.get("nickName"):
                user.nickname = req.userInfo["nickName"]
            if req.userInfo.get("avatarUrl"):
                user.avatar = req.userInfo["avatarUrl"]
            db.commit()
            db.refresh(user)

    # 生成 Token（包含 refresh_token）
    return _build_token_response(user, include_refresh=True)


# ---- 获取当前用户信息 ----

@router.get("/me", response_model=schemas.UserResponse)
async def get_me(
    user: User = Depends(require_auth),
):
    """获取当前登录用户信息"""
    return user


# ---- 更新个人信息 ----

@router.put("/me", response_model=schemas.UserResponse)
async def update_me(
    req: schemas.UserUpdateRequest,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    """更新当前用户资料（昵称、头像等）"""
    if req.nickname is not None:
        user.nickname = req.nickname
    if req.avatar is not None:
        user.avatar = req.avatar

    db.commit()
    db.refresh(user)
    return user
