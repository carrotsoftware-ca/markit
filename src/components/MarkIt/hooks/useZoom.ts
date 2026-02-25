import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const DOUBLE_TAP_ZOOM = 3;
const SPRING = { damping: 20, stiffness: 200, mass: 0.6 };

/**
 * Manages zoom + canvas-pan state for the MarkIt canvas.
 *
 * Gestures:
 *  - Pinch            → zoom in/out around the pinch focal point
 *  - 2-finger pan     → pan the canvas while zoomed
 *  - Double-tap       → zoom to tap point (or reset if already zoomed)
 *
 * All values are Reanimated shared values so Skia can consume them on the
 * UI thread without triggering React re-renders.
 */
export function useZoom() {
  const { width, height } = useWindowDimensions();

  const zoomLevel = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // --- Pinch-to-zoom ---
  //
  // Delta-based approach: each onUpdate frame we apply only the *change* in
  // scale since the last frame (dScale = e.scale / lastScale), around the
  // current focal point. This means the focal point can drift naturally as
  // fingers move — no jolt from focal-point mismatch at gesture start.
  //
  // Transform: translate(cx+tx, cy+ty) → scale(s) → translate(-cx,-cy)
  // To keep canvas point under focal fixed when applying delta dS:
  //   tx_new = fx + (tx - fx) * dS     where fx = focalX - cx

  const lastScale = useSharedValue(1);

  const panTxStart = useSharedValue(0);
  const panTyStart = useSharedValue(0);

  const clamp = (val: number, min: number, max: number) => {
    "worklet";
    return Math.max(min, Math.min(max, val));
  };

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      // Cancel any in-flight spring animations so values are stable
      cancelAnimation(zoomLevel);
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      lastScale.value = 1;
    })
    .onUpdate((e) => {
      // Delta scale since last frame
      const dS = e.scale / lastScale.value;
      lastScale.value = e.scale;

      const s0 = zoomLevel.value;
      const s1 = clamp(s0 * dS, MIN_ZOOM, MAX_ZOOM);
      const actualDS = s1 / s0; // may differ from dS at boundaries
      zoomLevel.value = s1;

      // Focal point relative to screen centre (updated every frame)
      const fx = e.focalX - width / 2;
      const fy = e.focalY - height / 2;

      // Apply delta zoom around focal point
      const newTx = fx + (translateX.value - fx) * actualDS;
      const newTy = fy + (translateY.value - fy) * actualDS;

      const maxTx = (width / 2) * (s1 - 1);
      const maxTy = (height / 2) * (s1 - 1);
      translateX.value = clamp(newTx, -maxTx, maxTx);
      translateY.value = clamp(newTy, -maxTy, maxTy);
    })
    .onEnd(() => {
      if (zoomLevel.value < 1.05) {
        zoomLevel.value = withSpring(1, SPRING);
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
        return;
      }
      const s = zoomLevel.value;
      const maxTx = (width / 2) * (s - 1);
      const maxTy = (height / 2) * (s - 1);
      translateX.value = withSpring(
        clamp(translateX.value, -maxTx, maxTx),
        SPRING,
      );
      translateY.value = withSpring(
        clamp(translateY.value, -maxTy, maxTy),
        SPRING,
      );
    });

  // --- 2-finger pan ---
  // Uses its own start snapshot so it doesn't interfere with pinch snapshots
  const canvasPanGesture = Gesture.Pan()
    .minPointers(2)
    .onBegin(() => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      panTxStart.value = translateX.value;
      panTyStart.value = translateY.value;
    })
    .onUpdate((e) => {
      const s = zoomLevel.value;
      const maxTx = (width / 2) * (s - 1);
      const maxTy = (height / 2) * (s - 1);
      translateX.value = clamp(
        panTxStart.value + e.translationX,
        -maxTx,
        maxTx,
      );
      translateY.value = clamp(
        panTyStart.value + e.translationY,
        -maxTy,
        maxTy,
      );
    });

  // --- Double-tap: zoom in to tap point, or reset ---
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (zoomLevel.value > 1.2) {
        zoomLevel.value = withSpring(1, SPRING);
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
      } else {
        const s0 = zoomLevel.value;
        const s1 = DOUBLE_TAP_ZOOM;
        const fx = e.x - width / 2;
        const fy = e.y - height / 2;
        const tx0 = translateX.value;
        const ty0 = translateY.value;
        const scale = s1 / s0;
        const newTx = tx0 - (fx - tx0) * (scale - 1);
        const newTy = ty0 - (fy - ty0) * (scale - 1);
        const maxTx = (width / 2) * (s1 - 1);
        const maxTy = (height / 2) * (s1 - 1);
        zoomLevel.value = withSpring(s1, SPRING);
        translateX.value = withSpring(clamp(newTx, -maxTx, maxTx), SPRING);
        translateY.value = withSpring(clamp(newTy, -maxTy, maxTy), SPRING);
      }
    });

  const zoomGesture = Gesture.Simultaneous(pinchGesture, canvasPanGesture);

  return {
    zoomLevel,
    translateX,
    translateY,
    zoomGesture,
    doubleTapGesture,
  };
}
