import { useState } from "react";
import { useRef } from "react";
import ControlsPanel from "./components/ControlsPanel";
import ThumbnailPreview from "./components/ThumbnailPreview";
import DarkModeToggle from "./components/DarkModeToggle";
import captureFrame from "./utils/captureFrame";
import renderCanvas from "./utils/renderCanvas";
import useDarkMode from "./utils/userDarkMode";

export default function App() {
  const [compositeUrl, setCompositeUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(4);
  const [canvasWidth, setCanvasWidth] = useState(1500);
  const [background, setBackground] = useState("dark");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useDarkMode();
  const videoRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setCompositeUrl(null);
  };

  const handleProcess = async () => {
    if (!file.type || !file.type.includes("video")) {
      setError("Unsupported file type. Please select a video.");
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
      const video = videoRef.current || document.createElement("video");
      videoRef.current = video;
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
          const chunkSize = Math.max(1, Math.floor(total / 20));
          for (let i = 0; i < chunkSize && index < total; i++, index++) {
            const fps = video.videoHeight > 0 ? video.videoWidth / video.duration : 30;
            const time = margin + index * interval;

            const result = await captureFrame(video, time, fps);
            thumbs.push({ time: result.time, image: result.img });

            setProgress(Math.round(((index + 1) / total) * 100));
          }

          if (index < total) {
            setTimeout(() => processInChunks(index), 100);
          } else {
            renderCanvas({
              thumbs,
              duration,
              originalWidth: width,
              originalHeight: height,
              cols,
              rows,
              canvasWidth,
              background,
              file,
              setCompositeUrl,
              setLoading,
            });

            videoRef.current.src = "";
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
    <div className="relative p-6 max-w-4xl mx-auto font-jakarta bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      <h1 className="text-3xl font-semibold mb-2 text-center">
        <span className="text-teal-600">Neko</span>Snap
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm">A simple, cat-powered tool to generate video thumbnail grids with ease.</p>
      <div className="absolute top-10 right-10 z-10 max-sm:static max-sm:flex max-sm:justify-center max-sm:mb-6 max-sm:mt-2">
        <DarkModeToggle darkMode={darkMode} onToggle={() => setDarkMode((d) => !d)} />
      </div>
      <ControlsPanel
        file={file}
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
        loading={loading}
      />
      {file && (
        <>
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100 mb-8 shadow-md space-y-2">
            <h2 className="text-base font-semibold text-gray-700 dark:text-white mb-2">Media Info</h2>
            <p className="break-words font-medium">{file.name}</p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">File Size:</span>
              <span className="break-words">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span>
              <span className="break-words">{file.type || "Unknown"}</span>
            </div>
          </div>
        </>
      )}
      {loading && !error && (
        <div className="mb-6 bg-teal-50 dark:bg-teal-800 p-4 rounded-lg border border-teal-200 dark:border-teal-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-teal-800 dark:text-teal-100">Processing video...</span>
            <span className="text-sm text-teal-600 dark:text-teal-200">{progress}%</span>
          </div>
          <div className="w-full bg-teal-200 dark:bg-teal-900 rounded-full h-2">
            <div className="bg-teal-600 dark:bg-teal-400 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {error && !file && (
        <div className="mb-6 bg-red-50 dark:bg-red-900 p-4 rounded-lg border border-red-200 dark:border-red-700 text-sm text-red-800 dark:text-red-100">
          <strong>Error:</strong> {error}
        </div>
      )}
      <ThumbnailPreview compositeUrl={compositeUrl} file={file} />
      <footer className="mt-12 text-center text-gray-400 dark:text-gray-500 text-sm">
        Created with ❤️ by{" "}
        <a className="hover:underline text-teal-600 dark:text-teal-400" href="https://web.facebook.com/kuchingneko" target="_blank" rel="noopener noreferrer">
          Tuan Kuchiing
        </a>
      </footer>
    </div>
  );
}
