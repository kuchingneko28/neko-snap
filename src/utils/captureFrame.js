const captureFrame = (video, time) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    const waitForNextPaint = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const onSeeked = async () => {
      try {
        await waitForNextPaint();
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

export default captureFrame;
