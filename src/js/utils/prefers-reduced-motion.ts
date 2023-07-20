const isReducedMotionPreferred = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const PREFERS_REDUCED_MOTION = isReducedMotionPreferred();
