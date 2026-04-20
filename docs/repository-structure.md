# Estructura del repositorio

## Objetivo

Separar claramente:

- la lógica del Excel
- la documentación del sistema
- la futura API
- la futura aplicación web
- los contratos compartidos

## Módulos

### `excel-engine/`

Contiene el motor del libro Excel.

- `src/gym_tracker/constants.py`: parámetros rígidos del sistema.
- `src/gym_tracker/workbook_layout.py`: estructura de hojas, semanas, slots y filas.
- `src/gym_tracker/formulas.py`: plantillas de fórmulas compatibles con Excel 2016.
- `scripts/build_workbook.py`: generación o reconstrucción del workbook.
- `scripts/validate_workbook.py`: validaciones previas a entrega.
- `scripts/rebuild_validations.py`: reconstrucción de data validations, sobre todo en columna B.

### `api/`

Contiene el backend que más adelante replicará la lógica del Excel en un modelo web.

Responsabilidades previstas:

- autenticación
- catálogo de ejercicios
- gestión de rutina
- registro de sesiones
- progresión y sugerencias
- dashboard y volumen
- exportación a Excel

### `web-app/`

Interfaz de usuario.

Responsabilidades previstas:

- login y alta de usuarios
- selección de ejercicios y variantes
- entrada de pesos, reps y RIR
- consulta de historial
- visualización de progreso y volumen

### `shared/`

Contratos y esquemas reutilizables entre frontend, backend y motor Excel.

## Principio de diseño

El Excel no debe desaparecer al principio.

La estructura está pensada para:

1. mantener el `.xlsx` estable
2. sacar la lógica a módulos reutilizables
3. construir una web encima
4. convertir el Excel en exportación o compatibilidad
