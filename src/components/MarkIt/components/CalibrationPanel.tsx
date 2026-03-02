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
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

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
  /**
   * Estimated camera-to-subject distance in inches, derived from focal length
   * EXIF + calibration scale. Displayed as a quality indicator after calibration.
   */
  estimatedDepthIn?: number | null;
  /** Whether EXIF focal length data is available — used to show/hide depth hints */
  hasDepthData?: boolean;
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
  estimatedDepthIn,
  hasDepthData,
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
    transform: [{ translateX: panelX.value }, { translateY: panelY.value + kbOffset.value }],
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
            <Animated.View ref={panelRef} style={[styles.panel, panelAnimStyle]}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>📏 Calibration</Text>
                <MaterialCommunityIcons name="drag-variant" size={22} color="#666" />
              </View>
              <Text style={styles.subtitle}>
                Draw a line over a known object, then enter its real size.{"\n"}
                <Text style={styles.subtitleHint}>
                  📍 For best accuracy, calibrate at the same distance as what you plan to measure.
                </Text>
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
                <TouchableOpacity style={styles.dismissKey} onPress={() => Keyboard.dismiss()}>
                  <MaterialCommunityIcons name="keyboard-close" size={22} color="#fff" />
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
      {/* Depth badge — top left below scale badge, always visible when EXIF available */}
      {estimatedDepthIn != null && estimatedDepthIn > 0 && (
        <View style={styles.depthBadge} pointerEvents="none">
          <MaterialCommunityIcons name="camera" size={13} color="#64b5f6" />
          <Text style={styles.depthBadgeText}>
            ~
            {estimatedDepthIn >= 12
              ? `${(estimatedDepthIn / 12).toFixed(1)} ft`
              : `${estimatedDepthIn.toFixed(1)} in`}{" "}
            from camera
          </Text>
        </View>
      )}
      {/* Toolbar icon — bottom right (above safe area) */}
      <Pressable
        style={styles.toolbarIcon}
        onPress={() => setMeasurePanelVisible((v) => !v)}
        hitSlop={16}
      >
        <MaterialCommunityIcons name="tools" size={24} color="#fff" />
        <Text style={styles.toolbarLabel}>{measurePanelVisible ? "Close" : "Tools"}</Text>
      </Pressable>

      {/* Measure panel */}
      {measurePanelVisible && (
        <View style={styles.overlay} pointerEvents="box-none">
          <GestureDetector gesture={dragGesture}>
            <Animated.View style={[styles.panel, panelAnimStyle]}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>📐 Measuring</Text>
                <MaterialCommunityIcons name="drag-variant" size={22} color="#666" />
              </View>
              <Text style={styles.subtitle}>
                {intrinsicScale ? `${intrinsicScale.toFixed(5)} in/px` : "No scale set"}
              </Text>
              {/* Calibration depth + perspective warning */}
              {estimatedDepthIn != null && estimatedDepthIn > 0 && (
                <View style={styles.depthRow}>
                  <MaterialCommunityIcons name="camera-distance" size={13} color="#64b5f6" />
                  <Text style={styles.depthText}>
                    Calibrated at ~
                    {estimatedDepthIn >= 12
                      ? `${(estimatedDepthIn / 12).toFixed(1)} ft`
                      : `${estimatedDepthIn.toFixed(1)} in`}{" "}
                    from camera
                  </Text>
                </View>
              )}
              {/* Perspective accuracy warning */}
              <View style={styles.warningRow}>
                <MaterialCommunityIcons name="alert-outline" size={13} color="#FFB300" />
                <Text style={styles.warningText}>
                  {estimatedDepthIn != null && estimatedDepthIn > 0
                    ? `Objects closer/farther than ${estimatedDepthIn >= 12 ? `${(estimatedDepthIn / 12).toFixed(1)} ft` : `${estimatedDepthIn.toFixed(1)} in`} will read incorrectly due to perspective.`
                    : "Measurements are only accurate at the same depth as your calibration object."}
                </Text>
              </View>
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
    bottom: 100,
    left: 16,
    right: 16,
  },
  toolbarIcon: {
    position: "absolute",
    bottom: 40,
    right: 16,
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  toolbarLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
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
  subtitleHint: {
    color: "#aaa",
    fontSize: 12,
    fontStyle: "italic",
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
  depthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  depthText: {
    color: "#64b5f6",
    fontSize: 12,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    backgroundColor: "rgba(255,179,0,0.12)",
    borderRadius: 6,
    padding: 6,
  },
  warningText: {
    color: "#FFB300",
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
});
