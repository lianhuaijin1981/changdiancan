"""
畅点餐 - 认证路由
处理用户注册、登录、微信登录及个人信息管理
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.database import get_db
from app import schemas
from app.models import User, MemberLevel
from app.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    require_auth,
    get_optional_user,
)

router = APIRouter(tags=["认证"])


# ---- 注册 ----

@router.post("/register", response_model=schemas.TokenResponse)
def register(
    req: schemas.RegisterRequest,
    db: Session = Depends(get_db),
):
    """手机号 + 密码注册"""
    # 检查手机号是否已注册
    existing = db.query(User).filter(User.phone == req.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该手机号已注册",
        )

    # 创建用户，密码哈希存储，默认会员等级为 1
    user = User(
        phone=req.phone,
        password_hash=get_password_hash(req.password),
        nickname=req.nickname or req.phone[-4:],
        member_level_id=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 生成 JWT Token
    access_token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=1440,  # 24h = 1440 分钟
        user={
            "id": user.id,
            "phone": user.phone,
            "nickname": user.nickname,
            "avatar": user.avatar,
            "member_level_id": user.member_level_id,
        },
    )


# ---- 登录 ----

@router.post("/login", response_model=schemas.TokenResponse)
def login(
    req: schemas.LoginRequest,
    db: Session = Depends(get_db),
):
    """手机号 + 密码登录"""
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

    access_token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=1440,
        user={
            "id": user.id,
            "phone": user.phone,
            "nickname": user.nickname,
            "avatar": user.avatar,
            "member_level_id": user.member_level_id,
        },
    )


# ---- 微信登录（模拟） ----

@router.post("/wechat-login", response_model=schemas.TokenResponse)
def wechat_login(
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

    access_token = create_access_token(data={"sub": str(user.id)})
    return schemas.TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=1440,
        user={
            "id": user.id,
            "phone": user.phone or "",
            "nickname": user.nickname,
            "avatar": user.avatar,
            "member_level_id": user.member_level_id,
        },
    )


# ---- 获取当前用户信息 ----

@router.get("/me", response_model=schemas.UserResponse)
def get_me(
    user: User = Depends(require_auth),
):
    """获取当前登录用户信息"""
    return user


# ---- 更新个人信息 ----

@router.put("/me", response_model=schemas.UserResponse)
def update_me(
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
