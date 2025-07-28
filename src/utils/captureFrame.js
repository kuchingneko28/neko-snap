const captureFrame = (video, targetTime, fps) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    const frameBasedTime = fps ? Math.round(targetTime * fps) / fps : targetTime;
    const onSeeked = async () => {
      video.removeEventListener("seeked", onSeeked);
      await new Promise((r) => requestAnimationFrame(r));
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          resolve({ img, time: video.currentTime });
          URL.revokeObjectURL(blobUrl);
        };
        img.src = blobUrl;
      });
    };

    video.addEventListener("seeked", onSeeked);
    video.currentTime = frameBasedTime;
  });
};

export default captureFrame;
