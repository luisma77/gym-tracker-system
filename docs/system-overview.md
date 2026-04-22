# Resumen del sistema

## Visión

Gym Tracker System convierte la lógica del Excel PPL en una aplicación web usable desde móvil, tablet y escritorio, con autenticación real y datos persistentes por usuario.

## Piezas activas del sistema

- `excel-engine/` como fuente de estructura y compatibilidad con la hoja original
- `web-app/` como experiencia principal del producto
- Supabase como backend unificado

## Qué hace cada capa

### `web-app/`

- landing pública permanente
- login, registro y callback de autenticación
- dashboard de entrenamiento
- bloque visual anatómico bajo el nombre del ejercicio dentro del registro de sesión
- registro de series y medidas
- perfil y ajustes
- informes PDF y Excel de rendimiento
- analítica avanzada con métricas de progreso, racha y récords
- páginas legales

### Supabase Auth

- email y contraseña
- verificación de correo
- recuperación y cambio de contraseña

### Supabase Postgres

- `exercise_catalog` para el catálogo global de ejercicios
- `profiles` para datos de cuenta y configuración base
- `workout_sessions` y `session_sets` para el historial de entrenamiento
- `body_measurements` para progreso físico

## Decisiones importantes ya tomadas

- no usar varios backends para la app normal
- mantener la landing aunque el usuario ya esté autenticado
- separar catálogo de ejercicios de historial personal
- mover privacidad, seguridad y textos legales al footer y a páginas propias
- hacer la edición de series responsive y contenida dentro del panel azul
- reservar el hueco bajo el nombre del ejercicio para media propia o licenciada sin rehacer luego el layout

## Capacidades actuales

- crear cuenta con verificación por email
- iniciar sesión con email o nombre de usuario
- registrar sesiones completas con múltiples ejercicios y series
- guardar medidas corporales
- mostrar gráficas de peso, volumen, RIR, frecuencia y e1RM del ejercicio con más progreso
- detectar ejercicio favorito, grupo estrella, grupo rezagado y racha de adherencia
- exportar un Excel base del sistema
- exportar informes de rendimiento en PDF y Excel con narrativa automática
- destacar récords como serie más pesada, mejor e1RM y sesión con más volumen

## Próxima mejora técnica ya prevista

- terminar de aplicar la migración de perfiles para login por usuario y borrado total de cuenta
- incrustar gráficas nativas dentro del archivo Excel generado
- documentar mejor el modelo de métricas y sus reglas de cálculo
