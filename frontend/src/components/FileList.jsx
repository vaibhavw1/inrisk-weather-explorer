import { useEffect, useState, useCallback } from "react";
import { listWeatherFiles, extractApiErrorMessage } from "../api";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileList({ selectedFile, onSelectFile, refreshKey }) {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  const loadFiles = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await listWeatherFiles();
      setFiles(result);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setMessage(extractApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles, refreshKey]);

  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col max-h-[420px]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-800">Stored Files</h2>
        <button
          onClick={loadFiles}
          className="text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {status === "loading" && (
        <p className="text-sm text-slate-500">Loading files...</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">{message}</p>
      )}
      {status === "success" && files.length === 0 && (
        <p className="text-sm text-slate-500">
          No files yet — fetch some weather data above.
        </p>
      )}

      <ul className="overflow-y-auto divide-y divide-slate-100">
        {files.map((file) => (
          <li key={file.name}>
            <button
              onClick={() => onSelectFile(file.name)}
              className={`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors ${
                selectedFile === file.name
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="font-mono truncate">{file.name}</div>
              <div className="text-xs text-slate-400">
                {formatBytes(file.size)} · {new Date(file.created_at).toLocaleString()}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
