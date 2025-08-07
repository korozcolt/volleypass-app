# Configuración de Variables de Entorno

Este proyecto utiliza variables de entorno para manejar la configuración de la API y Pusher de manera flexible entre diferentes entornos (desarrollo, staging, producción).

## Archivos de Configuración

### `.env`
Contiene las variables de entorno para desarrollo local. Este archivo debe ser creado localmente y **NO** debe ser committeado al repositorio.

### `.env.example`
Plantilla que muestra todas las variables de entorno necesarias. Este archivo sí debe ser committeado.

### `app.json`
Contiene la configuración para Expo, incluyendo las variables de entorno en la sección `extra`.

### `config/env.ts`
Archivo centralizado que lee las variables de entorno y las exporta de manera tipada.

## Variables de Entorno Disponibles

### API Configuration
- `API_BASE_URL`: URL base de la API del backend
  - Desarrollo: `https://volleypass-new.test/api`
  - Producción: `https://api.volleypass.com/api`

### Pusher Configuration
- `PUSHER_APP_KEY`: Clave de la aplicación Pusher
- `PUSHER_CLUSTER`: Cluster de Pusher (ej: `mt1`, `us2`, `eu`)
- `PUSHER_FORCE_TLS`: Forzar conexiones TLS (`true` o `false`)
- `PUSHER_AUTH_ENDPOINT`: Endpoint para autenticación de canales privados

### General
- `ENVIRONMENT`: Entorno actual (`development`, `staging`, `production`)

## Configuración por Entorno

### Desarrollo Local
1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus valores locales:
   ```env
   API_BASE_URL=http://localhost:8000/api
   PUSHER_APP_KEY=tu_clave_pusher_local
   PUSHER_CLUSTER=mt1
   PUSHER_FORCE_TLS=false
   PUSHER_AUTH_ENDPOINT=http://localhost:8000/api/broadcasting/auth
   ENVIRONMENT=development
   ```

### Staging/Producción
Para builds de staging o producción, actualiza la sección `extra` en `app.json`:

```json
{
  "expo": {
    "extra": {
      "API_BASE_URL": "https://api-staging.volleypass.com/api",
      "PUSHER_APP_KEY": "clave_pusher_staging",
      "PUSHER_CLUSTER": "us2",
      "PUSHER_FORCE_TLS": "true",
      "PUSHER_AUTH_ENDPOINT": "https://api-staging.volleypass.com/api/broadcasting/auth",
      "ENVIRONMENT": "staging"
    }
  }
}
```

## Uso en el Código

Las variables de entorno se acceden a través del archivo `config/env.ts`:

```typescript
import { CONFIG } from '../config/env';

// Configuración de API
const apiUrl = CONFIG.API.BASE_URL;

// Configuración de Pusher
const pusherKey = CONFIG.PUSHER.APP_KEY;
const pusherCluster = CONFIG.PUSHER.CLUSTER;
```

## Servicios Actualizados

Los siguientes servicios han sido actualizados para usar la configuración centralizada:

- **`services/api.ts`**: Usa `CONFIG.API.BASE_URL` para la URL base
- **`services/websocket.ts`**: Usa `CONFIG.PUSHER.*` para la configuración de Pusher
- **`providers/AuthProvider.tsx`**: Inicializa WebSocket con configuración automática

## Notas Importantes

1. **Seguridad**: Nunca commites archivos `.env` con credenciales reales
2. **Expo**: Las variables de entorno se leen desde `app.json` en builds de Expo
3. **Desarrollo**: En modo desarrollo, se pueden usar variables de `process.env`
4. **Tipado**: Todas las configuraciones están tipadas en TypeScript
5. **Fallbacks**: El sistema incluye valores por defecto para desarrollo

## Troubleshooting

### Error: "Environment variable X is required but not defined"
- Verifica que la variable esté definida en `.env` o `app.json`
- Asegúrate de que el nombre de la variable sea exacto
- Reinicia el servidor de desarrollo después de cambiar variables

### WebSocket no se conecta
- Verifica `PUSHER_APP_KEY` y `PUSHER_CLUSTER`
- Confirma que `PUSHER_AUTH_ENDPOINT` sea accesible
- Revisa los logs de la consola para errores específicos

### API no responde
- Verifica que `API_BASE_URL` sea correcta
- Confirma que el backend esté ejecutándose
- Revisa la configuración de CORS en el backend