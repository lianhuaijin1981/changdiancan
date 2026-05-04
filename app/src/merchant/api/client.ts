// 商家端 API 客户端
const API_BASE = "http://localhost:8000/api";

class ApiClient {
  token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("merchant_token", token);
  }

  getToken() {
    if (!this.token) this.token = localStorage.getItem("merchant_token");
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("merchant_token");
  }

  async request(method: string, path: string, body?: any) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const options: RequestInit = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  get(path: string) { return this.request("GET", path); }
  post(path: string, body?: any) { return this.request("POST", path, body); }
  put(path: string, body?: any) { return this.request("PUT", path, body); }
  delete(path: string) { return this.request("DELETE", path); }
}

export const api = new ApiClient();
