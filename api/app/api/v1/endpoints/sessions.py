from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.dependencies import get_db
from app.db.models.user import User
from app.schemas.session import WorkoutSessionCreate, WorkoutSessionRead
from app.services.session import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.get("", response_model=list[WorkoutSessionRead])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> list[WorkoutSessionRead]:
    return SessionService(db).list_sessions(current_user)


@router.post("", response_model=WorkoutSessionRead, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: WorkoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> WorkoutSessionRead:
    try:
        return SessionService(db).create_session(current_user, payload)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
