// API client: keeps the session in localStorage, refreshes the access token
// once on 401 (single flight) and sends the user to /login when that fails.

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.shipnative.uz/api/v1";
const KEY = "shipnative.admin.session";

type Session = { access: string; refresh: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function load(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function save(s: Session | null): void {
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
}

export function isLoggedIn(): boolean {
  return load() !== null;
}

type TokensBody = { tokens: { access_token: string; refresh_token: string } };

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(res.status, err?.code ?? String(res.status), err?.message ?? res.statusText);
  }
  return body as T;
}

export async function login(loginName: string, password: string): Promise<void> {
  const res = await fetch(`${API}/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login: loginName, password }),
  });
  const body = await parse<TokensBody>(res);
  save({ access: body.tokens.access_token, refresh: body.tokens.refresh_token });
}

export async function logout(): Promise<void> {
  const s = load();
  save(null);
  if (s) {
    await fetch(`${API}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh }),
    }).catch(() => undefined);
  }
}

let refreshing: Promise<boolean> | null = null;

async function refresh(): Promise<boolean> {
  refreshing ??= (async () => {
    const s = load();
    if (!s) return false;
    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: s.refresh }),
      });
      if (!res.ok) return false;
      const body = (await res.json()) as TokensBody;
      save({ access: body.tokens.access_token, refresh: body.tokens.refresh_token });
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const send = () =>
    fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${load()?.access ?? ""}`,
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    });
  let res = await send();
  if (res.status === 401 && (await refresh())) res = await send();
  if (res.status === 401) {
    save(null);
    window.location.href = "/login/";
  }
  return parse<T>(res);
}
