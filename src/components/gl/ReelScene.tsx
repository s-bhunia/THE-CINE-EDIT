import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  BoxGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from 'three';

const FLANGE_RADIUS = 1;
const FLANGE_RIM_THICKNESS = 0.045;
const FLANGE_SEPARATION = 0.17;
const HUB_RADIUS = 0.2;
const SPOKE_COUNT = 6;
const SPOKE_INNER_RADIUS = 0.26;
const WOUND_FILM_RADIUS = 0.78;
const SCROLL_TURNS = 3;
const RESTING_TILT = 0.32;
const MAX_DPR = 1.5;

function buildFlange(alloy: MeshStandardMaterial, z: number) {
  const flange = new Group();
  flange.position.z = z;

  flange.add(
    new Mesh(new TorusGeometry(FLANGE_RADIUS, FLANGE_RIM_THICKNESS, 10, 48), alloy),
  );
  flange.add(new Mesh(new TorusGeometry(SPOKE_INNER_RADIUS, 0.03, 8, 32), alloy));

  const spokeLength = FLANGE_RADIUS - FLANGE_RIM_THICKNESS - SPOKE_INNER_RADIUS;
  const spokeMidpoint = SPOKE_INNER_RADIUS + spokeLength / 2;
  const spokeGeometry = new BoxGeometry(spokeLength, 0.055, 0.035);

  for (let index = 0; index < SPOKE_COUNT; index += 1) {
    const angle = (index / SPOKE_COUNT) * Math.PI * 2;
    const spoke = new Mesh(spokeGeometry, alloy);
    spoke.position.set(
      Math.cos(angle) * spokeMidpoint,
      Math.sin(angle) * spokeMidpoint,
      0,
    );
    spoke.rotation.z = angle;
    flange.add(spoke);
  }

  return flange;
}

function buildReel() {
  const reel = new Group();

  const alloy = new MeshStandardMaterial({
    color: new Color('#948C81'),
    metalness: 0.95,
    roughness: 0.28,
  });
  const hubAlloy = new MeshStandardMaterial({
    color: new Color('#E9E2D6'),
    metalness: 0.9,
    roughness: 0.22,
  });
  const emulsion = new MeshStandardMaterial({
    color: new Color('#131110'),
    metalness: 0.35,
    roughness: 0.62,
    side: DoubleSide,
  });

  reel.add(buildFlange(alloy, FLANGE_SEPARATION));
  reel.add(buildFlange(alloy, -FLANGE_SEPARATION));

  const hub = new Mesh(
    new CylinderGeometry(HUB_RADIUS, HUB_RADIUS, FLANGE_SEPARATION * 2, 24),
    hubAlloy,
  );
  hub.rotation.x = Math.PI / 2;
  reel.add(hub);

  const film = new Mesh(
    new CylinderGeometry(
      WOUND_FILM_RADIUS,
      WOUND_FILM_RADIUS,
      FLANGE_SEPARATION * 1.85,
      48,
      1,
      true,
    ),
    emulsion,
  );
  film.rotation.x = Math.PI / 2;
  reel.add(film);

  return reel;
}

export default function ReelScene({ allowMotion }: { allowMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR));
    renderer.setClearAlpha(0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 3.6;

    scene.add(new AmbientLight(new Color('#948C81'), 0.35));

    const key = new DirectionalLight(new Color('#F2A65A'), 2.4);
    key.position.set(2.4, 2.8, 3.2);
    scene.add(key);

    const rim = new DirectionalLight(new Color('#24484C'), 1.1);
    rim.position.set(-3, -1.4, -2);
    scene.add(rim);

    const safelight = new PointLight(new Color('#D4703A'), 2.2, 7);
    safelight.position.set(0, 0, 2.6);
    scene.add(safelight);

    const reel = buildReel();
    reel.rotation.x = RESTING_TILT;
    scene.add(reel);

    let frame = 0;
    let queued = false;

    const draw = (progress: number) => {
      reel.rotation.z = progress * Math.PI * 2 * SCROLL_TURNS;
      reel.rotation.y = -0.42 + progress * 0.24;
      renderer.render(scene, camera);
      queued = false;
    };

    const readProgress = () => {
      const scrollable = document.body.scrollHeight - window.innerHeight;
      return scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    };

    const request = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(() => draw(allowMotion ? readProgress() : 0.5));
    };

    const resize = () => {
      const { clientWidth, clientHeight } = canvas;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      request();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    if (allowMotion) window.addEventListener('scroll', request, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', request);
      scene.traverse((node) => {
        if (node instanceof Mesh) {
          node.geometry.dispose();
          if (node.material instanceof MeshStandardMaterial) node.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [allowMotion]);

  return <canvas ref={canvasRef} className="w-full h-full block" aria-hidden="true" />;
}
