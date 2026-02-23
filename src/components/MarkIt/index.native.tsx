import React, { useState } from "react";
import {
  Text as RNText,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import {
  Canvas,
  Group,
  Image,
  Line,
  Text,
  useFont,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

const MarkIt = () => {
  const { width, height } = useWindowDimensions();
  const image = useImage(
    `https://images.unsplash.com/photo-1630699144919-681cf308ae82?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`,
  );
  const font = useFont(
    require("../../../assets/fonts/space_grotesk/SpaceGrotesk-VariableFont_wght.ttf"),
    16,
  );

  // Calibration state
  const [mode, setMode] = useState<"calibrate" | "measure">("calibrate");
  const [refInput, setRefInput] = useState("");
  const [scale, setScale] = useState<number | null>(null); // inches per pixel

  const start = useSharedValue({ x: 0, y: 0 });
  const end = useSharedValue({ x: 0, y: 0 });
  const isActive = useSharedValue(false);
  const scaleSV = useSharedValue<number>(0);
  const lastPixelDistance = useSharedValue<number>(0); // captured on gesture end for calibration

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      start.value = { x: e.x, y: e.y };
      end.value = { x: e.x, y: e.y };
      isActive.value = true;
    })
    .onUpdate((e) => {
      end.value = { x: e.x, y: e.y };
    })
    .onEnd(() => {
      const dx = end.value.x - start.value.x;
      const dy = end.value.y - start.value.y;
      lastPixelDistance.value = Math.sqrt(dx * dx + dy * dy);
    });

  const distanceText = useDerivedValue(() => {
    const dx = end.value.x - start.value.x;
    const dy = end.value.y - start.value.y;
    const px = Math.sqrt(dx * dx + dy * dy);
    if (scaleSV.value > 0) {
      const inches = px * scaleSV.value;
      const feet = Math.floor(inches / 12);
      const remainingInches = (inches % 12).toFixed(1);
      return feet > 0
        ? `${feet}ft ${remainingInches}in`
        : `${remainingInches}in`;
    }
    return `${px.toFixed(0)} px`;
  });

  // Calculate the center point for the label
  const labelPos = useDerivedValue(() => {
    return {
      x: (start.value.x + end.value.x) / 2,
      y: (start.value.y + end.value.y) / 2 - 10, // Offset slightly above the line
    };
  });

  // Drive visibility via opacity to avoid reading .value during render
  const groupOpacity = useDerivedValue(() => (isActive.value ? 1 : 0));

  const labelX = useDerivedValue(() => labelPos.value.x);
  const labelY = useDerivedValue(() => labelPos.value.y);
  const p1 = useDerivedValue(() => vec(start.value.x, start.value.y));
  const p2 = useDerivedValue(() => vec(end.value.x, end.value.y));

  // Panel drag position
  const panelX = useSharedValue(0);
  const panelY = useSharedValue(0);
  const panelOffsetX = useSharedValue(0);
  const panelOffsetY = useSharedValue(0);

  const panelDragGesture = Gesture.Pan()
    .minDistance(0)
    .onBegin(() => {
      panelOffsetX.value = panelX.value;
      panelOffsetY.value = panelY.value;
    })
    .onUpdate((e) => {
      panelX.value = panelOffsetX.value + e.translationX;
      panelY.value = panelOffsetY.value + e.translationY;
    });

  const panelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: panelX.value }, { translateY: panelY.value }],
  }));

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <Canvas style={{ width, height }}>
          {image && (
            <Image
              image={image}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="contain"
            />
          )}
          <Group opacity={groupOpacity}>
            <Line
              p1={p1}
              p2={p2}
              color={mode === "calibrate" ? "orange" : "red"}
              strokeWidth={3}
            />
            {font && (
              <Text
                x={labelX}
                y={labelY}
                text={distanceText}
                font={font}
                color="black"
              />
            )}
          </Group>
        </Canvas>
      </GestureDetector>

      {/* Draggable Overlay UI */}
      <View style={styles.overlay} pointerEvents="box-none">
        <GestureDetector gesture={panelDragGesture}>
          <Animated.View style={[styles.panel, panelAnimatedStyle]}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />
            {mode === "calibrate" ? (
              <>
                <RNText style={styles.panelTitle}>📏 Calibration</RNText>
                <RNText style={styles.panelSubtitle}>
                  Draw a line over a known object, then enter its real size.
                </RNText>
                <TextInput
                  style={styles.input}
                  placeholder="Size in inches (e.g. 4)"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  value={refInput}
                  onChangeText={setRefInput}
                />
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    const px = lastPixelDistance.value;
                    const realSize = parseFloat(refInput);
                    if (px > 0 && realSize > 0) {
                      const s = realSize / px;
                      setScale(s);
                      scaleSV.value = s;
                      setMode("measure");
                    }
                  }}
                >
                  <RNText style={styles.buttonText}>Set Scale & Measure</RNText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <RNText style={styles.panelTitle}>📐 Measuring</RNText>
                <RNText style={styles.panelSubtitle}>
                  Scale: {scale?.toFixed(5)} in/px
                </RNText>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#555" }]}
                  onPress={() => {
                    setMode("calibrate");
                    setScale(null);
                    scaleSV.value = 0;
                    setRefInput("");
                  }}
                >
                  <RNText style={styles.buttonText}>Recalibrate</RNText>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

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
  panelTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  panelSubtitle: {
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MarkIt;
