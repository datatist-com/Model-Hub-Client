export type UiThemePreference = 'dark' | 'light' | 'system';

type EffectiveTheme = 'dark' | 'light';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';
const PREF_ATTR = 'data-ui-theme-pref';
const EFFECTIVE_ATTR = 'data-ui-theme-effective';

let currentPreference: UiThemePreference | null = null;
let mediaQueryList: MediaQueryList | null = null;
let mediaListener: ((event: MediaQueryListEvent) => void) | null = null;

function getSystemTheme(): EffectiveTheme {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
}

function resolveEffectiveTheme(pref: UiThemePreference): EffectiveTheme {
  return pref === 'system' ? getSystemTheme() : pref;
}

function setAttrs(pref: UiThemePreference): void {
  const root = document.documentElement;
  root.setAttribute(PREF_ATTR, pref);
  root.setAttribute(EFFECTIVE_ATTR, resolveEffectiveTheme(pref));
}

function ensureSystemListener(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (!mediaQueryList) {
    mediaQueryList = window.matchMedia(MEDIA_QUERY);
  }
  if (mediaListener) {
    return;
  }
  mediaListener = () => {
    if (currentPreference !== 'system') {
      return;
    }
    setAttrs('system');
  };
  mediaQueryList.addEventListener('change', mediaListener);
}

export function applyUiTheme(preference: UiThemePreference): void {
  if (typeof document === 'undefined') {
    return;
  }

  currentPreference = preference;
  setAttrs(preference);

  if (preference === 'system') {
    ensureSystemListener();
  }
}
