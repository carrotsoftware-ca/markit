import { CommittedLine, PendingMeasurement } from "@/src/components/MarkIt/types";
import { normalizedToImageSpace } from "@/src/components/MarkIt/utils/coordTransform";
import { useMarkitSession } from "@/src/hooks/useMarkitSession";
import { SkImage } from "@shopify/react-native-skia";

interface CommittedLinesArgs {
  session: ReturnType<typeof useMarkitSession>;
  image: SkImage | null;
  width: number;
  height: number;
  pendingMeasurement: PendingMeasurement | null;
}

export function useCommittedLines({
  session,
  image,
  width,
  height,
  pendingMeasurement,
}: CommittedLinesArgs): CommittedLine[] {
  // Convert committed measurement events from the event log to image-space
  // coords (zoom=1, tx=0, ty=0). These are rendered INSIDE the zoom Group
  // in MeasureCanvas so they track the image automatically at any zoom/pan.
  const firestoreLines: CommittedLine[] = (session.measurements ?? []).flatMap((evt) => {
    if (!image) return [];
    if (
      !evt.distanceText ||
      evt.distanceText.includes("NaN") ||
      evt.distanceText.includes("Infinity")
    )
      return [];
    const s1 = normalizedToImageSpace(evt.start, image, width, height);
    const s2 = normalizedToImageSpace(evt.end, image, width, height);
    return [
      {
        id: evt.id,
        x1: s1.x,
        y1: s1.y,
        x2: s2.x,
        y2: s2.y,
        label: evt.distanceText,
      },
    ];
  });

  // Include the pending line while the user decides — it renders via
  // MeasurementLine just like any committed line, so there's a single
  // visual path. Once Firestore's listener adds the real event, the
  // pending entry (id starts with "pending_") is no longer added.
  const pendingLine = pendingMeasurement?.line ?? null;
  return pendingLine ? [...firestoreLines, pendingLine] : firestoreLines;
}
