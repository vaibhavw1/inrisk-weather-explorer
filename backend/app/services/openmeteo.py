from datetime import date

import httpx
from fastapi import HTTPException

from app.config import settings

DAILY_VARIABLES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "apparent_temperature_min",
]


async def fetch_historical_weather(
    latitude: float, longitude: float, start_date: date, end_date: date
) -> dict:
    """
    Calls Open-Meteo's historical daily archive endpoint and returns the
    raw JSON payload exactly as received, since we store the full response.
    """
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "daily": ",".join(DAILY_VARIABLES),
        "timezone": "auto",
    }

    async with httpx.AsyncClient(timeout=20.0) as client:
        try:
            response = await client.get(settings.OPEN_METEO_BASE_URL, params=params)
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=502, detail=f"Failed to reach Open-Meteo: {exc}"
            ) from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Open-Meteo returned an error: {response.text}",
        )

    return response.json()
