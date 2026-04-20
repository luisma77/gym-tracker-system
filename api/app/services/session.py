from sqlalchemy.orm import Session

from app.db.models.user import User
from app.repositories.exercises import ExerciseRepository
from app.repositories.sessions import SessionRepository
from app.schemas.dashboard import DashboardSummary
from app.schemas.session import SessionSetRead, WorkoutSessionCreate, WorkoutSessionRead


class SessionService:
    def __init__(self, db: Session) -> None:
        self.sessions = SessionRepository(db)
        self.exercises = ExerciseRepository(db)

    def create_session(self, user: User, payload: WorkoutSessionCreate) -> WorkoutSessionRead:
        exercise_ids = [item.exercise_id for item in payload.sets]
        existing_exercises = {item.id for item in self.exercises.get_many_by_ids(exercise_ids)}
        missing_ids = sorted(set(exercise_ids) - existing_exercises)
        if missing_ids:
            raise ValueError(f"Ejercicios no encontrados: {', '.join(str(item) for item in missing_ids)}")

        created = self.sessions.create(
            user_id=user.id,
            title=payload.title,
            training_day=payload.training_day,
            week_number=payload.week_number,
            notes=payload.notes,
            sets=[item.model_dump() for item in payload.sets]
        )
        return self._serialize_session(created)

    def list_sessions(self, user: User) -> list[WorkoutSessionRead]:
        return [self._serialize_session(item) for item in self.sessions.list_by_user(user.id)]

    def build_dashboard(self, user: User) -> DashboardSummary:
        sessions = self.list_sessions(user)
        total_sets = sum(len(item.sets) for item in sessions)
        current_week = sessions[0].week_number if sessions else 1
        block_type = "HIP" if current_week <= 4 else "FUE" if current_week <= 8 else "DEL"
        return DashboardSummary(
            current_week=current_week,
            block_type=block_type,
            total_sessions=len(sessions),
            total_sets=total_sets,
            latest_sessions=sessions[:5]
        )

    def _serialize_session(self, session) -> WorkoutSessionRead:
        serialized_sets = [
            SessionSetRead(
                id=item.id,
                position=item.position,
                reps=item.reps,
                rir=item.rir,
                weight_kg=float(item.weight_kg),
                exercise_name=item.exercise.name
            )
            for item in session.sets
        ]
        return WorkoutSessionRead(
            id=session.id,
            title=session.title,
            training_day=session.training_day,
            week_number=session.week_number,
            notes=session.notes,
            created_at=session.created_at,
            sets=serialized_sets
        )
