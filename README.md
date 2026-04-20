# Gym Tracker System

Sistema de seguimiento de entrenamiento orientado a hipertrofia y fuerza, pensado para usuarios que quieren planificar rutinas, registrar sesiones y visualizar progreso de forma estructurada.

Idioma / Language: **Español** · [English](./README.en.md)

## Qué es este proyecto

`Gym Tracker System` es una base pública para desarrollar una herramienta de seguimiento de entrenamiento con foco en:

- planificación por semanas
- registro de series, repeticiones, RIR y carga
- historial por ejercicio y variante
- sugerencias de progresión
- análisis de volumen semanal por grupo muscular

El repositorio está planteado como producto público y reutilizable. No pretende publicar hojas personales ni datos privados del autor.

## Para qué sirve

Sirve como base para construir un tracker de gimnasio más sólido que una hoja improvisada o una nota suelta.

El objetivo es que un usuario pueda:

- seguir una rutina estructurada
- registrar sus entrenamientos
- consultar sus marcas anteriores
- ver si progresa
- controlar volumen y carga semanal

## Estado actual

El proyecto define ya la arquitectura principal:

- `excel-engine`: generación y mantenimiento de workbooks compatibles con Excel 2016
- `api`: backend para la lógica del dominio
- `web-app`: futura interfaz de usuario
- `shared`: esquemas y contratos compartidos

Todavía no es una aplicación terminada. Es una base de desarrollo preparada para evolucionar a producto.

## Estructura actual

```text
gym-tracker-system/
├── README.md
├── README.en.md
├── .gitignore
├── docs/
│   ├── getting-started.md
│   ├── repository-structure.md
│   ├── system-overview.md
│   └── roadmap.md
├── excel-engine/
│   ├── workbook/
│   │   └── sample-workbook.md
│   ├── exports/
│   │   └── .gitkeep
│   ├── scripts/
│   └── src/
├── api/
│   ├── app/
│   └── tests/
├── web-app/
│   └── src/
└── shared/
    └── schemas/
```

## Casos de uso previstos

- Crear rutinas de varias semanas.
- Registrar entrenamientos diarios.
- Seguir progresión por ejercicio.
- Consultar historial y rendimiento.
- Analizar volumen por grupo muscular.
- Generar un workbook compatible cuando sea necesario.

## Arquitectura del producto

### `excel-engine`

Mantiene la compatibilidad con Excel 2016 y la capacidad de generar workbooks estructurados.

### `api`

Será la capa central de dominio:

- usuarios
- ejercicios y variantes
- rutinas
- sesiones
- historial
- sugerencias
- volumen

### `web-app`

Será la experiencia principal para el usuario final:

- acceso de usuarios
- consulta de rutina
- registro de entrenamientos
- panel de progreso

## A quién va dirigido

Este repositorio está pensado para:

- desarrolladores que quieran contribuir
- personas que quieran reutilizar la base
- usuarios avanzados interesados en la evolución del producto

## Documentación

- [Primeros pasos](./docs/getting-started.md)
- [Estructura del repositorio](./docs/repository-structure.md)
- [Resumen del sistema](./docs/system-overview.md)
- [Roadmap](./docs/roadmap.md)
