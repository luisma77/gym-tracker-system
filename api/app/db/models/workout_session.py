from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    training_day: Mapped[str] = mapped_column(String(32), nullable=False)
    week_number: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    sets = relationship(
        "SessionSet",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="SessionSet.position"
    )
