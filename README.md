# InRisk Weather Explorer

A small full-stack app that fetches historical daily weather from Open-Meteo,
stores the raw JSON in AWS S3, and exposes a dashboard to fetch/store, browse
stored files, and visualize temperature trends.

Built for the InRisk Labs Full Stack Engineer case study.

## Architecture

```
frontend (React + Vite + Tailwind)  --->  backend (FastAPI)  --->  Open-Meteo API
                                                |
                                                v
                                          AWS S3 bucket
```

- **Backend**: FastAPI, chosen over Flask for built-in request validation
  (Pydantic) and async support — the Open-Meteo call is I/O-bound, so an
  async HTTP client (`httpx`) avoids blocking the event loop.
- **Storage**: AWS S3, using `boto3`'s `list_objects_v2` paginator for listing
  (no brute-force scans), and `put_object`/`get_object` for storing/reading.
- **Frontend**: React + Tailwind for the dashboard, Recharts for the
  temperature line chart. Axios wraps API calls with a single configurable
  base URL (`VITE_API_BASE_URL`).
- **Deployment target**: backend on AWS Lambda + API Gateway (via `mangum`,
  free tier) or as a container on App Runner; frontend on Vercel/Netlify free
  tier.

## Design decisions & assumptions

- The S3 object key follows the required
  `weather_<lat>_<lon>_<start>_<end>_<timestamp>.json` pattern; the UTC
  timestamp prevents repeated identical queries from overwriting each other.
- All three required endpoints return the exact response shapes specified
  in the case study (`{"status": "ok", "file": ...}`, `{"files": [...]}`,
  raw JSON passthrough for file content).
- Validation is layered: Pydantic handles type/range checks (lat/lon bounds,
  date format) and raises a normalized `{"status": "error", "message": ...}`
  body via a custom exception handler; a separate `validate_date_range`
  function enforces the ≤31-day business rule so it's unit-testable in
  isolation from HTTP concerns.
- The frontend never calls Open-Meteo directly — it only talks to the
  backend and works off stored files, per the "avoid excessive external API
  calls" requirement.
- Missing/invalid file lookups return `404` with
  `{"status": "error", "message": "not found"}` exactly as specified.
- AWS credentials are expected via IAM role (Lambda/App Runner) in
  production, or local AWS CLI credentials during development — never
  hardcoded.

## Local setup

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # fill in S3_BUCKET_NAME and AWS_REGION
uvicorn app.main:app --reload --port 8080
```

Run tests:

```bash
pytest
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your backend
npm run dev
```

## Deployment notes

- **Backend on Lambda**: package `backend/app` + `lambda_handler.py` with
  dependencies, deploy behind API Gateway. `lambda_handler.py` wraps the
  FastAPI app with `mangum`.
- **Backend as a container** (App Runner / Cloud Run-style): `docker build -t
  weather-explorer-backend backend/` then deploy the image; set
  `S3_BUCKET_NAME`, `AWS_REGION`, and `ALLOWED_ORIGINS` as environment
  variables, and attach an IAM role with `s3:GetObject`, `s3:PutObject`,
  `s3:ListBucket` on the target bucket.
- **Frontend**: deploy `frontend/` to Vercel or Netlify with
  `VITE_API_BASE_URL` set to the live backend URL as a build-time env var.

_Live demo: <ADD DEPLOYED URL HERE — see submission guidelines>_
_Last verified live: <ADD DATE HERE>_

## Libraries used

**Backend**: FastAPI, Pydantic, httpx, boto3, mangum, python-dotenv, pytest

**Frontend**: React, Vite, Tailwind CSS, Recharts, Axios
