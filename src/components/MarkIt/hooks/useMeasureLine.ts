import { vec } from "@shopify/react-native-skia";
import { Gesture } from "react-native-gesture-handler";
import type { SharedValue } from "react-native-reanimated";
import { runOnJS, useDerivedValue, useSharedValue } from "react-native-reanimated";

import { formatInches, screenPxToInches } from "../utils/measureMath";

/**
 * Manages the 1-finger draw gesture that produces a measurement line.
 *
 * Shared values are threaded in from index.native.tsx:
 *   scaleAtOne      - written by useCalibration; inches per screen pixel at zoom 1×
 *   intrinsicScaleSV - inches per intrinsic pixel (platform-independent); used for
 *                     the live label so it matches the saved label exactly
 *   zoomLevel       - written by useZoom; current zoom level
 *   lastScreenPx    - written here; read by useCalibration on button press
 *
 * onLineCommitted is called on the JS thread after each completed draw,
 * with the final screen start/end coords. index.native.tsx uses this to
 * persist the measurement to Firestore without touching gesture internals.
 */
export function useMeasureLine(
  scaleAtOne: SharedValue<number>,
  zoomLevel: SharedValue<number>,
  lastScreenPx: SharedValue<number>,
  lastZoom: SharedValue<number>,
  onLineCommitted?: (startX: number, startY: number, endX: number, endY: number) => void,
  /** When true the line stays visible after finger-up (calibrate mode preview) */
  keepVisible?: SharedValue<boolean>,
  /** Platform-independent scale for the live label — threads in as a shared value */
  intrinsicScaleSV?: SharedValue<number>,
  /** Intrinsic image width in pixels — needed to compute intrinsic distance in worklet */
  imageWidthSV?: SharedValue<number>,
  /** Intrinsic image height in pixels */
  imageHeightSV?: SharedValue<number>,
  /** Canvas width for normalizing coordinates in the worklet */
  canvasWidthSV?: SharedValue<number>,
  /** Canvas height for normalizing coordinates in the worklet */
  canvasHeightSV?: SharedValue<number>,
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
      // Don't clear hasLine here — wait until the user actually starts moving.
      // Clearing on onBegin causes the calibration preview line to vanish the
      // moment the user taps the TextInput or the confirm button.
    })
    .onUpdate((e) => {
      end.value = { x: e.x, y: e.y };
      const dx = e.x - start.value.x;
      const dy = e.y - start.value.y;
      if (dx * dx + dy * dy > 16) {
        isActive.value = true;
        hasLine.value = false; // clear previous line only once they start a real draw
      }
    })
    .onEnd(() => {
      const dx = end.value.x - start.value.x;
      const dy = end.value.y - start.value.y;
      lastScreenPx.value = Math.sqrt(dx * dx + dy * dy);
      // Snapshot zoom on the UI thread at the exact moment of finger-up.
      lastZoom.value = zoomLevel.value;
      isActive.value = false;
      const shouldKeep = keepVisible ? keepVisible.value : false;
      hasLine.value = shouldKeep;
      // Bridge back to JS thread so the caller can persist without
      // touching gesture internals or breaking the worklet boundary
      if (onLineCommitted) {
        runOnJS(onLineCommitted)(start.value.x, start.value.y, end.value.x, end.value.y);
      }
    });

  // Live distance label — runs on UI thread, zoom-corrected
  const distanceText = useDerivedValue(() => {
    const dx = end.value.x - start.value.x;
    const dy = end.value.y - start.value.y;
    const screenPx = Math.sqrt(dx * dx + dy * dy);

    // Prefer intrinsic-pixel path so live label matches saved label exactly.
    // All the shared values must be valid for this path to activate.
    if (
      intrinsicScaleSV &&
      intrinsicScaleSV.value > 0 &&
      imageWidthSV &&
      imageWidthSV.value > 0 &&
      imageHeightSV &&
      imageHeightSV.value > 0 &&
      canvasWidthSV &&
      canvasWidthSV.value > 0 &&
      canvasHeightSV &&
      canvasHeightSV.value > 0
    ) {
      // Undo zoom to get image-space coords, then normalize
      const cw = canvasWidthSV.value;
      const ch = canvasHeightSV.value;
      const z = zoomLevel.value;
      const cx = cw / 2;
      const cy = ch / 2;
      const ix1 = (start.value.x - cx) / z + cx;
      const iy1 = (start.value.y - cy) / z + cy;
      const ix2 = (end.value.x - cx) / z + cx;
      const iy2 = (end.value.y - cy) / z + cy;
      // Image rect (contain fit, PixelRatio=1 approximation — good enough for live preview)
      const imgW = imageWidthSV.value;
      const imgH = imageHeightSV.value;
      const scaleX = cw / imgW;
      const scaleY = ch / imgH;
      const fit = scaleX < scaleY ? scaleX : scaleY;
      const rw = imgW * fit;
      const rh = imgH * fit;
      const rx = (cw - rw) / 2;
      const ry = (ch - rh) / 2;
      const nx1 = (ix1 - rx) / rw;
      const ny1 = (iy1 - ry) / rh;
      const nx2 = (ix2 - rx) / rw;
      const ny2 = (iy2 - ry) / rh;
      const dpx = (nx2 - nx1) * imgW;
      const dpy = (ny2 - ny1) * imgH;
      const intrinsicPx = Math.sqrt(dpx * dpx + dpy * dpy);
      return formatInches(intrinsicPx * intrinsicScaleSV.value);
    }

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
  const lineOpacity = useDerivedValue(() => (isActive.value || hasLine.value ? 1 : 0));

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
