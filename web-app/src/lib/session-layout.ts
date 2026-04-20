const MIN_SET_COUNT = 1;
const MAX_SET_COUNT = 5;

export function getSafeSetCount(setCount: number) {
  if (!Number.isFinite(setCount)) {
    return MIN_SET_COUNT;
  }

  return Math.min(MAX_SET_COUNT, Math.max(MIN_SET_COUNT, Math.trunc(setCount)));
}

export function getSetGridTemplate(setCount: number) {
  return `repeat(${getSafeSetCount(setCount)}, minmax(0, 1fr))`;
}
