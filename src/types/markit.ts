/**
 * Normalized image coordinate — both x and y are in the range [0, 1]
 * relative to the intrinsic image dimensions.
 * This makes events resolution-independent: the same event renders
 * correctly regardless of screen size or zoom level.
 */
export interface NormalizedPoint {
  x: number; // 0 = left edge, 1 = right edge
  y: number; // 0 = top edge,  1 = bottom edge
}

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

/**
 * The user drew the reference line for calibration.
 * The line endpoints are stored but no scale is computed yet —
 * that happens in CalibrationConfirmedEvent once the user enters
 * the real-world size.
 */
export interface CalibrationLineEvent {
  id: string;
  type: "calibration_line";
  createdAt: string; // ISO timestamp
  createdBy: string; // userId
  start: NormalizedPoint;
  end: NormalizedPoint;
}

/**
 * The user confirmed calibration by entering a real-world measurement.
 * intrinsicScale is in inches-per-intrinsic-pixel and is derived from
 * the reference line length + the user's refInput value.
 * This event is what the canvas uses to compute all measurement distances.
 * If a new CalibrationConfirmedEvent is added later, it supersedes this one —
 * all measurements are recalculated using the newest active calibration.
 */
export interface CalibrationConfirmedEvent {
  id: string;
  type: "calibration_confirmed";
  createdAt: string;
  createdBy: string;
  intrinsicScale: number; // inches per intrinsic pixel
  refInput: string; // the value the user typed, e.g. "4"
  calibrationLineEventId: string; // which CalibrationLineEvent was used
}

/**
 * The user drew a measurement line.
 * Coordinates are stored normalized; distanceText is the human-readable
 * result computed at the time of drawing (using the active calibration).
 * If calibration is later changed, the canvas re-derives the distance
 * from the coords + new scale rather than using this stored distanceText.
 */
export interface MeasurementEvent {
  id: string;
  type: "measurement";
  createdAt: string;
  createdBy: string;
  start: NormalizedPoint;
  end: NormalizedPoint;
  distanceText: string; // e.g. "1ft 2.5in" — display hint, recomputed on recalibration
}

/**
 * A soft-delete of any prior event.
 * We never hard-delete events — that would break the audit trail.
 * Instead, a DeleteEvent marks another event as removed.
 * The canvas derives state by filtering out any event whose ID
 * appears as the targetEventId of a non-deleted DeleteEvent.
 */
export interface DeleteEvent {
  id: string;
  type: "delete";
  createdAt: string;
  createdBy: string;
  targetEventId: string; // the event being removed
}

export type MarkitEvent =
  | CalibrationLineEvent
  | CalibrationConfirmedEvent
  | MeasurementEvent
  | DeleteEvent;

export type MarkitEventType = MarkitEvent["type"];
