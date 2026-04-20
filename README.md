# Gym Tracker System

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Excel](https://img.shields.io/badge/Excel-2016%20compatible-217346?logo=microsoft-excel&logoColor=white)
![API](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)
![Web](https://img.shields.io/badge/Web-Next.js-111111?logo=nextdotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

* * *

Idioma / Language: **Español** · [English](./README.en.md)

* * *

Sistema de seguimiento de entrenamiento orientado a hipertrofia y fuerza para usuarios que quieren planificar rutinas, registrar sesiones, consultar historial y visualizar progresión de forma más estructurada que con una hoja improvisada.

## ✨ Qué aporta este proyecto

- Una base pública para construir un tracker de gimnasio serio y reutilizable.
- Separación clara entre motor Excel, backend, frontend y esquemas compartidos.
- Compatibilidad con Excel 2016 como capa de generación o exportación.
- Estructura preparada para evolucionar a una aplicación web funcional.
- Documentación bilingüe y organización pensada para GitHub público.

## 🧩 Qué permite hacer

- Planificar rutinas de varias semanas.
- Registrar `kg`, `reps` y `RIR` por serie.
- Consultar historial por ejercicio y variante.
- Analizar progresión y volumen semanal.
- Generar o mantener workbooks compatibles cuando sea necesario.

## 🏗️ Estructura actual

```text
gym-tracker-system/
├── README.md
├── README.en.md
├── LICENSE
├── .gitignore
├── docs/
│   ├── getting-started.md
│   ├── repository-structure.md
│   ├── system-overview.md
│   └── roadmap.md
├── excel-engine/
│   ├── workbook/
│   │   ├── Gym_Tracker.xlsx
│   │   └── sample-workbook.md
│   ├── exports/
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

## 🚀 Inicio rápido

### Explorar la base del proyecto

```powershell
git clone https://github.com/luisma77/gym-tracker-system.git
cd gym-tracker-system
```

### Revisar la documentación principal

- [Primeros pasos](./docs/getting-started.md)
- [Resumen del sistema](./docs/system-overview.md)
- [Estructura del repositorio](./docs/repository-structure.md)
- [Roadmap](./docs/roadmap.md)

## ⚙️ Arquitectura del producto

### `excel-engine`

Gestiona la capa de workbook:

- generación
- validación
- mantenimiento de fórmulas
- compatibilidad con Excel 2016

### `api`

Backend FastAPI con autenticación JWT y estructura lista para producción:

- registro y login de usuarios (JWT + Argon2)
- catálogo de ejercicios y variantes
- sesiones de entrenamiento
- historial por ejercicio
- sugerencias de carga
- volumen semanal por grupo muscular
- dashboard de usuario

### `web-app`

Frontend Next.js 15 con React 19 y TypeScript:

- autenticación de usuarios (login / registro)
- dashboard de progresión
- registro de entrenamientos
- visualización de historial

## 🗺️ Estado del proyecto

La base técnica está implementada: API REST con autenticación funcional, frontend Next.js conectado y workbook Excel en uso diario con motor de sugerencias. El sistema está en fase de testeo y pulido antes del despliegue definitivo.

## 📌 Casos de uso previstos

- Crear una rutina estructurada.
- Registrar entrenamientos diarios.
- Seguir la progresión de un ejercicio.
- Revisar historial y rendimiento.
- Analizar volumen semanal por grupo muscular.
- Exportar a workbook cuando haga falta.

## 📄 Licencia

Este proyecto se distribuye bajo licencia [MIT](./LICENSE).
