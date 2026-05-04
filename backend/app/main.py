"""
畅点餐 - FastAPI 主入口
"""
import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

# 将 backend 加入路径
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import get_settings
from app.database import init_db
from app.models import Store, MemberLevel

settings = get_settings()


async def init_default_data():
    """初始化默认数据"""
    from app.database import SessionLocal
    from app.models import Store, MemberLevel, Category, Dish, Banner
    import random

    db = SessionLocal()
    try:
        # 检查是否已有门店
        if db.query(Store).first():
            return

        # 创建默认门店
        store = Store(
            name="畅点餐旗舰店",
            address="北京市朝阳区美食街88号",
            phone="400-888-6688",
            business_hours="09:00-22:00",
            status=1,
            logo="",
            description="畅点餐官方体验店，提供各类精品美食",
            announcement="🎉 新店开业全场8折！会员充值满100送20！",
            delivery_fee=5.0,
            min_delivery_amount=20.0,
            delivery_range=5.0,
        )
        db.add(store)
        db.flush()

        # 创建会员等级
        levels = [
            MemberLevel(name="普通会员", min_points=0, discount=1.0, icon="medal"),
            MemberLevel(name="银卡会员", min_points=500, discount=0.95, icon="silver-medal"),
            MemberLevel(name="金卡会员", min_points=2000, discount=0.9, icon="gold-medal"),
            MemberLevel(name="钻石会员", min_points=5000, discount=0.85, icon="diamond"),
        ]
        for level in levels:
            db.add(level)

        # 创建菜品分类
        categories_data = [
            {"name": "热销推荐", "sort_order": 0, "icon": "fire"},
            {"name": "精品热菜", "sort_order": 1, "icon": "flame"},
            {"name": "清爽凉菜", "sort_order": 2, "icon": "salad"},
            {"name": "美味主食", "sort_order": 3, "icon": "rice"},
            {"name": "时尚饮品", "sort_order": 4, "icon": "cup"},
            {"name": "超值套餐", "sort_order": 5, "icon": "box"},
        ]
        categories = []
        for cat_data in categories_data:
            cat = Category(store_id=store.id, **cat_data, status=1)
            db.add(cat)
            categories.append(cat)
        db.flush()

        # 创建菜品数据
        dishes_data = [
            # 热销推荐
            {"category_id": categories[0].id, "name": "招牌红烧肉", "price": 48, "original_price": 58, "tags": ["热销", "招牌"], "is_featured": True, "sales_count": 328, "stock": 100, "description": "精选五花肉，肥而不腻，入口即化", "specs": [{"name": "份量", "options": ["小份", "中份", "大份"]}]},
            {"category_id": categories[0].id, "name": "宫保鸡丁", "price": 32, "original_price": 38, "tags": ["热销", "推荐"], "is_featured": True, "sales_count": 256, "stock": 100, "description": "经典川菜，麻辣鲜香", "specs": [{"name": "辣度", "options": ["微辣", "中辣", "特辣"]}]},
            {"category_id": categories[0].id, "name": "蒜蓉粉丝虾", "price": 56, "original_price": 68, "tags": ["热销"], "is_featured": True, "sales_count": 198, "stock": 80, "description": "新鲜大虾配蒜蓉粉丝，蒸制而成", "specs": []},
            # 精品热菜
            {"category_id": categories[1].id, "name": "水煮牛肉", "price": 42, "original_price": 0, "tags": ["麻辣"], "is_featured": False, "sales_count": 156, "stock": 100, "description": "嫩滑牛肉配秘制麻辣汤底", "specs": [{"name": "辣度", "options": ["微辣", "中辣", "特辣"]}]},
            {"category_id": categories[1].id, "name": "糖醋里脊", "price": 36, "original_price": 0, "tags": ["酸甜"], "is_featured": False, "sales_count": 142, "stock": 100, "description": "外酥里嫩，酸甜适口", "specs": []},
            {"category_id": categories[1].id, "name": "麻婆豆腐", "price": 22, "original_price": 0, "tags": ["经典", "下饭"], "is_featured": False, "sales_count": 189, "stock": 100, "description": "嫩滑豆腐配肉沫，麻辣鲜香", "specs": [{"name": "辣度", "options": ["微辣", "中辣"]}]},
            {"category_id": categories[1].id, "name": "干煸四季豆", "price": 28, "original_price": 0, "tags": ["素食"], "is_featured": False, "sales_count": 98, "stock": 100, "description": "四季豆干煸至香脆", "specs": []},
            {"category_id": categories[1].id, "name": "东坡肘子", "price": 88, "original_price": 108, "tags": ["招牌", "大菜"], "is_featured": True, "sales_count": 76, "stock": 50, "description": "整只猪肘，软糯脱骨", "specs": [{"name": "份量", "options": ["半只", "整只"]}]},
            # 清爽凉菜
            {"category_id": categories[2].id, "name": "拍黄瓜", "price": 12, "original_price": 0, "tags": ["清爽"], "is_featured": False, "sales_count": 267, "stock": 200, "description": "清脆爽口的开胃小菜", "specs": [{"name": "口味", "options": ["蒜泥", "酸辣"]}]},
            {"category_id": categories[2].id, "name": "夫妻肺片", "price": 38, "original_price": 0, "tags": ["经典"], "is_featured": False, "sales_count": 134, "stock": 100, "description": "牛肉、牛杂配秘制红油", "specs": [{"name": "辣度", "options": ["微辣", "中辣", "特辣"]}]},
            {"category_id": categories[2].id, "name": "凉拌木耳", "price": 16, "original_price": 0, "tags": ["健康"], "is_featured": False, "sales_count": 112, "stock": 150, "description": "黑木耳配洋葱丝，清爽健康", "specs": []},
            {"category_id": categories[2].id, "name": "口水鸡", "price": 32, "original_price": 0, "tags": ["推荐"], "is_featured": True, "sales_count": 178, "stock": 100, "description": "嫩鸡配麻辣红油汁", "specs": [{"name": "辣度", "options": ["微辣", "中辣", "特辣"]}]},
            # 美味主食
            {"category_id": categories[3].id, "name": "蛋炒饭", "price": 15, "original_price": 0, "tags": ["主食"], "is_featured": False, "sales_count": 345, "stock": 200, "description": "经典蛋炒饭，粒粒分明", "specs": []},
            {"category_id": categories[3].id, "name": "扬州炒饭", "price": 22, "original_price": 0, "tags": ["主食", "推荐"], "is_featured": False, "sales_count": 198, "stock": 150, "description": "虾仁、火腿、鸡蛋、青豆", "specs": []},
            {"category_id": categories[3].id, "name": "牛肉面", "price": 25, "original_price": 0, "tags": ["面食"], "is_featured": False, "sales_count": 289, "stock": 150, "description": "劲道面条配大块牛肉", "specs": [{"name": "份量", "options": ["小份", "大份"]}]},
            {"category_id": categories[3].id, "name": "小笼包", "price": 18, "original_price": 0, "tags": ["点心"], "is_featured": True, "sales_count": 267, "stock": 100, "description": "皮薄馅大，汤汁丰富", "specs": [{"name": "口味", "options": ["鲜肉", "虾仁", "蟹粉"]}]},
            # 时尚饮品
            {"category_id": categories[4].id, "name": "鲜榨西瓜汁", "price": 18, "original_price": 0, "tags": ["鲜榨"], "is_featured": False, "sales_count": 234, "stock": 100, "description": "100%鲜榨西瓜汁，无添加", "specs": [{"name": "温度", "options": ["常温", "冰镇"]}, {"name": "糖度", "options": ["标准", "少糖", "无糖"]}]},
            {"category_id": categories[4].id, "name": "珍珠奶茶", "price": 16, "original_price": 0, "tags": ["奶茶"], "is_featured": True, "sales_count": 456, "stock": 200, "description": "香浓奶茶配Q弹珍珠", "specs": [{"name": "温度", "options": ["冰", "温", "热"]}, {"name": "糖度", "options": ["标准", "少糖", "微糖", "无糖"]}, {"name": "大小", "options": ["中杯", "大杯"]}]},
            {"category_id": categories[4].id, "name": "柠檬水", "price": 10, "original_price": 0, "tags": ["清爽"], "is_featured": False, "sales_count": 389, "stock": 200, "description": "新鲜柠檬，清爽解腻", "specs": [{"name": "温度", "options": ["冰", "常温"]}, {"name": "糖度", "options": ["标准", "少糖", "无糖"]}]},
            {"category_id": categories[4].id, "name": "百香果茶", "price": 20, "original_price": 0, "tags": ["果茶"], "is_featured": False, "sales_count": 167, "stock": 100, "description": "百香果配绿茶，酸甜可口", "specs": [{"name": "温度", "options": ["冰", "温"]}, {"name": "糖度", "options": ["标准", "少糖", "无糖"]}]},
            {"category_id": categories[4].id, "name": "生椰拿铁", "price": 24, "original_price": 0, "tags": ["咖啡"], "is_featured": True, "sales_count": 198, "stock": 100, "description": "浓缩咖啡配生椰乳", "specs": [{"name": "温度", "options": ["冰", "热"]}, {"name": "糖度", "options": ["标准", "少糖", "无糖"]}]},
            # 超值套餐
            {"category_id": categories[5].id, "name": "单人精选套餐", "price": 38, "original_price": 55, "tags": ["套餐", "超值"], "is_featured": True, "sales_count": 156, "stock": 100, "description": "一荤一素一汤一饭", "specs": []},
            {"category_id": categories[5].id, "name": "双人畅享套餐", "price": 78, "original_price": 108, "tags": ["套餐", "推荐"], "is_featured": True, "sales_count": 89, "stock": 80, "description": "两荤两素一汤两饭", "specs": []},
            {"category_id": categories[5].id, "name": "家庭欢聚套餐", "price": 128, "original_price": 188, "tags": ["套餐", "大份"], "is_featured": True, "sales_count": 45, "stock": 50, "description": "三荤三素一汤四饭", "specs": []},
        ]

        for dish_data in dishes_data:
            dish = Dish(
                store_id=store.id,
                **dish_data,
                status=1,
                image="",
            )
            db.add(dish)

        # 创建轮播图
        banners = [
            Banner(store_id=store.id, title="新店开业大酬宾", image="", link="", sort_order=0),
            Banner(store_id=store.id, title="会员充值送好礼", image="", link="", sort_order=1),
            Banner(store_id=store.id, title="周末限时特价", image="", link="", sort_order=2),
        ]
        for banner in banners:
            db.add(banner)

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    init_db()
    await init_default_data()
    yield
    # 关闭时清理


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="畅点餐 - 餐饮小程序完整后端 API",
    lifespan=lifespan,
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": str(exc), "data": None},
    )


# 注册路由
from app.routers import auth, store, table, category, dish, order, member, coupon, activity, payment, rider, staff, dashboard, merchant

app.include_router(auth.router, prefix="/api/auth", tags=["认证"])
app.include_router(store.router, prefix="/api/stores", tags=["门店"])
app.include_router(table.router, prefix="/api/tables", tags=["桌台"])
app.include_router(category.router, prefix="/api/categories", tags=["分类"])
app.include_router(dish.router, prefix="/api/dishes", tags=["菜品"])
app.include_router(order.router, prefix="/api/orders", tags=["订单"])
app.include_router(member.router, prefix="/api/members", tags=["会员"])
app.include_router(coupon.router, prefix="/api/coupons", tags=["优惠券"])
app.include_router(activity.router, prefix="/api/activities", tags=["活动"])
app.include_router(payment.router, prefix="/api/payment", tags=["支付"])
app.include_router(rider.router, prefix="/api/riders", tags=["骑手"])
app.include_router(staff.router, prefix="/api/staff", tags=["店员"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["数据统计"])
app.include_router(merchant.router, prefix="/api/merchant", tags=["商家"])


@app.get("/")
async def root():
    return {"message": "畅点餐 API 服务运行中", "version": settings.APP_VERSION}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
