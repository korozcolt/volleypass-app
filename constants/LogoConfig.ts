// Configuración centralizada para los logos de VolleyPass

export const LOGO_PATHS = {
  // Logos principales
  BLACK_BACK: require('../assets/images/logo-volley_pass_black_back.png'),
  WHITE_BACK: require('../assets/images/logo-volley_pass_white_back.png'),
} as const;

export const LOGO_SIZES = {
  SMALL: { width: 100, height: 32 },
  MEDIUM: { width: 200, height: 80 },
  LARGE: { width: 300, height: 120 },
  XLARGE: { width: 400, height: 160 },
} as const;

export const LOGO_CONTEXTS = {
  HEADER: 'header',
  SPLASH: 'splash',
  LOGIN: 'login',
  HOME: 'home',
  FAVICON: 'favicon',
} as const;

// Configuración específica por contexto
export const CONTEXT_CONFIG = {
  [LOGO_CONTEXTS.HEADER]: {
    size: LOGO_SIZES.SMALL,
    variant: 'auto' as const,
    resizeMode: 'contain' as const,
  },
  [LOGO_CONTEXTS.SPLASH]: {
    size: LOGO_SIZES.XLARGE,
    variant: 'dark' as const,
    resizeMode: 'contain' as const,
    animation: 'pulse' as const,
  },
  [LOGO_CONTEXTS.LOGIN]: {
    size: LOGO_SIZES.LARGE,
    variant: 'auto' as const,
    resizeMode: 'contain' as const,
  },
  [LOGO_CONTEXTS.HOME]: {
    size: { width: 250, height: 100 },
    variant: 'auto' as const,
    resizeMode: 'contain' as const,
  },
  [LOGO_CONTEXTS.FAVICON]: {
    size: { width: 32, height: 32 },
    variant: 'auto' as const,
    resizeMode: 'contain' as const,
  },
} as const;

// Función helper para obtener la configuración por contexto
export const getLogoConfig = (context: keyof typeof CONTEXT_CONFIG) => {
  return CONTEXT_CONFIG[context] || CONTEXT_CONFIG.header;
};

// Función helper para obtener el logo según el tema
export const getLogoSource = (isDark: boolean) => {
  return isDark ? LOGO_PATHS.WHITE_BACK : LOGO_PATHS.BLACK_BACK;
};

// Configuración para diferentes plataformas
export const PLATFORM_CONFIG = {
  ios: {
    iconSize: { width: 1024, height: 1024 },
    splashSize: LOGO_SIZES.XLARGE,
  },
  android: {
    iconSize: { width: 512, height: 512 },
    splashSize: LOGO_SIZES.XLARGE,
    adaptiveIconSize: { width: 432, height: 432 },
  },
  web: {
    faviconSize: { width: 32, height: 32 },
    splashSize: LOGO_SIZES.LARGE,
  },
} as const;

export default {
  LOGO_PATHS,
  LOGO_SIZES,
  LOGO_CONTEXTS,
  CONTEXT_CONFIG,
  getLogoConfig,
  getLogoSource,
  PLATFORM_CONFIG,
};