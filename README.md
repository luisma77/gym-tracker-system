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

## ✨ Qué ofrece este proyecto

- Un sistema de seguimiento de entrenamiento con enfoque práctico y claro.
- Un archivo Excel compatible para llevar control de rutinas y sesiones.
- Una web app como versión más visual y cómoda para consultar y registrar progreso.
- Una explicación pública del enfoque del producto y de su utilidad real.

## 🌐 Verlo o clonarlo

### Opción web para enseñar o usar

[![Abrir demo web](https://img.shields.io/badge/Abrir-Demo%20Web-1f6feb?style=for-the-badge&logo=vercel&logoColor=white)](https://web-app-sigma-hazel.vercel.app/)

Una forma más visual de enseñar el proyecto a amigos o usarlo como demo personal:

- [Abrir Gym Tracker Web](https://web-app-sigma-hazel.vercel.app/)

### Opción código: clonar el repositorio

```powershell
git clone https://github.com/luisma77/gym-tracker-system.git
cd gym-tracker-system
```

## 🧩 Qué permite hacer

- Planificar rutinas de varias semanas.
- Registrar `kg`, `reps` y `RIR` por serie.
- Consultar historial por ejercicio y variante.
- Analizar progresión y volumen semanal.
- Llevar un control más serio del entrenamiento sin depender de notas sueltas.

## 📘 Qué incluye

### Excel

El proyecto incluye una base de trabajo pensada para usar Excel como herramienta práctica de seguimiento. Sirve para organizar rutinas, registrar entrenamientos y conservar un histórico útil sin complicar el uso.

### Web app

La web app representa la versión más visual del sistema. Está pensada para quien prefiere una experiencia más cómoda que una hoja clásica:

- consultar progreso de forma rápida
- registrar sesiones con menos fricción
- revisar historial por ejercicio
- entender mejor la evolución del entrenamiento

### Para quién tiene sentido

Puede interesar a personas que:

- entrenan fuerza o hipertrofia con cierta constancia
- quieren medir progreso con algo más serio que notas sueltas
- prefieren una base clara para seguir cargas, repeticiones y rendimiento
- valoran tener una opción Excel y otra web según el contexto

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

## 📚 Documentación principal

### Revisar la documentación

- [Primeros pasos](./docs/getting-started.md)
- [Resumen del sistema](./docs/system-overview.md)
- [Estructura del repositorio](./docs/repository-structure.md)
- [Roadmap](./docs/roadmap.md)

## ⚙️ Cómo funciona la idea del producto

### `excel-engine`

Es la capa orientada al workbook:

- generación
- validación
- mantenimiento de fórmulas
- compatibilidad con Excel 2016

### `api`

Da soporte a la lógica de la aplicación:

- registro y login de usuarios (JWT + Argon2)
- catálogo de ejercicios y variantes
- sesiones de entrenamiento
- historial por ejercicio
- sugerencias de carga
- volumen semanal por grupo muscular
- dashboard de usuario

### `web-app`

Es la cara más visual del sistema:

- autenticación de usuarios (login / registro)
- dashboard de progresión
- registro de entrenamientos
- visualización de historial

## 🗺️ Estado del proyecto

La base técnica ya existe y el enfoque del producto está claro: ofrecer una forma estructurada de seguir entrenamientos tanto en Excel como en una interfaz web más visual. El repositorio está pensado para mostrar qué hace el sistema, cómo se organiza y por qué puede resultar útil.

## 📌 Por qué alguien querría usarlo

- Para dejar de llevar el entrenamiento en notas dispersas.
- Para registrar cargas, repeticiones y esfuerzo de una manera consistente.
- Para ver si realmente hay progresión con el paso de las semanas.
- Para disponer de una opción clásica en Excel y otra más cómoda en formato web.

## 📄 Licencia

Este proyecto se distribuye bajo licencia [MIT](./LICENSE).
