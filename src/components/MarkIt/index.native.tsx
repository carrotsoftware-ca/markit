import { useImage } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  PixelRatio,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { useMarkitSession } from "@/src/hooks/useMarkitSession";
import { CalibrationPanel } from "./components/CalibrationPanel";
import { DeleteMeasurementDialog } from "./components/DeleteMeasurementDialog";
import { CalibrationScreenLine, CommittedLine, MeasureCanvas } from "./components/MeasureCanvas";
import { MeasurementConfirmBar } from "./components/MeasurementConfirmBar";
import { useCalibration } from "./hooks/useCalibration";
import { useMarkItImage } from "./hooks/useMarkItImage";
import { useMeasureLine } from "./hooks/useMeasureLine";
import { useMeasurementManager } from "./hooks/useMeasurementManager";
import { useTapToDelete } from "./hooks/useTapToDelete";
import { useZoom } from "./hooks/useZoom";
import { normalizedToImageSpace, screenToNormalized } from "./utils/coordTransform";

interface MarkItProps {
  imageUrl?: string;
  projectId?: string;
  fileId?: string;
}

export default function MarkIt({ imageUrl, projectId, fileId }: MarkItProps) {
  // Use onLayout so we get the actual component dimensions, not the window.
  // On web, useWindowDimensions() returns the browser window size which
  // doesn't match the canvas area — causing calibration to be off.
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (w > 0 && h > 0) {
      setDimensions({ width: w, height: h });
    }
  };

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
  // Zoom snapshotted on the UI thread at the exact moment the calibration/
  // measurement line finger-up fires — avoids reading a stale or mid-animation
  // zoomLevel from the JS thread when the confirm button is pressed.
  const lastZoom = useSharedValue(1);
  const lineColor = useSharedValue<string>("orange");
  // True during calibrate mode — keeps the last drawn line visible as a preview
  const isCalibrating = useSharedValue(true);

  // 4. Zoom + pan + double-tap reset
  const { zoomLevel, translateX, translateY, zoomGesture, doubleTapGesture } = useZoom();

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
  const session = useMarkitSession(projectId ?? "", fileId ?? "", !!(projectId && fileId));

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
    lastZoom,
    scaleAtOne,
    lineColor,
    isCalibrating,
  );

  // Stable refs for values used inside gesture callbacks — avoids stale closures.
  const committedLinesRef = useRef<CommittedLine[]>([]);
  const modeRef = useRef(mode);
  const imageRef = useRef(image);
  const dimensionsRef = useRef({ width, height });

  // 8. Measurement state: pending save and pending delete, plus all handlers.
  const {
    pendingMeasurement,
    pendingDelete,
    setPendingDelete,
    handleLineCommitted,
    handleSaveMeasurement,
    handleDiscardMeasurement,
    handleDeleteMeasurement,
  } = useMeasurementManager({
    image,
    mode,
    dimensions: dimensionsRef.current,
    zoomLevel,
    translateX,
    translateY,
    scaleAtOne,
    session,
    projectId,
    fileId,
  });

  const pendingMeasurementRef = useRef(pendingMeasurement);
  const pendingDeleteRef = useRef(pendingDelete);

  // 9. Tap-to-delete gesture.
  const { tapToDeleteGesture } = useTapToDelete({
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
  });

  // 10. 1-finger draw gesture + live distance label.
  //     In measure mode the live line only shows while the finger is down.
  //     In calibrate mode keepVisible keeps it showing as a preview.
  const keepLineVisible = useDerivedValue(() => isCalibrating.value);

  const { drawGesture, distanceText, start, end, p1, p2, labelX, labelY, lineOpacity } =
    useMeasureLine(
      scaleAtOne,
      zoomLevel,
      lastScreenPx,
      lastZoom,
      handleLineCommitted,
      keepLineVisible,
    );

  // 10. Wrap confirmCalibration to also persist calibration events to Firestore
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

  // 11. When events load from Firestore and a calibration already exists,
  //     restore scaleAtOne + lineColor so committed lines show correct labels.
  //     Also re-runs when dimensions change (e.g. onLayout fires on web).
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

  // 12. Show/hide calibration reference line toggle
  const [showCalibrationLine, setShowCalibrationLine] = useState(false);

  // 12. Convert committed measurement events from the event log to image-space
  //     coords (zoom=1, tx=0, ty=0). These are rendered INSIDE the zoom Group
  //     in MeasureCanvas so they track the image automatically at any zoom/pan.
  const firestoreLines: CommittedLine[] = (session.measurements ?? []).flatMap((evt) => {
    if (!image) return [];
    if (
      !evt.distanceText ||
      evt.distanceText.includes("NaN") ||
      evt.distanceText.includes("Infinity")
    )
      return [];
    const s1 = normalizedToImageSpace(evt.start, image, width, height);
    const s2 = normalizedToImageSpace(evt.end, image, width, height);
    return [
      {
        id: evt.id,
        x1: s1.x,
        y1: s1.y,
        x2: s2.x,
        y2: s2.y,
        label: evt.distanceText,
      },
    ];
  });

  // Include the pending line while the user decides — it renders via
  // MeasurementLine just like any committed line, so there's a single
  // visual path. Once Firestore's listener adds the real event, the
  // pending entry (id starts with "pending_") is no longer added.
  const pendingLine = pendingMeasurement?.line ?? null;
  const committedLines: CommittedLine[] = pendingLine
    ? [...firestoreLines, pendingLine]
    : firestoreLines;

  // Keep all gesture refs current on every render.
  committedLinesRef.current = committedLines;
  modeRef.current = mode;
  pendingMeasurementRef.current = pendingMeasurement;
  pendingDeleteRef.current = pendingDelete;
  imageRef.current = image;
  dimensionsRef.current = { width, height };

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
  //     - zoomGesture (pinch + 2-finger pan) runs simultaneously with everything —
  //       it must never be delayed or blocked by the tap/draw recognisers.
  //     - doubleTapGesture races with drawGesture: if two taps land quickly the
  //       double-tap wins and the draw is cancelled; otherwise draw proceeds
  //       immediately without waiting for a double-tap timeout.
  const gesture = Gesture.Simultaneous(
    zoomGesture,
    Gesture.Exclusive(doubleTapGesture, tapToDeleteGesture, drawGesture),
  );

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {(!image || width === 0) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF8800" />
          <Text style={styles.loadingText}>{imageUrl ? "Loading image..." : "No image URL"}</Text>
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

      {pendingMeasurement && (
        <MeasurementConfirmBar
          distanceText={pendingMeasurement.line.label}
          onSave={handleSaveMeasurement}
          onDiscard={handleDiscardMeasurement}
        />
      )}

      {pendingDelete && (
        <DeleteMeasurementDialog
          distanceText={pendingDelete.distanceText}
          onConfirm={() => handleDeleteMeasurement(pendingDelete.id)}
          onCancel={() => setPendingDelete(null)}
        />
      )}
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
