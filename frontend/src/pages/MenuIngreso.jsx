import { Link } from 'react-router-dom';

const MenuIngreso = () => {
  return (
    <div className="container text-center mt-5">
      <h1>Bienvenido a OfiLink</h1>
      <p>Conectamos clientes con trabajadores de confianza en tu zona.</p>
      <div className="mt-4">
        <Link to="/registro" className="btn btn-success mx-2">Registrarse</Link>
        <Link to="/login" className="btn btn-outline-primary mx-2">Ingresar</Link>
      </div>
    </div>
  );
};

export default MenuIngreso;
