import { MarkitMode, PendingDelete, PendingMeasurement } from "@/src/components/MarkIt/types";
import {
  normalizedToImageSpace,
  screenToNormalized,
} from "@/src/components/MarkIt/utils/coordTransform";
import { formatInches, screenPxToInches } from "@/src/components/MarkIt/utils/measureMath";
import { useMarkitSession } from "@/src/hooks/useMarkitSession";
import { SkImage } from "@shopify/react-native-skia";
import { useState } from "react";
import { SharedValue } from "react-native-reanimated";

interface MeasurementManagerArgs {
  image: SkImage | null;
  mode: MarkitMode;
  dimensionsRef: React.RefObject<{ width: number; height: number }>;
  zoomLevel: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scaleAtOne: SharedValue<number>;
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

    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const screenPx = Math.sqrt(dx * dx + dy * dy);
    const inches = screenPxToInches(screenPx, scaleAtOne.value, zoomLevel.value);
    const distText = formatInches(inches);

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
