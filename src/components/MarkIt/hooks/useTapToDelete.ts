import {
  CommittedLine,
  MarkitMode,
  PendingDelete,
  PendingMeasurement,
} from "@/src/components/MarkIt/types";
import { screenToNormalized } from "@/src/components/MarkIt/utils/coordTransform";
import { PixelRatio } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";

const HIT_THRESHOLD_SCREEN_PX = 24;

interface TapToDeleteArgs {
  modeRef: React.RefObject<MarkitMode>;
  pendingMeasurementRef: React.RefObject<PendingMeasurement | null>;
  pendingDeleteRef: React.RefObject<PendingDelete | null>;
  imageRef: React.RefObject<import("@shopify/react-native-skia").SkImage | null>;
  committedLinesRef: React.RefObject<CommittedLine[]>;
  dimensionsRef: React.RefObject<{ width: number; height: number }>;
  zoomLevel: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  setPendingDelete: (val: PendingDelete | null) => void;
}

export function useTapToDelete({
  modeRef,
  pendingMeasurementRef,
  pendingDeleteRef,
  imageRef,
  committedLinesRef,
  dimensionsRef,
  zoomLevel,
  translateX,
  translateY,
  setPendingDelete,
}: TapToDeleteArgs) {
  const tapToDeleteGesture = Gesture.Tap()
    .maxDuration(300)
    .runOnJS(true)
    .onEnd((e) => {
      const currentMode = modeRef.current;
      const currentPending = pendingMeasurementRef.current;
      const currentImage = imageRef.current;
      const lines = committedLinesRef.current;

      if (currentMode !== "measure" || currentPending !== null) return;
      if (pendingDeleteRef.current !== null) return;
      if (!currentImage || lines.length === 0) return;

      const { width: w, height: h } = dimensionsRef.current;
      if (w === 0 || h === 0) return;

      const tapUnzoomed = screenToNormalized(
        e.x,
        e.y,
        currentImage,
        w,
        h,
        zoomLevel.value,
        translateX.value,
        translateY.value,
      );

      const pr = PixelRatio.get();
      const renderScale = Math.min(
        w / (currentImage.width() / pr),
        h / (currentImage.height() / pr),
      );
      const renderedW = (currentImage.width() / pr) * renderScale;
      const renderedH = (currentImage.height() / pr) * renderScale;
      const rect = {
        x: (w - renderedW) / 2,
        y: (h - renderedH) / 2,
        w: renderedW,
        h: renderedH,
      };
      const tapX = tapUnzoomed.x * rect.w + rect.x;
      const tapY = tapUnzoomed.y * rect.h + rect.y;

      const hitThreshold = HIT_THRESHOLD_SCREEN_PX / zoomLevel.value;

      let closest: string | null = null;
      let closestDist = hitThreshold;

      for (const line of lines) {
        const dx = line.x2 - line.x1;
        const dy = line.y2 - line.y1;
        const lenSq = dx * dx + dy * dy;
        let dist: number;
        if (lenSq === 0) {
          dist = Math.sqrt((tapX - line.x1) ** 2 + (tapY - line.y1) ** 2);
        } else {
          const t = Math.max(
            0,
            Math.min(1, ((tapX - line.x1) * dx + (tapY - line.y1) * dy) / lenSq),
          );
          dist = Math.sqrt((tapX - (line.x1 + t * dx)) ** 2 + (tapY - (line.y1 + t * dy)) ** 2);
        }
        if (dist < closestDist) {
          closestDist = dist;
          closest = line.id;
        }
      }

      if (closest !== null) {
        const line = lines.find((l) => l.id === closest);
        setPendingDelete({ id: closest, distanceText: line?.label ?? "" });
      }
    });

  return { tapToDeleteGesture };
}
