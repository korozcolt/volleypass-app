# Testing Documentation - VolleyPass App

## Configuración de Tests

Este proyecto utiliza **Jest** como framework de testing con **TypeScript** para probar los servicios de la aplicación.

### Estructura de Tests

```
__tests__/
├── setup.ts                    # Configuración global de Jest
├── basic.test.ts               # Tests básicos de verificación
├── test-data.ts                # Usuarios de prueba y datos mock
└── services/
    ├── api.test.ts             # Tests para el servicio de API
    ├── auth.test.ts            # Tests para el servicio de autenticación
    ├── notifications.test.ts   # Tests para el servicio de notificaciones
    └── websocket.test.ts       # Tests para el servicio de WebSocket
```

## Datos de Prueba

La suite de tests incluye usuarios de prueba predefinidos en `__tests__/test-data.ts`:

### Usuario Admin (para testing)
- **Email**: `ing.korozco+admin@gmail.com`
- **Password**: `Admin123`
- **Rol**: Admin
- **Uso**: Usuario principal para pruebas de autenticación y funcionalidad de administrador

### Usuarios de Prueba Adicionales
- **Jugador**: `test.player@example.com` / `Player123`
- **Entrenador**: `test.coach@example.com` / `Coach123`
- **Árbitro**: `test.referee@example.com` / `Referee123`

## Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar un test específico
npm test basic.test.ts
```

## Tests Implementados

### 1. API Service Tests (`api.test.ts`)

Prueba el servicio principal de API que maneja todas las comunicaciones con el backend.

**Funcionalidades probadas:**
- ✅ Gestión de tokens (cargar, guardar, remover)
- ✅ Autenticación (login, logout)
- ✅ Gestión de perfiles de usuario
- ✅ Operaciones de partidos (obtener, en vivo, jugadores)
- ✅ Gestión de torneos y equipos
- ✅ Manejo de errores y respuestas HTTP
- ✅ Requests paginados
- ✅ Verificación de tokens

**Ejemplo de uso:**
```typescript
it('should login successfully', async () => {
  const mockResponse = {
    token: 'test-token',
    user: { id: 1, name: 'Test User' }
  };
  
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockResponse)
  });
  
  const result = await api.login('test@example.com', 'password');
  expect(result).toEqual(mockResponse);
});
```

### 2. Authentication Service Tests (`auth.test.ts`)

Prueba el servicio de autenticación que maneja el estado del usuario y la sesión.

**Funcionalidades probadas:**
- ✅ Patrón Singleton
- ✅ Gestión de listeners
- ✅ Inicialización con/sin tokens almacenados
- ✅ Login y logout exitosos/fallidos
- ✅ Actualización de perfiles de usuario
- ✅ Verificación de roles y permisos
- ✅ Métodos utilitarios (club, posición, número de camiseta)

**Ejemplo de uso:**
```typescript
it('should login successfully', async () => {
  const mockResponse = {
    token: 'test-token',
    user: mockUser
  };
  
  mockApi.login.mockResolvedValue(mockResponse);
  
  await authService.login('test@example.com', 'password');
  
  expect(authService.isLoggedIn()).toBe(true);
  expect(authService.getCurrentUser()).toEqual(mockUser);
});
```

### 3. Notification Service Tests (`notifications.test.ts`)

Prueba el servicio de notificaciones que maneja notificaciones push y locales.

**Funcionalidades probadas:**
- ✅ Inicialización en dispositivos físicos/simuladores
- ✅ Gestión de permisos
- ✅ Programación de notificaciones locales
- ✅ Cancelación de notificaciones
- ✅ Gestión de notificaciones locales (leer, eliminar)
- ✅ Configuración de notificaciones
- ✅ Notificaciones especializadas (pagos, partidos)
- ✅ Manejo de errores

**Ejemplo de uso:**
```typescript
it('should schedule local notification', async () => {
  mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
  
  const notificationId = await notificationService.scheduleLocalNotification(
    'Test Title',
    'Test Body',
    { type: 'match_reminder' }
  );
  
  expect(notificationId).toBe('notification-id');
});
```

### 4. WebSocket Service Tests (`websocket.test.ts`)

Prueba el servicio de WebSocket que maneja comunicación en tiempo real.

**Funcionalidades probadas:**
- ✅ Inicialización de conexión WebSocket
- ✅ Suscripción a canales de partidos
- ✅ Suscripción a canales de usuario privados
- ✅ Suscripción a canales de torneos
- ✅ Gestión de eventos en tiempo real
- ✅ Manejo de conexión/desconexión
- ✅ Reconexión automática
- ✅ Manejo de errores de conexión

**Ejemplo de uso:**
```typescript
it('should subscribe to match channel with handlers', () => {
  const handlers = {
    onMatchScoreUpdated: jest.fn(),
    onMatchStatusChanged: jest.fn()
  };
  
  const unsubscribe = webSocketService.subscribeToMatch(123, handlers);
  
  expect(mockEchoInstance.channel).toHaveBeenCalledWith('match.123');
  expect(typeof unsubscribe).toBe('function');
});
```

## Configuración de Mocks

### AsyncStorage Mock
```typescript
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn()
  }
}));
```

### Fetch Mock
```typescript
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
```

### React Native Mocks
```typescript
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn((obj: any) => obj.ios)
  },
  Alert: {
    alert: jest.fn()
  }
}));
```

## Cobertura de Tests

Los tests cubren:
- **Casos exitosos**: Flujos normales de la aplicación
- **Manejo de errores**: Respuestas de error del servidor, fallos de red
- **Estados edge**: Usuarios no autenticados, permisos denegados
- **Mocks completos**: Todas las dependencias externas están mockeadas

## Mejores Prácticas

1. **Aislamiento**: Cada test es independiente y no afecta a otros
2. **Mocks**: Todas las dependencias externas están mockeadas
3. **Cleanup**: Los mocks se limpian después de cada test
4. **Descriptivos**: Los nombres de tests describen claramente qué se está probando
5. **Cobertura**: Se prueban tanto casos exitosos como de error

## Ejecutar Tests Específicos

```bash
# Solo tests de API
npm test api.test.ts

# Solo tests de autenticación
npm test auth.test.ts

# Solo tests de notificaciones
npm test notifications.test.ts

# Solo tests de WebSocket
npm test websocket.test.ts
```

## Próximos Pasos

- [ ] Tests de integración entre servicios
- [ ] Tests de componentes React Native
- [ ] Tests end-to-end con Detox
- [ ] Tests de performance
- [ ] Configuración de CI/CD con tests automáticos

## Troubleshooting

### Error: "Cannot find module"
- Verificar que todas las dependencias estén instaladas
- Revisar la configuración de `moduleNameMapping` en `jest.config.js`

### Error: "AsyncStorage is not defined"
- Verificar que el mock de AsyncStorage esté configurado correctamente
- Revisar el archivo `__tests__/setup.ts`

### Tests lentos
- Usar `jest.useFakeTimers()` para acelerar tests con timeouts
- Verificar que no haya requests reales a APIs externas