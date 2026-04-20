# Despliegue gestionado recomendado

## Arquitectura

- `web-app/` se despliega en Vercel
- `api/` se despliega en Render
- la base de datos puede vivir en MySQL o MariaDB
- `excel-engine/` se usa desde la API para generar exportaciones

## Puede Vercel llevar la base de datos

Sí, pero como integración y no como "servidor de bases de datos" propio.

Según la documentación oficial de Vercel:

- Vercel ofrece integraciones de bases de datos y storage a través de Marketplace
- Vercel permite conectar Postgres externos desde el panel del proyecto

Para este proyecto, la separación recomendada sigue siendo:

- Vercel: frontend y experiencia web
- Render: API Python y lógica de negocio
- MySQL o MariaDB: base de datos externa o servicio privado

## Dominios sugeridos

- `app.tudominio.com` -> Vercel
- `api.tudominio.com` -> Render

## Nota sobre MySQL

Si prefieres MySQL, el proyecto queda preparado para `MySQL/MariaDB` con SQLAlchemy y `pymysql`.

Para producción tienes dos rutas razonables:

1. Usar un proveedor MySQL-compatible externo
2. Levantar una instancia privada de MySQL/MariaDB y conectar solo la API

## Variables de entorno

### `web-app`

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_API_URL`

### `api`

- `APP_NAME`
- `APP_ENV`
- `API_V1_PREFIX`
- `FRONTEND_ORIGIN`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

## Siguiente fase

1. Sustituir el arranque automatico de tablas por migraciones reales
2. Añadir modelos `users`, `profiles`, `programs`, `sessions` y `session_sets`
3. Implementar cookies seguras y refresh tokens
4. Conectar `excel-engine` para exportaciones por usuario
