from fastapi import APIRouter

from app.models import (
    ListWeatherFilesResponse,
    StoreWeatherDataRequest,
    StoreWeatherDataResponse,
)
from app.services import openmeteo, storage
from app.validation import validate_date_range

router = APIRouter()


@router.post("/store-weather-data", response_model=StoreWeatherDataResponse)
async def store_weather_data(payload: StoreWeatherDataRequest):
    validate_date_range(payload.start_date, payload.end_date)

    weather_json = await openmeteo.fetch_historical_weather(
        latitude=payload.latitude,
        longitude=payload.longitude,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )

    file_name = storage.build_file_name(
        payload.latitude, payload.longitude, payload.start_date, payload.end_date
    )
    storage.upload_weather_json(file_name, weather_json)

    return StoreWeatherDataResponse(status="ok", file=file_name)


@router.get("/list-weather-files", response_model=ListWeatherFilesResponse)
def list_weather_files():
    files = storage.list_weather_files()
    return ListWeatherFilesResponse(files=files)


@router.get("/weather-file-content/{file_name}")
def weather_file_content(file_name: str):
    return storage.get_weather_file_content(file_name)
