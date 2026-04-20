import re

from email_validator import EmailNotValidError, validate_email
from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.user import UserRead

PASSWORD_RULES = {
    "length": "Debe tener al menos 12 caracteres.",
    "uppercase": "Debe incluir al menos una letra mayuscula.",
    "lowercase": "Debe incluir al menos una letra minuscula.",
    "digit": "Debe incluir al menos un numero.",
    "special": "Debe incluir al menos un simbolo especial."
}


def validate_password_strength(value: str) -> str:
    if len(value) < 12:
        raise ValueError(PASSWORD_RULES["length"])
    if not re.search(r"[A-Z]", value):
        raise ValueError(PASSWORD_RULES["uppercase"])
    if not re.search(r"[a-z]", value):
        raise ValueError(PASSWORD_RULES["lowercase"])
    if not re.search(r"\d", value):
        raise ValueError(PASSWORD_RULES["digit"])
    if not re.search(r"[^A-Za-z0-9]", value):
        raise ValueError(PASSWORD_RULES["special"])
    return value


class RegisterRequest(BaseModel):
    email: str = Field(max_length=255)
    full_name: str = Field(max_length=120)
    password: str = Field(max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, value: str) -> str:
        try:
            return validate_email(value, check_deliverability=False).normalized
        except EmailNotValidError as error:
            raise ValueError("Introduce un email valido.") from error

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        cleaned_value = value.strip()
        if len(cleaned_value) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres.")
        return cleaned_value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return validate_password_strength(value)


class LoginRequest(BaseModel):
    email: str = Field(max_length=255)
    password: str = Field(max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, value: str) -> str:
        try:
            return validate_email(value, check_deliverability=False).normalized
        except EmailNotValidError as error:
            raise ValueError("Introduce un email valido.") from error

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 12:
            raise ValueError("La contrasena debe tener al menos 12 caracteres.")
        return value


class TokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    access_token: str
    token_type: str = "bearer"
    user: UserRead
