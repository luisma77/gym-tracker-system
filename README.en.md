# Gym Tracker System

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![Excel](https://img.shields.io/badge/Excel-2016%20compatible-217346?logo=microsoft-excel&logoColor=white)
![API](https://img.shields.io/badge/API-FastAPI-009688?logo=fastapi&logoColor=white)
![Web](https://img.shields.io/badge/Web-Next.js-111111?logo=nextdotjs&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

* * *

Language: [Español](./README.md) · **English**

* * *

Training tracking system for hypertrophy and strength, designed for users who want to plan routines, log sessions, review history, and visualize progress in a more structured way than ad hoc spreadsheets.

## ✨ What this project provides

- A public foundation for building a serious and reusable gym tracker.
- Clear separation between Excel engine, backend, frontend, and shared schemas.
- Excel 2016 compatibility as a generation or export layer.
- A structure ready to evolve into a functional web application.
- Bilingual documentation and a more polished public GitHub presentation.

## 🧩 What it is meant to do

- Plan multi-week routines.
- Log `kg`, `reps`, and `RIR` per set.
- Review history per exercise and variant.
- Analyze progression and weekly volume.
- Generate or maintain compatible workbooks when needed.

## 🏗️ Current structure

```text
gym-tracker-system/
├── README.md
├── README.en.md
├── LICENSE
├── .gitignore
├── docs/
├── excel-engine/
├── api/
├── web-app/
└── shared/
```

## 🚀 Quick start

### Clone the repository

```bash
git clone https://github.com/luisma77/gym-tracker-system.git
cd gym-tracker-system
```

### Read the main docs

- [Getting started](./docs/getting-started.md)
- [System overview](./docs/system-overview.md)
- [Repository structure](./docs/repository-structure.md)
- [Roadmap](./docs/roadmap.md)

## ⚙️ Product architecture

### `excel-engine`

Owns the workbook layer:

- generation
- validation
- formula maintenance
- Excel 2016 compatibility

### `api`

Will serve as the main domain layer:

- users
- exercises and variants
- routines
- sessions
- history
- suggestions
- volume

### `web-app`

Will become the main end-user experience:

- user access
- routine view
- workout logging
- progress dashboard

## 🗺️ Project status

The repository already defines a clear technical base, but it is not yet a finished application. At this stage it serves as product structure and a starting point for incremental development.

## 📌 Planned use cases

- Create structured training routines.
- Log daily workouts.
- Track exercise progression.
- Review training history and performance.
- Analyze weekly volume by muscle group.
- Export to workbook when needed.

## 📄 License

This project is distributed under the [MIT](./LICENSE) license.
