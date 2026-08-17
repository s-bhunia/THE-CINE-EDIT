export function toTimecode(totalFrames: number, fps = 24) {
  const frameCount = Math.max(0, Math.floor(totalFrames));
  const hours = Math.floor(frameCount / (3600 * fps));
  const minutes = Math.floor((frameCount % (3600 * fps)) / (60 * fps));
  const seconds = Math.floor((frameCount % (60 * fps)) / fps);
  const frames = frameCount % fps;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}

export function fromScrollProgress(progress: number, durationSeconds: number, fps = 24) {
  const clamped = Math.min(1, Math.max(0, progress));
  const totalFrames = durationSeconds * fps;
  return toTimecode(clamped * totalFrames, fps);
}
