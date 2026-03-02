/**
 * Focal length utilities for perspective-aware measurement correction.
 *
 * Background
 * ----------
 * A camera's "35mm equivalent focal length" (focalLengthIn35mmFilm in EXIF) is
 * the most reliable way to compute the horizontal field of view (HFOV) because
 * it's already normalised to a standard 36mm × 24mm sensor — no device-specific
 * sensor size lookup is needed.
 *
 * The formula for HFOV from 35mm-equivalent focal length f (in mm) is:
 *
 *   HFOV = 2 × arctan(18 / f)
 *
 * where 18mm = half the width of a full-frame 35mm sensor.
 *
 * Why this matters for MarkIt
 * ----------------------------
 * The current system uses a user-drawn calibration line to compute
 * "inches per screen pixel". This is accurate as long as both the calibration
 * reference and the measurement target are on the same plane at the same
 * depth. When they are not, the pixel-per-inch ratio differs because of
 * perspective foreshortening.
 *
 * Knowing the HFOV allows us to:
 * 1. Warn the user if their calibration line is too short / at a bad angle.
 * 2. In a future phase, accept a known camera distance and compute a
 *    depth-aware scale without requiring calibration at all.
 */

/** Full-frame 35mm sensor half-width in mm */
const HALF_FRAME_WIDTH_MM = 18;

/**
 * Compute horizontal field of view in degrees from a 35mm-equivalent focal length.
 *
 * @param focalLengthIn35mm - EXIF FocalLengthIn35mmFilm (mm)
 * @returns HFOV in degrees, or null if input is invalid
 */
export function hfovFromFocalLength35mm(focalLengthIn35mm: number | undefined): number | null {
  if (!focalLengthIn35mm || focalLengthIn35mm <= 0) return null;
  const radians = 2 * Math.atan(HALF_FRAME_WIDTH_MM / focalLengthIn35mm);
  return radians * (180 / Math.PI);
}

/**
 * Given a calibration scale (inches/pixel at zoom 1×) and the HFOV of the
 * camera, estimate the approximate distance from camera to the calibration
 * plane in inches.
 *
 * Formula: depth = (imageWidthPx × calibrationInchesPerPx) / (2 × tan(HFOV/2))
 *
 * This is the distance at which an object spanning the full image width would
 * be `imageWidthPx × calibrationInchesPerPx` inches wide — i.e. the depth
 * implied by the calibration line.
 *
 * @param scaleInchesPerPx   - calibration scale (inches per screen pixel at zoom 1×)
 * @param imageWidthPx       - intrinsic image width in pixels
 * @param hfovDegrees        - horizontal field of view in degrees
 * @returns estimated depth in inches, or null if any input is missing/invalid
 */
export function estimateDepthFromCalibration(
  scaleInchesPerPx: number,
  imageWidthPx: number,
  hfovDegrees: number,
): number | null {
  if (scaleInchesPerPx <= 0 || imageWidthPx <= 0 || hfovDegrees <= 0) return null;
  const totalWidthInches = imageWidthPx * scaleInchesPerPx;
  const halfHfovRad = (hfovDegrees / 2) * (Math.PI / 180);
  return totalWidthInches / (2 * Math.tan(halfHfovRad));
}

/**
 * Convenience: extract and parse EXIF focal length fields from a raw EXIF record.
 */
export function parseFocalLengthExif(exif: Record<string, any> | undefined): {
  focalLength: number | null;
  focalLengthIn35mm: number | null;
} {
  if (!exif) return { focalLength: null, focalLengthIn35mm: null };
  return {
    focalLength: exif.focalLength ?? exif.FocalLength ?? null,
    focalLengthIn35mm:
      exif.focalLengthIn35mmFilm ?? exif.FocalLengthIn35mmFilm ?? null,
  };
}
