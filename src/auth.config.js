export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER'
}

export const ROLE_PERMISSIONS = {
  ADMIN: ['read', 'write', 'delete', 'manage_users'],
  EDITOR: ['read', 'write'],
  VIEWER: ['read']
}