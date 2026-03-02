/**
 * Euclidean distance between two points in screen pixels.
 */
export function pixelDistance(x1: number, y1: number, x2: number, y2: number): number {
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
  "worklet";
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
export function screenPxToInches(screenPx: number, scaleAtOne: number, zoomLevel: number): number {
  "worklet";
  return (screenPx / zoomLevel) * scaleAtOne;
}

/**
 * Convert intrinsic image pixels to real-world inches using the stored
 * intrinsic scale (inches per intrinsic pixel).
 *
 * This is platform-independent — it does not depend on PixelRatio, screen
 * resolution, canvas size, or zoom level. Use this for all saved measurements.
 *
 * @param intrinsicPx    - Euclidean pixel distance in the original image space
 * @param intrinsicScale - inches per intrinsic pixel (from calibration, stored in Firestore)
 */
export function intrinsicPxToInches(intrinsicPx: number, intrinsicScale: number): number {
  return intrinsicPx * intrinsicScale;
}

/**
 * Compute Euclidean distance in intrinsic image pixels from two normalized [0,1] coords.
 *
 * @param nx1 / ny1  - normalized start point
 * @param nx2 / ny2  - normalized end point
 * @param imgW       - intrinsic image width in pixels  (image.width())
 * @param imgH       - intrinsic image height in pixels (image.height())
 */
export function normalizedToIntrinsicPx(
  nx1: number,
  ny1: number,
  nx2: number,
  ny2: number,
  imgW: number,
  imgH: number,
): number {
  const dx = (nx2 - nx1) * imgW;
  const dy = (ny2 - ny1) * imgH;
  return Math.sqrt(dx * dx + dy * dy);
}
