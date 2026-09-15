import { useState } from "react";
import InputPanel from "./components/InputPanel";
import FileList from "./components/FileList";
import VisualizationPanel from "./components/VisualizationPanel";

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStored = (fileName) => {
    setRefreshKey((k) => k + 1); // triggers FileList to reload
    setSelectedFile(fileName); // jump straight to the new file
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-slate-800">
          InRisk Weather Explorer
        </h1>
        <p className="text-sm text-slate-500">
          Fetch, store, and visualize historical daily weather data
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <InputPanel onStored={handleStored} />

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          <FileList
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            refreshKey={refreshKey}
          />
          <VisualizationPanel fileName={selectedFile} />
        </div>
      </main>
    </div>
  );
}
