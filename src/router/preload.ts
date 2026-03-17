export const loadAppLayout = () => import('../layouts/AppLayout');
export const loadDashboardPage = () => import('../pages/DashboardPage');
export const loadLicenseCenterModal = () => import('../components/license/LicenseCenterModal');

export function warmupAuthEntry(): Promise<unknown[]> {
  return Promise.allSettled([loadAppLayout(), loadDashboardPage()]);
}
