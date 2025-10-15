// src/utils/apiFetch.js
export const apiFetch = async (url, options = {}) => {
  const usuario = JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  const headers = options.headers || {};

  // 1. Establecer el Content-Type para peticiones con body
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // 2. Agregar el token si existe
  if (usuario.token) {
    headers['Authorization'] = `Bearer ${usuario.token}`;
  }

  // 3. Serializar el cuerpo del objeto si existe
  const requestOptions = { ...options, headers };
  if (options.body && typeof options.body === 'object') {
    requestOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch('http://localhost:3000' + url, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Crear un nuevo Error
    const error = new Error(errorData.error || `HTTP error ${response.status}`);
    
    // 💡 ADJUNTAR LA RESPUESTA COMPLETA DEL SERVIDOR al objeto Error
    // Esto hace que 'error.response' esté disponible en el catch de Oficios.jsx
    error.response = errorData; 
    
    throw error;
  }

  return response.json();
};