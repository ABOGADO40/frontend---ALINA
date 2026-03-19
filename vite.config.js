// ============================================================================
// CONFIGURACION DE VITE - PRUEBA DIGITAL (FRONTEND)
// ============================================================================
// ******************************************************************************
// * CONFIGURACION HIBRIDA: LOCAL / RAILWAY                                     *
// ******************************************************************************
//
// [LOCAL]   Este archivo configura el servidor de desarrollo de Vite.
//           El proxy redirige /api/* al backend local (localhost:3000).
//           Se activa con: npm run dev
//
// [RAILWAY] Este archivo se usa SOLO durante el build (npm run build).
//           La seccion "server" y "proxy" se IGNORAN en produccion.
//           En Railway, el frontend se sirve como archivos estaticos con 'serve'.
//
// Proyecto Railway: https://railway.com/project/0d0c7b03-d08f-41c8-ab34-21d45b13e731
// ============================================================================

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ============================================================================
  // SERVIDOR DE DESARROLLO LOCAL
  // ============================================================================
  // Esta configuracion SOLO se usa cuando ejecutas: npm run dev
  // NO afecta el build de produccion ni Railway
  // ============================================================================
  server: {
    // Puerto del servidor de desarrollo (frontend local)
    port: 5173,

    // ============================================================================
    // PROXY PARA DESARROLLO LOCAL
    // ============================================================================
    // Redirecciona las peticiones /api/* al backend local (http://localhost:3000)
    // Esto evita problemas de CORS durante el desarrollo
    //
    // Ejemplo:
    //   fetch('/api/auth/login') -> http://localhost:3000/api/auth/login
    //
    // IMPORTANTE: Este proxy SOLO funciona en desarrollo local
    // En produccion (Railway), el frontend hace peticiones directas al backend
    // usando la URL configurada en las variables de entorno de Railway
    // ============================================================================
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // Backend local
        changeOrigin: true,
        secure: false
      }
    }
  },

  // ============================================================================
  // CONFIGURACION DE BUILD (PRODUCCION)
  // ============================================================================
  // Esta configuracion se usa cuando ejecutas: npm run build
  // Railway ejecuta este comando automaticamente durante el despliegue
  // ============================================================================
  build: {
    // Directorio de salida para los archivos compilados
    outDir: 'dist',

    // Generar sourcemaps para debugging (opcional en produccion)
    sourcemap: true
  }
})
