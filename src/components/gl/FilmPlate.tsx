import { useFilmPlateGl } from './useFilmPlateGl';

interface FilmPlateProps {
  video: HTMLVideoElement | null;
  animated: boolean;
  onContextChange?: (live: boolean) => void;
}

export function FilmPlate({ video, animated, onContextChange }: FilmPlateProps) {
  const canvasRef = useFilmPlateGl({ video, animated, onContextChange });

  return <canvas ref={canvasRef} className="block w-full h-full" />;
}
