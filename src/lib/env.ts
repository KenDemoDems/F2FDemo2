// Environment Variable Utility
// Provides safe access to environment variables across different JavaScript environments

/**
 * Safely access environment variables with proper error handling
 * @param key - Environment variable key
 * @param fallback - Optional fallback value
 * @returns Environment variable value or fallback
 */
export const getEnvVar = (key: string, fallback?: string): string | undefined => {
  try {
    // Check if we're in a Vite environment with import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }

    // Check if we're in a Node.js environment with process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }

    // Check if we're in a browser environment with window.__ENV__
    if (typeof window !== 'undefined' && (window as any).__ENV__ && (window as any).__ENV__[key]) {
      return (window as any).__ENV__[key];
    }

    // Return fallback without warning if it's a demo value (expected behavior)
    if (fallback && (fallback.includes('demo') || fallback.includes('development'))) {
      return fallback;
    }

    // Only warn for unexpected missing variables
    if (!fallback) {
      console.warn(`Environment variable ${key} not found and no fallback provided`);
    }

    return fallback;
  } catch (error) {
    return fallback;
  }
};

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => {
  const nodeEnv = getEnvVar('NODE_ENV') || getEnvVar('VITE_NODE_ENV');
  return nodeEnv === 'development' || nodeEnv === 'dev';
};

/**
 * Check if we're running in production mode
 */
export const isProduction = (): boolean => {
  const nodeEnv = getEnvVar('NODE_ENV') || getEnvVar('VITE_NODE_ENV');
  return nodeEnv === 'production' || nodeEnv === 'prod';
};

/**
 * Get environment mode (development, production, test)
 */
export const getEnvironmentMode = (): string => {
  return getEnvVar('NODE_ENV') || getEnvVar('VITE_NODE_ENV') || 'development';
};

/**
 * Check if environment variables are available
 */
export const isEnvAvailable = (): boolean => {
  try {
    // Check for any environment variable access method
    const hasImportMeta = typeof import.meta !== 'undefined' && !!import.meta.env;
    const hasProcessEnv = typeof process !== 'undefined' && !!process.env;
    const hasWindowEnv = typeof window !== 'undefined' && !!(window as any).__ENV__;

    return hasImportMeta || hasProcessEnv || hasWindowEnv;
  } catch (error) {
    return true; // Assume available to avoid unnecessary warnings
  }
};

/**
 * Get all Firebase environment variables
 */
export const getFirebaseConfig = () => {
  return {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'demo-api-key'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'demo-project.firebaseapp.com'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'demo-project'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'demo-project.appspot.com'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '123456789'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:123456789:web:abcdef')
  };
};

/**
 * Debug environment variables
 */
export const debugEnvironment = () => {
  console.log("🔍 Environment Debug Info:", {
    envAvailable: isEnvAvailable(),
    mode: getEnvironmentMode(),
    isDev: isDevelopment(),
    isProd: isProduction(),
    importMetaAvailable: typeof import.meta !== 'undefined',
    processEnvAvailable: typeof process !== 'undefined' && !!process.env,
    windowEnvAvailable: typeof window !== 'undefined' && !!(window as any).__ENV__
  });
};

export default {
  getEnvVar,
  isDevelopment,
  isProduction,
  getEnvironmentMode,
  isEnvAvailable,
  getFirebaseConfig,
  debugEnvironment
};
