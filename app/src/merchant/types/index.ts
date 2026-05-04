// 商家端类型定义
export interface MerchantUser {
  staff_id: number;
  name: string;
  phone: string;
  role: string;
  store_id: number;
  store_name: string;
  store_status: number;
}

export interface DashboardData {
  today_count: number;
  today_revenue: number;
  pending_orders: number;
  total_tables: number;
  occupied_tables: number;
  week_revenue: number;
}

export interface Order {
  id: number;
  order_no: string;
  status: string;
  total_amount: number;
  pay_amount: number;
  pay_status: string;
  order_type: string;
  table_id?: number;
  remark: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  dish_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  stock: number;
  status: number;
  category_id: number;
  image: string;
  sales_count: number;
}

export interface Table {
  id: number;
  table_no: string;
  capacity: number;
  status: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  status: number;
  announcement: string;
  delivery_fee: number;
  min_delivery_amount: number;
}

export interface Category {
  id: number;
  name: string;
}
