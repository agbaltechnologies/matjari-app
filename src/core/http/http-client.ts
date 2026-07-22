import { API_BASE_URL } from '../config/api-mode';

function unwrap<T>(json: any): T {
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    if (!json.success) throw new Error(json.message ?? 'Request failed');
    return json.data as T;
  }
  return json as T;
}

async function parseError(r: Response): Promise<string> {
  try {
    const json = await r.json();
    return json?.message ?? json?.error ?? r.statusText;
  } catch {
    return r.statusText;
  }
}

class HttpClient {
  private static instance: HttpClient;
  private authToken: string | null = null;

  static getInstance(): HttpClient {
    if (!HttpClient.instance) HttpClient.instance = new HttpClient();
    return HttpClient.instance;
  }

  setToken(token: string | null) { this.authToken = token; }
  clearToken() { this.authToken = null; }

  loadTokenFromStorage() {
    try {
      const s = localStorage.getItem('matjari-auth');
      if (s) {
        const t = JSON.parse(s)?.state?.token;
        if (t) this.authToken = t;
      }
    } catch {}
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json', 'X-App': 'matjari' };
    if (this.authToken) h['Authorization'] = `Bearer ${this.authToken}`;
    return h;
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(API_BASE_URL + path);
    if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
    const r = await fetch(url.toString(), { headers: this.headers() });
    if (!r.ok) throw new Error(await parseError(r));
    return unwrap<T>(await r.json());
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const r = await fetch(API_BASE_URL + path, { method: 'POST', headers: this.headers(), body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error(await parseError(r));
    return unwrap<T>(await r.json());
  }

  async put<T>(path: string, body?: any): Promise<T> {
    const r = await fetch(API_BASE_URL + path, { method: 'PUT', headers: this.headers(), body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error(await parseError(r));
    return unwrap<T>(await r.json());
  }

  async patch<T>(path: string, body?: any): Promise<T> {
    const r = await fetch(API_BASE_URL + path, { method: 'PATCH', headers: this.headers(), body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) throw new Error(await parseError(r));
    return unwrap<T>(await r.json());
  }

  async delete<T>(path: string): Promise<T> {
    const { 'Content-Type': _, ...headersNoBody } = this.headers();
    const r = await fetch(API_BASE_URL + path, { method: 'DELETE', headers: headersNoBody });
    if (!r.ok) throw new Error(await parseError(r));
    return unwrap<T>(await r.json());
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const headers: Record<string, string> = { 'X-App': 'matjari' };
    if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
    const r = await fetch(API_BASE_URL + path, { method: 'POST', headers, body: formData });
    if (!r.ok) throw new Error(await parseError(r));
    return unwrap<T>(await r.json());
  }
}

export const httpClient = HttpClient.getInstance();
