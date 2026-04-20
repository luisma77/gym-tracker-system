from fastapi import APIRouter

from app.api.v1.endpoints import auth, dashboard, exercises, health, measurements, sessions

router = APIRouter()
router.include_router(health.router)
router.include_router(auth.router)
router.include_router(dashboard.router)
router.include_router(exercises.router)
router.include_router(measurements.router)
router.include_router(sessions.router)
