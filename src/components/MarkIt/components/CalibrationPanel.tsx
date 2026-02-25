import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

import type { CalibrationMode } from "../hooks/useCalibration";

interface CalibrationPanelProps {
  mode: CalibrationMode;
  refInput: string;
  onRefInputChange: (v: string) => void;
  intrinsicScale: number | null;
  onConfirm: () => void;
  onRecalibrate: () => void;
}

/**
 * Draggable overlay panel that guides the user through calibration and
 * shows measurement mode controls.
 *
 * Owns only its own drag position — all calibration state comes via props.
 */
export function CalibrationPanel({
  mode,
  refInput,
  onRefInputChange,
  intrinsicScale,
  onConfirm,
  onRecalibrate,
}: CalibrationPanelProps) {
  const panelX = useSharedValue(0);
  const panelY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      offsetX.value = panelX.value;
      offsetY.value = panelY.value;
    })
    .onUpdate((e) => {
      panelX.value = offsetX.value + e.translationX;
      panelY.value = offsetY.value + e.translationY;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panelX.value },
      { translateY: panelY.value },
    ],
  }));

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.panel, animatedStyle]}>
          <View style={styles.dragHandle} />

          {mode === "calibrate" ? (
            <>
              <Text style={styles.title}>📏 Calibration</Text>
              <Text style={styles.subtitle}>
                Draw a line over a known object, then enter its real size.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Size in inches (e.g. 4)"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={refInput}
                onChangeText={onRefInputChange}
              />
              <TouchableOpacity style={styles.button} onPress={onConfirm}>
                <Text style={styles.buttonText}>Set Scale & Measure</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>📐 Measuring</Text>
              <Text style={styles.subtitle}>
                Scale: {intrinsicScale?.toFixed(5)} in/px (intrinsic)
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={onRecalibrate}
              >
                <Text style={styles.buttonText}>Recalibrate</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
    alignSelf: "center",
    marginBottom: 8,
  },
  panel: {
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF8800",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
