import JSZip from "jszip";
import { useState } from "react";
import ControlsPanel from "./components/ControlsPanel";
import DarkModeToggle from "./components/DarkModeToggle";
import ThumbnailPreview from "./components/ThumbnailPreview";
import useDarkMode from "./hooks/userDarkMode";
import { useVideoProcessor } from "./hooks/useVideoProcessor";

export default function App() {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [background, setBackground] = useState("dark");

  const [darkMode, setDarkMode] = useDarkMode();

  const { processQueue, cancelProcessing, loading, progress } = useVideoProcessor();

  // Sync processed results back to our local files state if needed,
  // or just rely on the hook's queue state for everything?
  // Let's use the hook as the source of truth for the processing queue
  // and sync user added files to it.

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const newItems = selectedFiles.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: "pending", // pending, processing, done, error
      resultUrl: null,
      error: null,
    }));
    // User Request: Select = Replace logic
    setFiles(newItems);
    setSelectedFileId(newItems.length > 0 ? newItems[0].id : null);
  };

  const handleClearQueue = () => {
    setFiles([]);
    setSelectedFileId(null);
  };

  // Derived state to keep UI working for now
  // If selectedFileId is set, find that file. Otherwise default to the first one (or last, but typically user wants to see the one they clicked).
  const activeFileItem = files.length > 0 ? files.find((f) => f.id === selectedFileId) || files[0] : null;

  const activeFile = activeFileItem ? activeFileItem.file : null;
  const activeResult = activeFileItem ? activeFileItem.resultUrl : null;
  const error = activeFileItem ? activeFileItem.error : null;

  const handleProcess = () => {
    // Reset all files to pending so they can be re-processed with new settings
    const pendingFiles = files.map((f) => ({ ...f, status: "pending", error: null }));
    setFiles(pendingFiles);

    // Pass the current settings to the processor
    processQueue(pendingFiles, setFiles, {
      cols,
      rows,
      canvasWidth,
      background,
    });
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    const processedFiles = files.filter((f) => f.status === "done" && f.resultUrl);

    if (processedFiles.length === 0) return;

    // Add files to zip
    for (const item of processedFiles) {
      const response = await fetch(item.resultUrl);
      const blob = await response.blob();
      const fileName = `${item.file.name.replace(/\.[^/.]+$/, "")}_contact_sheet.png`;
      zip.file(fileName, blob);
    }

    // Generate and save
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neko_snap_batch.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-ctp-base text-ctp-text font-sans transition-colors duration-300">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar / Controls */}
        <aside className="w-full lg:w-96 bg-ctp-mantle border-b lg:border-b-0 lg:border-r border-ctp-surface0 flex flex-col z-20 shadow-lg">
          <div className="p-6 border-b border-ctp-surface0 flex justify-between items-center sticky top-0 bg-ctp-mantle z-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-transparent bg-clip-text bg-linear-to-r from-ctp-blue to-ctp-sapphire">Neko</span>
                Snap
              </h1>
              <p className="text-xs text-ctp-subtext0 mt-1">Video Contact Sheet Generator</p>
            </div>
            <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            <ControlsPanel
              files={files}
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
              onClearQueue={handleClearQueue}
              file={activeFile}
              onFileChange={handleFileChange}
              cols={cols}
              setCols={setCols}
              rows={rows}
              setRows={setRows}
              canvasWidth={canvasWidth}
              setCanvasWidth={setCanvasWidth}
              background={background}
              setBackground={setBackground}
              onGenerate={handleProcess}
              onCancel={cancelProcessing}
              onDownloadAll={handleDownloadAll}
              loading={loading}
            />

            <footer className="mt-auto pt-6 text-center text-xs text-ctp-subtext0 pb-2">
              <p>
                Created with ❤️ by{" "}
                <a
                  className="hover:text-ctp-blue transition-colors"
                  href="https://web.facebook.com/kuchingneko"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tuan Kuchiing
                </a>
              </p>
            </footer>
          </div>
        </aside>

        {/* Main Content / Preview */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-ctp-base">
          <div className="flex-1 overflow-y-auto p-4 lg:p-10 flex flex-col items-center justify-center min-h-[500px]">
            {/* Progress / Loading State */}
            {loading && !error && (
              <div className="w-full max-w-md mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-sm font-bold text-ctp-blue tracking-wide">PROCESSING VIDEO...</span>
                  <span className="text-sm font-bold text-ctp-overlay0">{progress}%</span>
                </div>
                <div className="h-4 w-full bg-ctp-surface0 rounded-full overflow-hidden shadow-inner ring-1 ring-ctp-crust/5">
                  <div
                    className="h-full bg-linear-to-r from-ctp-blue to-ctp-sapphire transition-all duration-300 ease-out shadow-lg shadow-ctp-blue/20"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="max-w-md w-full bg-ctp-red/10 border border-ctp-red/20 rounded-xl p-6 text-center text-ctp-red mb-8 shadow-sm">
                <div className="flex justify-center mb-3">
                  <svg className="w-10 h-10 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* File Ready State (When file selected but not processed) */}
            {activeFile && !loading && !activeResult && (
              <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 bg-ctp-blue/10 rounded-3xl mx-auto mb-6 flex items-center justify-center ring-1 ring-ctp-blue/20 shadow-xl shadow-ctp-blue/10">
                  <svg className="w-10 h-10 text-ctp-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-ctp-text mb-2">
                  {files.length > 1 ? `${files.length} Files Queued` : activeFile.name}
                </h3>
                <div className="flex items-center justify-center gap-3 text-sm text-ctp-subtext0">
                  <span className="bg-ctp-surface0 px-3 py-1 rounded-full border border-ctp-surface1">
                    {(activeFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span className="bg-ctp-surface0 px-3 py-1 rounded-full border border-ctp-surface1 uppercase">
                    {activeFile.type.split("/")[1] || "VIDEO"}
                  </span>
                </div>
                <p className="mt-8 text-sm text-ctp-overlay0 max-w-xs mx-auto">
                  {files.length > 1
                    ? "Batch ready. Click Generate to process all."
                    : "Ready to generate. Adjust settings in the sidebar and click Generate."}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!activeFile && !loading && !activeResult && (
              <div className="text-center text-ctp-overlay0">
                <div className="w-24 h-24 bg-ctp-surface0 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium">No video selected</p>
                <p className="text-sm mt-1 max-w-xs mx-auto">
                  Upload a video from the sidebar to generate a contact sheet.
                </p>
              </div>
            )}

            {/* Preview */}
            <ThumbnailPreview compositeUrl={activeResult} file={activeFile || null} />
          </div>
        </main>
      </div>
    </div>
  );
}
