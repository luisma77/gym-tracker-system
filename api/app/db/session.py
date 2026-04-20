from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

connect_args = {}
if settings.database_url.startswith("sqlite"):
    db_path = Path(settings.database_url.replace("sqlite+pysqlite:///", ""))
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connect_args["check_same_thread"] = False

engine = create_engine(settings.database_url, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
