export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
}

export const ROLE_PERMISSIONS = {
  ADMIN: {
    description: 'Full system access and user management',
    canManageUsers: true,
    canManageContent: true,
    canViewReports: true,
    canManageSettings: true,
    canDelete: true
  },
  EDITOR: {
    description: 'Can create and edit content',
    canManageUsers: false,
    canManageContent: true,
    canViewReports: true,
    canManageSettings: false,
    canDelete: false
  },
  VIEWER: {
    description: 'Read-only access to content',
    canManageUsers: false,
    canManageContent: false,
    canViewReports: true,
    canManageSettings: false,
    canDelete: false
  }
}