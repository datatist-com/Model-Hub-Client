import { getAccessToken } from '../auth/token';
import i18n from '../i18n';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const API_BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL;

type ApiEnvelope<T> = {
  code?: string;
  message?: string;
  data?: T;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const NETWORK_ERROR_HINTS = ['failed to fetch', 'networkerror', 'network request failed', 'load failed'];

function isNetworkErrorMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return NETWORK_ERROR_HINTS.some((hint) => normalized.includes(hint));
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError && error.code === 'NETWORK_UNAVAILABLE') {
    return i18n.t('errors.backendUnavailable');
  }

  if (error instanceof Error && isNetworkErrorMessage(error.message)) {
    return i18n.t('errors.backendUnavailable');
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'network request failed';
    if (isNetworkErrorMessage(message)) {
      throw new ApiError(i18n.t('errors.backendUnavailable'), 0, 'NETWORK_UNAVAILABLE');
    }
    throw new ApiError(message, 0, 'NETWORK_ERROR');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const asJson = contentType.includes('application/json');
  const payload = asJson ? ((await response.json()) as unknown) : null;

  if (!response.ok) {
    const envelope = payload as ApiEnvelope<unknown> | null;
    throw new ApiError(
      envelope?.message ?? `Request failed with status ${response.status}`,
      response.status,
      envelope?.code
    );
  }

  const envelope = payload as ApiEnvelope<T> | null;
  if (envelope && Object.prototype.hasOwnProperty.call(envelope, 'data')) {
    return envelope.data as T;
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
};
