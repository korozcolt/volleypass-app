import Constants from 'expo-constants';

// Función para obtener variables de entorno de manera segura
const getEnvVar = (name: string, defaultValue?: string): string => {
  // En desarrollo, intentar leer desde process.env
  if (__DEV__ && process.env[name]) {
    return process.env[name] as string;
  }
  
  // En producción o si no está en process.env, usar expo-constants
  const value = Constants.expoConfig?.extra?.[name] || Constants.manifest?.extra?.[name];
  
  if (value) {
    return value;
  }
  
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  throw new Error(`Environment variable ${name} is required but not defined`);
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: getEnvVar('API_BASE_URL', 'https://volleypass-new.test/api'),
} as const;

// Configuración de Pusher
export const PUSHER_CONFIG = {
  APP_KEY: getEnvVar('PUSHER_APP_KEY', 'your_pusher_app_key'),
  CLUSTER: getEnvVar('PUSHER_CLUSTER', 'mt1'),
  FORCE_TLS: getEnvVar('PUSHER_FORCE_TLS', 'true') === 'true',
  AUTH_ENDPOINT: getEnvVar('PUSHER_AUTH_ENDPOINT', 'https://volleypass-new.test/api/broadcasting/auth'),
} as const;

// Configuración general
export const APP_CONFIG = {
  ENVIRONMENT: getEnvVar('ENVIRONMENT', 'development'),
  IS_DEV: __DEV__,
  IS_PRODUCTION: getEnvVar('ENVIRONMENT', 'development') === 'production',
} as const;

// Exportar toda la configuración
export const CONFIG = {
  API: API_CONFIG,
  PUSHER: PUSHER_CONFIG,
  APP: APP_CONFIG,
} as const;

export default CONFIG;