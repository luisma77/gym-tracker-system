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

## ✨ What this project offers

- A practical training tracking system with a clear purpose.
- An Excel-based option for routines, session logging, and history tracking.
- A web app version for a more visual and convenient experience.
- A public explanation of what the product does and why someone would want it.

## 🌐 View it or clone it

### Web option for demos or personal use

[![Open web demo](https://img.shields.io/badge/Open-Web%20Demo-1f6feb?style=for-the-badge&logo=vercel&logoColor=white)](https://web-app-sigma-hazel.vercel.app/)

A more visual way to show the project to friends or use it as a personal demo:

- [Open Gym Tracker Web](https://web-app-sigma-hazel.vercel.app/)

### Code option: clone the repository

```bash
git clone https://github.com/luisma77/gym-tracker-system.git
cd gym-tracker-system
```

## 🧩 What it is meant to do

- Plan multi-week routines.
- Log `kg`, `reps`, and `RIR` per set.
- Review history per exercise and variant.
- Analyze progression and weekly volume.
- Keep training data organized instead of relying on scattered notes.

## 📘 What is included

### Excel

The project includes an Excel-oriented layer meant to be practical for everyday tracking. It helps organize routines, log workouts, and preserve useful training history without adding unnecessary complexity.

### Web app

The web app is the more visual version of the same system. It is meant for people who want something more comfortable than a classic spreadsheet:

- quick progress review
- lower-friction workout logging
- exercise history visibility
- clearer understanding of training evolution

### Who it is for

It makes sense for people who:

- train for strength or hypertrophy consistently
- want something more serious than loose notes
- care about tracking loads, reps, and performance over time
- like having both an Excel option and a web option depending on context

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

## 📚 Main documentation

### Read the docs

- [Getting started](./docs/getting-started.md)
- [System overview](./docs/system-overview.md)
- [Repository structure](./docs/repository-structure.md)
- [Roadmap](./docs/roadmap.md)

## ⚙️ How the product works

### `excel-engine`

This is the workbook-oriented layer:

- generation
- validation
- formula maintenance
- Excel 2016 compatibility

### `api`

This supports the application logic:

- users
- exercises and variants
- routines
- sessions
- history
- suggestions
- volume

### `web-app`

This is the more visual face of the system:

- user access
- routine view
- workout logging
- progress dashboard

## 🗺️ Project status

The technical base already exists and the product direction is clear: offer a structured way to track training through both Excel and a more visual web interface. The repository is meant to show what the system does, how it is organized, and why it can be useful.

## 📌 Why someone would want it

- To stop tracking workouts in scattered notes.
- To log loads, reps, and effort in a consistent way.
- To see whether training progress is actually happening over time.
- To have both a classic Excel option and a more comfortable web option.

## 📄 License

This project is distributed under the [MIT](./LICENSE) license.
