const captureFrame = (video, time) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    const waitAfterSeek = () => new Promise((r) => setTimeout(() => requestAnimationFrame(r), 80));

    const seekAndCapture = async () => {
      video.removeEventListener("seeked", seekAndCapture); // cleanup

      await waitAfterSeek();

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = canvas.toDataURL("image/jpeg");
    };

    video.addEventListener("seeked", seekAndCapture);
    video.pause();
    video.currentTime = time;
  });
};

export default captureFrame;
