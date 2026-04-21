# Despliegue gestionado recomendado

## Arquitectura actual

- `web-app/` se despliega en Vercel
- Supabase actúa como backend principal
- `excel-engine/` se mantiene como referencia e importación del catálogo base de ejercicios

## Backend real en producción

La web ya no depende del backend Python para el flujo normal del producto.

La arquitectura desplegada queda así:

- Vercel sirve la aplicación Next.js
- Supabase Auth gestiona registro, login, OAuth, verificación de email y cambio de contraseña
- Supabase Postgres guarda perfiles, sesiones, series, medidas y catálogo de ejercicios

## Root Directory de Vercel

El proyecto de Vercel debe apuntar a:

- `web-app`

Si Vercel construye desde la raíz del repositorio, el despliegue por Git fallará porque la app Next.js vive dentro de `web-app/`.

## Variables de entorno de `web-app`

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Ajustes de Supabase Auth que deben mantenerse

- `Site URL` apuntando al dominio real de Vercel
- `Additional Redirect URLs` incluyendo:
  - `https://tu-dominio/auth/callback`
  - la variante `vercel.app` que uses en producción o preview
- proveedor `Email` activo
- confirmación de correo activa
- `Google` y `Apple` configurados si se quieren ofrecer botones OAuth funcionales

## Plantillas y entregabilidad del email

El email de Supabase Auth se puede personalizar desde el panel de Auth:

- plantilla de confirmación
- asunto
- contenido HTML
- remitente, si se configura SMTP propio

Para reducir la probabilidad de carpeta no deseada conviene:

- usar un dominio propio de envío
- configurar SPF, DKIM y DMARC
- evitar el remitente por defecto de pruebas para producción

## Migraciones manuales ya necesarias

Además de `schema.sql` y `seed.sql`, la app ya espera esta migración incremental:

- `web-app/supabase/migrations/2026-04-21-auth-profile-upgrades.sql`

Esa migración añade:

- `username` en `profiles`
- login por `username` o `email`
- borrado permanente de cuenta con función SQL

## Flujo bonito de auth

La app usa ahora:

- `/auth/callback`

Ese callback evita que el usuario termine en una URL fea o vacía al confirmar el correo o volver desde Google / Apple.
