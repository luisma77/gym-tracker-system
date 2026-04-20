"""Workbook layout helpers."""

from .constants import DATA_START, ROWS_PER_WEEK_PER_DAY


def week_block_start(week: int) -> int:
    """Returns the first row for a week's visual block."""
    return DATA_START + (week - 1) * ROWS_PER_WEEK_PER_DAY
