import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const SPRING = { damping: 20, stiffness: 200 };

/**
 * Manages zoom + canvas-pan state for the MarkIt canvas.
 *
 * Gestures:
 *  - Pinch            → zoom in/out
 *  - 2-finger pan     → pan the canvas while zoomed
 *  - Double-tap       → spring back to zoom 1× centred
 *
 * All values are Reanimated shared values so Skia can consume them on the
 * UI thread without triggering React re-renders.
 */
export function useZoom() {
  // Current zoom level (1 = no zoom)
  const zoomLevel = useSharedValue(1);
  // Canvas translation
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Snapshot of values at the start of each gesture so we can accumulate deltas
  const zoomStart = useSharedValue(1);
  const txStart = useSharedValue(0);
  const tyStart = useSharedValue(0);

  // --- Pinch to zoom ---
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      zoomStart.value = zoomLevel.value;
    })
    .onUpdate((e) => {
      zoomLevel.value = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, zoomStart.value * e.scale),
      );
    });

  // --- 2-finger pan (canvas pan while zoomed) ---
  const canvasPanGesture = Gesture.Pan()
    .minPointers(2)
    .onBegin(() => {
      txStart.value = translateX.value;
      tyStart.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = txStart.value + e.translationX;
      translateY.value = tyStart.value + e.translationY;
    });

  // --- Double-tap to reset ---
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      zoomLevel.value = withSpring(1, SPRING);
      translateX.value = withSpring(0, SPRING);
      translateY.value = withSpring(0, SPRING);
    });

  // Pinch and 2-finger pan run simultaneously (natural pinch-to-zoom feel)
  const zoomGesture = Gesture.Simultaneous(pinchGesture, canvasPanGesture);

  return {
    zoomLevel,
    translateX,
    translateY,
    zoomGesture,
    doubleTapGesture,
  };
}
