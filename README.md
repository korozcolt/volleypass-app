# VolleyPass App 🏐

**VolleyPass** es una aplicación móvil completa para la gestión de torneos de voleibol, desarrollada con React Native y Expo. La aplicación permite a jugadores, entrenadores, árbitros y administradores de liga gestionar todos los aspectos de los torneos de voleibol de manera eficiente y en tiempo real.

## 🚀 Características Principales

### 📱 Funcionalidades Públicas

- **Visualización de torneos activos** - Lista de todos los torneos disponibles
- **Partidos en vivo** - Seguimiento en tiempo real de partidos en curso
- **Tablas de posiciones** - Clasificaciones actualizadas por torneo y grupo
- **Detalles de partidos** - Información completa de cada encuentro
- **Información de equipos** - Datos de equipos y jugadores

### 🔐 Sistema de Autenticación

- **Login/Registro** - Autenticación segura con Laravel Sanctum
- **Gestión de perfiles** - Perfiles personalizados por tipo de usuario
- **Roles diferenciados** - Jugador, Entrenador, Árbitro, Liga, Administrador
- **Recuperación de sesión** - Persistencia automática de sesiones

### 👤 Funcionalidades por Tipo de Usuario

#### 🏃‍♂️ Jugadores

- **Estadísticas personales** - Rendimiento detallado en partidos
- **Historial de sanciones** - Visualización y apelación de sanciones
- **Gestión de pagos** - Control de cuotas y pagos pendientes
- **Perfil completo** - Información personal, médica y deportiva
- **Notificaciones** - Alertas de partidos, pagos y sanciones

#### 👨‍🏫 Entrenadores/Dirigentes

- **Gestión de equipos** - Administración de plantillas
- **Gestión de jugadores** - Control de información de jugadores
- **Seguimiento de partidos** - Monitoreo de rendimiento del equipo
- **Apelación de sanciones** - Gestión de recursos disciplinarios

#### 🏁 Árbitros

- **Control de partidos** - Herramientas para dirigir encuentros
- **Escáner QR** - Verificación rápida de jugadores
- **Gestión de rotaciones** - Control de posiciones en cancha
- **Aplicación de sanciones** - Sistema disciplinario integrado
- **Partidos asignados** - Lista de encuentros a dirigir

#### 🏛️ Liga/Administradores

- **Gestión de partidos** - Programación y control de encuentros
- **Administración de sanciones** - Revisión y gestión disciplinaria
- **Control de torneos** - Supervisión general de competencias
- **Reportes y estadísticas** - Análisis completo de datos

### 🔄 Funcionalidades en Tiempo Real

- **WebSocket integrado** - Actualizaciones instantáneas de partidos
- **Notificaciones push** - Alertas inmediatas de eventos importantes
- **Sincronización automática** - Datos siempre actualizados
- **Estado de conexión** - Indicadores de conectividad

### 📊 Gestión de Datos

- **API REST completa** - Comunicación eficiente con el backend
- **Caché inteligente** - Optimización de rendimiento
- **Sincronización offline** - Funcionalidad básica sin conexión
- **Paginación** - Carga eficiente de grandes conjuntos de datos

## 🛠️ Tecnologías Utilizadas

### Frontend

- **React Native** - Framework principal
- **Expo** - Plataforma de desarrollo
- **TypeScript** - Tipado estático
- **React Native Paper** - Componentes UI Material Design
- **React Navigation** - Navegación entre pantallas
- **Expo Router** - Enrutamiento basado en archivos

### Servicios y APIs

- **Laravel Echo** - WebSocket para tiempo real
- **Pusher** - Servicio de WebSocket
- **AsyncStorage** - Almacenamiento local
- **Expo Notifications** - Notificaciones push
- **Expo Camera/Barcode Scanner** - Funcionalidades de cámara

### Testing

- **Jest** - Framework de testing
- **TypeScript** - Tests tipados
- **Mocks completos** - Cobertura de servicios externos

## 📁 Estructura del Proyecto

```
volleypass-app/
├── app/                          # Pantallas principales (Expo Router)
│   ├── (tabs)/                   # Navegación por pestañas
│   ├── _layout.tsx              # Layout principal
│   └── +not-found.tsx           # Pantalla 404
├── screens/                      # Pantallas organizadas por rol
│   ├── auth/                    # Autenticación
│   ├── public/                  # Pantallas públicas
│   ├── player/                  # Pantallas de jugador
│   ├── coach/                   # Pantallas de entrenador
│   ├── referee/                 # Pantallas de árbitro
│   ├── league/                  # Pantallas de liga
│   └── user/                    # Pantallas de usuario
├── components/                   # Componentes reutilizables
│   ├── navigation/              # Navegación
│   ├── notifications/           # Notificaciones
│   └── ui/                      # Componentes UI
├── services/                     # Servicios de la aplicación
│   ├── api.ts                   # Cliente API REST
│   ├── auth.ts                  # Servicio de autenticación
│   ├── notifications.ts         # Servicio de notificaciones
│   └── websocket.ts             # Servicio WebSocket
├── providers/                    # Proveedores de contexto
├── types/                       # Definiciones TypeScript
├── hooks/                       # Hooks personalizados
├── constants/                   # Constantes de la aplicación
└── __tests__/                   # Suite de tests
    ├── services/                # Tests de servicios
    ├── setup.ts                 # Configuración de tests
    └── test-data.ts             # Datos de prueba
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo CLI
- Dispositivo móvil o emulador

### Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd volleypass-app
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   # Crear archivo .env con las siguientes variables:
   API_BASE_URL=https://volleypass-new.test/api
   PUSHER_KEY=your-pusher-key
   PUSHER_CLUSTER=your-pusher-cluster
   ```

