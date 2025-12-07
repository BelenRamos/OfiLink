export const tieneRol = (usuario, ...roles) =>
  roles.some(r => usuario?.roles_keys?.includes(r));
