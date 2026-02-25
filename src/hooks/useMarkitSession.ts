import { useAuth } from "@/src/context/AuthContext";
import { getFirestore } from "@/src/services/firebase";
import { addMarkitEvent, watchMarkitEvents } from "@/src/services/markit";
import {
  CalibrationConfirmedEvent,
  CalibrationLineEvent,
  MarkitEvent,
  MeasurementEvent,
} from "@/src/types";
import { useEffect, useMemo, useState } from "react";

/**
 * The derived canvas state — computed by replaying the event log.
 * This is what the MarkIt component renders.
 */
export interface MarkitSessionState {
  /** The most recent active calibration, or null if not yet calibrated */
  activeCalibration: CalibrationConfirmedEvent | null;

  /** The reference line used by the active calibration */
  activeCalibrationLine: CalibrationLineEvent | null;

  /** All live (non-deleted) measurement lines */
  measurements: MeasurementEvent[];

  /** Write a new event to Firestore. No-op if canEdit is false. */
  addEvent: (
    event: Omit<MarkitEvent, "id" | "createdAt" | "createdBy">,
  ) => Promise<void>;

  /** Soft-delete all live events, effectively resetting the canvas. */
  clearEvents: () => Promise<void>;

  /** False once the file has been exported — prevents further edits */
  canEdit: boolean;

  /** True while the initial event load is in flight */
  loading: boolean;
}

/**
 * Connects a MarkIt canvas session to its Firestore event log.
 *
 * @param projectId  - the Firestore project document ID
 * @param fileId     - the Firestore file document ID (within the project's files subcollection)
 * @param canEdit    - pass false if the file's markitStatus is "exported"
 */
export function useMarkitSession(
  projectId: string,
  fileId: string,
  canEdit: boolean = true,
): MarkitSessionState {
  const { user } = useAuth();
  const [events, setEvents] = useState<MarkitEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to the event log for this file
  useEffect(() => {
    const unsubscribe = watchMarkitEvents(projectId, fileId, (incoming) => {
      setEvents(incoming);
      setLoading(false);
    });
    return unsubscribe;
  }, [projectId, fileId]);

  // Derive canvas state from the event log.
  // This runs every time events changes (i.e. on every Firestore update).
  const derived = useMemo(() => {
    // Step 1: collect all event IDs that have been soft-deleted
    const deletedIds = new Set<string>();
    for (const e of events) {
      if (e.type === "delete") {
        deletedIds.add(e.targetEventId);
      }
    }

    // Step 2: filter out deleted events (and the delete events themselves —
    // they are bookkeeping only, not rendered)
    const live = events.filter(
      (e) => !deletedIds.has(e.id) && e.type !== "delete",
    );

    // Step 3: find the latest calibration_confirmed event.
    // "Latest" = last in createdAt order, which is how the snapshot is ordered.
    const calibrations = live.filter(
      (e): e is CalibrationConfirmedEvent => e.type === "calibration_confirmed",
    );
    const activeCalibration = calibrations.at(-1) ?? null;

    // Step 4: find the calibration_line that the active calibration references
    const activeCalibrationLine = activeCalibration
      ? (live.find(
          (e): e is CalibrationLineEvent =>
            e.type === "calibration_line" &&
            e.id === activeCalibration.calibrationLineEventId,
        ) ?? null)
      : null;

    // Step 5: all live measurements
    const measurements = live.filter(
      (e): e is MeasurementEvent => e.type === "measurement",
    );

    return { activeCalibration, activeCalibrationLine, measurements };
  }, [events]);

  // Write a new event to Firestore
  async function addEvent(
    partial: Omit<MarkitEvent, "id" | "createdAt" | "createdBy">,
  ): Promise<void> {
    if (!canEdit) return;

    // Use Firestore's .doc() with no argument to generate a unique ID
    const id = getFirestore()
      .collection("projects")
      .doc(projectId)
      .collection("files")
      .doc(fileId)
      .collection("events")
      .doc().id;

    const event: MarkitEvent = {
      ...partial,
      id,
      createdAt: new Date().toISOString(),
      createdBy: user?.id ?? "unknown",
    } as MarkitEvent;

    await addMarkitEvent(projectId, fileId, event);
  }

  // Soft-delete every live event so the canvas resets cleanly.
  // Used when the user recalibrates — clears old calibration + measurements.
  async function clearEvents(): Promise<void> {
    if (!canEdit) return;
    const deletedIds = new Set<string>();
    for (const e of events) {
      if (e.type === "delete") deletedIds.add(e.targetEventId);
    }
    const liveIds = events
      .filter((e) => !deletedIds.has(e.id) && e.type !== "delete")
      .map((e) => e.id);

    await Promise.all(
      liveIds.map((targetEventId) =>
        addEvent({ type: "delete", targetEventId } as any),
      ),
    );
  }

  return {
    ...derived,
    addEvent,
    clearEvents,
    canEdit,
    loading,
  };
}
