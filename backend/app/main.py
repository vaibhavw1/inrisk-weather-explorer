import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes.weather import router as weather_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("weather-explorer")

app = FastAPI(
    title="InRisk Weather Explorer API",
    description="Fetch, store, and browse historical weather data via Open-Meteo + S3.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Normalizes pydantic's default 422 body into the spec's error shape.
    first_error = exc.errors()[0]
    message = f"{'.'.join(str(loc) for loc in first_error['loc'])}: {first_error['msg']}"
    return JSONResponse(status_code=400, content={"status": "error", "message": message})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=500, content={"status": "error", "message": "Internal server error"}
    )


@app.get("/health")
def health():
    return {"status": "ok"}
