import { useState } from "react";
import type { SharedValue } from "react-native-reanimated";
import type { SkImage } from "@shopify/react-native-skia";

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
  lastScreenPx: SharedValue<number>,  // written by useMeasureLine
  scaleAtOne: SharedValue<number>,    // written here, read by useMeasureLine
  lineColor: SharedValue<string>,     // written here, read by MeasureCanvas
  isCalibrating: SharedValue<boolean>, // written here, read by useMeasureLine
) {
  const [mode, setMode] = useState<CalibrationMode>("calibrate");
  const [refInput, setRefInput] = useState("");
  const [intrinsicScale, setIntrinsicScale] = useState<number | null>(null);

  /**
   * How many screen pixels equal one intrinsic image pixel under Skia's
   * "contain" fit. Used to store a resolution-independent scale for display.
   */
  const getRenderScale = () => {
    if (!image) return 1;
    const scaleX = width / image.width();
    const scaleY = height / image.height();
    return Math.min(scaleX, scaleY);
  };

  const confirmCalibration = () => {
    const screenPx = lastScreenPx.value;
    const realInches = parseFloat(refInput);
    if (screenPx <= 0 || realInches <= 0) return;

    const zoom = zoomLevel.value;

    // Zoom-corrected: normalise the drawn line to what it would be at zoom 1×
    const screenPxAtOne = screenPx / zoom;

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
