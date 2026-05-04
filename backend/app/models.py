"""
畅点餐 - SQLAlchemy 数据模型（完整版）
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """用户表"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    openid = Column(String(64), unique=True, index=True, comment="微信openid")
    phone = Column(String(20), unique=True, index=True, comment="手机号")
    password_hash = Column(String(128), comment="密码哈希")
    nickname = Column(String(50), default="", comment="昵称")
    avatar = Column(String(255), default="", comment="头像URL")
    member_level_id = Column(Integer, ForeignKey("member_levels.id"), default=1, comment="会员等级")
    points = Column(Integer, default=0, comment="积分")
    balance = Column(Float, default=0.0, comment="储值余额")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # 关联
    orders = relationship("Order", back_populates="user")
    member_level = relationship("MemberLevel")


class Store(Base):
    """门店表"""
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, comment="门店名称")
    address = Column(String(255), default="", comment="地址")
    phone = Column(String(20), default="", comment="联系电话")
    business_hours = Column(String(100), default="09:00-22:00", comment="营业时间")
    status = Column(Integer, default=1, comment="状态: 0关闭 1营业 2休息")
    logo = Column(String(255), default="", comment="门店Logo")
    description = Column(Text, default="", comment="门店描述")
    announcement = Column(Text, default="", comment="公告")
    delivery_fee = Column(Float, default=0.0, comment="配送费")
    min_delivery_amount = Column(Float, default=0.0, comment="起送金额")
    delivery_range = Column(Float, default=5.0, comment="配送范围(km)")
    template_id = Column(String(20), default="modern", comment="模板ID: modern/traditional/fresh/luxury")
    created_at = Column(DateTime, default=datetime.now)

    tables = relationship("Table", back_populates="store", cascade="all, delete")
    categories = relationship("Category", back_populates="store", cascade="all, delete")
    dishes = relationship("Dish", back_populates="store", cascade="all, delete")


class Table(Base):
    """桌台表"""
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    table_no = Column(String(20), nullable=False, comment="桌号")
    capacity = Column(Integer, default=4, comment="容纳人数")
    status = Column(String(20), default="free", comment="状态: free空闲 occupied占用 locked锁定")
    qr_code = Column(String(255), default="", comment="二维码图片路径")
    created_at = Column(DateTime, default=datetime.now)

    store = relationship("Store", back_populates="tables")


