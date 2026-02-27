import type { SkFont } from "@shopify/react-native-skia";
import { Group, Line, RoundedRect, Text } from "@shopify/react-native-skia";
import React from "react";
import { Platform } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import type { CommittedLine } from "./MeasureCanvas";

const LINE_COLOR = "#F97316"; // orange
const PILL_BG = "rgba(18, 24, 38, 0.85)"; // dark navy
const PILL_TEXT = "#FFFFFF";
const PILL_H = 28;
const PILL_PADDING_X = 10;
const PILL_RADIUS = 8;
const STROKE_WIDTH = 2.5;

interface Props {
  line: CommittedLine;
  font: SkFont | null;
  zoomLevel: SharedValue<number>;
}

/**
 * Renders a single committed measurement line with an orange stroke and a
 * dark pill label centred above the midpoint.
 *
 * The pill and text are counter-scaled by 1/zoomLevel so they remain a
 * constant size on screen regardless of the current zoom level.
 *
 * Designed to be used inside a Skia <Group> that is already inside the
 * zoom/pan transform in MeasureCanvas.
 */
export function MeasurementLine({ line, font, zoomLevel }: Props) {
  const { x1, y1, x2, y2, label } = line;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // measureText is not implemented on web — use a fixed fallback width instead
  const textWidth =
    font && Platform.OS !== "web" ? font.measureText(label).width : label.length * 8;
  const pillW = textWidth + PILL_PADDING_X * 2;

  // Counter-scale transform: keeps the pill at a constant screen size.
  // We translate to the midpoint, scale by 1/zoom, then translate back.
  const pillTransform = useDerivedValue(() => {
    const s = 1 / zoomLevel.value;
    return [
      { translateX: mx },
      { translateY: my },
      { scale: s },
      { translateX: -mx },
      { translateY: -my },
    ];
  });

  // At zoom=1 the pill sits above the midpoint. Because we counter-scale
  // around the midpoint, the pill offset stays visually constant.
  const pillX = mx - pillW / 2;
  const pillY = my - PILL_H - 6;
  const textX = pillX + PILL_PADDING_X;
  const textY = pillY + PILL_H / 2 + 6;

  return (
    <Group>
      {/* Main line — scales naturally with the zoom group */}
      <Line
        p1={{ x: x1, y: y1 }}
        p2={{ x: x2, y: y2 }}
        color={LINE_COLOR}
        strokeWidth={STROKE_WIDTH}
      />

      {/* Tick at p1 */}
      <EndTick x={x1} y={y1} x2={x2} y2={y2} />

      {/* Tick at p2 */}
      <EndTick x={x2} y={y2} x2={x1} y2={y1} />

      {/* Pill background — counter-scaled to stay constant screen size */}
      {font && (
        <Group transform={pillTransform}>
          <RoundedRect
            x={pillX}
            y={pillY}
            width={pillW}
            height={PILL_H}
            r={PILL_RADIUS}
            color={PILL_BG}
          />
          <Text x={textX} y={textY} text={label} font={font} color={PILL_TEXT} />
        </Group>
      )}
    </Group>
  );
}

/**
 * Draws a short perpendicular tick mark at the end of a line segment.
 * The tick is perpendicular to the direction from (x,y) toward (x2,y2).
 */
function EndTick({ x, y, x2, y2 }: { x: number; y: number; x2: number; y2: number }) {
  const dx = x2 - x;
  const dy = y2 - y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector
  const px = (-dy / len) * 6;
  const py = (dx / len) * 6;

  return (
    <Line
      p1={{ x: x + px, y: y + py }}
      p2={{ x: x - px, y: y - py }}
      color={LINE_COLOR}
      strokeWidth={STROKE_WIDTH}
    />
  );
}
