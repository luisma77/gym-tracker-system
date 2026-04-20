# Viabilidad de la aplicación web

## Respuesta corta

Sí, se puede hacer y tiene mucho sentido.

## Lo importante

No conviene replicar la experiencia de Excel dentro del navegador celda por celda.

Conviene construir una aplicación real con entidades de negocio:

- usuario
- perfil
- rutina
- bloque semanal
- ejercicio
- variante
- sesión
- serie
- marca histórica

## Qué sí debe hacer la web

- crear cuenta e iniciar sesión
- guardar datos por usuario
- mostrar la rutina del día
- registrar kg, reps y RIR por serie
- recuperar el historial del mismo ejercicio o variante
- generar sugerencias de progresión
- mostrar volumen semanal
- exportar a Excel

## Qué no debe hacer la web al principio

- intentar editar directamente el `.xlsx` online como si fuera Google Sheets
- depender de fórmulas Excel para el cálculo en tiempo real
- mezclar la persistencia principal con el archivo del usuario

## Arquitectura recomendada

### Frontend

- Next.js
- UI móvil primero
- panel diario, historial, dashboard y ajustes

### Backend

- FastAPI
- lógica de progresión y validación
- endpoints para rutina, sesiones, ejercicios y exportación

### Base de datos

- PostgreSQL

Tablas mínimas:

- users
- profiles
- exercises
- exercise_variants
- programs
- program_weeks
- workout_days
- workout_slots
- sessions
- session_sets

## Estrategia de implementación

### Fase 1

Hacer estable el repositorio del Excel y documentar reglas.

### Fase 2

Crear backend con el mismo modelo lógico del workbook.

### Fase 3

Construir frontend para carga de entrenamientos.

### Fase 4

Generar el Excel desde la base de datos y no al revés.

## Conclusión

Sí es viable, funcional y más cómoda para el usuario final que usar el Excel a diario.

La clave es usar el Excel como especificación inicial y no como motor permanente de producto.
