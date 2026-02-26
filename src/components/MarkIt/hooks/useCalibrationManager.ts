import { screenToNormalized } from "@/src/components/MarkIt/utils/coordTransform";
import { useMarkitSession } from "@/src/hooks/useMarkitSession";
import { SkImage } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { PixelRatio } from "react-native";
import { SharedValue } from "react-native-reanimated";

interface CalibrationManagerArgs {
  image: SkImage | null;
  dimensionsRef: React.RefObject<{ width: number; height: number }>;
  width: number;
  height: number;
  session: ReturnType<typeof useMarkitSession>;
  // Shared values for the drawn calibration line endpoints
  start: { value: { x: number; y: number } };
  end: { value: { x: number; y: number } };
  zoomLevel: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  lastScreenPx: SharedValue<number>;
  scaleAtOne: SharedValue<number>;
  // From useCalibration
  refInput: string;
  confirmCalibration: () => void;
  restoreFromSession: (scaleAtOne: number, intrinsicScale: number) => void;
  projectId?: string;
  fileId?: string;
}

export function useCalibrationManager({
  image,
  dimensionsRef,
  width,
  height,
  session,
  start,
  end,
  zoomLevel,
  translateX,
  translateY,
  lastScreenPx,
  scaleAtOne,
  refInput,
  confirmCalibration,
  restoreFromSession,
  projectId,
  fileId,
}: CalibrationManagerArgs) {
  // Persists the calibration line + confirmation event to Firestore,
  // then transitions the local state machine to "measure" mode.
  const handleConfirmCalibration = async () => {
    if (image && projectId && fileId) {
      const { width: w, height: h } = dimensionsRef.current;

      // If there are any existing events (recalibration), clear them all first
      const hasExistingEvents =
        !!session.activeCalibration ||
        !!session.activeCalibrationLine ||
        session.measurements.length > 0;
      if (hasExistingEvents) {
        await session.clearEvents();
      }

      const calLineId = `${Date.now()}_cal_line`;
      const normStart = screenToNormalized(
        start.value.x,
        start.value.y,
        image,
        w,
        h,
        zoomLevel.value,
        translateX.value,
        translateY.value,
      );
      const normEnd = screenToNormalized(
        end.value.x,
        end.value.y,
        image,
        w,
        h,
        zoomLevel.value,
        translateX.value,
        translateY.value,
      );

      const renderScale = Math.min(
        w / (image.width() / PixelRatio.get()),
        h / (image.height() / PixelRatio.get()),
      );
      const screenPxAtOne = lastScreenPx.value / zoomLevel.value;
      const intrinsicPx = screenPxAtOne / renderScale;
      const realInches = parseFloat(refInput);
      const scale = realInches / intrinsicPx;

      // Guard: don't write corrupt events if inputs are invalid
      if (!isFinite(scale) || scale <= 0 || !isFinite(realInches) || realInches <= 0) {
        confirmCalibration();
        return;
      }

      // Write calibration_line first, then calibration_confirmed referencing it
      session
        .addEvent({
          type: "calibration_line",
          id: calLineId,
          start: normStart,
          end: normEnd,
        } as any)
        .then(() =>
          session.addEvent({
            type: "calibration_confirmed",
            intrinsicScale: scale,
            refInput,
            calibrationLineEventId: calLineId,
          } as any),
        );
    }
    confirmCalibration();
  };

  // When events load from Firestore and a calibration already exists,
  // restore scaleAtOne + lineColor so committed lines show correct labels.
  // Also re-runs when dimensions change (e.g. onLayout fires on web).
  useEffect(() => {
    if (session.loading) return;
    const { width: w, height: h } = dimensionsRef.current;
    if (w === 0 || h === 0) return;
    if (session.activeCalibration && scaleAtOne.value === 0 && image) {
      const cal = session.activeCalibration;
      const renderScale = Math.min(
        w / (image.width() / PixelRatio.get()),
        h / (image.height() / PixelRatio.get()),
      );
      // intrinsicScale = inches/intrinsicPx
      // scaleAtOne     = inches/screenPx  = intrinsicScale / renderScale
      //                  (renderScale = screenPx/intrinsicPx, so divide)
      const restoredScaleAtOne = cal.intrinsicScale / renderScale;
      restoreFromSession(restoredScaleAtOne, cal.intrinsicScale);
    }
  }, [session.loading, session.activeCalibration?.id, image, width, height]);

  return { handleConfirmCalibration };
}
