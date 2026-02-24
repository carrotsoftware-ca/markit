import { Gesture } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { vec } from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

import { formatInches, screenPxToInches } from "../utils/measureMath";

/**
 * Manages the 1-finger draw gesture that produces a measurement line.
 *
 * Shared values are threaded in from index.native.tsx:
 *   scaleAtOne   - written by useCalibration; inches per screen pixel at zoom 1×
 *   zoomLevel    - written by useZoom; current zoom level
 *   lastScreenPx - written here; read by useCalibration on button press
 */
export function useMeasureLine(
  scaleAtOne: SharedValue<number>,
  zoomLevel: SharedValue<number>,
  lastScreenPx: SharedValue<number>,
) {
  const start = useSharedValue({ x: 0, y: 0 });
  const end = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);

  const drawGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .minDistance(0)
    .onBegin((e) => {
      start.value = { x: e.x, y: e.y };
      end.value = { x: e.x, y: e.y };
      isActive.value = true;
    })
    .onUpdate((e) => {
      end.value = { x: e.x, y: e.y };
    })
    .onEnd(() => {
      const dx = end.value.x - start.value.x;
      const dy = end.value.y - start.value.y;
      lastScreenPx.value = Math.sqrt(dx * dx + dy * dy);
    });

  // Live distance label — runs on UI thread, zoom-corrected
  const distanceText = useDerivedValue(() => {
    const dx = end.value.x - start.value.x;
    const dy = end.value.y - start.value.y;
    const screenPx = Math.sqrt(dx * dx + dy * dy);

    if (scaleAtOne.value > 0) {
      const inches = screenPxToInches(screenPx, scaleAtOne.value, zoomLevel.value);
      return formatInches(inches);
    }
    return `${screenPx.toFixed(0)} px`;
  });

  const p1 = useDerivedValue(() => vec(start.value.x, start.value.y));
  const p2 = useDerivedValue(() => vec(end.value.x, end.value.y));
  const labelX = useDerivedValue(() => (start.value.x + end.value.x) / 2);
  const labelY = useDerivedValue(() => (start.value.y + end.value.y) / 2 - 10);
  const lineOpacity = useDerivedValue(() => (isActive.value ? 1 : 0));

  return {
    drawGesture,
    distanceText,
    p1,
    p2,
    labelX,
    labelY,
    lineOpacity,
  };
}
