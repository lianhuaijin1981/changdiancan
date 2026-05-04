export interface SuperAdminUser {
  id: number;
  name: string;
  phone: string;
  avatar?: string;
  role: string;
}

export interface PlatformDashboard {
  total_stores: number;
  today_orders: number;
  today_revenue: number;
  total_users: number;
}

export interface RevenueTrendData {
  date: string;
  revenue: number;
}

export interface TopStore {
  id: number;
  name: string;
  phone: string;
  template: string;
  order_count: number;
  revenue: number;
  created_at: string;
}

export interface TemplateDistributionItem {
  template: string;
  count: number;
}

export interface PlatformStore {
  id: number;
  name: string;
  phone: string;
  status: 'enabled' | 'disabled';
  template: string;
  order_count: number;
  revenue: number;
  created_at: string;
}
