import { Role } from '@/generated/client';

export function getRoleLabel(role: Role): string {
  switch (role) {
    case Role.SUPERADMIN:
      return 'Super Administrateur';
    case Role.ADMIN:
      return 'Administrateur';
    case Role.USER:
      return 'Utilisateur';
    default:
      return 'Rôle inconnu';
  }
}
