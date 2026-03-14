export type Role =
  | 'system_admin'
  | 'model_engineer'
  | 'data_engineer'
  | 'business_operator'
  | 'project_admin'
  | 'project_member';

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
  system_admin: [
    '/dashboard', '/data-sources', '/feature-management', '/user-portrait',
    '/target-management', '/model-management', '/scoring-generation',
    '/operation-list-output', '/users', '/log-viewer'
  ],
  model_engineer: [
    '/dashboard', '/data-sources', '/feature-management', '/user-portrait',
    '/target-management', '/model-management', '/scoring-generation',
    '/operation-list-output'
  ],
  data_engineer: [
    '/dashboard', '/data-sources', '/user-portrait', '/target-management',
    '/scoring-generation', '/operation-list-output'
  ],
  business_operator: [
    '/dashboard', '/scoring-generation', '/operation-list-output'
  ],
  project_admin: [
    '/dashboard', '/data-sources', '/user-portrait', '/target-management',
    '/scoring-generation', '/operation-list-output', '/users'
  ],
  project_member: [
    '/dashboard', '/scoring-generation', '/operation-list-output'
  ]
};

export function getMenuKeysForRole(role: Role): MenuKey[] {
  return ROLE_MENU_MAP[role] ?? ROLE_MENU_MAP.project_member;
}

/** 项目管理员只能管理项目成员 */
export function canManageRole(currentRole: Role, targetRole: Role): boolean {
  if (currentRole === 'system_admin') return true;
  if (currentRole === 'project_admin' && targetRole === 'project_member') return true;
  return false;
}

/** 用户管理页: 系统管理员看所有, 项目管理员只看项目成员 */
export function getManageableRoles(role: Role): Role[] {
  if (role === 'system_admin') {
    return ['system_admin', 'model_engineer', 'data_engineer', 'business_operator', 'project_admin', 'project_member'];
  }
  if (role === 'project_admin') {
    return ['project_member'];
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
  return 'system_admin';
}
