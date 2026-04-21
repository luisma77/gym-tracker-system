# Problemas resueltos

## Auth y navegación

- el enlace de confirmación de correo ya no debe depender de `localhost`
- la app usa `/auth/callback` para cerrar bien el flujo
- la landing pública sigue existiendo aunque el usuario ya haya iniciado sesión
- el header ya se apoya mejor en la sesión sincronizada con Supabase

## Supabase

- migración a `Supabase Auth + Supabase Postgres` como backend principal
- separación clara entre catálogo de ejercicios y datos personales del usuario
- soporte de login por `username` con fallback si falta la RPC

## UI

- botones de Google y Apple retirados de la UI por complejidad innecesaria actual
- redundancias eliminadas del bloque superior del dashboard
- el editor de series se mantuvo responsive dentro del panel

## Analítica

- añadido cálculo de mayor progreso
- añadido ejercicio favorito con motivo explicativo
- añadidos récords
- añadidos grupo estrella y grupo rezagado
- añadidas más gráficas de evolución

## Exportes

- informe PDF con narrativa automática
- informe Excel con múltiples hojas analíticas

## Relación con otras notas

- estado general: [[01-estado-actual]]
- auth: [[03-supabase-auth]]
- informes: [[04-analitica-e-informes]]
