const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para resolver problemas con pusher-js
config.resolver.alias = {
  ...config.resolver.alias,
  'pusher-js': 'pusher-js/dist/web/pusher.min.js',
};

// Configuración para manejar extensiones de archivos
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
];

// Configuración para plataformas
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;