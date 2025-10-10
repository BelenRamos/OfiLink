import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

    // 1. 🔑 MIGRAR fetchUsuarios a apiFetch
  const fetchUsuarios = async () => {
      try {
          // Asumimos que esta ruta está protegida por Admin
          const response = await apiFetch('/api/personas'); 
          setUsuarios(response); // apiFetch devuelve directamente el JSON
      } catch (error) {
          console.error('Error al cargar usuarios:', error);
          setMensaje('Error al cargar la lista de usuarios.');
      }
  };

  // 2. 🔑 MIGRAR resetearContraseña a apiFetch
  const resetearContraseña = async (id) => {
      try {
          // Asumimos que esta ruta está protegida por Admin
          const response = await apiFetch(`/api/personas/${id}/reset-password`, {
              method: 'PUT'
          });
          setMensaje(`Nueva contraseña: ${response.nuevaPassword}`);
          fetchUsuarios(); 
      } catch (error) {
          console.error('Error al resetear contraseña:', error.message);
          setMensaje(`Error al resetear contraseña: ${error.message}`);
      }
  };

/*   const fetchUsuarios = async () => {
    const response = await axios.get('/api/personas');
    setUsuarios(response.data);
  };

  const resetearContraseña = async (id) => {
    try {
      const response = await axios.put(`/api/personas/${id}/reset-password`);
      setMensaje(`Nueva contraseña: ${response.data.nuevaPassword}`);
      fetchUsuarios(); // refrescar
    } catch (error) {
      console.error(error);
      setMensaje('Error al resetear contraseña');
    }
  }; */


  // -----------------------------------------------------
  // 🔑 NUEVA FUNCIÓN: Toggle Bloqueo
  // -----------------------------------------------------
async function toggleBloqueo(usuario) {
    // Determinar el nuevo estado y acción
    const nuevoEstado = usuario.estado_cuenta === 'Activo' ? 'Bloqueado' : 'Activo';
    const accion = nuevoEstado === 'Bloqueado' ? 'bloquear' : 'desbloquear';
    let motivo = '';

    // Si vamos a bloquear, pedimos el motivo --> Para despues en la auditoria
    if (nuevoEstado === 'Bloqueado') {
      motivo = prompt(`Ingrese el motivo para bloquear a ${usuario.nombre}:`);
      if (!motivo) return;
    }

    try {

        await apiFetch(`/api/personas/${usuario.id}/estado`, {
            method: 'PUT',
            body: { 
                nuevoEstado: nuevoEstado,
                motivo: motivo
            }
        });

        setMensaje(`La cuenta de ${usuario.nombre} fue ${accion === 'bloquear' ? 'bloqueada' : 'desbloqueada'} exitosamente.`);
        fetchUsuarios(); 

    } catch (error) {
          console.error('Error al cambiar el estado de la cuenta:', error.message);
          setMensaje(`Error al ${accion} la cuenta: ${error.message}`);
    }
}
  // -----------------------------------------------------

  const usuariosFiltrados = filtroTipo
    ? usuarios.filter(u => u.tipo === filtroTipo)
    : usuarios;

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <label className="form-label">Filtrar por tipo:</label>
        <select
          className="form-select w-auto"
          value={filtroTipo}
          onChange={e => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="cliente">Clientes</option>
          <option value="trabajador">Trabajadores</option>
        </select>
      </div>

      <table className="table table-bordered table-striped">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Estado</th> 
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(usuario => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.mail}</td>
              <td>{usuario.tipo}</td>
              <td>
                {/* 🔑 VISUALIZACIÓN DEL ESTADO */}
                <span className={`badge ${usuario.estado_cuenta === 'Activo' ? 'bg-success' : 'bg-danger'}`}>
                    {usuario.estado_cuenta}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => resetearContraseña(usuario.id)}
                >
                  🔑 Resetear
                </button>
                {/* 🔑 BOTÓN CONDICIONAL DE BLOQUEO/DESBLOQUEO */}
                {usuario.estado_cuenta !== 'Eliminado' && (
                    <button
                        className={`btn btn-sm ${usuario.estado_cuenta === 'Activo' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleBloqueo(usuario)}
                    >
                        {usuario.estado_cuenta === 'Activo' ? '🚫 Bloquear' : '🔓 Desbloquear'}
                    </button>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export default Usuarios;
