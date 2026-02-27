import type {
    AnimatedProp,
    SkImage,
    SkPoint,
    Transforms3d,
} from "@shopify/react-native-skia";
import {
    Canvas,
    DashPathEffect,
    Group,
    Image,
    Line,
    RoundedRect,
    Text,
    useFont,
} from "@shopify/react-native-skia";
import React from "react";
import type { SharedValue } from "react-native-reanimated";

import { MeasurementLine } from "./MeasurementLine";

/** A committed measurement line with pre-computed screen coordinates */
export interface CommittedLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}

/** The calibration reference line, pre-computed to screen coords */
export interface CalibrationScreenLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface MeasureCanvasProps {
  image: SkImage | null;
  // Pre-computed animated props — all derived values are created in
  // index.native.tsx and passed in. This component has zero hooks so it
  // can never trigger a worklet re-registration on re-render.
  zoomTransform: SharedValue<Transforms3d>;
  zoomLevel: SharedValue<number>;
  imageWidth: SharedValue<number>;
  imageHeight: SharedValue<number>;
  // Live in-progress measurement line
  p1: AnimatedProp<SkPoint>;
  p2: AnimatedProp<SkPoint>;
  labelX: SharedValue<number>;
  labelY: SharedValue<number>;
  distanceText: SharedValue<string>;
  lineOpacity: SharedValue<number>;
  lineColor: SharedValue<string>;
  // Committed lines from the event log
  committedLines: CommittedLine[];
  // Optional calibration reference line (shown when user toggles it)
  calibrationLine?: CalibrationScreenLine | null;
}

// Fixed pill dimensions for the live in-progress label.
// Wide enough for the longest expected label (e.g. "99' 11\"").
const LIVE_PILL_W = 90;
const LIVE_PILL_H = 28;
const LIVE_PILL_PAD = 10;

/**
 * Pure Skia drawing layer — NO hooks (except useFont which is safe).
 *
 * All animated/derived values are created in index.native.tsx and passed as
 * props. This guarantees no worklet is ever registered or re-registered from
 * inside this component, eliminating the Reanimated UI-thread deadlock.
 */
export function MeasureCanvas({
  image,
  zoomTransform,
  zoomLevel,
  imageWidth,
  imageHeight,
  p1,
  p2,
  labelX,
  labelY,
  distanceText,
  lineOpacity,
  lineColor,
  committedLines,
  calibrationLine,
}: MeasureCanvasProps) {
  const font = useFont(
    require("../../../../assets/fonts/space_grotesk/static/SpaceGrotesk-SemiBold.ttf"),
    14,
  );

  return (
    <Canvas style={{ flex: 1 }}>
      {/* Layer 1 + 2 + 3: image and all stored lines inside the zoom/pan transform */}
      <Group transform={zoomTransform}>
        {image && (
          <Image
            image={image}
            x={0}
            y={0}
            width={imageWidth}
            height={imageHeight}
            fit="contain"
          />
        )}

        {/* Committed measurement lines — image-space coords, track zoom/pan */}
        {committedLines.map((line) => (
          <MeasurementLine key={line.id} line={line} font={font} zoomLevel={zoomLevel} />
        ))}

        {/* Calibration reference line — image-space coords, track zoom/pan */}
        {calibrationLine && (
          <Line
            p1={{ x: calibrationLine.x1, y: calibrationLine.y1 }}
            p2={{ x: calibrationLine.x2, y: calibrationLine.y2 }}
            color="rgba(255,255,255,0.4)"
            strokeWidth={2}
          >
            <DashPathEffect intervals={[8, 6]} />
          </Line>
        )}
      </Group>

      {/* Layer 4: live in-progress line — screen space, stays fixed on screen */}
      <Group opacity={lineOpacity}>
        <Line p1={p1} p2={p2} color={lineColor} strokeWidth={3} />
        {font && (
          <>
            {/* Pill background — centred on labelX/labelY */}
            <RoundedRect
              x={labelX}
              y={labelY}
              width={LIVE_PILL_W}
              height={LIVE_PILL_H}
              r={8}
              color="rgba(18, 24, 38, 0.85)"
              transform={[
                { translateX: -LIVE_PILL_W / 2 },
                { translateY: -LIVE_PILL_H / 2 },
              ]}
            />
            <Text
              x={labelX}
              y={labelY}
              text={distanceText}
              font={font}
              color="white"
              transform={[
                { translateX: -LIVE_PILL_W / 2 + LIVE_PILL_PAD },
                { translateY: LIVE_PILL_H / 2 - 4 },
              ]}
            />
          </>
        )}
      </Group>
    </Canvas>
  );
}
