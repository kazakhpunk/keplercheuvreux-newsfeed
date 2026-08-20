import { describe, it, expect } from 'vitest';
import { toPlainText } from '@/lib/markdown';

describe('toPlainText', () => {
  it('drops heading markers but keeps the heading words', () => {
    expect(toPlainText('## Exciting new year ahead')).toBe('Exciting new year ahead');
  });

  it('unwraps emphasis and strong markers', () => {
    expect(toPlainText('**Aadil Shaikh** is *Head* of Trading')).toBe(
      'Aadil Shaikh is Head of Trading',
    );
  });

  it('keeps link text and drops the target', () => {
    expect(toPlainText('See [Dubai Marathon](https://www.dubaimarathon.org) now')).toBe(
      'See Dubai Marathon now',
    );
  });

  it('removes images entirely', () => {
    expect(toPlainText('![Banner](https://example.com/a.png)\n\nWelcome to 2026.')).toBe(
      'Welcome to 2026.',
    );
  });

  it('flattens list markers and collapses blank lines into a single excerpt line', () => {
    expect(toPlainText('- Hire people\n- Grow revenues\n\n- Build relationships')).toBe(
      'Hire people Grow revenues Build relationships',
    );
  });

  it('strips inline code and blockquote markers', () => {
    expect(toPlainText('> quoted `code` here')).toBe('quoted code here');
  });

  it('returns an empty string for empty input', () => {
    expect(toPlainText('')).toBe('');
  });
});
