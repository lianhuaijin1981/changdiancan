"""
畅点餐 - 数据库连接与 ORM 基类
支持 SQLite 开发环境和 MySQL/PostgreSQL 生产环境
"""
from sqlalchemy import create_engine, event, pool
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.engine import Engine
from app.config import get_settings
import os

settings = get_settings()

# ── 数据库引擎创建 ─────────────────────────────────────────────
def create_database_engine():
    """创建数据库引擎，支持连接池配置"""
    db_url = settings.DATABASE_URL

    # 确保数据库目录存在（仅 SQLite）
    if db_url.startswith("sqlite"):
        db_path = db_url.replace("sqlite:///.", ".")
        os.makedirs(
            os.path.dirname(os.path.abspath(db_path)) if "/" in db_path else ".",
            exist_ok=True
        )

    # 连接参数
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
    elif db_url.startswith("mysql"):
        # MySQL 连接参数
        connect_args = {
            "charset": "utf8mb4",
        }

    # 引擎配置
    engine_args = {
        "connect_args": connect_args,
        "echo": settings.DEBUG,
        "pool_pre_ping": True,  # 连接前检测
    }

    # ── 生产环境 MySQL 连接池配置 ──────────────────────────
    if not db_url.startswith("sqlite"):
        engine_args.update({
            "pool_size": settings.DB_POOL_SIZE,           # 池大小
            "max_overflow": settings.DB_MAX_OVERFLOW,     # 最大溢出
            "pool_timeout": settings.DB_POOL_TIMEOUT,     # 获取超时
            "pool_recycle": settings.DB_POOL_RECYCLE,     # 连接回收
            "poolclass": pool.QueuePool,                  # 队列池
        })

    return create_engine(db_url, **engine_args)


engine = create_database_engine()

# ── SQLite 特殊配置 ────────────────────────────────────────────
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """启用 SQLite 外键约束"""
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        # 性能优化
        cursor.execute("PRAGMA journal_mode=WAL")        # WAL 模式
        cursor.execute("PRAGMA synchronous=NORMAL")       # 同步模式
        cursor.execute("PRAGMA cache_size=-64000")       # 64MB 缓存
        cursor.close()


# ── 会话工厂 ───────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Session:
    """获取数据库会话（依赖注入用）"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """初始化数据库（创建所有表）"""
    Base.metadata.create_all(bind=engine)


def check_db_connection() -> bool:
    """检查数据库连接是否正常"""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"数据库连接检查失败: {e}")
        return False
