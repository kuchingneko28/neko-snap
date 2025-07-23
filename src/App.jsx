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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setCompositeUrl(null);
  };

  const handleProcess = async () => {
    if (!file) return alert("Please select a video file first.");
    setLoading(true);
    setCompositeUrl(null);

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = url;
    video.muted = true;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const width = video.videoWidth;
      const height = video.videoHeight;

      const total = cols * rows;
      const margin = 0.05 * duration;
      const interval = (duration - 2 * margin) / total;

      const thumbs = [];
      for (let i = 0; i < total; i++) {
        const time = margin + i * interval;
        const thumb = await captureFrame(video, time);
        thumbs.push({ time, image: thumb });
      }

      const thumbHeight = (height / width) * thumbWidth;
      const textLines = 4;
      const lineSpacing = 6;
      const marginTop = 8;
      const padding = 2;
      const baseFontSize = Math.min(36, Math.max(14, Math.floor(thumbWidth * 0.035)));
      const smallFontSize = Math.min(24, Math.max(10, Math.floor(thumbWidth * 0.025)));

      const headerHeight = marginTop + baseFontSize * textLines + lineSpacing * (textLines - 1);
      const canvas = document.createElement("canvas");
      canvas.width = cols * (thumbWidth + padding) - padding;
      canvas.height = rows * (thumbHeight + padding) - padding + headerHeight;

      const ctx = canvas.getContext("2d");
      const isDarkBg = background === "black";
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isDarkBg ? "white" : "black";
      ctx.font = `${baseFontSize}px monospace`;

      ctx.fillText(`Filename: ${file.name}`, 10, Math.round(marginTop + baseFontSize * 1));
      ctx.fillText(`File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB`, 10, Math.round(marginTop + baseFontSize * 2));
      ctx.fillText(`Duration: ${formatTime(duration)}`, 10, Math.round(marginTop + baseFontSize * 3));
      ctx.fillText(`Dimensions: ${width}x${height}`, 10, Math.round(marginTop + baseFontSize * 4));

      thumbs.forEach((thumb, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const x = col * (thumbWidth + padding);
        const y = row * (thumbHeight + padding) + headerHeight;

        ctx.drawImage(thumb.image, x, y, thumbWidth, thumbHeight);

        const timeStr = formatTime(thumb.time);
        ctx.font = `${smallFontSize}px monospace`;
        const textWidth = ctx.measureText(timeStr).width;
        const boxPadding = 4;
        const boxWidth = textWidth + boxPadding * 2;
        const boxHeight = smallFontSize + 6;

        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(x + thumbWidth - boxWidth - 5, y + thumbHeight - boxHeight - 5, boxWidth, boxHeight);

        ctx.fillStyle = "white";
        ctx.fillText(timeStr, x + thumbWidth - boxWidth + boxPadding - 5, y + thumbHeight - 10);
      });

      setCompositeUrl(canvas.toDataURL("image/png"));
      setLoading(false);
    };
  };

  const captureFrame = (video, time) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      video.currentTime = time;
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0);
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = canvas.toDataURL("image/jpeg");
      };
    });
  };

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(Math.floor(seconds % 60)).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans text-gray-800">
      <h1 className="text-3xl font-semibold mb-2 text-center">NekoSnap</h1>
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
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-sm text-gray-700 mb-8 shadow-inner">
          <p className="break-words">
            <strong>Filename:</strong> {file.name}
          </p>
          <p>
            <strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>
          <p>
            <strong>Type:</strong> {file.type || "Unknown"}
          </p>
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
