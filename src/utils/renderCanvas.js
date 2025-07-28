import formatTime from "./formatTime";

export default async function renderCanvas({ thumbs, duration, originalWidth, originalHeight, cols, rows, canvasWidth, background, file, setCompositeUrl, setLoading }) {
  const spacing = 8;
  const metadataFontSize = 16;
  const timestampFontSize = 12;
  const metadataMargin = 12;
  const lineHeight = metadataFontSize * 1.5;

  const aspect = thumbs[0].image.naturalHeight / thumbs[0].image.naturalWidth;
  const thumbW = Math.floor((canvasWidth - (cols - 1) * spacing) / cols);
  const thumbH = Math.floor(thumbW * aspect);

  const timestamp = new Date().toLocaleString();
  const headerLines = [
    "🐾 NekoSnap Contact Sheet",
    file.name,
    `Resolution: ${originalWidth}x${originalHeight}`,
    `Duration: ${formatTime(duration)} (${Math.round(duration)}s)`,
    `File size: ${(file.size / 1024 / 1024).toFixed(1)} MB`,
    `Generated: ${timestamp}`,
  ];
  const headerHeight = metadataMargin * 2 + headerLines.length * lineHeight;
  const canvasHeight = headerHeight + rows * thumbH + (rows - 1) * spacing + spacing;

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = background === "white" ? "#fff" : "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.font = `${metadataFontSize}px monospace`;
  ctx.fillStyle = background === "white" ? "#000" : "#fff";
  headerLines.forEach((line, i) => {
    ctx.fillText(line, metadataMargin, metadataMargin + i * lineHeight + metadataFontSize);
  });

  // Thumbnails
  thumbs.forEach(({ image, time }, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * (thumbW + spacing);
    const y = headerHeight + row * (thumbH + spacing);

    ctx.drawImage(image, x, y, thumbW, thumbH);

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, thumbW, thumbH);

    // Timestamp below thumbnail
    const ts = formatTime(time);
    ctx.font = `${timestampFontSize}px monospace`;
    ctx.textBaseline = "middle";

    const textW = ctx.measureText(ts).width;
    const padH = 4;
    const padV = 4;
    const marginTs = 8;
    const boxW = textW + padH * 2;
    const boxH = timestampFontSize + padV * 2;
    const bx = x + thumbW - boxW - marginTs;
    const by = y + thumbH - boxH - marginTs;

    // Draw box
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(bx, by, boxW, boxH);

    // Timestamp text
    ctx.fillStyle = "#fff";
    ctx.fillText(ts, bx + padH, by + boxH / 2);
    // Optional grid coordinates
    // const coord = `R${row + 1}C${col + 1}`;
    // ctx.fillText(coord, x + 4, y + thumbH + 20);
  });

  canvas.toBlob((blob) => {
    setCompositeUrl(URL.createObjectURL(blob));
    setLoading(false);
  }, "image/png");
}
