from pydantic import BaseModel

from app.schemas.session import WorkoutSessionRead


class DashboardSummary(BaseModel):
    current_week: int
    block_type: str
    total_sessions: int
    total_sets: int
    latest_sessions: list[WorkoutSessionRead]
