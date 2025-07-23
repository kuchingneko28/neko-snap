import { useState } from "react";
import ControlsPanel from "./components/ControlsPanel";
import ThumbnailPreview from "./components/ThumbnailPreview";

export default function App() {
  const [compositeUrl, setCompositeUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(3);
  const [thumbWidth, setThumbWidth] = useState(320);
  const [background, setBackground] = useState("white");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setCompositeUrl(null);
  };

  const captureFrame = (video, time) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const waitForNextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const onSeeked = async () => {
        try {
          await waitForNextPaint(); // smoother than setTimeout
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = new Image();
          image.onload = () => resolve(image);
          image.src = canvas.toDataURL("image/jpeg");
        } catch (err) {
          console.error("drawImage failed:", err);
          resolve(null);
        } finally {
          video.removeEventListener("seeked", onSeeked);
        }
      };

      video.addEventListener("seeked", onSeeked);
      video.currentTime = time;
    });
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  const handleProcess = async () => {
    if (!file) return alert("Please select a video file first.");
    setLoading(true);
    setProgress(0);
    setCompositeUrl(null);

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.muted = true;
    video.playsInline = true;

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
          renderCanvas(thumbs, duration, width, height);
        }
      };

      const renderCanvas = (thumbs, duration, width, height) => {
        const padding = 4;
        const thumbHeight = (height / width) * thumbWidth;

        const canvas = document.createElement("canvas");
        canvas.width = cols * (thumbWidth + padding) - padding;

        const fontScale = canvas.width / 1200;
        const baseFontSize = Math.min(48, Math.max(14, Math.floor(20 * fontScale)));
        const marginTop = 16;
        const marginLeft = 16;
        const marginBottom = 16;
        const lineSpacing = 8;
        const labelBlockHeight = baseFontSize + lineSpacing;

        const ctx = canvas.getContext("2d");
        ctx.font = `${baseFontSize}px monospace`;

        const rawLabels = [`Filename: ${file.name}`, `File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB`, `Duration: ${formatTime(duration)}`, `Dimensions: ${width}x${height}`];
        const maxTextWidth = canvas.width - marginLeft * 2;
        const wrappedLines = [];

        rawLabels.forEach((label, index) => {
          if (index === 0) {
            let currentLine = "";
            const chars = label.split("");
            for (const char of chars) {
              const testLine = currentLine + char;
              if (ctx.measureText(testLine).width > maxTextWidth) {
                wrappedLines.push(currentLine);
                currentLine = char;
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) wrappedLines.push(currentLine);
          } else {
            wrappedLines.push(label);
          }
        });

        const textLines = wrappedLines.length;
        const headerHeight = marginTop + textLines * labelBlockHeight + marginBottom;

        canvas.height = rows * (thumbHeight + padding) - padding + headerHeight;

        const isDarkBg = background === "black";
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = isDarkBg ? "white" : "black";
        ctx.font = `${baseFontSize}px monospace`;

        wrappedLines.forEach((line, i) => {
          const y = marginTop + i * labelBlockHeight + baseFontSize;
          ctx.fillText(line, marginLeft, y);
        });

        thumbs.forEach((thumb, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = col * (thumbWidth + padding);
          const y = row * (thumbHeight + padding) + headerHeight;

          ctx.drawImage(thumb.image, x, y, thumbWidth, thumbHeight);

          const timeStr = formatTime(thumb.time);
          ctx.font = `${baseFontSize}px monospace`;
          const textWidth = ctx.measureText(timeStr).width;
          const boxPadding = 4;
          const boxWidth = textWidth + boxPadding * 2;
          const boxHeight = baseFontSize + 4;

          ctx.fillStyle = "rgba(0,0,0,0.6)";
          ctx.fillRect(x + thumbWidth - boxWidth - 5, y + thumbHeight - boxHeight - 5, boxWidth, boxHeight);

          ctx.fillStyle = "white";
          ctx.fillText(timeStr, x + thumbWidth - boxWidth + boxPadding - 5, y + thumbHeight - 10);
        });

        setCompositeUrl(canvas.toDataURL("image/png"));
        setLoading(false);
      };

      processInChunks();
    };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-jakarta text-gray-800">
      <h1 className="text-3xl font-semibold mb-2 text-center">
        <span className="text-teal-600">Neko</span>Snap
      </h1>
      <p className="text-center text-gray-600 mb-6 text-sm">A simple, cat-powered tool to generate video thumbnail grids with ease.</p>

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
      {loading && (
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

      <ThumbnailPreview compositeUrl={compositeUrl} file={file} />

      <footer className="mt-12 text-center text-gray-400 text-sm">
        Created with ❤️ by{" "}
        <a className="hover:underline" href="https://web.facebook.com/kuchingneko">
          Tuan Kuchiing
        </a>
      </footer>
    </div>
  );
}
