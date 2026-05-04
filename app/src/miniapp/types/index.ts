export interface Store {
  id: number;
  name: string;
  business_hours: string;
  announcement: string;
  address: string;
  phone: string;
  logo_url: string;
  banner_urls: string[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  sort_order: number;
}

export interface DishSpec {
  id: number;
  name: string;
  price: number;
  original_price?: number;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_id: number;
  specs: DishSpec[];
  is_featured: boolean;
  sales_count: number;
  stock?: number;
}

export interface CartItem {
  dishId: number;
  dishName: string;
  dishImage: string;
  specId?: number;
  specName?: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  dish_id: number;
  dish_name: string;
  spec_name?: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled";
export type OrderType = "dine_in" | "takeout" | "delivery";

export interface Order {
  id: number;
  order_no: string;
  store_id: number;
  status: OrderStatus;
  order_type: OrderType;
  items: OrderItem[];
  total_amount: number;
  discount_amount: number;
  delivery_fee: number;
  pay_amount: number;
  remark?: string;
  table_no?: string;
  created_at: string;
}

export interface Coupon {
  id: number;
  title: string;
  discount_amount: number;
  min_spend: number;
  valid_start: string;
  valid_end: string;
  status?: "available" | "claimed" | "used" | "expired";
}

export interface User {
  id: number;
  phone: string;
  nickname: string;
  avatar_url?: string;
}

export interface MemberInfo {
  id: number;
  user_id: number;
  level: number;
  level_name: string;
  points: number;
  balance: number;
  total_spend: number;
  next_level_spend: number;
}

export interface MemberLevel {
  level: number;
  name: string;
  min_spend: number;
  discount: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  image_url: string;
  link?: string;
}
