import { Role } from '@/generated/client';

export function canAccess(role: Role | null | undefined, requiredRole: Role): boolean {
  if (!role) {
    return false;
  }

  const roleHierarchy: Role[] = [Role.USER, Role.ADMIN, Role.SUPERADMIN];

  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  const userRoleIndex = roleHierarchy.indexOf(role);

  return userRoleIndex >= requiredRoleIndex;
}
