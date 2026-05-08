"""
畅点餐 - 全局配置
生产环境配置指南见 docs/production-checklist.md
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """应用配置"""

    # ── 应用 ────────────────────────────────────────────────
    APP_NAME: str = "畅点餐"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── 环境模式 ────────────────────────────────────────────
    # 设置为 "production" 启用生产模式安全配置
    ENV_MODE: str = "development"  # development / production

    # ── 数据库 ──────────────────────────────────────────────
    # 开发环境: sqlite:///./canting.db
    # 生产环境: mysql+pymysql://user:pass@localhost:3306/canting
    DATABASE_URL: str = "sqlite:///./canting.db"

    # 数据库连接池配置（生产环境 MySQL）
    DB_POOL_SIZE: int = 10          # 连接池最小连接数
    DB_MAX_OVERFLOW: int = 20       # 连接池最大溢出数
    DB_POOL_TIMEOUT: int = 30       # 连接获取超时（秒）
    DB_POOL_RECYCLE: int = 3600     # 连接回收时间（秒）

    # ── CORS 白名单 ─────────────────────────────────────────
    # 生产环境必须配置！不允许使用 *（存在安全风险）
    # 开发环境可以使用 ["http://localhost:5173", "http://localhost:3000"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # ── JWT 认证 ────────────────────────────────────────────
    SECRET_KEY: str = "changdiancan-secret-key-2024-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7   # 7天

    # Refresh Token 配置
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30              # Refresh Token 有效期（天）
    REFRESH_TOKEN_SECRET_KEY: str = "changdiancan-refresh-secret-key-change-in-production"

    # ── 限流配置 ─────────────────────────────────────────────
    # 使用 slowapi 限流中间件
    RATE_LIMIT_PER_MINUTE: int = 60      # 每分钟最大请求数（普通接口）
    RATE_LIMIT_AUTH_PER_MINUTE: int = 10 # 每分钟最大请求数（认证接口，防暴力破解）
    RATE_LIMIT_STRICT_PER_MINUTE: int = 30 # 每分钟最大请求数（支付接口）

    # ── Redis 缓存配置 ──────────────────────────────────────
    # 生产环境建议配置 Redis 以提升性能
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False  # 生产环境设为 True
    CACHE_TTL_SECONDS: int = 300  # 默认缓存时间（秒）

    # ── 微信支付 ────────────────────────────────────────────
    WXPAY_MCHID: str = "1234567890"
    WXPAY_APPID: str = "wxappid123456"
    WXPAY_KEY: str = "wxpaykey123456"
    WXPAY_NOTIFY_URL: str = "https://your-domain.com/api/payment/notify"

    # ── 文件上传 ────────────────────────────────────────────
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    # ── 密码加密 ────────────────────────────────────────────
    # 生产环境建议使用更安全的加密方式
    PASSWORD_MIN_LENGTH: int = 6
    PASSWORD_MAX_LENGTH: int = 128

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def get_cors_origins() -> List[str]:
    """获取 CORS 白名单"""
    settings = get_settings()

    if settings.ENV_MODE == "production":
        # 生产环境必须有明确的域名配置
        if settings.CORS_ORIGINS == ["http://localhost:5173", "http://localhost:3000"]:
            print("⚠️ 警告: 生产环境未配置 CORS 白名单，请修改 .env 中的 CORS_ORIGINS")
        return settings.CORS_ORIGINS
    else:
        # 开发环境允许的来源
        dev_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]
        return list(set(settings.CORS_ORIGINS + dev_origins))
