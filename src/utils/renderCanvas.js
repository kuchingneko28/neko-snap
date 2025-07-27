import formatTime from "./formatTime";

export default async function renderCanvas({ thumbs, duration, originalWidth, originalHeight, cols, rows, canvasWidth, background, file, setCompositeUrl, setLoading }) {
  const padding = 8;
  const aspectRatio = thumbs[0].image.naturalHeight / thumbs[0].image.naturalWidth;

  const thumbWidth = Math.floor((canvasWidth - (cols - 1) * padding) / cols);
  const thumbHeight = Math.floor(thumbWidth * aspectRatio);
  const fontSize = Math.max(12, Math.floor(canvasWidth * 0.013));

  const headerLines = [`${file.name}`, `File size: ${(file.size / 1024 / 1024).toFixed(1)} MB`, `Duration: ${formatTime(duration)}`, `Dimensions: ${originalWidth}x${originalHeight}`];

  const margin = 12;
  const lineSpacing = 6;
  const headerHeight = margin * 2 + headerLines.length * (fontSize + lineSpacing);

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = headerHeight + rows * thumbHeight + (rows - 1) * padding;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw header
  ctx.font = `${fontSize}px monospace`;
  ctx.fillStyle = background === "white" ? "black" : "white";
  headerLines.forEach((line, i) => {
    const y = margin + i * (fontSize + lineSpacing) + fontSize;
    ctx.fillText(line, margin, y);
  });

  // Draw grid
  thumbs.forEach(({ image, time }, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = col * (thumbWidth + padding);
    const y = headerHeight + row * (thumbHeight + padding);

    ctx.drawImage(image, x, y, thumbWidth, thumbHeight);

    // Timestamp box
    const timeStr = formatTime(time);
    const textW = ctx.measureText(timeStr).width;
    const boxPad = 4;
    const boxH = fontSize + boxPad * 2;
    const boxW = textW + boxPad * 2;
    const boxX = x + thumbWidth - boxW - 6;
    const boxY = y + thumbHeight - boxH - 6;

    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.fillText(timeStr, boxX + boxPad, boxY + boxH / 2);
  });

  canvas.toBlob((blob) => {
    setCompositeUrl(URL.createObjectURL(blob));
    setLoading(false);
  }, "image/png");
}
