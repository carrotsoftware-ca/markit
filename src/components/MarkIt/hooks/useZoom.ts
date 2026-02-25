import { useWindowDimensions } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const DOUBLE_TAP_ZOOM = 3; // zoom level to spring to on double-tap
const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

/**
 * Manages zoom + canvas-pan state for the MarkIt canvas.
 *
 * Gestures:
 *  - Pinch            → zoom in/out around the pinch focal point
 *  - 2-finger pan     → pan the canvas while zoomed (clamped so image stays on screen)
 *  - Double-tap       → spring back to zoom 1× centred
 *
 * All values are Reanimated shared values so Skia can consume them on the
 * UI thread without triggering React re-renders.
 */
export function useZoom() {
  const { width, height } = useWindowDimensions();

  // Current zoom level (1 = no zoom)
  const zoomLevel = useSharedValue(1);
  // Canvas translation (offset from centre)
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Snapshots at gesture start
  const zoomStart = useSharedValue(1);
  const txStart = useSharedValue(0);
  const tyStart = useSharedValue(0);
  // Focal point of the pinch at gesture start (screen coords)
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // --- Pinch to zoom (around the pinch focal point) ---
  //
  // The transform in index.native.tsx is:
  //   translateX(cx + tx) → translateY(cy + ty) → scale(s) → translateX(-cx) → translateY(-cy)
  //
  // To keep the focal point stationary under the fingers we adjust tx/ty so
  // that the image pixel under the focal point doesn't move as scale changes.
  //
  // At scale s0 the image pixel under screen point (fx, fy) is:
  //   imgX = (fx - cx - tx0) / s0
  // After scaling to s1 we want that pixel to stay at (fx, fy):
  //   tx1 = fx - cx - imgX * s1  = tx0 + imgX * (s0 - s1)
  //       = tx0 - (fx - cx - tx0) / s0 * (s1 - s0)
  const pinchGesture = Gesture.Pinch()
    .onBegin((e) => {
      zoomStart.value = zoomLevel.value;
      txStart.value = translateX.value;
      tyStart.value = translateY.value;
      // Focal point relative to screen centre (matches transform origin)
      focalX.value = e.focalX - width / 2;
      focalY.value = e.focalY - height / 2;
    })
    .onUpdate((e) => {
      const s0 = zoomStart.value;
      const s1 = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s0 * e.scale));
      zoomLevel.value = s1;

      // Adjust translation so the focal point stays fixed
      const fx = focalX.value;
      const fy = focalY.value;
      const newTx = txStart.value - ((fx - txStart.value) / s0) * (s1 - s0);
      const newTy = tyStart.value - ((fy - tyStart.value) / s0) * (s1 - s0);

      // Clamp: don't let the image leave the screen
      const maxTx = (width / 2) * (s1 - 1);
      const maxTy = (height / 2) * (s1 - 1);
      translateX.value = Math.max(-maxTx, Math.min(maxTx, newTx));
      translateY.value = Math.max(-maxTy, Math.min(maxTy, newTy));
    })
    .onEnd(() => {
      // Spring the translation back inside bounds in case it drifted
      const s = zoomLevel.value;
      const maxTx = (width / 2) * (s - 1);
      const maxTy = (height / 2) * (s - 1);
      translateX.value = withSpring(
        Math.max(-maxTx, Math.min(maxTx, translateX.value)),
        SPRING,
      );
      translateY.value = withSpring(
        Math.max(-maxTy, Math.min(maxTy, translateY.value)),
        SPRING,
      );
    });

  // --- 2-finger pan (clamped so image stays on screen) ---
  const canvasPanGesture = Gesture.Pan()
    .minPointers(2)
    .onBegin(() => {
      txStart.value = translateX.value;
      tyStart.value = translateY.value;
    })
    .onUpdate((e) => {
      const s = zoomLevel.value;
      const maxTx = (width / 2) * (s - 1);
      const maxTy = (height / 2) * (s - 1);
      translateX.value = Math.max(
        -maxTx,
        Math.min(maxTx, txStart.value + e.translationX),
      );
      translateY.value = Math.max(
        -maxTy,
        Math.min(maxTy, tyStart.value + e.translationY),
      );
    });

  // --- Double-tap: zoom in to tap point, or reset if already zoomed ---
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (zoomLevel.value > 1) {
        // Already zoomed — spring back to reset
        zoomLevel.value = withSpring(1, SPRING);
        translateX.value = withSpring(0, SPRING);
        translateY.value = withSpring(0, SPRING);
      } else {
        // Zoom in to the tapped point using the same focal-point math as pinch
        const s0 = 1;
        const s1 = DOUBLE_TAP_ZOOM;
        // Focal point relative to screen centre (matches the transform origin)
        const fx = e.x - width / 2;
        const fy = e.y - height / 2;
        const newTx = 0 - ((fx - 0) / s0) * (s1 - s0);
        const newTy = 0 - ((fy - 0) / s0) * (s1 - s0);
        const maxTx = (width / 2) * (s1 - 1);
        const maxTy = (height / 2) * (s1 - 1);
        zoomLevel.value = withSpring(s1, SPRING);
        translateX.value = withSpring(Math.max(-maxTx, Math.min(maxTx, newTx)), SPRING);
        translateY.value = withSpring(Math.max(-maxTy, Math.min(maxTy, newTy)), SPRING);
      }
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
