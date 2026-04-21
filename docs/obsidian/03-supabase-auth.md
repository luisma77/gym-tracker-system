# Supabase y Auth

## Configuración actual

- `Supabase Auth` lleva registro, login, verificación y cambio de contraseña
- `Supabase Postgres` guarda perfiles, sesiones, series y medidas

## Variables públicas usadas por la web

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_NAME`

## URLs importantes

- `Project ref`: `amwqthtmzvcwurmdkfcv`
- `Project URL`: `https://amwqthtmzvcwurmdkfcv.supabase.co`
- callback OAuth/Auth de Supabase:
  - `https://amwqthtmzvcwurmdkfcv.supabase.co/auth/v1/callback`

## Requisitos de producción

- `Site URL` apuntando al dominio real de Vercel
- redirect URL con `/auth/callback`
- confirmación de email activa

## Migración importante

Archivo:

- `web-app/supabase/migrations/2026-04-21-auth-profile-upgrades.sql`

Objetivo:

- `username` en `profiles`
- login por `email o username`
- borrado completo de cuenta

## Relación con otras notas

- estado general: [[01-estado-actual]]
- problemas resueltos: [[02-problemas-resueltos]]
- pendientes: [[05-pendientes]]
