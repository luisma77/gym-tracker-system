from sqlalchemy import ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SessionSet(Base):
    __tablename__ = "session_sets"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, nullable=False)
    rir: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_kg: Mapped[float] = mapped_column(Numeric(6, 2), nullable=False)

    session = relationship("WorkoutSession", back_populates="sets")
    exercise = relationship("Exercise")
