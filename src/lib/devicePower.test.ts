import { describe, expect, it } from 'vitest';
import { isLowPower } from './devicePower';

describe('isLowPower', () => {
  it('treats unknown hardware as capable', () => {
    expect(isLowPower({})).toBe(false);
  });
  it('flags few cores, little memory and data saving', () => {
    expect(isLowPower({ hardwareConcurrency: 2 })).toBe(true);
    expect(isLowPower({ deviceMemory: 1 })).toBe(true);
    expect(isLowPower({ connection: { saveData: true } })).toBe(true);
  });
  it('leaves ordinary devices alone', () => {
    expect(isLowPower({ hardwareConcurrency: 8, deviceMemory: 8 })).toBe(false);
  });
});
