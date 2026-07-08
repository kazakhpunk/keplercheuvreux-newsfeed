export function nextIndex(current: number, length: number): number {
  if (length === 0) return 0;
  return (current + 1) % length;
}

export function prevIndex(current: number, length: number): number {
  if (length === 0) return 0;
  return (current - 1 + length) % length;
}

export function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
}
