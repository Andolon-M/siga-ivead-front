// Endpoints de la API
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh",
    FORGOT_PASSWORD: "/auth/request-reset",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_TOKEN: (token: string) => `/auth/verify-token/${token}`,
    ME: "/auth/me",
  },
  
  // Users
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET: (id: string) => `/users/${id}`,
    STATS: "/users/stats",
  },
  
  // Members
  MEMBERS: {
    LIST: "/members",
    CREATE: "/members",
    UPDATE: (id: string) => `/members/${id}`,
    DELETE: (id: string) => `/members/${id}`,
    GET: (id: string) => `/members/${id}`,
    STATS: "/members/stats",
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
    UPDATE: (id: string) => `/ministries/${id}`,
    DELETE: (id: string) => `/ministries/${id}`,
    GET: (id: string) => `/ministries/${id}`,
    STATS: "/ministries/stats",
    // Ministry Members
    MEMBERS: {
      LIST: (ministryId: string) => `/ministries/${ministryId}/members`,
      ADD: (ministryId: string) => `/ministries/${ministryId}/members`,
      REMOVE: (ministryId: string, memberId: string) => `/ministries/${ministryId}/members/${memberId}`,
      UPDATE_ROLE: (ministryId: string, memberId: string) => `/ministries/${ministryId}/members/${memberId}/role`,
      STATS: (ministryId: string) => `/ministries/${ministryId}/members/stats`,
    },
    // Member's Ministries
    MEMBER_MINISTRIES: (memberId: string) => `/ministries/members/${memberId}/ministries`,
    MEMBER_STATS: (memberId: string) => `/ministries/members/${memberId}/stats`,
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
  
  // Roles (rutas bajo /auth según documentación)
  ROLES: {
    LIST: "/auth/roles",
    CREATE: "/auth/roles",
    UPDATE: (id: string) => `/auth/roles/${id}`,
    DELETE: (id: string) => `/auth/roles/${id}`,
    GET: (id: string) => `/auth/roles/${id}`,
    PERMISSIONS: (roleId: string) => `/auth/roles/${roleId}/permissions`,
    STATS: "/auth/roles-permissions/stats",
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

