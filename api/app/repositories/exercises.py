from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.exercise import Exercise


class ExerciseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Exercise]:
        return list(self.db.scalars(select(Exercise).order_by(Exercise.name)).all())

    def get_many_by_ids(self, exercise_ids: list[int]) -> list[Exercise]:
        statement = select(Exercise).where(Exercise.id.in_(exercise_ids))
        return list(self.db.scalars(statement).all())
