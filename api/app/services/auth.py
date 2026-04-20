from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.users import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead


class AuthValidationError(ValueError):
    def __init__(self, message: str, field: str | None = None) -> None:
        super().__init__(message)
        self.field = field


class AuthService:
    def __init__(self, db: Session) -> None:
        self.users = UserRepository(db)

    def register(self, payload: RegisterRequest):
        existing_user = self.users.get_by_email(payload.email)
        if existing_user is not None:
            raise AuthValidationError("Ya existe una cuenta registrada con ese email.", field="email")

        return self.users.create(
            email=payload.email,
            full_name=payload.full_name,
            password_hash=hash_password(payload.password)
        )

    def login(self, payload: LoginRequest) -> TokenResponse:
        user = self.users.get_by_email(payload.email)
        if user is None:
            raise AuthValidationError("No existe ningun usuario con ese email.", field="email")
        if not verify_password(payload.password, user.password_hash):
            raise AuthValidationError("La contrasena no es correcta.", field="password")

        return TokenResponse(
            access_token=create_access_token(subject=str(user.id)),
            user=UserRead.model_validate(user)
        )
