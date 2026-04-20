from sqlalchemy import desc, select
from sqlalchemy.orm import Session, selectinload

from app.db.models.session_set import SessionSet
from app.db.models.workout_session import WorkoutSession


class SessionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_by_user(self, user_id: int) -> list[WorkoutSession]:
        statement = (
            select(WorkoutSession)
            .where(WorkoutSession.user_id == user_id)
            .options(selectinload(WorkoutSession.sets).selectinload(SessionSet.exercise))
            .order_by(desc(WorkoutSession.created_at))
        )
        return list(self.db.scalars(statement).all())

    def create(
        self,
        *,
        user_id: int,
        title: str,
        training_day: str,
        week_number: int,
        notes: str | None,
        sets: list[dict[str, int | float]]
    ) -> WorkoutSession:
        session = WorkoutSession(
            user_id=user_id,
            title=title,
            training_day=training_day,
            week_number=week_number,
            notes=notes
        )
        self.db.add(session)
        self.db.flush()

        for index, item in enumerate(sets, start=1):
            self.db.add(
                SessionSet(
                    session_id=session.id,
                    exercise_id=int(item["exercise_id"]),
                    position=index,
                    reps=int(item["reps"]),
                    rir=int(item["rir"]),
                    weight_kg=float(item["weight_kg"])
                )
            )

        self.db.commit()
        self.db.refresh(session)
        statement = (
            select(WorkoutSession)
            .where(WorkoutSession.id == session.id)
            .options(selectinload(WorkoutSession.sets).selectinload(SessionSet.exercise))
        )
        return self.db.scalar(statement)
