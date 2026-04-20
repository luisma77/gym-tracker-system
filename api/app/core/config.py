import os
from functools import lru_cache
from pathlib import Path

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]
if os.getenv("VERCEL"):
    DEFAULT_SQLITE_PATH = Path("/tmp/gym_tracker.db")
else:
    DEFAULT_SQLITE_PATH = BASE_DIR / "data" / "gym_tracker.db"


class Settings(BaseSettings):
    app_name: str = "Gym Tracker API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    frontend_origin: AnyHttpUrl = "http://localhost:3000"
    frontend_origin_regex: str = r"https://.*\.vercel\.app"
    database_url: str = f"sqlite+pysqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    @field_validator("api_v1_prefix")
    @classmethod
    def validate_api_prefix(cls, value: str) -> str:
        if not value.startswith("/"):
            raise ValueError("API_V1_PREFIX debe empezar por '/'.")
        return value.rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()
