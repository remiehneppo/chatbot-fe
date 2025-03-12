export const isAdminAuthenticated = (): boolean => {
  const token = localStorage.getItem('admin_token');
  return !!token;
};

export const getAdminToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

export const clearAdminAuth = (): void => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
};