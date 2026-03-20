import { api } from './http';
import type { Role } from '../auth/roles';

export type LoginUser = {
  id: string;
  username: string;
  role: Role;
  language?: string;
  uiTheme?: string;
};

export type LoginResponse = {
  accessToken: string;
  user: LoginUser;
};

export type LicenseInfoResponse = {
  status?: 'missing' | 'expired' | 'active';
  licenseKeyMasked: string;
  licensee: string;
  activatedAt: string;
  expiresAt: string;
};

export function login(username: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { username, password });
}

export function logout(): Promise<{ success?: boolean }> {
  return api.post<{ success?: boolean }>('/auth/logout');
}

export function changePassword(currentPassword: string, newPassword: string): Promise<{ success?: boolean }> {
  return api.put<{ success?: boolean }>('/profile/password', { currentPassword, newPassword });
}

export function activateLicense(licenseKey: string): Promise<LicenseInfoResponse> {
  return api.post<LicenseInfoResponse>('/license/activate', { licenseKey });
}

export function getLicenseInfo(): Promise<LicenseInfoResponse> {
  return api.get<LicenseInfoResponse>('/license/info');
}
