import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// ============================================================================
// API CLIENT - CONFIGURACION HIBRIDA LOCAL / RAILWAY
// ============================================================================
// Este cliente axios funciona automaticamente en ambos entornos:
//
// [LOCAL]   baseURL = "/api" -> Vite proxy redirige a http://localhost:3000/api
// [RAILWAY] baseURL = URL completa del backend en Railway
//
// NO se necesitan cambios en este archivo para alternar entre LOCAL y RAILWAY.
// La configuracion se determina por VITE_API_URL en el archivo .env del frontend.
// ============================================================================

// Axios instance principal con configuracion base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds default timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      const isRegisterRoute = error.config?.url?.includes('/auth/register');

      // Only redirect to login if not already on auth routes
      if (!isLoginRoute && !isRegisterRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Format error response
    const errorResponse = {
      success: false,
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.error?.message ||
                 error.response?.data?.error ||
                 error.message ||
                 'Ha ocurrido un error inesperado',
        details: error.response?.data?.error?.details || [],
        status: error.response?.status || 500
      },
      // Body crudo de la respuesta para consumidores que necesiten estructuras
      // especificas (ej. import-drive devuelve { data: { results, summary } } con 422)
      data: error.response?.data || null,
      status: error.response?.status || 0
    };

    return Promise.reject(errorResponse);
  }
);

// Axios instance para uploads con timeout extendido (10 min para archivos grandes)
// Funciona igual en LOCAL y RAILWAY gracias a API_BASE_URL
export const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for large file uploads
});

// Add auth interceptor to upload client
uploadClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for upload client
uploadClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorResponse = {
      success: false,
      error: {
        code: error.response?.data?.error?.code || 'UPLOAD_ERROR',
        message: error.response?.data?.error?.message ||
                 error.response?.data?.error ||
                 error.message ||
                 'Error al subir el archivo',
        details: error.response?.data?.error?.details || [],
        status: error.response?.status || 500
      },
      data: error.response?.data || null,
      status: error.response?.status || 0
    };
    return Promise.reject(errorResponse);
  }
);

export default apiClient;
