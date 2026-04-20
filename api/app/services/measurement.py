from app.db.models.user import User
from app.repositories.measurements import MeasurementRepository
from app.schemas.measurement import BodyMeasurementCreate, BodyMeasurementRead


class MeasurementService:
    def __init__(self, db) -> None:
        self.measurements = MeasurementRepository(db)

    def list_measurements(self, user: User) -> list[BodyMeasurementRead]:
        return [
            BodyMeasurementRead.model_validate(item)
            for item in self.measurements.list_by_user(user.id)
        ]

    def create_measurement(self, user: User, payload: BodyMeasurementCreate) -> BodyMeasurementRead:
        created = self.measurements.create(
            user.id,
            payload.model_dump(exclude_none=True)
        )
        return BodyMeasurementRead.model_validate(created)
