export interface PuckPosition {
  x: number;
  y: number;
}

export interface WheelState {
  lift: PuckPosition;
  gamma: PuckPosition;
  gain: PuckPosition;
}

export interface ChannelTransfer {
  amplitude: number;
  exponent: number;
  offset: number;
}

export interface GradeTransfer {
  r: ChannelTransfer;
  g: ChannelTransfer;
  b: ChannelTransfer;
}

export type WheelId = keyof WheelState;

export const WHEEL_IDS: readonly WheelId[] = ['lift', 'gamma', 'gain'];

export const NEUTRAL_PUCK: PuckPosition = { x: 0, y: 0 };

export const NEUTRAL_WHEELS: WheelState = {
  lift: NEUTRAL_PUCK,
  gamma: NEUTRAL_PUCK,
  gain: NEUTRAL_PUCK,
};

const LIFT_RANGE = 0.14;
const GAMMA_RANGE = 0.55;
const GAIN_RANGE = 0.45;

const CHANNEL_ANGLES = { r: 90, g: 210, b: 330 } as const;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function clampPuck(puck: PuckPosition): PuckPosition {
  const radius = Math.hypot(puck.x, puck.y);
  if (radius <= 1) return puck;
  return { x: puck.x / radius, y: puck.y / radius };
}

function channelWeight(puck: PuckPosition, channel: keyof typeof CHANNEL_ANGLES): number {
  const clamped = clampPuck(puck);
  const radius = Math.hypot(clamped.x, clamped.y);
  if (radius === 0) return 0;
  const angle = Math.atan2(clamped.y, clamped.x);
  return radius * Math.cos(angle - toRadians(CHANNEL_ANGLES[channel]));
}

export function isNeutral(wheels: WheelState): boolean {
  return WHEEL_IDS.every((id) => wheels[id].x === 0 && wheels[id].y === 0);
}

export function toTransfer(wheels: WheelState): GradeTransfer {
  const build = (channel: keyof typeof CHANNEL_ANGLES): ChannelTransfer => ({
    amplitude: 1 + channelWeight(wheels.gain, channel) * GAIN_RANGE,
    exponent: 1 / (1 + channelWeight(wheels.gamma, channel) * GAMMA_RANGE),
    offset: channelWeight(wheels.lift, channel) * LIFT_RANGE,
  });

  return { r: build('r'), g: build('g'), b: build('b') };
}

function applyChannel(value: number, transfer: ChannelTransfer): number {
  const shaped =
    transfer.amplitude * Math.pow(value, transfer.exponent) + transfer.offset;
  return Math.min(1, Math.max(0, shaped));
}

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) return null;
  const int = Number.parseInt(match[1], 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function toHex(r: number, g: number, b: number): string {
  const channel = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

export function gradeHex(hex: string, transfer: GradeTransfer): string {
  const parsed = parseHex(hex);
  if (!parsed) return hex;
  const [r, g, b] = parsed;
  return toHex(
    applyChannel(r, transfer.r),
    applyChannel(g, transfer.g),
    applyChannel(b, transfer.b),
  );
}
