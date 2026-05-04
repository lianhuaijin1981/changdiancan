"""
畅点餐 - Pydantic 数据校验模型
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class ResponseModel(BaseModel):
    """通用响应模型"""
    code: int = 200
    message: str = "success"
    data: Any = None


# ============== 认证相关 ==============

class RegisterRequest(BaseModel):
    phone: str = Field(..., min_length=11, max_length=11)
    password: str = Field(..., min_length=6)
    nickname: Optional[str] = ""


class LoginRequest(BaseModel):
    phone: str
    password: str


class WechatLoginRequest(BaseModel):
    code: str
    userInfo: Optional[Dict[str, Any]] = None


class TokenResponse(BaseModel):
    access_token: str
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
    nickname: Optional[str] = None
    avatar: Optional[str] = None


# ============== 门店相关 ==============

class StoreCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    address: Optional[str] = ""
    phone: Optional[str] = ""
    business_hours: Optional[str] = "09:00-22:00"
    logo: Optional[str] = ""
    description: Optional[str] = ""
    delivery_fee: Optional[float] = 0.0
    min_delivery_amount: Optional[float] = 0.0
    delivery_range: Optional[float] = 5.0


class StoreUpdate(StoreCreate):
    name: Optional[str] = None
    status: Optional[int] = None
    announcement: Optional[str] = ""


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
    store_id: int
    table_no: str
    capacity: Optional[int] = 4


class TableUpdate(BaseModel):
    table_no: Optional[str] = None
    capacity: Optional[int] = None
    status: Optional[str] = None


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
    store_id: int
    name: str
    sort_order: Optional[int] = 0
    icon: Optional[str] = ""


class CategoryUpdate(CategoryCreate):
    store_id: Optional[int] = None
    name: Optional[str] = None


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
    store_id: int
    category_id: int
    name: str
    description: Optional[str] = ""
    image: Optional[str] = ""
    price: float = Field(..., gt=0)
    original_price: Optional[float] = 0.0
    stock: Optional[int] = 999
    specs: Optional[List[Dict[str, Any]]] = []
    tags: Optional[List[str]] = []
    is_featured: Optional[bool] = False


class DishUpdate(DishCreate):
    store_id: Optional[int] = None
    category_id: Optional[int] = None
    name: Optional[str] = None
    price: Optional[float] = None
    status: Optional[int] = None


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
    dish_id: int
    quantity: int = Field(default=1, ge=1)
    specs: Optional[Dict[str, str]] = {}
    remark: Optional[str] = ""


class CartItemDetail(CartItem):
    dish_name: str
    dish_image: str
    price: float
    subtotal: float


# ============== 订单相关 ==============

class OrderCreateRequest(BaseModel):
    store_id: int
    table_id: Optional[int] = None
    order_type: str = "dine_in"  # dine_in, takeaway, delivery
    items: List[CartItem]
    coupon_id: Optional[int] = None
    remark: Optional[str] = ""
    pay_type: Optional[str] = "wechat"
    # 外卖信息
    delivery_name: Optional[str] = ""
    delivery_phone: Optional[str] = ""
    delivery_address: Optional[str] = ""


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
    status: str


class OrderQuery(BaseModel):
    status: Optional[str] = None
    order_type: Optional[str] = None
    store_id: Optional[int] = None
    page: int = 1
    page_size: int = 20


# ============== 会员相关 ==============

class MemberLevelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    min_points: int
    discount: float
    icon: str


class RechargeRequest(BaseModel):
    amount: float = Field(..., gt=0)
    pay_type: str = "wechat"


class PointsLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    type: str
    points: int
    description: str
    created_at: Optional[datetime] = None


# ============== 优惠券相关 ==============

class CouponCreate(BaseModel):
    store_id: Optional[int] = None
    title: str
    type: str = "amount"  # amount, discount, percent
    min_amount: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    total_count: Optional[int] = 0
    limit_per_user: Optional[int] = 1
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
    store_id: Optional[int] = None
    title: str
    type: str = "seckill"
    config: Optional[Dict[str, Any]] = {}
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
    order_no: str
    pay_type: str = "wechat"


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
    phone: str
    password: str


class RiderUpdateLocation(BaseModel):
    lat: float
    lng: float


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
    phone: str
    password: str


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


# ============== 轮播图相关 ==============

class BannerCreate(BaseModel):
    store_id: Optional[int] = None
    title: Optional[str] = ""
    image: str
    link: Optional[str] = ""
    sort_order: Optional[int] = 0


class BannerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: Optional[int] = None
    title: str
    image: str
    link: str
    sort_order: int
    status: int
