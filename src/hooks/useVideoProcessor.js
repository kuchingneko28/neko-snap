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
  const abortControllerRef = useRef(null);

  const cancelProcessing = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setCurrentFileId(null);
    setProgress(0);
  };

  const processQueue = async (queue, setQueue, settings) => {
    setLoading(true);
    // Create new abort controller for this run
    abortControllerRef.current = new AbortController();

    // Filter for pending items
    const pendingItems = queue.filter((item) => item.status === "pending");

    // Process sequentially
    for (const item of pendingItems) {
      // Check for cancellation
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      if (item.status !== "pending") continue;

      setCurrentFileId(item.id);
      setProgress(0);

      // Update status to processing
      setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "processing", error: null } : f)));

      try {
        // Pass signal to processSingleFile if we want deep cancellation,
        // but for now loop check is enough for "between files".
        // To support mid-file cancellation, we'd need to check signal inside processSingleFile's chunk loop.
        const resultUrl = await processSingleFile(item.file, settings, abortControllerRef.current.signal);

        // Update status to done
        setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "done", resultUrl } : f)));
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("Processing aborted");
          // Reset status of current item to pending or aborted? Let's leave as processing or set to pending.
          // Actually if aborted, we should stop updating queue for this item effectively.
          break;
        }
        console.error(`Error processing file ${item.file.name}:`, err);
        // Update status to error
        setQueue((prev) => prev.map((f) => (f.id === item.id ? { ...f, status: "error", error: err.message } : f)));
      }
    }

    setLoading(false);
    setCurrentFileId(null);
    setProgress(0);
  };

  const processSingleFile = (file, settings, signal) => {
    return new Promise((resolve, reject) => {
      const { cols, rows, canvasWidth, background } = settings;

      if (!file.type || !file.type.includes("video")) {
        reject(new Error("Unsupported file type."));
        return;
      }

      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
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
          if (signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            URL.revokeObjectURL(url);
            return;
          }

          const chunkSize = Math.max(1, Math.floor(total / 20)); // Small chunks for UI responsiveness
          try {
            for (let i = 0; i < chunkSize && index < total; i++, index++) {
              if (signal?.aborted) {
                throw new DOMException("Aborted", "AbortError");
              }
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
    cancelProcessing,
    loading,
    progress,
    currentFileId,
  };
};
