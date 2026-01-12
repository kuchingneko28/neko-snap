import { useRef, useState } from "react";
import captureFrame from "../utils/captureFrame";
import renderCanvas from "../utils/renderCanvas";

export const useVideoProcessor = () => {
  const [loading, setLoading] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [progress, setProgress] = useState(0); // Progress of current file

  // We don't store the queue itself here to avoid duplication if App passes it,
  // but we could store "processed results" here.
  // For simplicity, we will update the "files" state in App via a callback or
  // let App handle the state updates driven by this hook.

  const videoRef = useRef(null);

  const processQueue = async (queue, setQueue, settings) => {
    setLoading(true);

    // Filter for pending items
    const pendingItems = queue.filter((item) => item.status === "pending");

    // Process sequentially
    for (const item of pendingItems) {
      if (item.status !== "pending") continue;

      setCurrentFileId(item.id);
      setProgress(0);

      // Update status to processing
      setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "processing", error: null } : f)));

      try {
        const resultUrl = await processSingleFile(item.file, settings);

        // Update status to done
        setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "done", resultUrl } : f)));
      } catch (err) {
        console.error(`Error processing file ${item.file.name}:`, err);
        // Update status to error
        setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", error: err.message } : f)));
      }
    }

    setLoading(false);
    setCurrentFileId(null);
    setProgress(0);
  };

  const processSingleFile = (file, settings) => {
    return new Promise((resolve, reject) => {
      const { cols, rows, canvasWidth, background } = settings;

      if (!file.type || !file.type.includes("video")) {
        reject(new Error("Unsupported file type."));
        return;
      }

      const url = URL.createObjectURL(file);
      const video = videoRef.current || document.createElement("video");
      videoRef.current = video;

      // Reset handlers
      video.onloadedmetadata = null;
      video.onerror = null;

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

        const spacing = 8;
        const aspect = height / width;
        const thumbW = Math.floor((canvasWidth - (cols - 1) * spacing) / cols);
        const thumbH = Math.floor(thumbW * aspect);

        const processInChunks = async (index = 0) => {
          const chunkSize = Math.max(1, Math.floor(total / 20)); // Small chunks for UI responsiveness
          try {
            for (let i = 0; i < chunkSize && index < total; i++, index++) {
              const time = margin + index * interval;
              const result = await captureFrame(video, time, thumbW, thumbH);
              thumbs.push({ time: result.time, image: result.img });
              setProgress(Math.round(((index + 1) / total) * 100));
            }

            if (index < total) {
              setTimeout(() => processInChunks(index), 50); // Small delay to let UI breathe
            } else {
              // All frames captured, render canvas
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
                setCompositeUrl: resolve, // Resolve the promise with the URL
                setLoading: () => {}, // No-op, managed by queue
              });

              // Cleanup
              video.onerror = null;
              videoRef.current.src = "";
              URL.revokeObjectURL(url);
            }
          } catch (e) {
            reject(e);
          }
        };

        processInChunks();
      };

      video.onerror = () => {
        const err = video.error;
        let msg = "Failed to load video.";
        if (err) {
          switch (err.code) {
            case MediaError.MEDIA_ERR_DECODE:
              msg = "Video corrupted/unsupported codec.";
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              msg = "Format not supported.";
              break;
            default:
              msg = `Video Error ${err.code}`;
          }
        }
        reject(new Error(msg));
      };
    });
  };

  return {
    processQueue,
    loading,
    progress,
    currentFileId,
  };
};
