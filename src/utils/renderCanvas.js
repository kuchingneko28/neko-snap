import formatTime from "./formatTime";

export default async function renderCanvas({ thumbs, duration, width, height, cols, rows, thumbWidth, background, file, setCompositeUrl, setLoading }) {
  const padding = 4;
  const thumbHeight = (height / width) * thumbWidth;
  const canvasWidth = cols * (thumbWidth + padding) - padding;

  const headerCanvas = document.createElement("canvas");
  headerCanvas.width = canvasWidth;
  const ctxHdr = headerCanvas.getContext("2d");
  ctxHdr.font = "16px monospace";
  const rawLabels = [`Filename: ${file.name}`, `File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB`, `Duration: ${formatTime(duration)}`, `Dimensions: ${width}x${height}`];
  const marginLeft = 16,
    marginTop = 16,
    lineSpacing = 8;
  const maxTextWidth = canvasWidth - marginLeft * 2;
  const wrappedLines = [];

  rawLabels.forEach((lbl, idx) => {
    if (idx === 0) {
      let line = "";
      for (const ch of lbl) {
        const test = line + ch;
        if (ctxHdr.measureText(test).width > maxTextWidth) {
          wrappedLines.push(line);
          line = ch;
        } else line = test;
      }
      if (line) wrappedLines.push(line);
    } else wrappedLines.push(lbl);
  });

  const baseFontSize = 16;
  const labelBlockHeight = baseFontSize + lineSpacing;
  const headerHeight = marginTop + wrappedLines.length * labelBlockHeight + marginTop;
  headerCanvas.height = headerHeight;

  ctxHdr.fillStyle = background;
  ctxHdr.fillRect(0, 0, canvasWidth, headerHeight);
  ctxHdr.fillStyle = background === "black" ? "white" : "black";
  ctxHdr.font = `${baseFontSize}px monospace`;
  wrappedLines.forEach((l, i) => {
    const y = marginTop + i * labelBlockHeight + baseFontSize;
    ctxHdr.fillText(l, marginLeft, y);
  });

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = headerHeight + rows * (thumbHeight + padding) - padding;

  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(headerCanvas, 0, 0);

  ctx.font = `${baseFontSize}px monospace`;
  thumbs.forEach((t, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * (thumbWidth + padding);
    const y = headerHeight + row * (thumbHeight + padding);

    ctx.drawImage(t.image, x, y, thumbWidth, thumbHeight);

    const timeStr = formatTime(t.time);
    const textWidth = ctx.measureText(timeStr).width;
    const boxPad = 4;
    const boxW = textWidth + boxPad * 2;
    const boxH = baseFontSize + 4;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x + thumbWidth - boxW - 5, y + thumbHeight - boxH - 5, boxW, boxH);

    ctx.fillStyle = "white";
    ctx.fillText(timeStr, x + thumbWidth - boxW + boxPad - 5, y + thumbHeight - 10);
  });

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    setCompositeUrl(url);
    setLoading(false);
  }, "image/png");
}
