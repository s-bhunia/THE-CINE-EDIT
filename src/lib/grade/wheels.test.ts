import { describe, expect, it } from 'vitest';
import {
  NEUTRAL_WHEELS,
  gradeHex,
  isNeutral,
  toTransfer,
  type WheelState,
} from './wheels';

const withPuck = (partial: Partial<WheelState>): WheelState => ({
  ...NEUTRAL_WHEELS,
  ...partial,
});

describe('grade wheels', () => {
  it('reports the untouched wheel set as neutral', () => {
    expect(isNeutral(NEUTRAL_WHEELS)).toBe(true);
    expect(isNeutral(withPuck({ gain: { x: 0.4, y: 0 } }))).toBe(false);
  });

  it('produces an identity transfer at neutral', () => {
    const transfer = toTransfer(NEUTRAL_WHEELS);
    for (const channel of ['r', 'g', 'b'] as const) {
      expect(transfer[channel].amplitude).toBeCloseTo(1);
      expect(transfer[channel].exponent).toBeCloseTo(1);
      expect(transfer[channel].offset).toBeCloseTo(0);
    }
  });

  it('leaves colours untouched at neutral', () => {
    const transfer = toTransfer(NEUTRAL_WHEELS);
    expect(gradeHex('#0a0908', transfer)).toBe('#0a0908');
    expect(gradeHex('#e9e2d6', transfer)).toBe('#e9e2d6');
  });

  it('raises gain toward red when the gain puck moves to the red axis', () => {
    const transfer = toTransfer(withPuck({ gain: { x: 0, y: 1 } }));
    expect(transfer.r.amplitude).toBeGreaterThan(1);
    expect(transfer.g.amplitude).toBeLessThan(1);
    expect(transfer.b.amplitude).toBeLessThan(1);
  });

  it('lifts blacks off zero when the lift puck leaves centre', () => {
    const neutralBlack = gradeHex('#000000', toTransfer(NEUTRAL_WHEELS));
    const liftedBlack = gradeHex(
      '#000000',
      toTransfer(withPuck({ lift: { x: 0, y: 1 } })),
    );
    expect(neutralBlack).toBe('#000000');
    expect(liftedBlack).not.toBe('#000000');
  });

  it('clamps a puck dragged beyond the disc to the rim', () => {
    const atRim = toTransfer(withPuck({ gain: { x: 0, y: 1 } }));
    const beyondRim = toTransfer(withPuck({ gain: { x: 0, y: 4 } }));
    expect(beyondRim.r.amplitude).toBeCloseTo(atRim.r.amplitude);
  });

  it('keeps graded channels inside the representable range', () => {
    const extreme = toTransfer(withPuck({ gain: { x: 0, y: 1 }, lift: { x: 0, y: 1 } }));
    expect(gradeHex('#ffffff', extreme)).toMatch(/^#[0-9a-f]{6}$/);
    expect(gradeHex('#000000', extreme)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('returns malformed colour strings unchanged', () => {
    const transfer = toTransfer(withPuck({ gain: { x: 0, y: 1 } }));
    expect(gradeHex('not-a-colour', transfer)).toBe('not-a-colour');
  });
});
