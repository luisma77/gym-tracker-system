from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead
from app.services.auth import AuthService, AuthValidationError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserRead:
    service = AuthService(db)
    try:
        user = service.register(payload)
    except AuthValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"message": str(error), "field": error.field}
        ) from error
    return UserRead.model_validate(user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    service = AuthService(db)
    try:
        return service.login(payload)
    except AuthValidationError as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"message": str(error), "field": error.field}
        ) from error
