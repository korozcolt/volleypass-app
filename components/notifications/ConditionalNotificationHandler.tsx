import React from 'react';
import { Platform } from 'react-native';

interface ConditionalNotificationHandlerProps {
  children: React.ReactNode;
}

const ConditionalNotificationHandler: React.FC<ConditionalNotificationHandlerProps> = ({ children }) => {
  // Desactivar notificaciones en Expo Go para Android
  if (__DEV__ && Platform.OS === 'android') {
    console.log('Notifications disabled in Expo Go on Android');
    return <>{children}</>;
  }

  // En otros casos, importar dinámicamente el NotificationHandler
  const NotificationHandler = React.lazy(() => import('./NotificationHandler'));
  
  return (
    <React.Suspense fallback={<>{children}</>}>
      <NotificationHandler>{children}</NotificationHandler>
    </React.Suspense>
  );
};

export default ConditionalNotificationHandler;