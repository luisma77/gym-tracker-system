# Gym Tracker System

Training tracking system for hypertrophy and strength, designed for users who want to plan routines, log sessions, and review progress in a structured way.

Language: [Español](./README.md) · **English**

## What this project is

`Gym Tracker System` is a public foundation for building a training tracker focused on:

- multi-week planning
- set logging with weight, reps, and RIR
- exercise and variant history
- progression suggestions
- weekly volume analysis by muscle group

This repository is intended as a public, reusable product base. It is not meant to publish the author's personal spreadsheets or private data.

## What it is for

It provides a cleaner foundation than ad hoc spreadsheets or scattered notes.

The goal is for a user to be able to:

- follow a structured routine
- log workouts
- review previous performance
- see progression over time
- track weekly workload and volume

## Current status

The project already defines the main architecture:

- `excel-engine`: workbook generation and Excel 2016-compatible maintenance
- `api`: backend for domain logic
- `web-app`: future user interface
- `shared`: shared schemas and contracts

It is not yet a finished application. It is a development-ready base designed to evolve into a product.

## Current structure

```text
gym-tracker-system/
├── README.md
├── README.en.md
├── .gitignore
├── docs/
├── excel-engine/
├── api/
├── web-app/
└── shared/
```

## Planned use cases

- Build multi-week routines.
- Log daily workouts.
- Track progression per exercise.
- Review history and performance.
- Analyze muscle-group volume.
- Generate a compatible workbook when needed.

## Product architecture

### `excel-engine`

Maintains Excel 2016 compatibility and structured workbook generation.

### `api`

Will serve as the central domain layer:

- users
- exercises and variants
- routines
- sessions
- history
- suggestions
- volume

### `web-app`

Will provide the main end-user experience:

- user access
- routine view
- workout logging
- progress dashboard

## Intended audience

This repository is meant for:

- developers who want to contribute
- people who want to reuse the foundation
- advanced users interested in the product roadmap

## Documentation

- [Getting started](./docs/getting-started.md)
- [Repository structure](./docs/repository-structure.md)
- [System overview](./docs/system-overview.md)
- [Roadmap](./docs/roadmap.md)
