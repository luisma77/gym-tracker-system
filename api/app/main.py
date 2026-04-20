from pathlib import Path

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import router as api_v1_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.models import Profile, User
from app.db.seed import seed_exercises
from app.db.session import engine
from sqlalchemy.orm import Session

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    if settings.database_url.startswith("sqlite"):
        db_path = Path(settings.database_url.replace("sqlite+pysqlite:///", ""))
        db_path.parent.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        seed_exercises(db)
    yield

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    openapi_url=f"{settings.api_v1_prefix}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.frontend_origin)],
    allow_origin_regex=settings.frontend_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"]
)


app.include_router(api_v1_router, prefix=settings.api_v1_prefix)
