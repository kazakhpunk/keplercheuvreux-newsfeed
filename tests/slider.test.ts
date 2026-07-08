import { describe, it, expect } from 'vitest';
import { nextIndex, prevIndex, clampIndex } from '@/lib/slider';

describe('nextIndex', () => {
  it('advances to the next index', () => {
    expect(nextIndex(0, 3)).toBe(1);
  });

  it('wraps around from the last index to the first', () => {
    expect(nextIndex(2, 3)).toBe(0);
  });

  it('returns 0 when there are no items', () => {
    expect(nextIndex(0, 0)).toBe(0);
  });
});

describe('prevIndex', () => {
  it('moves to the previous index', () => {
    expect(prevIndex(1, 3)).toBe(0);
  });

  it('wraps around from the first index to the last', () => {
    expect(prevIndex(0, 3)).toBe(2);
  });

  it('returns 0 when there are no items', () => {
    expect(prevIndex(0, 0)).toBe(0);
  });
});

describe('clampIndex', () => {
  it('clamps a negative index to 0', () => {
    expect(clampIndex(-1, 3)).toBe(0);
  });

  it('clamps an index past the end to the last item', () => {
    expect(clampIndex(5, 3)).toBe(2);
  });

  it('returns 0 when there are no items', () => {
    expect(clampIndex(0, 0)).toBe(0);
  });
});
