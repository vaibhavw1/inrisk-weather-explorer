import axios from "axios";

// Set VITE_API_BASE_URL in a .env file (see .env.example) to point at your
// deployed backend. Falls back to localhost for local dev.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const client = axios.create({ baseURL: API_BASE_URL });

export async function storeWeatherData({ latitude, longitude, startDate, endDate }) {
  const { data } = await client.post("/store-weather-data", {
    latitude: Number(latitude),
    longitude: Number(longitude),
    start_date: startDate,
    end_date: endDate,
  });
  return data;
}

export async function listWeatherFiles() {
  const { data } = await client.get("/list-weather-files");
  return data.files;
}

export async function getWeatherFileContent(fileName) {
  const { data } = await client.get(
    `/weather-file-content/${encodeURIComponent(fileName)}`
  );
  return data;
}

export function extractApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}
