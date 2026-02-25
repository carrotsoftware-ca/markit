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
  Text,
  useFont,
} from "@shopify/react-native-skia";
import React from "react";
import type { SharedValue } from "react-native-reanimated";

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
    require("../../../../assets/fonts/space_grotesk/SpaceGrotesk-VariableFont_wght.ttf"),
    16,
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
          <Group key={line.id}>
            <Line
              p1={{ x: line.x1, y: line.y1 }}
              p2={{ x: line.x2, y: line.y2 }}
              color="red"
              strokeWidth={3}
            />
            {font && (
              <Text
                x={(line.x1 + line.x2) / 2}
                y={(line.y1 + line.y2) / 2 - 10}
                text={line.label}
                font={font}
                color="white"
              />
            )}
          </Group>
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
          <Text
            x={labelX}
            y={labelY}
            text={distanceText}
            font={font}
            color="white"
          />
        )}
      </Group>
    </Canvas>
  );
}
