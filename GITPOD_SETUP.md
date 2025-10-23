# Configuración para Gitpod

Este proyecto está configurado para ejecutarse en entornos virtuales como Gitpod.

## Cambios realizados

### Backend (Express)
- **server.js**: Modificado para escuchar en `0.0.0.0` en lugar de `localhost`
- Esto permite que el servidor sea accesible desde fuera del contenedor

### Frontend (React + Vite)
- **vite.config.js**: Configurado para:
  - Escuchar en `0.0.0.0:3000`
  - HMR configurado para puerto 443 (HTTPS de Gitpod)
  - Hosts permitidos: `.gitpod.dev` y `.gitpod.io`
  - Proxy de `/api` hacia `http://localhost:5000` (Backend)
- **Archivos actualizados**: Todas las referencias a `http://localhost:5000` fueron cambiadas a `/api` para usar el proxy
  - `src/services/api.js`
  - `src/components/LoginForm.jsx`
  - `src/components/Proveedor/ProveedorDashboard.jsx`
  - `src/pages/ProductosPage.jsx`

## Cómo ejecutar el proyecto

### Backend
```bash
cd Backend
node server.js
```

### Frontend
```bash
cd frontend
npm run dev
```

## Acceso en Gitpod

### URLs públicas

Para obtener las URLs correctas, ejecuta:
```bash
gitpod environment port list
```

Las URLs tendrán el formato:
- **Frontend**: `https://3000--[workspace-id].gitpod.dev`
- **Backend**: `https://5000--[workspace-id].gitpod.dev`

⚠️ **IMPORTANTE**: NO uses las IPs internas como `http://100.64.x.x:3000` - estas no son accesibles desde tu navegador.

El proxy de Vite se encarga de redirigir las peticiones `/api` al backend automáticamente.

## Variables de entorno

### Backend (.env)
```
DB_HOST=bgdjvookoidrpqeftyvn-mysql.services.clever-cloud.com
DB_USER=urj7ebq8bptzmmjw
DB_PASSWORD=gTRHtUBm916XkYhfza5U
DB_NAME=bgdjvookoidrpqeftyvn
DB_PORT=3306
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=
```
(Vacío para usar el proxy local en desarrollo)

## Notas importantes

- El backend debe estar corriendo antes de iniciar el frontend
- El proxy de Vite solo funciona en modo desarrollo (`npm run dev`)
- Para producción, deberás configurar `VITE_API_URL` con la URL real del backend
