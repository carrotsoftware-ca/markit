
/**
 * The mode of the MarkIt component.
 * - `calibrate`: The user is drawing a line to set the reference scale.
 * - `measure`: The user is drawing measurement lines.
 */
export type MarkitMode = "calibrate" | "measure";

/**
 * A measurement line that has been saved to the session or is pending save.
 * Coordinates are in the image's own pixel space (zoom=1, pan=0).
 */
export interface CommittedLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

/**
 * A line that has been drawn but not yet saved to the session.
 * It includes the `CommittedLine` data for immediate rendering, plus the
 * normalized start/end points needed to persist the event to Firestore.
 */
export interface PendingMeasurement {
  line: CommittedLine;
  normStart: { x: number; y: number };
  normEnd: { x: number; y: number };
}

/**
 * A measurement that has been tapped and is awaiting delete confirmation.
 */
export interface PendingDelete {
  id: string;
  distanceText: string;
}

/**
 * A line drawn on the screen during calibration, used for display purposes.
 * Coordinates are in the image's own pixel space.
 */
export interface CalibrationScreenLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
