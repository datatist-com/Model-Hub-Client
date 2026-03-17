export type EnvironmentIssue = 'small-viewport' | 'mobile-layout' | 'non-chrome';

export type EnvironmentCheckResult = {
  supported: boolean;
  issues: EnvironmentIssue[];
};

const ENVIRONMENT_GUARD_BYPASS_KEY = 'model_hub.environment_guard_bypass.v1';
const ENVIRONMENT_GUARD_BYPASS_TTL_MS = 24 * 60 * 60 * 1000;

const MIN_WIDTH = 768;
const MIN_HEIGHT = 500;
const MOBILE_RATIO_THRESHOLD = 0.65;
const MOBILE_LIKE_MAX_WIDTH = 480;

function isChromeBrowser(userAgent: string, vendor: string): boolean {
  const hasChromeToken = /Chrome\//.test(userAgent);
  const isChromiumVariant = /(Edg|OPR|Opera|SamsungBrowser|DuckDuckGo|YaBrowser|Vivaldi|Brave)/.test(userAgent);
  const isGoogleVendor = /Google Inc\./.test(vendor);
  return hasChromeToken && isGoogleVendor && !isChromiumVariant;
}

function isMobileLikeViewport(width: number, height: number): boolean {
  if (width > MOBILE_LIKE_MAX_WIDTH) {
    return false;
  }

  if (width >= height) {
    return false;
  }

  return width / height <= MOBILE_RATIO_THRESHOLD;
}

export function evaluateEnvironment(): EnvironmentCheckResult {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { supported: true, issues: [] };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const userAgent = navigator.userAgent;
  const vendor = navigator.vendor ?? '';

  const issues: EnvironmentIssue[] = [];

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    issues.push('small-viewport');
  }

  if (isMobileLikeViewport(width, height)) {
    issues.push('mobile-layout');
  }

  if (!isChromeBrowser(userAgent, vendor)) {
    issues.push('non-chrome');
  }

  return {
    supported: issues.length === 0,
    issues
  };
}

export function getEnvironmentGuardBypass(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const raw = window.localStorage.getItem(ENVIRONMENT_GUARD_BYPASS_KEY);

  if (!raw) {
    return false;
  }

  try {
    const parsed = JSON.parse(raw) as { expiresAt?: number };
    const expiresAt = typeof parsed.expiresAt === 'number' ? parsed.expiresAt : 0;

    if (expiresAt > Date.now()) {
      return true;
    }
  } catch {
    // ignore invalid cache payload
  }

  window.localStorage.removeItem(ENVIRONMENT_GUARD_BYPASS_KEY);
  return false;
}

export function setEnvironmentGuardBypass(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (enabled) {
    window.localStorage.setItem(
      ENVIRONMENT_GUARD_BYPASS_KEY,
      JSON.stringify({ expiresAt: Date.now() + ENVIRONMENT_GUARD_BYPASS_TTL_MS })
    );
    return;
  }

  window.localStorage.removeItem(ENVIRONMENT_GUARD_BYPASS_KEY);
}
