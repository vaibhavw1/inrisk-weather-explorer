from datetime import date
from pydantic import BaseModel, Field, field_validator


class StoreWeatherDataRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, end_date: date, info):
        start_date = info.data.get("start_date")
        if start_date and end_date < start_date:
            raise ValueError("end_date must be on or after start_date")
        return end_date


class StoreWeatherDataResponse(BaseModel):
    status: str
    file: str


class FileMetadata(BaseModel):
    name: str
    size: int
    created_at: str


class ListWeatherFilesResponse(BaseModel):
    files: list[FileMetadata]


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
