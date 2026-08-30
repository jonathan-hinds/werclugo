import type { ApiErrorShape } from '@wurcluego/shared';

const DEVICE_KEY = 'wurcluego-device-seal';
function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, id); }
  return id;
}

export class ClueApiError extends Error { constructor(public readonly code: string, message: string, public readonly status: number) { super(message); } }
const apiBase = import.meta.env.VITE_API_URL ?? '';

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBase}/api/v1${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'x-device-id': deviceId(), ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: { code: 'CLUE_RESPONSE_MISSING', message: 'The discrepancy arrived without paperwork.' } })) as ApiErrorShape;
    throw new ClueApiError(body.error.code, body.error.message, response.status);
  }
  return response.json() as Promise<T>;
}
