from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.dependencies import get_db
from app.db.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.session import SessionService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DashboardSummary:
    return SessionService(db).build_dashboard(current_user)
