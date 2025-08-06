import React, { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';

const WebFavicon: React.FC = () => {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Cambiar el favicon basado en el tema
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        const logoPath = colorScheme === 'dark' 
          ? '/assets/images/logo-volley_pass_white_back.png'
          : '/assets/images/logo-volley_pass_black_back.png';
        
        favicon.href = logoPath;
      }

      // Actualizar el título de la página
      document.title = 'VolleyPass - Gestión de Torneos de Voleibol';

      // Agregar meta tags para PWA
      const metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
      if (metaThemeColor) {
        metaThemeColor.content = colorScheme === 'dark' ? '#121212' : '#1976d2';
      }

      // Agregar meta description si no existe
      if (!document.querySelector('meta[name="description"]')) {
        const metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = 'VolleyPass - La aplicación completa para gestión de torneos de voleibol. Seguimiento en tiempo real, estadísticas y más.';
        document.head.appendChild(metaDescription);
      }
    }
  }, [colorScheme]);

  return null; // Este componente no renderiza nada visible
};

export default WebFavicon;