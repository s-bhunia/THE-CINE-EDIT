import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const VERTEX_SHADER_SOURCE = `#version 300 es
in vec2 aPosition;

uniform float uTime;
uniform vec2 uResolution;

out vec2 vUv;

const float TAU = 6.28318530718;
const float GATE_WEAVE_HZ = 2.0;
const vec2 GATE_WEAVE_PIXELS = vec2(0.55, 0.3);

void main() {
  vUv = aPosition * 0.5 + 0.5;
  float phase = uTime * TAU * GATE_WEAVE_HZ;
  vec2 weavePixels = vec2(sin(phase), sin(phase * 1.37)) * GATE_WEAVE_PIXELS;
  gl_Position = vec4(aPosition + weavePixels * 2.0 / uResolution, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform sampler2D uTexture;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCoverScale;
uniform vec3 uHalationColor;

in vec2 vUv;
out vec4 outColor;

const vec3 LUMA_WEIGHTS = vec3(0.299, 0.587, 0.114);
const float BARREL_STRENGTH = 0.05;
const float ABERRATION_BASE = 0.0008;
const float ABERRATION_RADIAL = 0.001;
const float HALATION_THRESHOLD = 0.8;
const float HALATION_MIX = 2.0;
const float HALATION_BLOOM_GAIN = 1.4;
const float HALATION_BLOOM_PIXELS = 3.0;
const float GRAIN_STRENGTH = 0.08;
const float GRAIN_SCROLL = 91.7;
const float GRAIN_CYCLE = 10.0;
const float VIGNETTE_INNER = 1.2;
const float VIGNETTE_OUTER = 0.4;

float hash(vec2 seed) {
  return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453123);
}

float luma(vec3 color) {
  return dot(color, LUMA_WEIGHTS);
}

vec3 sampleAberrated(vec2 uv, float radiusSquared) {
  float offset = ABERRATION_BASE + radiusSquared * ABERRATION_RADIAL;
  return vec3(
    texture(uTexture, uv + vec2(offset, 0.0)).r,
    texture(uTexture, uv).g,
    texture(uTexture, uv - vec2(offset, 0.0)).b
  );
}

vec3 gatherHalation(vec2 uv) {
  vec2 tapStride = uCoverScale * HALATION_BLOOM_PIXELS / uResolution;
  vec3 gathered = vec3(0.0);
  float weightSum = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 tapOffset = vec2(float(x), float(y));
      float weight = 1.0 / (1.0 + dot(tapOffset, tapOffset));
      vec3 tap = texture(uTexture, uv + tapOffset * tapStride).rgb;
      gathered += tap * max(luma(tap) - HALATION_THRESHOLD, 0.0) * weight;
      weightSum += weight;
    }
  }
  return gathered / weightSum;
}

void main() {
  vec2 centered = vUv - 0.5;
  float radiusSquared = dot(centered, centered);
  vec2 plateUv = centered * (1.0 + radiusSquared * BARREL_STRENGTH) * uCoverScale + 0.5;

  vec3 color = sampleAberrated(plateUv, radiusSquared);

  float overexposed = clamp((luma(color) - HALATION_THRESHOLD) * HALATION_MIX, 0.0, 1.0);
  color = mix(color, uHalationColor, overexposed);
  color += gatherHalation(plateUv) * uHalationColor * HALATION_BLOOM_GAIN;

  float grainSeed = mod(uTime, GRAIN_CYCLE) * GRAIN_SCROLL;
  color += (hash(vUv * uResolution + grainSeed) - 0.5) * GRAIN_STRENGTH;

  color *= smoothstep(VIGNETTE_INNER, VIGNETTE_OUTER, length(centered * 2.0));

  outColor = vec4(color, 1.0);
}
`;

const QUAD_VERTICES = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

const QUAD_VERTEX_COUNT = 6;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MAX_FRAME_DELTA_SECONDS = 0.1;
const HALATION_R = 242 / 255;
const HALATION_G = 166 / 255;
const HALATION_B = 90 / 255;
const VIDEO_READY_STATE = 2;

