import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de presentación para mostrar el historial de auditoría en formato de tabla.
 *
 * @param {Array} historial - Lista de registros de auditoría.
 * @param {object} printRef - Referencia para el div contenedor de la tabla (usado para la impresión).
 * @param {function} formatDateTime - Función para formatear la fecha y hora.
 */
const TablaAuditoria = ({ historial, printRef, formatDateTime }) => {
    return (
        <div ref={printRef} className="table-responsive rounded-3 shadow-sm">
            {historial.length === 0 ? (
                <div className="alert alert-info shadow-sm">
                    No se encontraron registros de auditoría para el rango de fechas seleccionado.
                </div>
            ) : (
                <table className="table table-hover align-middle text-center table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Fecha/Hora</th>
                            <th>Tipo</th>
                            <th>Usuario que Acciona</th>
                            <th>Persona Afectada</th>
                            <th>Campo</th>
                            <th>Valor Anterior</th>
                            <th>Valor Nuevo</th>
                            <th>Descripción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.map((reg) => (
                            <tr key={reg.Id}>
                                <td className="text-nowrap">{formatDateTime(reg.FechaHora)}</td>
                                <td><span className="badge bg-primary">{reg.TipoCambio}</span></td>
                                <td>{reg.usuario_accion_nombre} <br /><small className="text-muted">(ID: {reg.usuario_accion_id})</small></td>
                                <td>{reg.persona_afectada_nombre} <br /><small className="text-muted">(ID: {reg.persona_afectada_id})</small></td>
                                <td>{reg.ColumnaAfectada || '—'}</td>
                                <td className="text-danger">{reg.ValorAnterior || '—'}</td>
                                <td className="text-success">{reg.ValorNuevo || '—'}</td>
                                <td className="text-start">{reg.Observaciones}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

TablaAuditoria.propTypes = {
    historial: PropTypes.array.isRequired,
    printRef: PropTypes.oneOfType([
        PropTypes.func, 
        PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    ]),
    formatDateTime: PropTypes.func.isRequired,
};

export default TablaAuditoria;