4. **Iniciar la aplicación**

   ```bash
   # Desarrollo
   npm start
   
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Coverage report
npm run test:coverage

# Test específico
npm test api.test.ts
```

### Datos de Prueba

- **Admin**: `ing.korozco+admin@gmail.com` / `Admin123`
- **Jugador**: `test.player@example.com` / `Player123`
- **Entrenador**: `test.coach@example.com` / `Coach123`
- **Árbitro**: `test.referee@example.com` / `Referee123`

## 📋 Estado de Implementación

### ✅ Completamente Implementado

- [x] Sistema de autenticación completo
- [x] Servicios de API REST
- [x] Navegación por roles
- [x] Gestión de perfiles de usuario
- [x] Sistema de notificaciones push
- [x] WebSocket para tiempo real
- [x] Suite completa de tests
- [x] Tipado TypeScript completo
- [x] Documentación de API

### 🚧 Parcialmente Implementado

- [x] Pantallas base creadas (estructura)
- [ ] Implementación completa de UI
- [ ] Funcionalidades específicas por pantalla
- [ ] Integración completa con backend
- [ ] Validaciones de formularios
- [ ] Manejo de errores en UI

### ⏳ Pendiente de Implementación

- [ ] Funcionalidad de cámara/QR completa
- [ ] Gestión de archivos/imágenes
- [ ] Modo offline completo
- [ ] Optimizaciones de rendimiento
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Configuración de CI/CD
- [ ] Distribución en stores

## 🔧 Servicios Principales

### API Service (`services/api.ts`)

- Cliente REST completo para comunicación con backend
- Gestión automática de tokens
- Manejo de errores y respuestas
- Soporte para paginación
- Métodos para todas las entidades (usuarios, partidos, torneos, etc.)

### Auth Service (`services/auth.ts`)

- Gestión completa de autenticación
- Verificación de roles y permisos
- Persistencia de sesión
- Patrón Singleton
- Sistema de listeners para cambios de estado

### Notification Service (`services/notifications.ts`)

- Notificaciones push con Expo
- Notificaciones locales programadas
- Gestión de permisos
- Configuración por tipo de notificación
- Historial de notificaciones

### WebSocket Service (`services/websocket.ts`)

- Conexión en tiempo real con Laravel Echo
- Suscripción a canales específicos
- Reconexión automática
- Manejo de eventos de partidos
- Notificaciones de usuario privadas

## 📱 Navegación y Pantallas

### Navegación Adaptativa

La aplicación utiliza navegación diferenciada según el tipo de usuario:

- **Público**: Home, Torneos, En Vivo, Posiciones
- **Jugador**: + Estadísticas, Perfil
- **Árbitro**: + Mis Partidos, Escáner QR
- **Entrenador**: + Gestión de Equipo
- **Liga**: + Gestión de Partidos, Sanciones

### Pantallas Implementadas

- **Autenticación**: Login, Registro
- **Públicas**: Home, Torneos, Partidos en Vivo, Posiciones, Detalles
- **Usuario**: Perfil, Editar Perfil, Notificaciones
- **Jugador**: Estadísticas, Sanciones, Pagos
- **Árbitro**: Partidos Asignados, Control de Partido, Escáner QR
- **Entrenador**: Gestión de Equipo, Gestión de Jugadores
- **Liga**: Gestión de Partidos, Gestión de Sanciones

## 🎨 Diseño y UI

### Tema Personalizado

- Material Design 3 con React Native Paper
- Soporte para modo claro/oscuro
- Colores personalizados para voleibol
- Iconografía consistente con Material Community Icons

### Componentes Reutilizables

- Componentes temáticos (ThemedText, ThemedView)
- Navegación con feedback háptico
- Componentes de UI especializados
- Scroll views con parallax

## 🔒 Seguridad

### Autenticación

- Tokens JWT con Laravel Sanctum
- Almacenamiento seguro con AsyncStorage
- Verificación automática de tokens
- Logout automático en caso de token inválido

### Permisos

- Sistema de roles granular
- Verificación de permisos por pantalla
- Navegación condicional según rol
- Acceso controlado a funcionalidades

## 📚 Documentación

- **API_DOCUMENTATION.md** - Documentación completa de la API
- **TESTING.md** - Guía de testing y datos de prueba
- **README.md** - Este archivo con información general

## 🤝 Contribución

### Flujo de Desarrollo

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- TypeScript estricto
- ESLint configurado
- Prettier para formateo
- Tests obligatorios para nuevas funcionalidades
- Documentación actualizada

## 📞 Soporte

Para soporte técnico o preguntas sobre la aplicación:

- Crear issue en el repositorio
- Revisar documentación existente
- Consultar logs de la aplicación

## 📄 Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados.

---

**VolleyPass** - La aplicación completa para gestión de torneos de voleibol 🏐
