export interface User {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
  role: string;
}

export interface Store {
  id: number;
  name: string;
  logo?: string;
  phone: string;
  address: string;
  notice?: string;
  business_hours?: string;
  status: 'open' | 'closed';
  delivery_fee: number;
  min_order_amount: number;
  delivery_range?: number;
  rating?: number;
  monthly_sales?: number;
  description?: string;
}

export interface Category {
  id: number;
  store_id: number;
  name: string;
  sort_order: number;
  is_show: boolean;
  created_at: string;
}

export interface DishSpecOption {
  name: string;
  price: number;
}

export interface DishSpec {
  name: string;
  options: DishSpecOption[];
}

export interface Dish {
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  image?: string;
  stock: number;
  sales: number;
  status: 'on' | 'off';
  is_featured: boolean;
  specs?: DishSpec[];
  tags?: string[];
  category_name?: string;
  created_at: string;
}

export interface Table {
  id: number;
  store_id: number;
  table_no: string;
  capacity: number;
  status: 'free' | 'dining' | 'reserved';
  qrcode_url?: string;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'cooking'
  | 'served'
  | 'completed'
  | 'cancelled';

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

export interface OrderItem {
  id: number;
  dish_id: number;
  dish_name: string;
  dish_image?: string;
  quantity: number;
  price: number;
  specs?: string;
}

export interface Order {
  id: number;
  order_no: string;
  store_id: number;
  table_id?: number;
  table_no?: string;
  user_id?: number;
  user_name?: string;
  user_phone?: string;
  type: OrderType;
  status: OrderStatus;
  total_amount: number;
  discount_amount: number;
  pay_amount: number;
  remark?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  address?: string;
  delivery_fee?: number;
  people_count?: number;
}

export interface Coupon {
  id: number;
  store_id: number;
  title: string;
  type: 'amount' | 'discount';
  min_amount: number;
  discount: number;
  count: number;
  remaining: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface MemberLevel {
  id: number;
  name: string;
  min_points: number;
  discount: number;
  icon?: string;
  member_count?: number;
}

export interface Member {
  id: number;
  store_id: number;
  nickname: string;
  avatar?: string;
  phone?: string;
  level_id: number;
  level_name?: string;
  points: number;
  balance: number;
  total_consumption: number;
  order_count: number;
  created_at: string;
}

export interface DashboardSummary {
  today_revenue: number;
  today_orders: number;
  total_members: number;
  pending_orders: number;
  week_revenue: number;
  month_revenue: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface HourlyOrderData {
  hour: string;
  orders: number;
}

export interface DishRankingData {
  name: string;
  sales: number;
  revenue: number;
}

export interface MemberStatsData {
  level_name: string;
  count: number;
}

export interface OrderTypeData {
  type: string;
  count: number;
}
