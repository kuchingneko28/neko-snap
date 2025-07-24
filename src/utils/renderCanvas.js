import formatTime from "./formatTime";

const renderCanvas = ({ thumbs, duration, width, height, cols, rows, thumbWidth, background, file, setCompositeUrl, setLoading }) => {
  const padding = 4;
  const thumbHeight = (height / width) * thumbWidth;

  const canvas = document.createElement("canvas");
  canvas.width = cols * (thumbWidth + padding) - padding;

  const fontScale = canvas.width / 1200;
  const baseFontSize = Math.min(48, Math.max(14, Math.floor(20 * fontScale)));
  const marginTop = 16;
  const marginLeft = 16;
  const marginBottom = 16;
  const lineSpacing = 8;
  const labelBlockHeight = baseFontSize + lineSpacing;

  const ctx = canvas.getContext("2d");
  ctx.font = `${baseFontSize}px monospace`;

  const rawLabels = [`Filename: ${file.name}`, `File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB`, `Duration: ${formatTime(duration)}`, `Dimensions: ${width}x${height}`];

  const maxTextWidth = canvas.width - marginLeft * 2;
  const wrappedLines = [];

  rawLabels.forEach((label, index) => {
    if (index === 0) {
      let currentLine = "";
      for (const char of label) {
        const testLine = currentLine + char;
        if (ctx.measureText(testLine).width > maxTextWidth) {
          wrappedLines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    } else {
      wrappedLines.push(label);
    }
  });

  const textLines = wrappedLines.length;
  const headerHeight = marginTop + textLines * labelBlockHeight + marginBottom;

  canvas.height = rows * (thumbHeight + padding) - padding + headerHeight;

  const isDarkBg = background === "black";
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = isDarkBg ? "white" : "black";
  ctx.font = `${baseFontSize}px monospace`;

  wrappedLines.forEach((line, i) => {
    const y = marginTop + i * labelBlockHeight + baseFontSize;
    ctx.fillText(line, marginLeft, y);
  });

  thumbs.forEach((thumb, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = col * (thumbWidth + padding);
    const y = row * (thumbHeight + padding) + headerHeight;

    ctx.drawImage(thumb.image, x, y, thumbWidth, thumbHeight);

    const timeStr = formatTime(thumb.time);
    ctx.font = `${baseFontSize}px monospace`;
    const textWidth = ctx.measureText(timeStr).width;
    const boxPadding = 4;
    const boxWidth = textWidth + boxPadding * 2;
    const boxHeight = baseFontSize + 4;

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x + thumbWidth - boxWidth - 5, y + thumbHeight - boxHeight - 5, boxWidth, boxHeight);

    ctx.fillStyle = "white";
    ctx.fillText(timeStr, x + thumbWidth - boxWidth + boxPadding - 5, y + thumbHeight - 10);
  });

  setCompositeUrl(canvas.toDataURL("image/png"));
  setLoading(false);
};

export default renderCanvas;
