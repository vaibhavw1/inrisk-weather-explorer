/**
 * Converts the raw Open-Meteo response (columnar arrays keyed by variable)
 * into an array of row objects, one per day — easier to feed into
 * Recharts and a paginated table.
 */
export function parseDailyRows(weatherJson) {
  const daily = weatherJson?.daily;
  if (!daily?.time) return [];

  return daily.time.map((date, i) => ({
    date,
    tempMax: daily.temperature_2m_max?.[i] ?? null,
    tempMin: daily.temperature_2m_min?.[i] ?? null,
    apparentTempMax: daily.apparent_temperature_max?.[i] ?? null,
    apparentTempMin: daily.apparent_temperature_min?.[i] ?? null,
  }));
}
