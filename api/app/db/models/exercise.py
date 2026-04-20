from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False, index=True)
    muscle_group: Mapped[str] = mapped_column(String(80), nullable=False)
    equipment: Mapped[str] = mapped_column(String(80), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
