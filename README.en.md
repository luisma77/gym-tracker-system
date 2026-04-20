# Gym Tracker System

Base repository for a training tracking system built around two connected layers:

- `excel-engine`: keeps the `.xlsx` workbook as the operational Excel 2016-compatible version.
- `web-app` + `api`: the natural evolution into a functional web application with user accounts, routines, and performance tracking.

This repository structure is based on `GYM_TRACKER_SYSTEM_PROMPT`, included in [docs/GYM_TRACKER_SYSTEM_PROMPT.md](./docs/GYM_TRACKER_SYSTEM_PROMPT.md), preserving the main constraints:

- Excel 2016 compatibility is a hard requirement.
- Python + `openpyxl` is the generation and editing engine.
- Fixed 12-week layout, 5 training days, and 61 weekly exercise slots.
- Stability comes first: it must work reliably before anything else.

## Language

- Spanish: `README.md`
- English: `README.en.md`

## What this structure gives you

- Clear separation between workbook logic, shared schemas, API, and frontend.
- A safe path from Excel-first to web-first without losing the current working system.
- A clean GitHub-ready layout similar to your existing public repository style.
- A practical foundation for a real product instead of a one-off spreadsheet.

## Structure

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

## Can this become a real web app?

Yes.

The right approach is not to “embed Excel into a website”, but to move the business rules behind the spreadsheet into an application backend:

- user authentication
- profile management
- exercise and variant selection
- workout logging
- progression logic
- exercise history
- recommendation engine
- weekly volume analysis
- dashboards

In that model, Excel becomes an export and compatibility layer, not the core runtime.

## Recommended MVP

1. Sign up and sign in.
2. User profile with bodyweight and training settings.
3. Exercise catalog and variants.
4. 12-week program builder aligned with the workbook structure.
5. Session logging with kg, reps, and RIR.
6. History and auto-suggestions.
7. Weekly volume dashboard.
8. Excel export.

## Suggested stack

- Backend: FastAPI
- Database: PostgreSQL
- Frontend: Next.js
- Auth: Clerk or Auth.js
- ORM: Prisma or SQLAlchemy
- Deployment: Vercel for frontend and Railway/Render/Fly.io for API
