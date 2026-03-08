// Central API configuration
// In development, Vite proxy forwards /api to localhost:8000
// In production, calls the Render backend directly
const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? '/api/v1'
  : (import.meta.env.VITE_API_BASE_URL || 'https://kewinchem-backend.onrender.com/api/v1');
