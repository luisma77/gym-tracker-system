from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class BodyMeasurementCreate(BaseModel):
    measured_at: datetime | None = None
    weight_kg: float | None = Field(default=None, ge=0, le=400)
    body_fat_percent: float | None = Field(default=None, ge=0, le=100)
    chest_cm: float | None = Field(default=None, ge=0, le=300)
    waist_cm: float | None = Field(default=None, ge=0, le=300)
    hip_cm: float | None = Field(default=None, ge=0, le=300)
    arm_cm: float | None = Field(default=None, ge=0, le=150)
    thigh_cm: float | None = Field(default=None, ge=0, le=200)
    notes: str | None = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_has_some_value(self):
        metric_fields = [
            self.weight_kg,
            self.body_fat_percent,
            self.chest_cm,
            self.waist_cm,
            self.hip_cm,
            self.arm_cm,
            self.thigh_cm
        ]
        if all(value is None for value in metric_fields):
            raise ValueError("Debes indicar al menos una medida corporal.")
        return self


class BodyMeasurementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    measured_at: datetime
    weight_kg: float | None
    body_fat_percent: float | None
    chest_cm: float | None
    waist_cm: float | None
    hip_cm: float | None
    arm_cm: float | None
    thigh_cm: float | None
    notes: str | None