class Category(Base):
    """菜品分类表"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String(50), nullable=False, comment="分类名称")
    sort_order = Column(Integer, default=0, comment="排序")
    status = Column(Integer, default=1, comment="状态: 0隐藏 1显示")
    icon = Column(String(50), default="", comment="图标")
    created_at = Column(DateTime, default=datetime.now)

    store = relationship("Store", back_populates="categories")
    dishes = relationship("Dish", back_populates="category", cascade="all, delete")


class Dish(Base):
    """菜品表"""
    __tablename__ = "dishes"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(100), nullable=False, comment="菜品名称")
    description = Column(Text, default="", comment="描述")
    image = Column(String(255), default="", comment="图片URL")
    price = Column(Float, nullable=False, comment="售价")
    original_price = Column(Float, default=0.0, comment="原价")
    stock = Column(Integer, default=999, comment="库存")
    status = Column(Integer, default=1, comment="状态: 0下架 1上架 2售罄")
    specs = Column(JSON, default=list, comment="规格选项 [{name, options[]}]")
    tags = Column(JSON, default=list, comment="标签 ['热销','推荐','新品']")
    is_featured = Column(Boolean, default=False, comment="是否推荐")
    sales_count = Column(Integer, default=0, comment="销量")
    created_at = Column(DateTime, default=datetime.now)

    store = relationship("Store", back_populates="dishes")
    category = relationship("Category", back_populates="dishes")


class Order(Base):
    """订单表"""
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(32), unique=True, index=True, comment="订单编号")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, comment="用户ID(游客可为空)")
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True, comment="桌台ID")
    order_type = Column(String(20), default="dine_in", comment="类型: dine_in堂食 takeaway自提 delivery外卖")
    status = Column(String(20), default="pending", comment="状态")
    # pending待支付 paid已支付 preparing制作中 ready待上菜 served已上菜 completed已完成 cancelled已取消 refunding退款中 refunded已退款
    total_amount = Column(Float, default=0.0, comment="订单总额")
    discount_amount = Column(Float, default=0.0, comment="优惠金额")
    pay_amount = Column(Float, default=0.0, comment="实付金额")
    pay_type = Column(String(20), default="", comment="支付方式: wechat微信 balance余额")
    pay_status = Column(String(20), default="unpaid", comment="支付状态: unpaid未支付 paid已支付 refunded已退款")
    pay_time = Column(DateTime, nullable=True, comment="支付时间")
    remark = Column(Text, default="", comment="订单备注")
    cancel_reason = Column(String(255), default="", comment="取消原因")
    delivery_address = Column(Text, default="", comment="外卖地址")
    delivery_name = Column(String(50), default="", comment="收货人")
    delivery_phone = Column(String(20), default="", comment="收货电话")
    delivery_fee = Column(Float, default=0.0, comment="配送费")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete")


class OrderItem(Base):
    """订单项表"""
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    dish_id = Column(Integer, ForeignKey("dishes.id"), nullable=False)
    dish_name = Column(String(100), nullable=False)
    dish_image = Column(String(255), default="")
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    specs = Column(JSON, default=dict, comment="已选规格 {规格名: 选项值}")
    subtotal = Column(Float, nullable=False)
    status = Column(String(20), default="pending", comment="状态: pending待制作 preparing制作中 completed已完成")

    order = relationship("Order", back_populates="items")


class MemberLevel(Base):
    """会员等级表"""
    __tablename__ = "member_levels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, comment="等级名称")
    min_points = Column(Integer, default=0, comment="最低积分")
    discount = Column(Float, default=1.0, comment="折扣率 0-1")
    icon = Column(String(50), default="", comment="图标")
    created_at = Column(DateTime, default=datetime.now)


class Coupon(Base):
    """优惠券表"""
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True, comment="门店ID(空=通用)")
    title = Column(String(100), nullable=False, comment="标题")
    type = Column(String(20), default="amount", comment="类型: amount满减 discount折扣 percent百分比")
    min_amount = Column(Float, default=0.0, comment="最低消费金额")
    discount_amount = Column(Float, default=0.0, comment="优惠金额/折扣率")
    total_count = Column(Integer, default=0, comment="总发放数量")
    used_count = Column(Integer, default=0, comment="已使用数量")
    limit_per_user = Column(Integer, default=1, comment="每人限领")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(Integer, default=1, comment="状态: 0禁用 1启用")
    created_at = Column(DateTime, default=datetime.now)


class UserCoupon(Base):
    """用户优惠券表"""
    __tablename__ = "user_coupons"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coupon_id = Column(Integer, ForeignKey("coupons.id"), nullable=False)
    status = Column(String(20), default="unused", comment="状态: unused未使用 used已使用 expired已过期")
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)


class Activity(Base):
    """营销活动表"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    title = Column(String(100), nullable=False, comment="活动标题")
    type = Column(String(20), default="seckill", comment="类型: seckill秒杀 group拼团 limit限时特价 second_half第二份半价 recharge充值赠送")
    config = Column(JSON, default=dict, comment="活动配置(JSON)")
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    status = Column(Integer, default=1, comment="状态: 0未开始 1进行中 2已结束 3已停用")
    created_at = Column(DateTime, default=datetime.now)


class Payment(Base):
    """支付记录表"""
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_no = Column(String(32), nullable=False, comment="商户订单号")
    transaction_id = Column(String(64), default="", comment="微信支付流水号")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    amount = Column(Float, nullable=False, comment="支付金额")
    pay_type = Column(String(20), default="wechat", comment="支付方式")
    status = Column(String(20), default="pending", comment="状态: pending待支付 success成功 failed失败 refunded已退款")
    paid_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)


class Rider(Base):
    """骑手表"""
    __tablename__ = "riders"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False, comment="所属门店")
    name = Column(String(50), nullable=False)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(128), nullable=False)
    status = Column(String(20), default="online", comment="状态: online在线 offline离线 busy busy")
    current_lat = Column(Float, default=0.0)
    current_lng = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.now)


class DeliveryOrder(Base):
    """配送订单表"""
    __tablename__ = "delivery_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("riders.id"), nullable=True)
    status = Column(String(20), default="waiting", comment="状态: waiting待接单 accepted已接单 picked_up已取餐 delivering配送中 delivered已送达 cancelled已取消")
    pickup_time = Column(DateTime, nullable=True)
    deliver_time = Column(DateTime, nullable=True)
    delivery_address = Column(Text, default="")
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    fee = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.now)


class Staff(Base):
    """店员表"""
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String(50), nullable=False)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), default="waiter", comment="角色: waiter服务员 chef厨师 manager店长")
    status = Column(Integer, default=1, comment="状态: 0禁用 1启用")
    created_at = Column(DateTime, default=datetime.now)


class PointsLog(Base):
    """积分记录表"""
    __tablename__ = "points_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), default="earn", comment="类型: earn获得 use使用 refund退回")
    points = Column(Integer, default=0, comment="积分数量")
    description = Column(String(255), default="", comment="描述")
    created_at = Column(DateTime, default=datetime.now)


class Banner(Base):
    """轮播图表"""
    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)
    title = Column(String(100), default="")
    image = Column(String(255), nullable=False)
    link = Column(String(255), default="")
    sort_order = Column(Integer, default=0)
    status = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now)
