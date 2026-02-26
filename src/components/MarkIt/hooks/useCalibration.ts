import type { SkImage } from "@shopify/react-native-skia";
import { useRef, useState } from "react";
import { PixelRatio } from "react-native";
import type { SharedValue } from "react-native-reanimated";

export type CalibrationMode = "calibrate" | "measure";

/**
 * Manages the calibrate → measure state machine.
 *
 * Shared values are created in index.native.tsx and threaded through here
 * to avoid circular dependencies with useMeasureLine.
 *
 * Zoom-aware calibration:
 *   When the user draws a line at zoom level Z and says it equals R inches,
 *   the stored scale is R / (screenPx / Z) = inches per screen pixel at zoom 1×.
 *   This means measurements are correct at any zoom level.
 */
export function useCalibration(
  image: SkImage | null,
  width: number,
  height: number,
  zoomLevel: SharedValue<number>,
  lastScreenPx: SharedValue<number>, // written by useMeasureLine
  lastZoom: SharedValue<number>,     // zoom snapshotted at finger-up by useMeasureLine
  scaleAtOne: SharedValue<number>, // written here, read by useMeasureLine
  lineColor: SharedValue<string>, // written here, read by MeasureCanvas
  isCalibrating: SharedValue<boolean>, // written here, read by useMeasureLine
) {
  const [mode, setMode] = useState<CalibrationMode>("calibrate");
  const [refInput, setRefInput] = useState("");
  const [intrinsicScale, setIntrinsicScale] = useState<number | null>(null);

  // Keep a ref so confirmCalibration always sees current dimensions
  const dimensionsRef = useRef({ width, height });
  dimensionsRef.current = { width, height };

  /**
   * How many screen pixels equal one intrinsic image pixel under Skia's
   * "contain" fit. Used to store a resolution-independent scale for display.
   */
  const getRenderScale = () => {
    if (!image) return 1;
    const { width: w, height: h } = dimensionsRef.current;
    if (w === 0 || h === 0) return 1;
    const pr = PixelRatio.get();
    const scaleX = w / (image.width() / pr);
    const scaleY = h / (image.height() / pr);
    return Math.min(scaleX, scaleY);
  };

  const confirmCalibration = () => {
    const screenPx = lastScreenPx.value;
    const realInches = parseFloat(refInput);
    if (screenPx <= 0 || realInches <= 0) return;

    const zoom = zoomLevel.value;

    // Zoom-corrected: normalise the drawn line to what it would be at zoom 1×.
    // Use lastZoom (snapshotted on UI thread at finger-up) rather than reading
    // zoomLevel now — the spring animation may have settled to a different value
    // by the time the user presses the confirm button.
    const zoomAtDraw = lastZoom.value > 0 ? lastZoom.value : zoom;
    const screenPxAtOne = screenPx / zoomAtDraw;

    // Store intrinsic scale for display in the panel
    const renderScale = getRenderScale();
    const intrinsicPx = screenPxAtOne / renderScale;
    setIntrinsicScale(realInches / intrinsicPx);

    // This is what useMeasureLine uses on the UI thread
    scaleAtOne.value = realInches / screenPxAtOne;
    lineColor.value = "red";
    isCalibrating.value = false;

    setMode("measure");
  };

  const recalibrate = () => {
    setMode("calibrate");
    setIntrinsicScale(null);
    setRefInput("");
    scaleAtOne.value = 0;
    lineColor.value = "orange";
    isCalibrating.value = true;
  };

  /** Called on session replay — restores mode + display scale without recalculating. */
  const restoreFromSession = (scale: number, intrinsicScaleVal: number) => {
    scaleAtOne.value = scale;
    lineColor.value = "red";
    isCalibrating.value = false;
    setIntrinsicScale(intrinsicScaleVal);
    setMode("measure");
  };

  return {
    mode,
    refInput,
    setRefInput,
    intrinsicScale,
    confirmCalibration,
    recalibrate,
    restoreFromSession,
  };
}
