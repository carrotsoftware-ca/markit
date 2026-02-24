import React from "react";
import {
  ActivityIndicator,
  Text,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, useDerivedValue } from "react-native-reanimated";
import { useEffect } from "react";
import { useImage } from "@shopify/react-native-skia";

import { useMarkItImage } from "./hooks/useMarkItImage";
import { useZoom } from "./hooks/useZoom";
import { useMeasureLine } from "./hooks/useMeasureLine";
import { useCalibration } from "./hooks/useCalibration";
import { MeasureCanvas } from "./components/MeasureCanvas";
import { CalibrationPanel } from "./components/CalibrationPanel";

interface MarkItProps {
  imageUrl?: string;
}

export default function MarkIt({ imageUrl }: MarkItProps) {
  const { width, height } = useWindowDimensions();

  // 1. Resolve image URI (handles platform differences + Firebase URL encoding)
  const localUri = useMarkItImage(imageUrl);
  const image = useImage(localUri);

  // 2. Canvas dimensions as shared values so useDerivedValue in MeasureCanvas
  //    never captures plain JS numbers in its closure — preventing the
  //    worklet re-registration deadlock when calibration state changes.
  const widthSV = useSharedValue(width);
  const heightSV = useSharedValue(height);
  useEffect(() => {
    widthSV.value = width;
    heightSV.value = height;
  }, [width, height]);

  // 3. Shared values threaded between hooks to avoid circular dependencies:
  //    - scaleAtOne: written by useCalibration, read by useMeasureLine
  //    - lastScreenPx: written by useMeasureLine, read by useCalibration
  //    - lineColor: updated here when mode changes, read by MeasureCanvas
  const scaleAtOne = useSharedValue(0);
  const lastScreenPx = useSharedValue(0);
  const lineColor = useSharedValue<string>("orange");

  // 4. Zoom + canvas pan + double-tap reset
  const { zoomLevel, translateX, translateY, zoomGesture, doubleTapGesture } =
    useZoom();

  // 5. All derived (animated) values are created here — at the top level of this
  //    component, called exactly once at mount — so their worklets are never
  //    re-registered.  MeasureCanvas has zero hooks, eliminating the
  //    Reanimated UI-thread deadlock that occurs when useDerivedValue is called
  //    inside a component body that re-renders.
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

  // 6. 1-finger draw gesture + live distance label (zoom-corrected)
  const { drawGesture, distanceText, p1, p2, labelX, labelY, lineOpacity } =
    useMeasureLine(scaleAtOne, zoomLevel, lastScreenPx);

  // 7. Calibration state machine (zoom-aware)
  const { mode, refInput, setRefInput, intrinsicScale, confirmCalibration, recalibrate } =
    useCalibration(image, width, height, zoomLevel, lastScreenPx, scaleAtOne, lineColor);

  // 8. Compose gestures:
  //    - Double-tap is exclusive (checked first, prevents other gestures firing on double-tap)
  //    - Draw (1-finger) and zoom (2-finger pinch+pan) run simultaneously
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
        />
      </GestureDetector>

      <CalibrationPanel
        mode={mode}
        refInput={refInput}
        onRefInputChange={setRefInput}
        intrinsicScale={intrinsicScale}
        onConfirm={confirmCalibration}
        onRecalibrate={recalibrate}
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
