from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    body_fat_percent: Mapped[float | None] = mapped_column(Float, nullable=True)
    chest_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    waist_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    hip_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    arm_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    thigh_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)
