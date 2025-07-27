const formatTime = (seconds) => {
  const rounded = Math.round(seconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

export default formatTime;
