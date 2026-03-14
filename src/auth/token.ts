const TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'currentUsername';
const USER_LANGUAGE_PREFIX = 'userLanguage:';
const USER_UI_THEME_PREFIX = 'userUiTheme:';
const USER_SESSION_TABS_PREFIX = 'userSessionTabs:';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function setCurrentUsername(username: string): void {
  localStorage.setItem(CURRENT_USER_KEY, username);
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setUserLanguage(username: string, language: string): void {
  localStorage.setItem(`${USER_LANGUAGE_PREFIX}${username}`, language);
}

export function getUserLanguage(username: string): string | null {
  return localStorage.getItem(`${USER_LANGUAGE_PREFIX}${username}`);
}

export type { UiThemePreference } from '../theme/uiTheme';
import type { UiThemePreference } from '../theme/uiTheme';

export function setUserUiTheme(username: string, theme: UiThemePreference): void {
  localStorage.setItem(`${USER_UI_THEME_PREFIX}${username}`, theme);
}

export function getUserUiTheme(username: string): UiThemePreference | null {
  const value = localStorage.getItem(`${USER_UI_THEME_PREFIX}${username}`);
  if (value === 'dark' || value === 'light' || value === 'system') {
    return value;
  }
  return null;
}

export type SessionTabStorageItem = {
  key: string;
  href: string;
  labelKey?: string;
};

export function setUserSessionTabs(username: string, tabs: SessionTabStorageItem[]): void {
  localStorage.setItem(`${USER_SESSION_TABS_PREFIX}${username}`, JSON.stringify(tabs));
}

export function getUserSessionTabs(username: string): SessionTabStorageItem[] | null {
  const raw = localStorage.getItem(`${USER_SESSION_TABS_PREFIX}${username}`);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return null;
    }

    const asRecord = (value: unknown): Record<string, unknown> | null => {
      if (!value || typeof value !== 'object') {
        return null;
      }
      return value as Record<string, unknown>;
    };

    const asString = (value: unknown): string | null => {
      return typeof value === 'string' ? value : null;
    };

    const cleaned: SessionTabStorageItem[] = [];
    for (const item of parsed) {
      const record = asRecord(item);
      if (!record) {
        continue;
      }

      const key = asString(record.key);
      const href = asString(record.href);
      const labelKey = asString(record.labelKey);

      if (!key || !href) {
        continue;
      }

      if (!key.startsWith('/')) {
        continue;
      }

      cleaned.push({ key, href, labelKey: labelKey ?? undefined });
    }
    return cleaned;
  } catch {
    return null;
  }
}
