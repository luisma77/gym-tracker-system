# Gym Tracker System

Repositorio base para un sistema de seguimiento de entrenamiento con dos capas conectadas:

- `excel-engine`: mantiene el archivo `.xlsx` como versión operativa compatible con Excel 2016.
- `web-app` + `api`: evolución natural a una aplicación web funcional con usuarios, rutinas y registro de marcas.

El diseño de este repositorio está construido a partir de `GYM_TRACKER_SYSTEM_PROMPT`, incluido en [docs/GYM_TRACKER_SYSTEM_PROMPT.md](./docs/GYM_TRACKER_SYSTEM_PROMPT.md), respetando estas reglas clave:

- Excel 2016 como restricción real de compatibilidad.
- Python + `openpyxl` como motor de generación y edición.
- Estructura fija de 12 semanas, 5 días de entrenamiento y 61 slots semanales.
- Prioridad absoluta a estabilidad: primero que funcione siempre.

## Idioma / Language

- Español: `README.md`
- English: `README.en.md`

## Qué aporta esta estructura

- Separa la lógica de negocio del libro Excel para no mezclar scripts, datos y documentación.
- Prepara una migración progresiva a web sin romper el sistema actual.
- Organiza catálogo, fórmulas, validaciones y documentación técnica.
- Deja lista una base de backend y frontend para una app real con autenticación.

## Estructura

```text
gym-tracker-system/
├── README.md
├── README.en.md
├── .gitignore
├── docs/
│   ├── repository-structure.md
│   ├── system-overview.md
│   └── web-app-feasibility.md
├── excel-engine/
│   ├── workbook/
│   │   └── .gitkeep
│   ├── exports/
│   │   └── .gitkeep
│   ├── scripts/
│   │   ├── build_workbook.py
│   │   ├── validate_workbook.py
│   │   └── rebuild_validations.py
│   └── src/
│       └── gym_tracker/
│           ├── __init__.py
│           ├── constants.py
│           ├── workbook_layout.py
│           └── formulas.py
├── api/
│   ├── app/
│   │   ├── __init__.py
│   │   └── main.py
│   └── tests/
│       └── .gitkeep
├── web-app/
│   └── src/
│       └── .gitkeep
└── shared/
    └── schemas/
        └── exercise-catalog.schema.json
```

## Recomendación de arquitectura

### Fase 1: Excel-first

- El `.xlsx` sigue siendo la fuente funcional principal.
- `excel-engine` centraliza generación, edición, validación y reconstrucción de DVs.
- Cada cambio se valida contra el checklist del prompt.

### Fase 2: Web híbrida

- La web no sustituye el Excel al principio.
- La web captura usuarios, ejercicios, rutinas, sesiones y marcas.
- El Excel pasa a ser un formato de exportación, auditoría o compatibilidad.

### Fase 3: Web-first

- La lógica de progresión vive en backend.
- El libro Excel se genera desde datos persistidos en base de datos.
- La experiencia principal del usuario ya no depende del `.xlsx`.

## ¿Se puede hacer una web funcional?

Sí, y además tiene bastante sentido.

La mejor decisión técnica no es “meter el Excel en una web”, sino convertir la lógica del Excel en reglas de negocio del backend:

- autenticación de usuarios
- creación de cuenta
- selección de ejercicios
- registro de series, reps, RIR y carga
- cálculo de progresión
- historial por ejercicio
- sugerencias automáticas
- volumen semanal por grupo muscular
- dashboard

Eso permite una app real, usable y escalable.

## MVP recomendado

1. Registro e inicio de sesión.
2. Perfil del usuario con peso corporal y configuración base.
3. Catálogo de ejercicios y variantes.
4. Rutina de 12 semanas basada en la estructura del Excel.
5. Registro de sesiones con kg, reps y RIR.
6. Historial y sugerencias automáticas.
7. Dashboard con volumen semanal.
8. Exportación a Excel compatible.

## Stack sugerido

- Backend: FastAPI
- Base de datos: PostgreSQL
- Frontend: Next.js
- Auth: Clerk o Auth.js
- ORM: Prisma o SQLAlchemy
- Deploy: Vercel para frontend y Railway/Render/Fly.io para API

## Documentación

- [Resumen del sistema](./docs/system-overview.md)
- [Estructura del repositorio](./docs/repository-structure.md)
- [Viabilidad de la web](./docs/web-app-feasibility.md)
