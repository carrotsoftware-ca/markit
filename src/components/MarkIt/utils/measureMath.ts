/**
 * Euclidean distance between two points in screen pixels.
 */
export function pixelDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Format a measurement in inches into a human-readable feet + inches string.
 * e.g. 14.5 → "1ft 2.5in", 3.0 → "3.0in"
 *
 * 'worklet' directive: this function is called from useDerivedValue callbacks
 * that run on the Reanimated UI thread, so it must be serialisable as a worklet.
 */
export function formatInches(inches: number): string {
  'worklet';
  const feet = Math.floor(inches / 12);
  const remainingInches = (inches % 12).toFixed(1);
  return feet > 0 ? `${feet}ft ${remainingInches}in` : `${remainingInches}in`;
}

/**
 * Convert screen pixels to real-world inches using a pre-computed scale.
 *
 * @param screenPx     - pixel distance drawn on screen
 * @param scaleAtOne   - inches per screen pixel at zoom level 1× (from calibration)
 * @param zoomLevel    - current zoom level at the time of measurement
 *
 * The zoom correction: when zoomed in 2×, each screen pixel represents half as
 * much image content, so the real distance is half what a naive calculation
 * would give. Dividing by zoomLevel corrects for this.
 *
 * 'worklet' directive: called from useDerivedValue on the Reanimated UI thread.
 */
export function screenPxToInches(
  screenPx: number,
  scaleAtOne: number,
  zoomLevel: number,
): number {
  'worklet';
  return (screenPx / zoomLevel) * scaleAtOne;
}
