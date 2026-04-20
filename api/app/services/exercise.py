from sqlalchemy.orm import Session

from app.repositories.exercises import ExerciseRepository
from app.schemas.exercise import ExerciseRead


class ExerciseService:
    def __init__(self, db: Session) -> None:
        self.repository = ExerciseRepository(db)

    def list_all(self) -> list[ExerciseRead]:
        return [ExerciseRead.model_validate(item) for item in self.repository.list_all()]
