from datetime import date

import pytest
from fastapi import HTTPException

from app.validation import validate_date_range


def test_valid_range_passes():
    validate_date_range(date(2024, 1, 1), date(2024, 1, 15))  # should not raise


def test_start_after_end_raises_400():
    with pytest.raises(HTTPException) as exc_info:
        validate_date_range(date(2024, 1, 15), date(2024, 1, 1))
    assert exc_info.value.status_code == 400


def test_range_over_31_days_raises_400():
    with pytest.raises(HTTPException) as exc_info:
        validate_date_range(date(2024, 1, 1), date(2024, 3, 1))
    assert exc_info.value.status_code == 400


def test_exactly_31_days_passes():
    validate_date_range(date(2024, 1, 1), date(2024, 1, 31))  # should not raise
