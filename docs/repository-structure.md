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
- páginas legales
- conexión directa con Supabase Auth y Supabase Postgres

### `shared/`

Esquemas y contratos reutilizables entre módulos.

## Principio de diseño

Cada carpeta debe representar una responsabilidad clara del sistema. La estructura evita mezclar documentación, motor Excel y futura aplicación web en una sola capa.
