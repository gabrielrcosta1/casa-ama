export type Permission = 
  | 'products:read'
  | 'products:write'
  | 'products:delete'
  | 'orders:read'
  | 'orders:write'
  | 'orders:cancel'
  | 'customers:read'
  | 'customers:write'
  | 'suppliers:read'
  | 'suppliers:write'
  | 'suppliers:approve'
  | 'admin:full'
  | 'analytics:read'
  | 'logistics:read'
  | 'logistics:write';

export type Role = 'customer' | 'supplier' | 'admin';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  customer: [
    'products:read',
    'orders:read',
    'orders:write',
    'orders:cancel',
  ],
  supplier: [
    'products:read',
    'products:write',
    'orders:read',
    'suppliers:read',
    'analytics:read',
    'logistics:read',
  ],
  admin: [
    'admin:full',
    'products:read',
    'products:write',
    'products:delete',
    'orders:read',
    'orders:write',
    'orders:cancel',
    'customers:read',
    'customers:write',
    'suppliers:read',
    'suppliers:write',
    'suppliers:approve',
    'analytics:read',
    'logistics:read',
    'logistics:write',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission) || permissions.includes('admin:full');
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

