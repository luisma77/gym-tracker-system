from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.exercise import ExerciseRead
from app.services.exercise import ExerciseService

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("", response_model=list[ExerciseRead])
def list_exercises(db: Session = Depends(get_db)) -> list[ExerciseRead]:
    return ExerciseService(db).list_all()
