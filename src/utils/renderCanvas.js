import formatTime from "./formatTime";

export default async function renderCanvas({ thumbs, duration, originalWidth, originalHeight, cols, rows, canvasWidth, background, file, setCompositeUrl, setLoading }) {
  const spacing = 8;
  const metadataFontSize = 16;
  const timestampFontSize = 12;
  const metadataMargin = 8;
  const lineHeight = metadataFontSize * 1.2;

  const aspect = thumbs[0].image.naturalHeight / thumbs[0].image.naturalWidth;
  const thumbW = Math.floor((canvasWidth - (cols - 1) * spacing) / cols);
  const thumbH = Math.floor(thumbW * aspect);

  const headerLines = [file.name, `File size: ${(file.size / 1024 / 1024).toFixed(1)} MB`, `Duration: ${formatTime(duration)}`, `Dimensions: ${originalWidth}x${originalHeight}`];
  const headerHeight = metadataMargin * 2 + headerLines.length * lineHeight;

  const canvasHeight = headerHeight + rows * thumbH + (rows - 1) * spacing + spacing; // extra bottom spacing

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = background === "white" ? "#fff" : "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${metadataFontSize}px monospace`;
  ctx.fillStyle = background === "white" ? "#000" : "#fff";
  headerLines.forEach((line, i) => {
    ctx.fillText(line, metadataMargin, metadataMargin + i * lineHeight + metadataFontSize);
  });

  thumbs.forEach(({ image, time }, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * (thumbW + spacing);
    const y = headerHeight + row * (thumbH + spacing);
    ctx.drawImage(image, x, y, thumbW, thumbH);

    const ts = formatTime(time);
    ctx.font = `${timestampFontSize}px monospace`;
    const textW = ctx.measureText(ts).width;
    const padH = 4;
    const padV = 4;
    const marginTs = 8;
    const boxW = textW + padH * 2;
    const boxH = timestampFontSize + padV * 2;
    const bx = x + thumbW - boxW - marginTs;
    const by = y + thumbH - boxH - marginTs;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.fillStyle = "#fff";
    ctx.textBaseline = "middle";
    ctx.fillText(ts, bx + padH, by + boxH / 2);
  });

  canvas.toBlob((blob) => {
    setCompositeUrl(URL.createObjectURL(blob));
    setLoading(false);
  }, "image/png");
}