const VIDEO_WAKE_EVENTS = [
  'loadeddata',
  'canplay',
  'play',
  'playing',
  'pause',
  'seeked',
  'timeupdate',
] as const;

interface PlateResources {
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  program: WebGLProgram;
  vertexArray: WebGLVertexArrayObject;
  vertexBuffer: WebGLBuffer;
  texture: WebGLTexture;
  timeLocation: WebGLUniformLocation;
  resolutionLocation: WebGLUniformLocation;
  coverScaleLocation: WebGLUniformLocation;
}

interface FilmPlateGlOptions {
  video: HTMLVideoElement | null;
  animated: boolean;
  onContextChange?: (live: boolean) => void;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    console.warn('FilmPlate: could not allocate shader');
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('FilmPlate: shader compilation failed', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createResources(gl: WebGL2RenderingContext): PlateResources | null {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  if (!vertexShader) return null;

  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  if (!fragmentShader) {
    gl.deleteShader(vertexShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    console.warn('FilmPlate: could not allocate program');
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const discard = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  };

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('FilmPlate: program link failed', gl.getProgramInfoLog(program));
    discard();
    return null;
  }

  const timeLocation = gl.getUniformLocation(program, 'uTime');
  const resolutionLocation = gl.getUniformLocation(program, 'uResolution');
  const coverScaleLocation = gl.getUniformLocation(program, 'uCoverScale');
  const textureLocation = gl.getUniformLocation(program, 'uTexture');
  const halationLocation = gl.getUniformLocation(program, 'uHalationColor');
  const positionLocation = gl.getAttribLocation(program, 'aPosition');

  if (
    !timeLocation ||
    !resolutionLocation ||
    !coverScaleLocation ||
    !textureLocation ||
    !halationLocation ||
    positionLocation < 0
  ) {
    console.warn('FilmPlate: shader interface did not resolve');
    discard();
    return null;
  }

  const vertexBuffer = gl.createBuffer();
  const vertexArray = gl.createVertexArray();
  const texture = gl.createTexture();

  if (!vertexBuffer || !vertexArray || !texture) {
    console.warn('FilmPlate: could not allocate geometry or texture');
    if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
    if (vertexArray) gl.deleteVertexArray(vertexArray);
    if (texture) gl.deleteTexture(texture);
    discard();
    return null;
  }

  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, QUAD_VERTICES, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.useProgram(program);
  gl.uniform1i(textureLocation, 0);
  gl.uniform3f(halationLocation, HALATION_R, HALATION_G, HALATION_B);
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  return {
    vertexShader,
    fragmentShader,
    program,
    vertexArray,
    vertexBuffer,
    texture,
    timeLocation,
    resolutionLocation,
    coverScaleLocation,
  };
}

function destroyResources(gl: WebGL2RenderingContext, resources: PlateResources) {
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.useProgram(null);
  gl.deleteTexture(resources.texture);
  gl.deleteBuffer(resources.vertexBuffer);
  gl.deleteVertexArray(resources.vertexArray);
  gl.detachShader(resources.program, resources.vertexShader);
  gl.detachShader(resources.program, resources.fragmentShader);
  gl.deleteShader(resources.vertexShader);
  gl.deleteShader(resources.fragmentShader);
  gl.deleteProgram(resources.program);
}

export function useFilmPlateGl({
  video,
  animated,
  onContextChange,
}: FilmPlateGlOptions): RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reportRef = useRef(onContextChange);

  useEffect(() => {
    reportRef.current = onContextChange;
  }, [onContextChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    let reported: boolean | null = null;
    const report = (live: boolean) => {
      if (reported === live) return;
      reported = live;
      reportRef.current?.(live);
    };

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('FilmPlate: WebGL2 is unavailable');
      report(false);
      return;
    }

    let resources = createResources(gl);
    if (!resources) {
      report(false);
      return;
    }

    let frameHandle: number | null = null;
    let lastTimestamp: number | null = null;
    let clock = 0;
    let drawingWidth = 0;
    let drawingHeight = 0;
    let uploadedWidth = 0;
    let uploadedHeight = 0;
    let staticFrameDrawn = false;

    const syncSize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
      const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      if (width === drawingWidth && height === drawingHeight) return;
      drawingWidth = width;
      drawingHeight = height;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      staticFrameDrawn = false;
    };

    const uploadFrame = (active: PlateResources): boolean => {
      if (video.readyState < VIDEO_READY_STATE) return false;
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width === 0 || height === 0) return false;

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, active.texture);
      if (width !== uploadedWidth || height !== uploadedHeight) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        uploadedWidth = width;
        uploadedHeight = height;
      } else {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, video);
      }
      return true;
    };

    const drawFrame = (): boolean => {
      const active = resources;
      if (!active || gl.isContextLost()) return false;

      syncSize();
      if (!uploadFrame(active)) return false;

      const canvasAspect = drawingWidth / drawingHeight;
      const videoAspect = uploadedWidth / uploadedHeight;
      const coverX = canvasAspect > videoAspect ? 1 : canvasAspect / videoAspect;
      const coverY = canvasAspect > videoAspect ? videoAspect / canvasAspect : 1;

      gl.useProgram(active.program);
      gl.uniform2f(active.resolutionLocation, drawingWidth, drawingHeight);
      gl.uniform2f(active.coverScaleLocation, coverX, coverY);
      gl.uniform1f(active.timeLocation, clock);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(active.vertexArray);
      gl.drawArrays(gl.TRIANGLES, 0, QUAD_VERTEX_COUNT);
      gl.bindVertexArray(null);
      return true;
    };

    const stopLoop = () => {
      if (frameHandle !== null) {
        cancelAnimationFrame(frameHandle);
        frameHandle = null;
      }
      lastTimestamp = null;
    };

    const canKeepLooping = () =>
      animated && document.visibilityState === 'visible' && !video.paused && !video.ended;

    const step = (timestamp: number) => {
      frameHandle = null;
      if (animated && lastTimestamp !== null) {
        const delta = (timestamp - lastTimestamp) / 1000;
        clock += Math.min(Math.max(delta, 0), MAX_FRAME_DELTA_SECONDS);
      }
      lastTimestamp = timestamp;

      if (drawFrame()) {
        staticFrameDrawn = true;
        report(true);
      }

      if (canKeepLooping()) {
        frameHandle = requestAnimationFrame(step);
      } else {
        lastTimestamp = null;
      }
    };

    const requestDraw = () => {
      if (frameHandle !== null) return;
      if (document.visibilityState !== 'visible') return;
      if (!animated && staticFrameDrawn) return;
      frameHandle = requestAnimationFrame(step);
    };

    const handleVideoActivity = () => requestDraw();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestDraw();
      } else {
        stopLoop();
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      stopLoop();
      resources = null;
      uploadedWidth = 0;
      uploadedHeight = 0;
      staticFrameDrawn = false;
      report(false);
    };

    const handleContextRestored = () => {
      resources = createResources(gl);
      if (!resources) {
        report(false);
        return;
      }
      drawingWidth = 0;
      drawingHeight = 0;
      requestDraw();
    };

    const observer = new ResizeObserver(() => {
      syncSize();
      requestDraw();
    });

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    for (const eventName of VIDEO_WAKE_EVENTS) {
      video.addEventListener(eventName, handleVideoActivity);
    }
    observer.observe(canvas);

    syncSize();
    requestDraw();

    return () => {
      observer.disconnect();
      stopLoop();
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      for (const eventName of VIDEO_WAKE_EVENTS) {
        video.removeEventListener(eventName, handleVideoActivity);
      }
      if (resources) {
        destroyResources(gl, resources);
        resources = null;
      }
      report(false);
    };
  }, [video, animated]);

  return canvasRef;
}
