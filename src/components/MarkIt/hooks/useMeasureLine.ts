import { vec } from "@shopify/react-native-skia";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

import { formatInches, screenPxToInches } from "../utils/measureMath";

/**
 * Manages the 1-finger draw gesture that produces a measurement line.
 *
 * Shared values are threaded in from index.native.tsx:
 *   scaleAtOne   - written by useCalibration; inches per screen pixel at zoom 1×
 *   zoomLevel    - written by useZoom; current zoom level
 *   lastScreenPx - written here; read by useCalibration on button press
 *
 * onLineCommitted is called on the JS thread after each completed draw,
 * with the final screen start/end coords. index.native.tsx uses this to
 * persist the measurement to Firestore without touching gesture internals.
 */
export function useMeasureLine(
  scaleAtOne: SharedValue<number>,
  zoomLevel: SharedValue<number>,
  lastScreenPx: SharedValue<number>,
  onLineCommitted?: (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => void,
  /** When true the line stays visible after finger-up (calibrate mode preview) */
  keepVisible?: SharedValue<boolean>,
) {
  const start = useSharedValue({ x: 0, y: 0 });
  const end = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);
  // Stays true after finger-up when keepVisible is set, cleared on next draw begin
  const hasLine = useSharedValue(false);

  const drawGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .minDistance(0)
    .onBegin((e) => {
      start.value = { x: e.x, y: e.y };
      end.value = { x: e.x, y: e.y };
      isActive.value = false;
      hasLine.value = false;
    })
    .onUpdate((e) => {
      end.value = { x: e.x, y: e.y };
      const dx = e.x - start.value.x;
      const dy = e.y - start.value.y;
      if (dx * dx + dy * dy > 16) {
        isActive.value = true;
      }
    })
    .onEnd(() => {
      const dx = end.value.x - start.value.x;
      const dy = end.value.y - start.value.y;
      lastScreenPx.value = Math.sqrt(dx * dx + dy * dy);
      isActive.value = false;
      hasLine.value = keepVisible ? keepVisible.value : false;
      // Bridge back to JS thread so the caller can persist without
      // touching gesture internals or breaking the worklet boundary
      if (onLineCommitted) {
        runOnJS(onLineCommitted)(
          start.value.x,
          start.value.y,
          end.value.x,
          end.value.y,
        );
      }
    });

  // Live distance label — runs on UI thread, zoom-corrected
  const distanceText = useDerivedValue(() => {
    const dx = end.value.x - start.value.x;
    const dy = end.value.y - start.value.y;
    const screenPx = Math.sqrt(dx * dx + dy * dy);

    if (scaleAtOne.value > 0) {
      const inches = screenPxToInches(
        screenPx,
        scaleAtOne.value,
        zoomLevel.value,
      );
      return formatInches(inches);
    }
    return `${screenPx.toFixed(0)} px`;
  });

  const p1 = useDerivedValue(() => vec(start.value.x, start.value.y));
  const p2 = useDerivedValue(() => vec(end.value.x, end.value.y));
  const labelX = useDerivedValue(() => (start.value.x + end.value.x) / 2);
  const labelY = useDerivedValue(() => (start.value.y + end.value.y) / 2 - 10);
  const lineOpacity = useDerivedValue(() =>
    isActive.value || hasLine.value ? 1 : 0,
  );

  return {
    drawGesture,
    distanceText,
    start,
    end,
    p1,
    p2,
    labelX,
    labelY,
    lineOpacity,
  };
}
