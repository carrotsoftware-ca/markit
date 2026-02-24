import React from "react";
import {
  Canvas,
  Group,
  Image,
  Line,
  Text,
  useFont,
} from "@shopify/react-native-skia";
import type {
  SkImage,
  AnimatedProp,
  SkPoint,
  Transforms3d,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

interface MeasureCanvasProps {
  image: SkImage | null;
  // Pre-computed animated props — all derived values are created in
  // index.native.tsx and passed in. This component has zero hooks so it
  // can never trigger a worklet re-registration on re-render.
  zoomTransform: SharedValue<Transforms3d>;
  imageWidth: SharedValue<number>;
  imageHeight: SharedValue<number>;
  // Measurement line
  p1: AnimatedProp<SkPoint>;
  p2: AnimatedProp<SkPoint>;
  labelX: SharedValue<number>;
  labelY: SharedValue<number>;
  distanceText: SharedValue<string>;
  lineOpacity: SharedValue<number>;
  lineColor: SharedValue<string>;
}

/**
 * Pure Skia drawing layer — NO hooks.
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
}: MeasureCanvasProps) {
  const font = useFont(
    require("../../../../assets/fonts/space_grotesk/SpaceGrotesk-VariableFont_wght.ttf"),
    16,
  );

  return (
    <Canvas style={{ flex: 1 }}>
      {/* Layer 1: image in zoom/pan transform */}
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
      </Group>

      {/* Layer 2: measurement line in screen space (outside zoom group) */}
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
