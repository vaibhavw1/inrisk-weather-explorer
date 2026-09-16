import json
from datetime import date, datetime, timezone

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException

from app.config import settings

_s3_client = boto3.client("s3", region_name=settings.AWS_REGION)


def build_file_name(
    latitude: float, longitude: float, start_date: date, end_date: date
) -> str:
    """
    Builds the required weather_<lat>_<lon>_<start>_<end>_<timestamp>.json
    naming convention. Timestamp keeps repeated queries from overwriting
    each other.
    """
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"weather_{latitude}_{longitude}_{start_date}_{end_date}_{ts}.json"


def upload_weather_json(file_name: str, payload: dict) -> None:
    try:
        _s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=file_name,
            Body=json.dumps(payload).encode("utf-8"),
            ContentType="application/json",
        )
    except ClientError as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to store file in S3: {exc}"
        ) from exc


def list_weather_files() -> list[dict]:
    """
    Uses the SDK's paginator with list_objects_v2 rather than any
    brute-force scan, per the spec's efficiency requirement.
    """
    files = []
    paginator = _s3_client.get_paginator("list_objects_v2")
    try:
        for page in paginator.paginate(Bucket=settings.S3_BUCKET_NAME):
            for obj in page.get("Contents", []):
                files.append(
                    {
                        "name": obj["Key"],
                        "size": obj["Size"],
                        "created_at": obj["LastModified"]
                        .astimezone(timezone.utc)
                        .isoformat(),
                    }
                )
    except ClientError as exc:
        raise HTTPException(
            status_code=500, detail=f"Failed to list files from S3: {exc}"
        ) from exc

    return sorted(files, key=lambda f: f["created_at"], reverse=True)


def get_weather_file_content(file_name: str) -> dict:
    try:
        obj = _s3_client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=file_name)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code", "")
        if error_code in ("NoSuchKey", "404"):
            raise HTTPException(status_code=404, detail="not found") from exc
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch file from S3: {exc}"
        ) from exc

    try:
        return json.loads(obj["Body"].read())
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500, detail="Stored file is not valid JSON"
        ) from exc
