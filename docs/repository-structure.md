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

Backend del sistema.

Responsabilidades previstas:

- autenticación
- ejercicios y variantes
- programas y bloques
- sesiones y series
- historial
- sugerencias
- volumen
- exportación

### `web-app/`

Frontend del producto.

Responsabilidades previstas:

- acceso de usuarios
- rutina del día
- registro de entrenamiento
- panel de progreso

### `shared/`

Esquemas y contratos reutilizables entre módulos.

## Principio de diseño

Cada carpeta debe representar una responsabilidad clara del sistema. La estructura evita mezclar documentación, motor Excel y futura aplicación web en una sola capa.
