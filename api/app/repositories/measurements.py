from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db.models.body_measurement import BodyMeasurement


class MeasurementRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_user(self, user_id: int) -> list[BodyMeasurement]:
        statement = (
            select(BodyMeasurement)
            .where(BodyMeasurement.user_id == user_id)
            .order_by(desc(BodyMeasurement.measured_at))
        )
        return list(self.db.scalars(statement).all())

    def create(self, user_id: int, payload: dict) -> BodyMeasurement:
        measurement = BodyMeasurement(user_id=user_id, **payload)
        self.db.add(measurement)
        self.db.commit()
        self.db.refresh(measurement)
        return measurement
