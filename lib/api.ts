const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

let token: string | null = null;

export function setApiToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem('dutchwise-token', t);
  else localStorage.removeItem('dutchwise-token');
}

export function getApiToken(): string | null {
  if (token) return token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('dutchwise-token');
  }
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const t = getApiToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`);
  return json.data;
}

// --- Users ---
export async function apiAuthUser(email: string, name: string, image?: string | null) {
  // This bypasses the auth middleware on the server side
  const res = await fetch(`${API_URL}/api/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, image }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Auth failed');
  return json.data as { user: any; token: string };
}

export function apiGetMe() {
  return request<any>('/api/users/me');
}

export function apiUpdateMe(data: { name?: string; preferredCurrency?: string; themePreference?: string }) {
  return request<any>('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) });
}

// --- Groups ---
export function apiGetGroups() {
  return request<any[]>('/api/groups');
}

export function apiGetGroup(id: string) {
  return request<any>(`/api/groups/${id}`);
}

export function apiCreateGroup(data: { name: string; type: string; icon: string; description?: string }) {
  return request<any>('/api/groups', { method: 'POST', body: JSON.stringify(data) });
}

export function apiAddGroupMember(groupId: string, email: string) {
  return request<any>(`/api/groups/${groupId}/members`, { method: 'POST', body: JSON.stringify({ email }) });
}

export function apiDeleteGroup(id: string) {
  return request<any>(`/api/groups/${id}`, { method: 'DELETE' });
}

// --- Expenses ---
export function apiGetExpenses(groupId: string) {
  return request<any[]>(`/api/expenses?groupId=${groupId}`);
}

export function apiCreateExpense(data: any) {
  return request<any>('/api/expenses', { method: 'POST', body: JSON.stringify(data) });
}

export function apiUpdateExpense(id: string, data: any) {
  return request<any>(`/api/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function apiDeleteExpense(id: string) {
  return request<any>(`/api/expenses/${id}`, { method: 'DELETE' });
}

// --- Settlements ---
export function apiGetSettlements(groupId: string) {
  return request<any[]>(`/api/settlements?groupId=${groupId}`);
}

export function apiCreateSettlement(data: any) {
  return request<any>('/api/settlements', { method: 'POST', body: JSON.stringify(data) });
}

// --- Activity ---
export function apiGetActivity(groupId?: string) {
  const q = groupId ? `?groupId=${groupId}` : '';
  return request<any[]>(`/api/activity${q}`);
}

// --- Balances ---
export function apiGetMyBalance() {
  return request<any>('/api/balances/me');
}

export function apiGetGroupBalances(groupId: string) {
  return request<any>(`/api/balances/group/${groupId}`);
}
