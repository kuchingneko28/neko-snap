import { useState, useEffect } from "react";
import ControlsPanel from "./components/ControlsPanel";
import ThumbnailPreview from "./components/ThumbnailPreview";
import captureFrame from "./utils/captureFrame";
import renderCanvas from "./utils/renderCanvas";
import DarkModeToggle from "./components/DarkModeToggle";

export default function App() {
  const [compositeUrl, setCompositeUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [thumbWidth, setThumbWidth] = useState(320);
  const [background, setBackground] = useState("white");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setCompositeUrl(null);
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Please select a video file first.");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("The selected file is not a valid video.");
      return;
    }

    setLoading(true);
    setProgress(0);
    setCompositeUrl(null);
    setError(null);

    try {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = url;
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";

      video.onloadedmetadata = () => {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;
        const total = cols * rows;
        const margin = 0.05 * duration;
        const interval = (duration - 2 * margin) / total;
        const thumbs = [];

        const processInChunks = async (index = 0) => {
          const chunkSize = 1;

          for (let i = 0; i < chunkSize && index < total; i++, index++) {
            const time = margin + index * interval;
            const thumb = await captureFrame(video, time);
            thumbs.push({ time, image: thumb });

            setProgress(Math.round(((index + 1) / total) * 100));
          }

          if (index < total) {
            setTimeout(() => processInChunks(index), 20);
          } else {
            renderCanvas({
              thumbs,
              duration,
              width,
              height,
              cols,
              rows,
              thumbWidth,
              background,
              file,
              setCompositeUrl,
              setLoading,
            });
          }
        };

        processInChunks();
      };
      video.onerror = () => {
        throw new Error("Failed to load video metadata.");
      };
    } catch (err) {
      console.error("Video processing failed:", err);
      setError("An error occurred while processing the video. Please try a different file.");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-jakarta text-gray-800" style={{ position: 'relative' }}>
      {/* Responsive dark mode toggle: top-right on desktop, centered above title on mobile */}
      <div className="dark-toggle-container">
        <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
      </div>
      <div className="main-panel">
        <h1 className="text-3xl font-semibold mb-2 text-center">
          <span className="text-teal-600">Neko</span>Snap
        </h1>
        <p className="text-center subtitle mb-6 text-sm">A simple, cat-powered tool to generate video thumbnail grids with ease.</p>
        <ControlsPanel
          file={file}
          onFileChange={handleFileChange}
          cols={cols}
          setCols={setCols}
          rows={rows}
          setRows={setRows}
          thumbWidth={thumbWidth}
          setThumbWidth={setThumbWidth}
          background={background}
          setBackground={setBackground}
          onGenerate={handleProcess}
          loading={loading}
        />

        {file && (
          <>
            <h2 className="text-base font-semibold text-gray-700 mb-2">Media Info</h2>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm text-gray-800 mb-8 shadow-inner space-y-2">
              <div>
                <span className="font-medium text-gray-600 mb-1">Filename:</span>
                <span className="break-words">{file.name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium text-gray-600">Size:</span>
                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-medium text-gray-600">Type:</span>
                <span>{file.type || "Unknown"}</span>
              </div>
            </div>
          </>
        )}
        {loading && !error && (
          <div className="mb-6 bg-teal-50 p-4 rounded-lg border border-teal-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-teal-800">Processing video...</span>
              <span className="text-sm text-teal-600">{progress}%</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {error && !file && (
          <div className="mb-6 bg-red-50 p-4 rounded-lg border border-red-200 text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        <ThumbnailPreview compositeUrl={compositeUrl} file={file} />
      </div>
      <footer className="mt-12 text-center footer text-sm">
        Created with ❤️ by{" "}
        <a className="hover:underline" href="https://web.facebook.com/kuchingneko">
          Tuan Kuchiing
        </a>
      </footer>
    </div>
  );
}
