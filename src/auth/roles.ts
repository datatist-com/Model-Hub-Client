export type Role = 'model_developer' | 'model_operator' | 'platform_admin';

export type MenuKey =
  | '/dashboard'
  | '/data-sources'
  | '/feature-management'
  | '/user-portrait'
  | '/target-management'
  | '/model-management'
  | '/scoring-generation'
  | '/operation-list-output'
  | '/users'
  | '/log-viewer';

/** 角色 → 可见菜单 */
const ROLE_MENU_MAP: Record<Role, MenuKey[]> = {
  model_developer: [
    '/dashboard', '/data-sources', '/feature-management', '/user-portrait',
    '/target-management', '/model-management'
  ],
  model_operator: [
    '/dashboard', '/model-management', '/scoring-generation',
    '/operation-list-output'
  ],
  platform_admin: [
    '/dashboard', '/data-sources', '/feature-management', '/user-portrait',
    '/target-management', '/model-management', '/scoring-generation',
    '/operation-list-output', '/users', '/log-viewer'
  ]
};

/** 角色 → i18n 键名 */
const ROLE_I18N_KEY_MAP: Record<Role, string> = {
  model_developer: 'modelDeveloper',
  model_operator: 'modelOperator',
  platform_admin: 'platformAdmin'
};

export function getRoleI18nKey(role: Role): string {
  return ROLE_I18N_KEY_MAP[role] ?? ROLE_I18N_KEY_MAP.model_operator;
}

export function getMenuKeysForRole(role: Role): MenuKey[] {
  return ROLE_MENU_MAP[role] ?? ROLE_MENU_MAP.model_operator;
}

/** 仅平台管理员可以管理用户 */
export function canManageRole(currentRole: Role, _targetRole: Role): boolean {
  return currentRole === 'platform_admin';
}

/** 用户管理页: 仅平台管理员可见所有角色 */
export function getManageableRoles(role: Role): Role[] {
  if (role === 'platform_admin') {
    return ['model_developer', 'model_operator', 'platform_admin'];
  }
  return [];
}

const USER_ROLE_PREFIX = 'userRole:';

export function setUserRole(username: string, role: Role): void {
  localStorage.setItem(`${USER_ROLE_PREFIX}${username}`, role);
}

export function getUserRole(username: string): Role {
  const v = localStorage.getItem(`${USER_ROLE_PREFIX}${username}`);
  if (v && v in ROLE_MENU_MAP) return v as Role;
  return 'model_operator'; // 最小权限原则
}
