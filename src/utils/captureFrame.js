const captureFrame = (video, targetTime, targetWidth, targetHeight) => {
  return new Promise((resolve) => {
    // If no target dimensions provided, use video original size
    const width = targetWidth || video.videoWidth;
    const height = targetHeight || video.videoHeight;

    // Use OffscreenCanvas if available for better performance in workers (future proofing)
    // but for now standard canvas is fine
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false }); // alpha false usually faster

    const onSeeked = async () => {
      // Small delay to ensure frame is actually ready (VideoDecoder can be laggy)
      // Double requestAnimationFrame is a common trick
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));

      try {
        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              // Fallback or retry? For now just resolve null
              console.error("Frame capture produced null blob");
              resolve({ img: null, time: video.currentTime });
              return;
            }
            const blobUrl = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              resolve({ img, time: video.currentTime });
            };
            img.onerror = () => {
              URL.revokeObjectURL(blobUrl);
              resolve({ img: null, time: video.currentTime });
            };
            img.src = blobUrl;
          },
          "image/jpeg",
          0.85
        ); // Use JPEG 0.85 for reasonable quality/size trade-off vs default PNG
      } catch (e) {
        console.error("Drawing failed", e);
        resolve({ img: null, time: video.currentTime });
      } finally {
        video.removeEventListener("seeked", onSeeked);
      }
    };

    video.addEventListener("seeked", onSeeked, { once: true });
    video.currentTime = targetTime;
  });
};

export default captureFrame;
