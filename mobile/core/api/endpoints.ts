// API endpoint constants
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
  },
  // Task endpoints
  TASKS: {
    LIST: '/tasks',
    DETAIL: (id: string) => `/tasks/${id}`,
    CREATE: '/tasks',
    UPDATE: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    SYNC: '/tasks/sync',
  },
  // Form endpoints
  FORMS: {
    LIST: '/forms',
    DETAIL: (id: string) => `/forms/${id}`,
    SUBMIT: (id: string) => `/forms/${id}/submit`,
  },
} as const;

