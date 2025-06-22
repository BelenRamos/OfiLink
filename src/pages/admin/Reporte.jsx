import React, { useRef } from 'react';

const datosMock = [
  { id: 1, nombre: 'Pedro Díaz', oficio: 'Electricista', zona: 'Zona Norte' },
  { id: 2, nombre: 'Marta C.', oficio: 'Plomera', zona: 'Zona Sur' },
];

const Reporte = () => {
  const printRef = useRef();

  const imprimir = () => {
    const contenido = printRef.current.innerHTML;
    const ventana = window.open('', '', 'width=800,height=600');
    ventana.document.write(`<html><head><title>Reporte</title></head><body>${contenido}</body></html>`);
    ventana.document.close();
    ventana.print();
  };

  return (
    <div>
      <h3>Generar Reporte</h3>
      <button className="btn btn-success mb-3" onClick={imprimir}>🖨️ Imprimir</button>

      <div ref={printRef}>
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Oficio</th>
              <th>Zona</th>
            </tr>
          </thead>
          <tbody>
            {datosMock.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.nombre}</td>
                <td>{d.oficio}</td>
                <td>{d.zona}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reporte;
