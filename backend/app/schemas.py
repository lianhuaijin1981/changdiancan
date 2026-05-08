"""
畅点餐 - Pydantic 数据校验模型
安全加固版本：增强输入验证、添加 refresh_token schema
"""
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re


# ============== 通用响应 ==============

class ResponseModel(BaseModel):
    """通用响应模型"""
    code: int = 200
    message: str = "success"
    data: Any = None


# ============== 认证相关 ==============

class RegisterRequest(BaseModel):
    """注册请求 - 增强验证"""
    phone: str = Field(
        ...,
        min_length=11,
        max_length=11,
        description="手机号，必须是11位数字"
    )
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="密码，6-128位"
    )
    nickname: Optional[str] = Field(None, max_length=50)

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """验证手机号格式"""
        if not re.match(r'^1[3-9]\d{9}$', v):
            raise ValueError('手机号格式不正确')
        return v

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """密码强度检查"""
        if len(v) < 6:
            raise ValueError('密码长度不能少于6位')
        return v


class LoginRequest(BaseModel):
    """登录请求 - 增强验证"""
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=1, max_length=128)


class WechatLoginRequest(BaseModel):
    """微信登录请求"""
    code: str = Field(..., min_length=1, max_length=128)
    userInfo: Optional[Dict[str, Any]] = None


class RefreshTokenRequest(BaseModel):
    """刷新 Token 请求"""
    refresh_token: str = Field(..., min_length=1, description="Refresh Token")


class TokenResponse(BaseModel):
    """认证响应"""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]


# ============== 用户相关 ==============

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    phone: str
    nickname: str
    avatar: str
    member_level_id: int
    points: int
    balance: float
    created_at: Optional[datetime] = None


class UserUpdateRequest(BaseModel):
    """更新用户资料"""
    nickname: Optional[str] = Field(None, max_length=50)
    avatar: Optional[str] = Field(None, max_length=500)


# ============== 门店相关 ==============

class StoreCreate(BaseModel):
    """创建门店"""
    name: str = Field(..., min_length=1, max_length=100)
    address: Optional[str] = Field(None, max_length=200)
    phone: Optional[str] = Field(None, max_length=20)
    business_hours: Optional[str] = Field(None, max_length=50)
    logo: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = Field(None, max_length=500)
    delivery_fee: Optional[float] = Field(0.0, ge=0)
    min_delivery_amount: Optional[float] = Field(0.0, ge=0)
    delivery_range: Optional[float] = Field(5.0, ge=0)


