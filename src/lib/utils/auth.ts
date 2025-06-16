import { Role } from '@/generated/client';

export function canAccess(userRole: Role | null | undefined, requiredRole: Role): boolean {
  if (!userRole) {
    return false;
  }

  const roleHierarchy: Role[] = [Role.USER, Role.ADMIN, Role.SUPERADMIN];

  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
  const userRoleIndex = roleHierarchy.indexOf(userRole);

  return userRoleIndex >= requiredRoleIndex;
}
