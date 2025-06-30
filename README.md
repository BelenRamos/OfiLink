# OfiLink

OfiLink es una plataforma web que permite a los clientes buscar y contactar trabajadores de distintos oficios dentro de su zona. Este proyecto está dividido en dos partes: **frontend (React + Vite)** y **backend (Node.js + Express + SQL Server)**.

## 📁 Estructura del proyecto

/OFILINK
├── /backend → Node.js + Express (API REST + conexión a SQL Server)
├── /frontend → React (Vite) para la interfaz de usuario

## 🚀 Cómo ejecutar en desarrollo

### 1. Backend (API)

bash
cd backend
npm install
node app.js

**Esto inicia el servidor en http://localhost:3000**

### 2. Frontend (React)
cd frontend
npm install
npm run dev
**Esto abre Vite en http://localhost:5173 (por defecto)**

**El archivo vite.config.js redirige las llamadas a /api hacia el backend automáticamente en desarrollo:**

server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}

## 🌐 Build para producción

###  Generar los archivos estáticos del frontend:

bash
Copiar
Editar
cd frontend
npm run build

### Copiar la carpeta generada (frontend/dist) a backend/public (opcional si lo servís desde Express).

## 🧠 Tecnologías
Frontend: React, Vite, CSS
Backend: Node.js, Express, MSSQL
Base de datos: SQL Server (con autenticación de Windows)
ORM/Driver: mssql y msnodesqlv8

## 🔒 Requisitos
Node.js 18+
SQL Server (local o remoto)
DBC Driver 18 for SQL Server (instalado en Windows)

## 📦 Scripts útiles
Backend
bash
Copiar
Editar
cd backend
node app.js         # Inicia el servidor
Frontend
bash
Copiar
Editar
cd frontend
npm run dev         # Inicia Vite en modo desarrollo
npm run build       # Genera los archivos para producción

## 👩‍💻 Autor
Proyecto desarrollado por Belen Ramos – 2025