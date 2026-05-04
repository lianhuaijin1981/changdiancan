const BASE_URL = 'http://localhost:8000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('admin_token');
      this.token = null;
      window.location.hash = '#/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  // Auth
  login(phone: string, password: string) {
    return this.request<{ token: string; user: import('../types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  me() {
    return this.request<{ user: import('../types').User }>('/auth/me');
  }

  // Stores
  getStores() {
    return this.request<{ stores: import('../types').Store[] }>('/stores/');
  }

  getStore(id: number) {
    return this.request<{ store: import('../types').Store }>(`/stores/${id}`);
  }

  updateStore(id: number, data: Partial<import('../types').Store>) {
    return this.request<{ store: import('../types').Store }>(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  toggleStoreStatus(id: number) {
    return this.request<{ store: import('../types').Store }>(`/stores/${id}/status`, {
      method: 'PUT',
    });
  }

  // Categories
  getCategories(storeId: number) {
    return this.request<{ categories: import('../types').Category[] }>(`/categories/?store_id=${storeId}`);
  }

  createCategory(data: Partial<import('../types').Category>) {
    return this.request<{ category: import('../types').Category }>('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateCategory(id: number, data: Partial<import('../types').Category>) {
    return this.request<{ category: import('../types').Category }>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteCategory(id: number) {
    return this.request<void>(`/categories/${id}`, { method: 'DELETE' });
  }

  // Dishes
  getDishes(storeId: number, params?: Record<string, string>) {
    const query = new URLSearchParams({ store_id: String(storeId), ...params });
    return this.request<{ dishes: import('../types').Dish[] }>(`/dishes/?${query}`);
  }

  createDish(data: Partial<import('../types').Dish>) {
    return this.request<{ dish: import('../types').Dish }>('/dishes/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateDish(id: number, data: Partial<import('../types').Dish>) {
    return this.request<{ dish: import('../types').Dish }>(`/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Tables
  getTables(storeId: number) {
    return this.request<{ tables: import('../types').Table[] }>(`/tables/?store_id=${storeId}`);
  }

  createTable(data: Partial<import('../types').Table>) {
    return this.request<{ table: import('../types').Table }>('/tables/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTable(id: number, data: Partial<import('../types').Table>) {
    return this.request<{ table: import('../types').Table }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Orders
  getOrders(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<{ orders: import('../types').Order[]; total: number; page: number; per_page: number }>(`/orders/${query}`);
  }

  getOrder(id: number) {
    return this.request<{ order: import('../types').Order }>(`/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string) {
    return this.request<{ order: import('../types').Order }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Coupons
  getCoupons() {
    return this.request<{ coupons: import('../types').Coupon[] }>('/coupons/');
  }

  createCoupon(data: Partial<import('../types').Coupon>) {
    return this.request<{ coupon: import('../types').Coupon }>('/coupons/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Members
  getMemberLevels() {
    return this.request<{ levels: import('../types').MemberLevel[] }>('/members/levels');
  }

  getMembers() {
    return this.request<{ members: import('../types').Member[] }>('/members/');
  }

  // Dashboard
  getDashboardSummary() {
    return this.request<import('../types').DashboardSummary>('/dashboard/summary');
  }

  getRevenue(rangeType: string = 'week') {
    return this.request<{ data: import('../types').RevenueData[] }>(`/dashboard/revenue?range_type=${rangeType}`);
  }

  getOrdersByHour() {
    return this.request<{ data: import('../types').HourlyOrderData[] }>('/dashboard/orders-by-hour');
  }

  getDishRanking(rangeType: string = 'week') {
    return this.request<{ data: import('../types').DishRankingData[] }>(`/dashboard/dishes?range_type=${rangeType}`);
  }

  getMemberStats() {
    return this.request<{ data: import('../types').MemberStatsData[] }>('/dashboard/members');
  }

  getOrderTypes(rangeType: string = 'week') {
    return this.request<{ data: import('../types').OrderTypeData[] }>(`/dashboard/order-types?range_type=${rangeType}`);
  }
}

export const apiClient = new ApiClient();

// Initialize token from localStorage
const storedToken = localStorage.getItem('admin_token');
if (storedToken) {
  apiClient.setToken(storedToken);
}
