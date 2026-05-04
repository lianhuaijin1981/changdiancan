"""
畅点餐 - 全局配置
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    # 应用
    APP_NAME: str = "畅点餐"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # 数据库
    DATABASE_URL: str = "sqlite:///./canting.db"

    # JWT
    SECRET_KEY: str = "changdiancan-secret-key-2024-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天

    # 微信支付（模拟）
    WXPAY_MCHID: str = "1234567890"
    WXPAY_APPID: str = "wxappid123456"
    WXPAY_KEY: str = "wxpaykey123456"
    WXPAY_NOTIFY_URL: str = "https://your-domain.com/api/payment/notify"

    # 文件上传
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
