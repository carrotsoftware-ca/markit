import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import type { CalibrationMode } from "../hooks/useCalibration";

interface CalibrationPanelProps {
  mode: CalibrationMode;
  refInput: string;
  onRefInputChange: (v: string) => void;
  intrinsicScale: number | null;
  onConfirm: () => void;
  onRecalibrate: () => void;
  /** Show/hide calibration reference line toggle — only relevant in measure mode */
  hasCalibrationLine?: boolean;
  showCalibrationLine?: boolean;
  onToggleCalibrationLine?: () => void;
}

export function CalibrationPanel({
  mode,
  refInput,
  onRefInputChange,
  intrinsicScale,
  onConfirm,
  onRecalibrate,
  hasCalibrationLine,
  showCalibrationLine,
  onToggleCalibrationLine,
}: CalibrationPanelProps) {
  const panelX = useSharedValue(0);
  const panelY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const kbOffset = useSharedValue(0);

  // Ref to the panel so we can measure its on-screen position
  const panelRef = useRef<View>(null);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      // Measure where the panel currently sits on screen
      panelRef.current?.measureInWindow((_x, y, _w, h) => {
        const panelBottom = y + h;
        const keyboardTop = e.endCoordinates.screenY;
        const overlap = panelBottom - keyboardTop;
        // Only push up by however much the keyboard actually covers the panel.
        // If the panel is already above the keyboard, overlap is ≤ 0 — don't move.
        if (overlap > 0) {
          kbOffset.value = withTiming(-overlap - 8, {
            duration: e.duration ?? 250,
          });
        }
      });
    });
    const hide = Keyboard.addListener("keyboardWillHide", (e) => {
      kbOffset.value = withTiming(0, { duration: e.duration ?? 250 });
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const panelAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: panelX.value },
      { translateY: panelY.value + kbOffset.value },
    ],
  }));

  // In measure mode the panel is hidden by default; user shows it via toolbar
  const [measurePanelVisible, setMeasurePanelVisible] = useState(false);

  // Drag gesture — repositions the panel (title row only).
  // minDistance prevents accidental drags when tapping TextInput/buttons.
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

  // --- Calibrate mode ---
  if (mode === "calibrate") {
    return (
      <View style={styles.calibrateWrapper} pointerEvents="box-none">
        <View style={styles.overlay} pointerEvents="box-none">
          <GestureDetector gesture={dragGesture}>
            <Animated.View
              ref={panelRef}
              style={[styles.panel, panelAnimStyle]}
            >
              <View style={styles.titleRow}>
                <Text style={styles.title}>📏 Calibration</Text>
                <MaterialCommunityIcons
                  name="drag-variant"
                  size={22}
                  color="#666"
                />
              </View>
              <Text style={styles.subtitle}>
                Draw a line over a known object, then enter its real size.
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Size in inches (e.g. 4)"
                  placeholderTextColor="#aaa"
                  keyboardType="decimal-pad"
                  value={refInput}
                  onChangeText={onRefInputChange}
                />
                <TouchableOpacity
                  style={styles.dismissKey}
                  onPress={() => Keyboard.dismiss()}
                >
                  <MaterialCommunityIcons
                    name="keyboard-close"
                    size={22}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.button} onPress={onConfirm}>
                <Text style={styles.buttonText}>Set Scale & Measure</Text>
              </TouchableOpacity>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    );
  }

  // --- Measure mode: toolbar icon top-right + optional panel + scale badge ---
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Scale badge — top left, always visible when calibrated */}
      {intrinsicScale !== null && intrinsicScale > 0 && (
        <View style={styles.scaleBadge} pointerEvents="none">
          <MaterialCommunityIcons name="ruler" size={13} color="#FF8800" />
          <Text style={styles.scaleBadgeText}>
            {refInput ? `${refInput} in ref` : `${intrinsicScale.toFixed(4)} in/px`}
          </Text>
        </View>
      )}
      {/* Toolbar icon — top right */}
      <Pressable
        style={styles.toolbarIcon}
        onPress={() => setMeasurePanelVisible((v) => !v)}
      >
        <MaterialCommunityIcons name="tools" size={22} color="#fff" />
      </Pressable>

      {/* Measure panel */}
      {measurePanelVisible && (
        <View style={styles.overlay} pointerEvents="box-none">
          <GestureDetector gesture={dragGesture}>
            <Animated.View style={[styles.panel, panelAnimStyle]}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>📐 Measuring</Text>
                <MaterialCommunityIcons
                  name="drag-variant"
                  size={22}
                  color="#666"
                />
              </View>
              <Text style={styles.subtitle}>
                {intrinsicScale
                  ? `${intrinsicScale.toFixed(5)} in/px`
                  : "No scale set"}
              </Text>
              {hasCalibrationLine && (
                <TouchableOpacity
                  style={[styles.button, styles.buttonSecondary]}
                  onPress={onToggleCalibrationLine}
                >
                  <Text style={styles.buttonText}>
                    {showCalibrationLine ? "Hide" : "Show"} reference line
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setMeasurePanelVisible(false);
                  onRecalibrate();
                }}
              >
                <Text style={styles.buttonText}>Recalibrate</Text>
              </TouchableOpacity>
            </Animated.View>
          </GestureDetector>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calibrateWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    pointerEvents: "box-none" as any,
  },
  overlay: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
  },
  toolbarIcon: {
    position: "absolute",
    top: 56,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panel: {
    backgroundColor: "rgba(0,0,0,0.85)",
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dismissKey: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#444",
    alignItems: "center",
    justifyContent: "center",
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
