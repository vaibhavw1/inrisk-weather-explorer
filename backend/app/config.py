import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """
    Centralized app configuration, pulled from environment variables.
    Keeping this in one place makes it easy to swap buckets/regions
    without touching business logic.
    """

    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "")
    OPEN_METEO_BASE_URL: str = os.getenv(
        "OPEN_METEO_BASE_URL", "https://archive-api.open-meteo.com/v1/archive"
    )
    MAX_DATE_RANGE_DAYS: int = int(os.getenv("MAX_DATE_RANGE_DAYS", "31"))
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")


settings = Settings()