class StoreUpdate(StoreCreate):
    """更新门店"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[int] = Field(None, ge=0, le=1)
    announcement: Optional[str] = Field(None, max_length=500)


class StoreResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    address: str
    phone: str
    business_hours: str
    status: int
    logo: str
    description: str
    announcement: str
    delivery_fee: float
    min_delivery_amount: float
    delivery_range: float
    created_at: Optional[datetime] = None


# ============== 桌台相关 ==============

class TableCreate(BaseModel):
    """创建桌台"""
    store_id: int = Field(..., gt=0)
    table_no: str = Field(..., min_length=1, max_length=20)
    capacity: Optional[int] = Field(4, ge=1, le=50)


class TableUpdate(BaseModel):
    """更新桌台"""
    table_no: Optional[str] = Field(None, min_length=1, max_length=20)
    capacity: Optional[int] = Field(None, ge=1, le=50)
    status: Optional[str] = Field(None, max_length=20)


class TableResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: int
    table_no: str
    capacity: int
    status: str
    qr_code: str


# ============== 分类相关 ==============

class CategoryCreate(BaseModel):
    """创建分类"""
    store_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=50)
    sort_order: Optional[int] = Field(0, ge=0)
    icon: Optional[str] = Field(None, max_length=50)


class CategoryUpdate(CategoryCreate):
    """更新分类"""
    store_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=50)


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: int
    name: str
    sort_order: int
    status: int
    icon: str


# ============== 菜品相关 ==============

class DishCreate(BaseModel):
    """创建菜品"""
    store_id: int = Field(..., gt=0)
    category_id: int = Field(..., gt=0)
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    image: Optional[str] = Field(None, max_length=500)
    price: float = Field(..., gt=0, le=99999)
    original_price: Optional[float] = Field(0.0, ge=0, le=99999)
    stock: Optional[int] = Field(999, ge=0)
    specs: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)
    is_featured: Optional[bool] = False


class DishUpdate(DishCreate):
    """更新菜品"""
    store_id: Optional[int] = None
    category_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    status: Optional[int] = Field(None, ge=0, le=1)


class DishResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: int
    category_id: int
    name: str
    description: str
    image: str
    price: float
    original_price: float
    stock: int
    status: int
    specs: Any
    tags: Any
    is_featured: bool
    sales_count: int
    created_at: Optional[datetime] = None


# ============== 购物车相关 ==============

class CartItem(BaseModel):
    """购物车项"""
    dish_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, ge=1, le=99)
    specs: Optional[Dict[str, str]] = Field(default_factory=dict)
    remark: Optional[str] = Field(None, max_length=200)


class CartItemDetail(CartItem):
    """购物车项详情"""
    dish_name: str
    dish_image: str
    price: float
    subtotal: float


# ============== 订单相关 ==============

class OrderCreateRequest(BaseModel):
    """创建订单"""
    store_id: int = Field(..., gt=0)
    table_id: Optional[int] = None
    order_type: str = Field("dine_in", max_length=20)
    items: List[CartItem] = Field(..., min_length=1)
    coupon_id: Optional[int] = None
    remark: Optional[str] = Field(None, max_length=200)
    pay_type: Optional[str] = Field("wechat", max_length=20)
    delivery_name: Optional[str] = Field(None, max_length=50)
    delivery_phone: Optional[str] = Field(None, max_length=20)
    delivery_address: Optional[str] = Field(None, max_length=200)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    dish_id: int
    dish_name: str
    dish_image: str
    price: float
    quantity: int
    specs: Any
    subtotal: float
    status: str


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_no: str
    user_id: Optional[int] = None
    store_id: int
    table_id: Optional[int] = None
    order_type: str
    status: str
    total_amount: float
    discount_amount: float
    pay_amount: float
    pay_type: str
    pay_status: str
    pay_time: Optional[datetime] = None
    remark: str
    delivery_address: str
    delivery_name: str
    delivery_phone: str
    delivery_fee: float
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: List[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    """更新订单状态"""
    status: str = Field(..., min_length=1, max_length=20)


class OrderQuery(BaseModel):
    """订单查询"""
    status: Optional[str] = None
    order_type: Optional[str] = None
    store_id: Optional[int] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)


# ============== 会员相关 ==============

class MemberLevelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    min_points: int
    discount: float
    icon: str


class RechargeRequest(BaseModel):
    """储值充值"""
    amount: float = Field(..., gt=0, le=100000)
    pay_type: str = Field("wechat", max_length=20)


class PointsLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    points: int
    description: str
    created_at: Optional[datetime] = None


# ============== 优惠券相关 ==============

class CouponCreate(BaseModel):
    """创建优惠券"""
    store_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=100)
    type: str = Field("amount", max_length=20)
    min_amount: Optional[float] = Field(0.0, ge=0)
    discount_amount: Optional[float] = Field(0.0, ge=0)
    total_count: Optional[int] = Field(0, ge=0)
    limit_per_user: Optional[int] = Field(1, ge=1)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class CouponResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: Optional[int] = None
    title: str
    type: str
    min_amount: float
    discount_amount: float
    total_count: int
    used_count: int
    limit_per_user: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: int


class UserCouponResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    coupon_id: int
    title: str
    type: str
    min_amount: float
    discount_amount: float
    status: str
    end_date: Optional[datetime] = None
    used_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


# ============== 活动相关 ==============

class ActivityCreate(BaseModel):
    """创建活动"""
    store_id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=100)
    type: str = Field("seckill", max_length=20)
    config: Optional[Dict[str, Any]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: Optional[int] = None
    title: str
    type: str
    config: Dict[str, Any]
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: int


# ============== 支付相关 ==============

class UnifiedOrderRequest(BaseModel):
    """统一下单"""
    order_no: str = Field(..., min_length=1, max_length=50)
    pay_type: str = Field("wechat", max_length=20)


class PaymentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_no: str
    transaction_id: str
    amount: float
    pay_type: str
    status: str
    paid_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


# ============== 骑手相关 ==============

class RiderLogin(BaseModel):
    """骑手登录"""
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=1)


class RiderUpdateLocation(BaseModel):
    """更新骑手位置"""
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class DeliveryOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    order_id: int
    rider_id: Optional[int] = None
    status: str
    pickup_time: Optional[datetime] = None
    deliver_time: Optional[datetime] = None
    delivery_address: str
    fee: float


# ============== 店员相关 ==============

class StaffLogin(BaseModel):
    """店员登录"""
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=1)


# ============== 数据统计相关 ==============

class DashboardSummary(BaseModel):
    today_revenue: float
    today_orders: int
    today_customers: int
    pending_orders: int
    total_members: int
    week_revenue: float
    month_revenue: float


class RevenueStats(BaseModel):
    date: str
    revenue: float
    order_count: int
    refund_amount: float


class DishRanking(BaseModel):
    dish_id: int
    dish_name: str
    total_sales: int
    total_revenue: float


class MemberStats(BaseModel):
    level_name: str
    member_count: int
    total_consumption: float
    avg_consumption: float


# ============== 审计日志相关 ==============

class AuditLogCreate(BaseModel):
    """创建审计日志"""
    user_id: Optional[int] = None
    user_type: Optional[str] = Field("user", max_length=20)
    action: str = Field(..., min_length=1, max_length=50)
    target_type: Optional[str] = Field(None, max_length=50)
    target_id: Optional[int] = None
    detail: Optional[str] = Field(None, max_length=500)
    ip_address: Optional[str] = Field(None, max_length=50)


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: Optional[int] = None
    user_type: str
    action: str
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    detail: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: Optional[datetime] = None


# ============== 库存相关 ==============

class InventoryLowStockFilter(BaseModel):
    """库存预警查询"""
    store_id: int = Field(..., gt=0)
    threshold: Optional[int] = Field(10, ge=1)


class InventorySummary(BaseModel):
    """库存汇总"""
    store_id: int
    total_items: int
    low_stock_count: int
    out_of_stock_count: int
    threshold: int


class StockUpdateRequest(BaseModel):
    """更新库存"""
    quantity: int = Field(..., ge=0, le=999999, description="新库存数量")


# ============== 轮播图相关 ==============

class BannerCreate(BaseModel):
    """创建轮播图"""
    store_id: Optional[int] = None
    title: Optional[str] = Field(None, max_length=100)
    image: str = Field(..., min_length=1, max_length=500)
    link: Optional[str] = Field(None, max_length=500)
    sort_order: Optional[int] = Field(0, ge=0)


class BannerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: Optional[int] = None
    title: str
    image: str
    link: str
    sort_order: int
    status: int
