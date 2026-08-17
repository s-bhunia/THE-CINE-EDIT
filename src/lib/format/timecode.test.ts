import { describe, it, expect } from 'vitest';
import { toTimecode, fromScrollProgress } from './timecode';

describe('toTimecode at 24fps (non-drop, no drop-frame compensation needed at whole frame rates)', () => {
  it('formats zero as 00:00:00:00', () => {
    expect(toTimecode(0)).toBe('00:00:00:00');
  });

  it('rolls seconds over at the fps boundary', () => {
    expect(toTimecode(24)).toBe('00:00:01:00');
  });

  it('rolls minutes over at 60 seconds', () => {
    expect(toTimecode(24 * 60)).toBe('00:01:00:00');
  });

  it('rolls hours over at 60 minutes', () => {
    expect(toTimecode(24 * 60 * 60)).toBe('01:00:00:00');
  });

  it('clamps negative frame counts to zero', () => {
    expect(toTimecode(-10)).toBe('00:00:00:00');
  });
});

describe('fromScrollProgress', () => {
  it('maps progress 0 to the start of the duration', () => {
    expect(fromScrollProgress(0, 10, 24)).toBe('00:00:00:00');
  });

  it('maps progress 1 to the end of the duration', () => {
    expect(fromScrollProgress(1, 10, 24)).toBe('00:00:10:00');
  });

  it('maps progress 0.5 to the midpoint of the duration', () => {
    expect(fromScrollProgress(0.5, 10, 24)).toBe('00:00:05:00');
  });

  it('clamps out-of-range progress to [0, 1]', () => {
    expect(fromScrollProgress(-1, 10, 24)).toBe('00:00:00:00');
    expect(fromScrollProgress(2, 10, 24)).toBe('00:00:10:00');
  });
});
