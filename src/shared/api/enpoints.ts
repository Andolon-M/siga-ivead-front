// Endpoints de la API
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
  },
  
  // Users
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: number) => `/users/${id}`,
    DELETE: (id: number) => `/users/${id}`,
    GET: (id: number) => `/users/${id}`,
  },
  
  // Members
  MEMBERS: {
    LIST: "/members",
    CREATE: "/members",
    UPDATE: (id: number) => `/members/${id}`,
    DELETE: (id: number) => `/members/${id}`,
    GET: (id: number) => `/members/${id}`,
  },
  
  // Events
  EVENTS: {
    LIST: "/events",
    CREATE: "/events",
    UPDATE: (id: number) => `/events/${id}`,
    DELETE: (id: number) => `/events/${id}`,
    GET: (id: number) => `/events/${id}`,
    SESSIONS: (eventId: number) => `/events/${eventId}/sessions`,
    ATTENDEES: (eventId: number) => `/events/${eventId}/attendees`,
    PAYMENTS: (eventId: number) => `/events/${eventId}/payments`,
  },
  
  // Ministries
  MINISTRIES: {
    LIST: "/ministries",
    CREATE: "/ministries",
    UPDATE: (id: number) => `/ministries/${id}`,
    DELETE: (id: number) => `/ministries/${id}`,
    GET: (id: number) => `/ministries/${id}`,
  },
  
  // Teams
  TEAMS: {
    LIST: "/teams",
    CREATE: "/teams",
    UPDATE: (id: number) => `/teams/${id}`,
    DELETE: (id: number) => `/teams/${id}`,
    GET: (id: number) => `/teams/${id}`,
    MEMBERS: (teamId: number) => `/teams/${teamId}/members`,
  },
  
  // Roles
  ROLES: {
    LIST: "/roles",
    CREATE: "/roles",
    UPDATE: (id: number) => `/roles/${id}`,
    DELETE: (id: number) => `/roles/${id}`,
    GET: (id: number) => `/roles/${id}`,
    PERMISSIONS: (roleId: number) => `/roles/${roleId}/permissions`,
  },
  
  // Reports
  REPORTS: {
    FINANCIAL: "/reports/financial",
    DEPOSITS: "/reports/deposits",
    EXPENSES: "/reports/expenses",
    WEEKLY: "/reports/weekly",
  },
  
  // Files
  FILES: {
    LIST: "/files",
    UPLOAD: "/files/upload",
    DELETE: (id: number) => `/files/${id}`,
    DOWNLOAD: (id: number) => `/files/${id}/download`,
  },
  
  // Settings
  SETTINGS: {
    GET: "/settings",
    UPDATE: "/settings",
  },
}

