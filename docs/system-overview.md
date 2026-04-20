# Resumen del sistema

## Base técnica

El sistema actual es un tracker de gimnasio de 12 semanas implementado en Excel con `openpyxl`.

Condiciones duras:

- compatibilidad con Excel 2016
- sin `LET`, `FILTER`, `TAKE`, `XLOOKUP`, `AGGREGATE`
- cuidado especial con fórmulas, named ranges y data validations

## Núcleo funcional

- 5 hojas de entrenamiento: `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES`, `SABADO`
- 61 slots semanales
- 12 semanas
- historial por ejercicio
- sugerencias automáticas
- control de volumen por grupo muscular

## Riesgo principal

El Excel funciona porque toda la estructura está muy acoplada:

- filas
- referencias cruzadas
- named ranges
- data validations
- fórmulas de historial y sugerencias

Por eso la migración a web debe respetar primero la lógica, no solo la interfaz.

## Visión recomendada

### Excel como motor inicial

Mantener el workbook como activo principal mientras se estabiliza el código.

### Backend como capa de dominio

Extraer estas reglas:

- semana actual
- tipo de semana: `HIP`, `FUE`, `DEL`
- cálculo de historial por identidad de ejercicio
- sugerencias
- volumen semanal

### Web como experiencia de usuario

La web debe permitir:

- iniciar sesión
- crear rutina
- registrar entrenamientos
- consultar marcas anteriores
- recibir sugerencias
- ver progreso

## Regla estratégica

La web debe leer y escribir datos del sistema.

El Excel debe quedar como:

- exportador
- respaldo
- formato legacy
- herramienta de verificación
