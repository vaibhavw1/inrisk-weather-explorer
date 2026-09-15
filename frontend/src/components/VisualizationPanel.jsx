import { useEffect, useState } from "react";
import { getWeatherFileContent, extractApiErrorMessage } from "../api";
import { parseDailyRows } from "../utils/parseWeather";
import TempChart from "./TempChart";
import TempTable from "./TempTable";

export default function VisualizationPanel({ fileName }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!fileName) return;

    let cancelled = false;
    setStatus("loading");
    setMessage("");

    getWeatherFileContent(fileName)
      .then((data) => {
        if (cancelled) return;
        setRows(parseDailyRows(data));
        setStatus("success");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setMessage(extractApiErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [fileName]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Visualization
      </h2>

      {!fileName && (
        <p className="text-sm text-slate-500">
          Select a stored file on the left to view its chart and data.
        </p>
      )}
      {status === "loading" && (
        <p className="text-sm text-slate-500">Loading file content...</p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{message}</p>}

      {status === "success" && rows.length === 0 && (
        <p className="text-sm text-slate-500">
          This file has no daily data to display.
        </p>
      )}

      {status === "success" && rows.length > 0 && (
        <div className="flex flex-col gap-6">
          <TempChart rows={rows} />
          <TempTable rows={rows} />
        </div>
      )}
    </section>
  );
}
