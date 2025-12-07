export const tienePermiso = (usuario, permiso) => {
  if (!usuario || !usuario.permisos_keys) return false;
  return usuario.permisos_keys.includes(permiso);
};

