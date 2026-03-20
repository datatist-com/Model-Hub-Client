import { api } from './http';
import type { Role } from '../auth/roles';

export type UserStatus = 'active' | 'frozen';

export type LoginUser = {
  id: string;
  username: string;
  role: Role;
  realName?: string;
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

export type CurrentUserResponse = LoginUser;

export type UserView = {
  id: string;
  username: string;
  realName: string;
  role: Role;
  status: UserStatus;
  language?: string;
  uiTheme?: string;
  createdAt?: string;
};

export type ListUsersParams = {
  page?: number;
  pageSize?: number;
  role?: Role;
  status?: UserStatus;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PagedUsersResponse = {
  items: UserView[];
  page: number;
  pageSize: number;
  total: number;
};

export type CreateUserRequest = {
  username: string;
  password: string;
  realName?: string;
  role: Role;
};

export type UpdateUserRequest = {
  realName?: string;
  role?: Role;
  status?: UserStatus;
};

function toQueryString(params: ListUsersParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.set(key, String(value));
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { username, password });
}

export function logout(): Promise<{ success?: boolean }> {
  return api.post<{ success?: boolean }>('/auth/logout');
}

export function getCurrentUser(): Promise<CurrentUserResponse> {
  return api.get<CurrentUserResponse>('/auth/current-user');
}

export function listUsers(params: ListUsersParams): Promise<PagedUsersResponse> {
  return api.get<PagedUsersResponse>(`/users${toQueryString(params)}`);
}

export function createUser(payload: CreateUserRequest): Promise<UserView> {
  return api.post<UserView>('/users', payload);
}

export function updateUser(userId: string, payload: UpdateUserRequest): Promise<UserView> {
  return api.put<UserView>(`/users/${userId}`, payload);
}

export function deleteUser(userId: string): Promise<{ success?: boolean }> {
  return api.delete<{ success?: boolean }>(`/users/${userId}`);
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
