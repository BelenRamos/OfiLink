import React from 'react';
import { createRoot } from 'react-dom/client'; // ✅ Importación correcta y moderna
import App from './App';
import { AuthProvider } from "./context/AuthContext"; 

/* const root = createRoot(document.getElementById('root'));
root.render(<App />); */

// 1. Obtener el contenedor DOM
const container = document.getElementById('root'); 

// 2. Crear la raíz de React usando la función importada `createRoot`
const root = createRoot(container); 

// 3. Renderizar la aplicación
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Tu nuevo proveedor de autenticación */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);