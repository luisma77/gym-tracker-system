from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SessionSetCreate(BaseModel):
    exercise_id: int
    reps: int = Field(ge=1, le=50)
    rir: int = Field(ge=0, le=5)
    weight_kg: float = Field(ge=0, le=500)


class WorkoutSessionCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    training_day: str = Field(min_length=3, max_length=32)
    week_number: int = Field(ge=1, le=12)
    notes: str | None = Field(default=None, max_length=500)
    sets: list[SessionSetCreate] = Field(min_length=1, max_length=20)


class SessionSetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: int
    reps: int
    rir: int
    weight_kg: float
    exercise_name: str


class WorkoutSessionRead(BaseModel):
    id: int
    title: str
    training_day: str
    week_number: int
    notes: str | None
    created_at: datetime
    sets: list[SessionSetRead]
