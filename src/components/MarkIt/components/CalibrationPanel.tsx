import React, { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import type { CalibrationMode } from "../hooks/useCalibration";

interface CalibrationPanelProps {
  mode: CalibrationMode;
  refInput: string;
  onRefInputChange: (v: string) => void;
  intrinsicScale: number | null;
  onConfirm: () => void;
  onRecalibrate: () => void;
}

const SPRING = { damping: 18, stiffness: 200, mass: 0.8 };
// Collapsed height: just the drag handle + one line of text + padding
const COLLAPSED_HEIGHT = 44;

/**
 * Draggable overlay panel that guides the user through calibration and
 * shows measurement mode controls.
 *
 * - Drag handle: drag to reposition
 * - Tap handle: collapse / expand with a spring animation
 * - Keyboard: "Done" toolbar button + tapping outside the input dismisses it
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
  const collapsed = useSharedValue(false);
  const contentOpacity = useSharedValue(1);
  const panelHeight = useSharedValue(0); // 0 = unconstrained (auto)

  // Drag gesture — only fires if the finger moves (not a tap)
  const dragGesture = Gesture.Pan()
    .minDistance(6)
    .onBegin(() => {
      offsetX.value = panelX.value;
      offsetY.value = panelY.value;
    })
    .onUpdate((e) => {
      panelX.value = offsetX.value + e.translationX;
      panelY.value = offsetY.value + e.translationY;
    });

  // Tap gesture on the handle — toggles collapsed state
  const tapGesture = Gesture.Tap()
    .maxDistance(8)
    .onEnd(() => {
      const next = !collapsed.value;
      collapsed.value = next;
      contentOpacity.value = withSpring(next ? 0 : 1, SPRING);
      panelHeight.value = withSpring(next ? COLLAPSED_HEIGHT : 0, SPRING);
    });

  // Handle receives both — tap fires if no drag movement
  const handleGesture = Gesture.Simultaneous(dragGesture, tapGesture);

  const panelAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panelX.value },
      { translateY: panelY.value },
    ],
    // 0 means height is unset (auto) — we only constrain it when collapsing
    ...(panelHeight.value > 0 ? { height: panelHeight.value, overflow: "hidden" as const } : {}),
  }));

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <GestureDetector gesture={dragGesture}>
        <Animated.View style={[styles.panel, panelAnimStyle]}>

          {/* Drag handle — also tappable to collapse */}
          <GestureDetector gesture={handleGesture}>
            <View style={styles.handleRow}>
              <View style={styles.dragHandle} />
              {collapsed.value ? (
                <Text style={styles.collapsedLabel}>
                  {mode === "calibrate" ? "📏 Calibration" : "📐 Measuring"} — tap to expand
                </Text>
              ) : null}
            </View>
          </GestureDetector>

          <Animated.View style={contentAnimStyle}>
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
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  value={refInput}
                  onChangeText={onRefInputChange}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    Keyboard.dismiss();
                    onConfirm();
                  }}
                >
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
  handleRow: {
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 4,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#666",
    marginBottom: 4,
  },
  collapsedLabel: {
    color: "#aaa",
    fontSize: 13,
  },
  panel: {
    backgroundColor: "rgba(0,0,0,0.80)",
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
