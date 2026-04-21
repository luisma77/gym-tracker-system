# Estructura del repositorio

## Objetivo

Separar de forma limpia las piezas del producto para que el proyecto sea mantenible, público y fácil de entender.

## Módulos

### `docs/`

Documentación de producto, arquitectura y roadmap.

### `excel-engine/`

Motor de generación y mantenimiento de workbooks compatibles con Excel 2016.

- `src/gym_tracker/constants.py`: constantes del dominio
- `src/gym_tracker/workbook_layout.py`: helpers de layout
- `src/gym_tracker/formulas.py`: fórmulas compatibles con Excel 2016
- `scripts/build_workbook.py`: entrada para generar workbooks
- `scripts/validate_workbook.py`: validación funcional
- `scripts/rebuild_validations.py`: reconstrucción de validaciones

### `api/`

Backend Python heredado del sistema.

Estado actual:

- no es la ruta principal del producto web actual
- puede reutilizarse en el futuro para tareas auxiliares, exportaciones o procesos específicos

### `web-app/`

Frontend del producto.

Responsabilidades actuales:

- acceso de usuarios
- callback de autenticación
- rutina del día
- registro de entrenamiento
- panel de progreso
- perfil y ajustes
- exporte del Excel base
- exporte de informes PDF y Excel del usuario
- métricas de favorito, récords, adherencia y evolución
- páginas legales
- conexión directa con Supabase Auth y Supabase Postgres

### `shared/`

Esquemas y contratos reutilizables entre módulos.

## Principio de diseño

Cada carpeta debe representar una responsabilidad clara del sistema. La estructura evita mezclar documentación, motor Excel y futura aplicación web en una sola capa.

## Notas actuales de documentación

- `docs/system-overview.md` resume arquitectura y capacidades activas
- `docs/managed-deployment.md` recoge requisitos de Supabase y Vercel para producción
- la lógica analítica viva del dashboard y de los informes se concentra en:
  - `web-app/src/lib/performance-report.ts`
  - `web-app/src/lib/report-export.ts`
