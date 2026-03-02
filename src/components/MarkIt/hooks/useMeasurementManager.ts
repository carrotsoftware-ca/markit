import { MarkitMode, PendingDelete, PendingMeasurement } from "@/src/components/MarkIt/types";
import {
  normalizedToImageSpace,
  screenToNormalized,
} from "@/src/components/MarkIt/utils/coordTransform";
import {
  formatInches,
  intrinsicPxToInches,
  normalizedToIntrinsicPx,
} from "@/src/components/MarkIt/utils/measureMath";
import { useMarkitSession } from "@/src/hooks/useMarkitSession";
import { SkImage } from "@shopify/react-native-skia";
import { useState } from "react";
import { PixelRatio } from "react-native";
import { SharedValue } from "react-native-reanimated";

interface MeasurementManagerArgs {
  image: SkImage | null;
  mode: MarkitMode;
  dimensionsRef: React.RefObject<{ width: number; height: number }>;
  zoomLevel: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scaleAtOne: SharedValue<number>;
  /** Platform-independent inches/intrinsicPx scale — used for saved labels */
  intrinsicScale: number | null;
  session: ReturnType<typeof useMarkitSession>;
  projectId?: string;
  fileId?: string;
}

export function useMeasurementManager({
  image,
  mode,
  dimensionsRef,
  zoomLevel,
  translateX,
  translateY,
  scaleAtOne,
  intrinsicScale,
  session,
  projectId,
  fileId,
}: MeasurementManagerArgs) {
  const [pendingMeasurement, setPendingMeasurement] = useState<PendingMeasurement | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const handleLineCommitted = (sx1: number, sy1: number, sx2: number, sy2: number) => {
    if (!image || mode !== "measure") return;
    const { width: w, height: h } = dimensionsRef.current;
    if (w === 0 || h === 0) return;

    const normStart = screenToNormalized(
      sx1,
      sy1,
      image,
      w,
      h,
      zoomLevel.value,
      translateX.value,
      translateY.value,
    );
    const normEnd = screenToNormalized(
      sx2,
      sy2,
      image,
      w,
      h,
      zoomLevel.value,
      translateX.value,
      translateY.value,
    );

    // Use intrinsic pixel distance × intrinsicScale for a platform-independent,
    // zoom-independent measurement. Falls back to screen-pixel path only if
    // intrinsicScale is not yet available (should not happen in normal use).
    let distText: string;
    if (intrinsicScale && intrinsicScale > 0) {
      // intrinsicScale is in inches / logical-intrinsic-px (physical px / PixelRatio).
      // Pass logical dimensions so units match.
      const pr = PixelRatio.get();
      const intrinsicPx = normalizedToIntrinsicPx(
        normStart.x,
        normStart.y,
        normEnd.x,
        normEnd.y,
        image.width() / pr,
        image.height() / pr,
      );
      distText = formatInches(intrinsicPxToInches(intrinsicPx, intrinsicScale));
    } else {
      // Fallback (no intrinsicScale yet — guard only, shouldn't reach here)
      const dx = sx2 - sx1;
      const dy = sy2 - sy1;
      const screenPx = Math.sqrt(dx * dx + dy * dy);
      const inches = (screenPx / zoomLevel.value) * scaleAtOne.value;
      distText = formatInches(inches);
    }

    const s1 = normalizedToImageSpace(normStart, image, w, h);
    const s2 = normalizedToImageSpace(normEnd, image, w, h);

    setPendingMeasurement({
      line: {
        id: `pending_${Date.now()}`,
        x1: s1.x,
        y1: s1.y,
        x2: s2.x,
        y2: s2.y,
        label: distText,
      },
      normStart,
      normEnd,
    });
  };

  const handleSaveMeasurement = () => {
    if (!pendingMeasurement || !projectId || !fileId) {
      setPendingMeasurement(null);
      return;
    }
    session.addEvent({
      type: "measurement",
      start: pendingMeasurement.normStart,
      end: pendingMeasurement.normEnd,
      distanceText: pendingMeasurement.line.label,
    } as any);
    setPendingMeasurement(null);
  };

  const handleDiscardMeasurement = () => {
    setPendingMeasurement(null);
  };

  const handleDeleteMeasurement = async (id: string) => {
    if (!projectId || !fileId) return;
    await session.addEvent({ type: "delete", targetEventId: id } as any);
    setPendingDelete(null);
  };

  return {
    pendingMeasurement,
    pendingDelete,
    setPendingDelete,
    handleLineCommitted,
    handleSaveMeasurement,
    handleDiscardMeasurement,
    handleDeleteMeasurement,
  };
}
