export const platformRoles = ['admin', 'super_admin'];

export function isPlatformRole(role) {
  return platformRoles.includes(role);
}
