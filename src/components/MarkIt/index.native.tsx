import { useImage } from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { useMarkitSession } from "@/src/hooks/useMarkitSession";
import { CalibrationPanel } from "./components/CalibrationPanel";
import {
  CalibrationScreenLine,
  CommittedLine,
  MeasureCanvas,
} from "./components/MeasureCanvas";
import { useCalibration } from "./hooks/useCalibration";
import { useMarkItImage } from "./hooks/useMarkItImage";
import { useMeasureLine } from "./hooks/useMeasureLine";
import { useZoom } from "./hooks/useZoom";
import { normalizedToImageSpace, normalizedToScreen, screenToNormalized } from "./utils/coordTransform";
import { formatInches, screenPxToInches } from "./utils/measureMath";

interface MarkItProps {
  imageUrl?: string;
  projectId?: string;
  fileId?: string;
}

export default function MarkIt({ imageUrl, projectId, fileId }: MarkItProps) {
  const { width, height } = useWindowDimensions();

  // 1. Resolve image URI (handles platform differences + Firebase URL encoding)
  const localUri = useMarkItImage(imageUrl);
  const image = useImage(localUri);

  // 2. Canvas dimensions as shared values so useDerivedValue closures never
  //    capture stale plain-JS numbers — prevents worklet re-registration deadlock.
  const widthSV = useSharedValue(width);
  const heightSV = useSharedValue(height);
  useEffect(() => {
    widthSV.value = width;
    heightSV.value = height;
  }, [width, height]);

  // 3. Shared values threaded between hooks to avoid circular dependencies
  const scaleAtOne = useSharedValue(0);
  const lastScreenPx = useSharedValue(0);
  const lineColor = useSharedValue<string>("orange");
  // True during calibrate mode — keeps the last drawn line visible as a preview
  const isCalibrating = useSharedValue(true);

  // 4. Zoom + pan + double-tap reset
  const { zoomLevel, translateX, translateY, zoomGesture, doubleTapGesture } =
    useZoom();

  // 5. All derived (animated) values created at top level — worklets are never
  //    re-registered because this component renders exactly once per mount.
  const zoomTransform = useDerivedValue(() => {
    const cx = widthSV.value / 2;
    const cy = heightSV.value / 2;
    const s = zoomLevel.value;
    return [
      { translateX: cx + translateX.value },
      { translateY: cy + translateY.value },
      { scale: s },
      { translateX: -cx },
      { translateY: -cy },
    ];
  });
  const imageWidth = useDerivedValue(() => widthSV.value);
  const imageHeight = useDerivedValue(() => heightSV.value);

  // 6. Firestore event session — no-op when projectId/fileId are absent
  const session = useMarkitSession(
    projectId ?? "",
    fileId ?? "",
    !!(projectId && fileId),
  );

  // 7. Calibration state machine (zoom-aware)
  const {
    mode,
    refInput,
    setRefInput,
    intrinsicScale,
    confirmCalibration,
    recalibrate,
    restoreFromSession,
  } = useCalibration(
    image,
    width,
    height,
    zoomLevel,
    lastScreenPx,
    scaleAtOne,
    lineColor,
    isCalibrating,
  );

  // 8. Called on the JS thread when the user lifts their finger after drawing.
  //    Converts final screen coords to normalized image coords and persists
  //    the measurement event to Firestore.
  const handleLineCommitted = (
    sx1: number,
    sy1: number,
    sx2: number,
    sy2: number,
  ) => {
    if (!image || !projectId || !fileId || mode !== "measure") return;

    const normStart = screenToNormalized(
      sx1,
      sy1,
      image,
      width,
      height,
      zoomLevel.value,
      translateX.value,
      translateY.value,
    );
    const normEnd = screenToNormalized(
      sx2,
      sy2,
      image,
      width,
      height,
      zoomLevel.value,
      translateX.value,
      translateY.value,
    );
    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const screenPx = Math.sqrt(dx * dx + dy * dy);
    const inches = screenPxToInches(
      screenPx,
      scaleAtOne.value,
      zoomLevel.value,
    );

    session.addEvent({
      type: "measurement",
      start: normStart,
      end: normEnd,
      distanceText: formatInches(inches),
    } as any);
  };

  // 9. 1-finger draw gesture + live distance label.
  //    handleLineCommitted is passed as a callback so the gesture bridges
  //    back to the JS thread via runOnJS internally.
  const {
    drawGesture,
    distanceText,
    start,
    end,
    p1,
    p2,
    labelX,
    labelY,
    lineOpacity,
  } = useMeasureLine(scaleAtOne, zoomLevel, lastScreenPx, handleLineCommitted, isCalibrating);

  // 10. Wrap confirmCalibration to also persist calibration events to Firestore
  const handleConfirmCalibration = async () => {
    if (image && projectId && fileId) {
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
        width,
        height,
        zoomLevel.value,
        translateX.value,
        translateY.value,
      );
      const normEnd = screenToNormalized(
        end.value.x,
        end.value.y,
        image,
        width,
        height,
        zoomLevel.value,
        translateX.value,
        translateY.value,
      );

      const renderScale = Math.min(
        width / image.width(),
        height / image.height(),
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

  // 11. When events load from Firestore and a calibration already exists,
  //     restore scaleAtOne + lineColor so committed lines show correct labels.
  useEffect(() => {
    if (session.loading) return;
    if (session.activeCalibration && scaleAtOne.value === 0 && image) {
      const cal = session.activeCalibration;
      const renderScale = Math.min(width / image.width(), height / image.height());
      const restoredScaleAtOne = cal.intrinsicScale * renderScale;
      restoreFromSession(restoredScaleAtOne, cal.intrinsicScale);
    }
  }, [session.loading, session.activeCalibration?.id, image]);

  // 12. Show/hide calibration reference line toggle
  const [showCalibrationLine, setShowCalibrationLine] = useState(false);

  // 12. Convert committed measurement events from the event log to image-space
  //     coords (zoom=1, tx=0, ty=0). These are rendered INSIDE the zoom Group
  //     in MeasureCanvas so they track the image automatically at any zoom/pan.
  const committedLines: CommittedLine[] = (session.measurements ?? []).flatMap(
    (evt) => {
      if (!image) return [];
      // Skip events with corrupt distanceText from old test runs
      if (!evt.distanceText || evt.distanceText.includes("NaN") || evt.distanceText.includes("Infinity")) return [];
      const s1 = normalizedToImageSpace(evt.start, image, width, height);
      const s2 = normalizedToImageSpace(evt.end, image, width, height);
      const label = evt.distanceText;
      return [{ id: evt.id, x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y, label }];
    },
  );

  // 13. Convert calibration reference line to image-space coords if visible.
  //     Also rendered inside the zoom Group so it tracks the image.
  const calibrationScreenLine: CalibrationScreenLine | null =
    showCalibrationLine && session.activeCalibrationLine && image
      ? (() => {
          const ln = session.activeCalibrationLine;
          const s1 = normalizedToImageSpace(ln.start, image, width, height);
          const s2 = normalizedToImageSpace(ln.end, image, width, height);
          return { x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y };
        })()
      : null;

  // 14. Compose gestures:
  //     Double-tap is exclusive (resets zoom). Draw + zoom run simultaneously.
  const gesture = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(drawGesture, zoomGesture),
  );

  return (
    <View style={styles.container}>
      {!image && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF8800" />
          <Text style={styles.loadingText}>
            {imageUrl ? "Loading image..." : "No image URL"}
          </Text>
        </View>
      )}

      <GestureDetector gesture={gesture}>
        <MeasureCanvas
          image={image}
          zoomTransform={zoomTransform}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          p1={p1}
          p2={p2}
          labelX={labelX}
          labelY={labelY}
          distanceText={distanceText}
          lineOpacity={lineOpacity}
          lineColor={lineColor}
          committedLines={committedLines}
          calibrationLine={calibrationScreenLine}
        />
      </GestureDetector>

      <CalibrationPanel
        mode={mode}
        refInput={refInput}
        onRefInputChange={setRefInput}
        intrinsicScale={intrinsicScale}
        onConfirm={handleConfirmCalibration}
        onRecalibrate={recalibrate}
        hasCalibrationLine={!!session.activeCalibrationLine}
        showCalibrationLine={showCalibrationLine}
        onToggleCalibrationLine={() => setShowCalibrationLine((v) => !v)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 12,
  },
});
