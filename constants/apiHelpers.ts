import { API_BASE_URL, API_PATHS } from '@/constants/api';

type JsonObject = Record<string, unknown>;

export function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function authHeaders(token: string | null): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function pickToken(json: unknown): string | null {
  if (!isRecord(json)) return null;
  const sources: JsonObject[] = [json, ...(isRecord(json.data) ? [json.data] : [])];
  for (const source of sources) {
    for (const key of ['token', 'accessToken', 'access_token']) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) return value;
    }
  }
  return null;
}

export function pickNested<T>(json: unknown, keys: string[]): T | null {
  if (!isRecord(json)) return null;
  for (const key of keys) {
    const value = json[key];
    if (isRecord(value)) return value as T;
  }
  return null;
}

export function pickList<T>(json: unknown): T[] | null {
  if (Array.isArray(json)) return json as T[];
  if (!isRecord(json)) return null;
  for (const key of ['students', 'data', 'items', 'results']) {
    const value = json[key];
    if (Array.isArray(value)) return value as T[];
    if (isRecord(value)) {
      const nested = pickList<T>(value);
      if (nested) return nested;
    }
  }
  return null;
}

export function pickMessage(json: unknown, fallback: string): string {
  if (typeof json === 'string' && json.trim()) return json;
  if (isRecord(json)) {
    for (const key of ['message', 'error', 'detail']) {
      const value = json[key];
      if (typeof value === 'string' && value.trim()) return value;
    }
  }
  return fallback;
}

export type Person = {
  id?: string | number;
  name?: string;
  email?: string;
  role?: string;
  course?: string;
};

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function normalizePerson(raw: unknown): Person | null {
  if (!isRecord(raw)) return null;
  const fullName = [text(raw.firstName), text(raw.lastName)].filter(Boolean).join(' ');
  const company = isRecord(raw.company) ? raw.company : null;
  const id = typeof raw.id === 'string' || typeof raw.id === 'number' ? raw.id : undefined;
  return {
    id,
    name: text(raw.name) ?? (fullName || text(raw.username)),
    email: text(raw.email),
    role: text(raw.role),
    course: text(raw.course) ?? (company ? text(company.department) : undefined),
  };
}

export function normalizePeople(list: unknown[]): Person[] {
  return list.flatMap((item) => {
    const person = normalizePerson(item);
    return person ? [person] : [];
  });
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64Url(input: string): string {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of input.replace(/-/g, '+').replace(/_/g, '/')) {
    if (char === '=') break;
    const index = BASE64_CHARS.indexOf(char);
    if (index < 0) throw new Error('Invalid base64');
    value = (value << 6) | index;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((value >> bits) & 0xff);
      value &= (1 << bits) - 1;
    }
  }
  return decodeURIComponent(bytes.map((b) => `%${b.toString(16).padStart(2, '0')}`).join(''));
}

export function userIdFromToken(token: string | null): string | null {
  const payloadPart = token?.split('.')[1];
  if (!payloadPart) return null;
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(payloadPart));
    if (!isRecord(payload)) return null;
    const id = payload.sub ?? payload.id ?? payload.userId;
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
  } catch {
    return null;
  }
}

export function profileUrl(token: string | null): string {
  return `${API_BASE_URL}${API_PATHS.profile(userIdFromToken(token) ?? '')}`;
}
