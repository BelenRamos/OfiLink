import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormularioContratacion from '../components/FormularioContratacion';

const PerfilTrabajador = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [trabajador, setTrabajador] = useState(null);
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [mostrandoFormulario, setMostrandoFormulario] = useState(false);
  //const [contratacionExitosa, setContratacionExitosa] = useState(false);

  // Cargar usuario y datos del trabajador
  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuarioActual');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }

    const fetchTrabajador = async () => {
      try {
        const res = await fetch(`/api/trabajadores/${id}`);
        const data = await res.json();
        setTrabajador(data);
      } catch (error) {
        console.error('Error al obtener el trabajador:', error);
      }
    };

    const fetchReseñas = async () => {
      try {
        const res = await fetch(`/api/resenas/trabajador/${id}`);
        const data = await res.json();
        setReseñas(data);
      } catch (error) {
        console.error('Error al obtener reseñas:', error);
      }
    };

    Promise.all([fetchTrabajador(), fetchReseñas()]).finally(() =>
      setLoading(false)
    );
  }, [id]);


  if (loading) return <div className="container mt-4">Cargando...</div>;
  if (!trabajador)
    return (
      <div className="container mt-4">
        <p>Trabajador no encontrado.</p>
      </div>
    );

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ← Volver
      </button>

      <h2>{trabajador.nombre}</h2>
      <h5 className="text-muted">
        {trabajador.oficios?.join(', ')} - {trabajador.zona}
      </h5>
      <p>{trabajador.descripcion}</p>
      <p>
        <strong>Teléfono:</strong>{' '}
        <a href={`tel:${trabajador.telefono}`}>{trabajador.telefono}</a>
      </p>

      <hr />

      {usuario.roles_keys?.includes('cliente') && trabajador.disponible && (
        mostrandoFormulario ? (
          <FormularioContratacion
            idTrabajador={trabajador.id}
            onCancel={() => setMostrandoFormulario(false)}
            onSuccess={() => {
              setMostrandoFormulario(false);
              alert('Contratación creada con éxito');
            }}
          />
        ) : (
          <button
            className="btn btn-primary mt-3"
            onClick={() => setMostrandoFormulario(true)}
          >
            Contratar
          </button>
        )
      )}

      <h3>Reseñas</h3>
      {reseñas.length === 0 ? (
        <p>No hay reseñas para este trabajador.</p>
      ) : (
        <ul className="list-group">
          {reseñas.map((r) => (
            <li key={r.id} className="list-group-item">
              <strong>{r.nombre_cliente}</strong>: {r.comentario}{' '}
              <span>⭐ {r.puntuacion}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PerfilTrabajador;
