import { useState } from "react";
import { storeWeatherData, extractApiErrorMessage } from "../api";

export default function InputPanel({ onStored }) {
  const [form, setForm] = useState({
    latitude: "28.6139",
    longitude: "77.2090",
    startDate: "",
    endDate: "",
  });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [storedFile, setStoredFile] = useState(null);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setStoredFile(null);

    try {
      const result = await storeWeatherData(form);
      setStatus("success");
      setStoredFile(result.file);
      onStored?.(result.file);
    } catch (err) {
      setStatus("error");
      setMessage(extractApiErrorMessage(err));
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Fetch &amp; Store Weather Data
      </h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <label className="flex flex-col text-sm text-slate-600 gap-1">
          Latitude
          <input
            type="number"
            step="any"
            required
            value={form.latitude}
            onChange={handleChange("latitude")}
            className="border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600 gap-1">
          Longitude
          <input
            type="number"
            step="any"
            required
            value={form.longitude}
            onChange={handleChange("longitude")}
            className="border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600 gap-1">
          Start Date
          <input
            type="date"
            required
            value={form.startDate}
            onChange={handleChange("startDate")}
            className="border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="flex flex-col text-sm text-slate-600 gap-1">
          End Date
          <input
            type="date"
            required
            value={form.endDate}
            onChange={handleChange("endDate")}
            className="border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <div className="sm:col-span-2 flex items-center gap-3 mt-1">
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {status === "loading" ? "Fetching..." : "Fetch & Store Data"}
          </button>

          {status === "success" && (
            <span className="text-sm text-green-700">
              Stored as <span className="font-mono">{storedFile}</span>
            </span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600">{message}</span>
          )}
        </div>
      </form>
    </section>
  );
}
