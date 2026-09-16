from datetime import date

from fastapi import HTTPException

from app.config import settings


def validate_date_range(start_date: date, end_date: date) -> None:
    """
    Enforces the ≤31-day range rule from the spec. Raised as an HTTPException
    so route handlers don't need their own try/except for this.
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=400, detail="start_date must be on or before end_date"
        )

    span_days = (end_date - start_date).days + 1
    if span_days > settings.MAX_DATE_RANGE_DAYS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Date range too large ({span_days} days). "
                f"Maximum allowed is {settings.MAX_DATE_RANGE_DAYS} days."
            ),
        )
