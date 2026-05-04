const BASE_URL = 'http://localhost:8000/api';

class SuperAdminApiClient {
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
      localStorage.removeItem('superadmin_token');
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
    return this.request<{ token: string; user: import('../types').SuperAdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  me() {
    return this.request<{ user: import('../types').SuperAdminUser }>('/auth/me');
  }

  // Dashboard
  getDashboard() {
    return this.request<import('../types').PlatformDashboard>('/superadmin/dashboard');
  }

  getRevenueTrend(days: number = 30) {
    return this.request<{ data: import('../types').RevenueTrendData[] }>(`/superadmin/revenue-trend?days=${days}`);
  }

  getTopStores() {
    return this.request<{ stores: import('../types').TopStore[] }>('/superadmin/top-stores');
  }

  getTemplateDistribution() {
    return this.request<{ data: import('../types').TemplateDistributionItem[] }>('/superadmin/template-distribution');
  }

  // Stores
  getStores(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<{ stores: import('../types').PlatformStore[]; total: number; page: number; per_page: number }>(`/superadmin/stores${query}`);
  }

  updateStoreStatus(id: number, status: 'enabled' | 'disabled') {
    return this.request<{ store: import('../types').PlatformStore }>(`/superadmin/stores/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiClient = new SuperAdminApiClient();

// Initialize token from localStorage
const storedToken = localStorage.getItem('superadmin_token');
if (storedToken) {
  apiClient.setToken(storedToken);
}
