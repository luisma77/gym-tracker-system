from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.dependencies import get_db
from app.db.models.user import User
from app.schemas.measurement import BodyMeasurementCreate, BodyMeasurementRead
from app.services.measurement import MeasurementService

router = APIRouter(prefix="/measurements", tags=["measurements"])


@router.get("", response_model=list[BodyMeasurementRead])
def list_measurements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[BodyMeasurementRead]:
    return MeasurementService(db).list_measurements(current_user)


@router.post("", response_model=BodyMeasurementRead)
def create_measurement(
    payload: BodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> BodyMeasurementRead:
    return MeasurementService(db).create_measurement(current_user, payload)
