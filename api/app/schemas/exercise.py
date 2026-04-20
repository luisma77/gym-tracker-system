from pydantic import BaseModel, ConfigDict


class ExerciseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    muscle_group: str
    equipment: str
