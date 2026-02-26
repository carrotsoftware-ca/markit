import type { NormalizedPoint } from "@/src/types";
import type { SkImage } from "@shopify/react-native-skia";
import { PixelRatio } from "react-native";

/**
 * Computes the rendered image rect under Skia's "contain" (letter-box) fit.
 *
 * image.width()/height() return physical pixels. canvasWidth/Height are
 * logical points (from onLayout). We divide image dimensions by PixelRatio
 * so both are in the same unit before computing the scale.
 */
function getRenderedImageRect(
  image: SkImage,
  canvasWidth: number,
  canvasHeight: number,
): { x: number; y: number; w: number; h: number } {
  const pr = PixelRatio.get();
  const imgW = image.width() / pr;
  const imgH = image.height() / pr;

  const scaleX = canvasWidth / imgW;
  const scaleY = canvasHeight / imgH;
  const scale = Math.min(scaleX, scaleY); // "contain"

  const w = imgW * scale;
  const h = imgH * scale;
  const x = (canvasWidth - w) / 2;
  const y = (canvasHeight - h) / 2;

  return { x, y, w, h };
}

/**
 * Convert a screen-space point (from a gesture event) to a normalized image
 * coordinate in the range [0, 1].
 *
 * Takes zoom + pan into account so the stored coordinate is always relative
 * to the image at rest (zoom = 1, no translation), making events
 * resolution- and zoom-independent.
 *
 * @param screenX/Y  - raw gesture coordinates in screen pixels
 * @param image      - the loaded Skia image
 * @param canvasW/H  - canvas dimensions
 * @param zoom       - current zoom level (from useZoom)
 * @param tx/ty      - current pan translation (from useZoom)
 */
export function screenToNormalized(
  screenX: number,
  screenY: number,
  image: SkImage,
  canvasW: number,
  canvasH: number,
  zoom: number,
  tx: number,
  ty: number,
): NormalizedPoint {
  // The zoom transform in MeasureCanvas is:
  //   translate(cx + tx, cy + ty) · scale(zoom) · translate(-cx, -cy)
  // where cx = canvasW/2, cy = canvasH/2.
  // To invert it, we reverse those operations.
  const cx = canvasW / 2;
  const cy = canvasH / 2;

  // Undo the transform to get image-space (zoom=1, tx=0, ty=0) coordinates
  const imageSpaceX = (screenX - cx - tx) / zoom + cx;
  const imageSpaceY = (screenY - cy - ty) / zoom + cy;

  // Now normalize relative to the rendered image rect
  const rect = getRenderedImageRect(image, canvasW, canvasH);
  return {
    x: (imageSpaceX - rect.x) / rect.w,
    y: (imageSpaceY - rect.y) / rect.h,
  };
}

/**
 * Convert a stored normalized point to image-space pixels at zoom=1 / tx=0 / ty=0.
 *
 * Use this when you want coordinates that live *inside* the zoom Group in
 * the Skia canvas — they will automatically scale and pan with the image.
 */
export function normalizedToImageSpace(
  norm: NormalizedPoint,
  image: SkImage,
  canvasW: number,
  canvasH: number,
): { x: number; y: number } {
  return normalizedToScreen(norm, image, canvasW, canvasH, 1, 0, 0);
}

/**
 * Convert a stored normalized point back to screen-space pixels for rendering.
 * This is the inverse of screenToNormalized.
 *
 * @param norm       - the stored { x, y } in [0,1] image coords
 * @param image      - the loaded Skia image
 * @param canvasW/H  - canvas dimensions
 * @param zoom       - current zoom level
 * @param tx/ty      - current pan translation
 */
export function normalizedToScreen(
  norm: NormalizedPoint,
  image: SkImage,
  canvasW: number,
  canvasH: number,
  zoom: number,
  tx: number,
  ty: number,
): { x: number; y: number } {
  const rect = getRenderedImageRect(image, canvasW, canvasH);

  // Convert normalized → image-space (zoom=1)
  const imageSpaceX = norm.x * rect.w + rect.x;
  const imageSpaceY = norm.y * rect.h + rect.y;

  // Apply the zoom transform
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  const screenX = (imageSpaceX - cx) * zoom + cx + tx;
  const screenY = (imageSpaceY - cy) * zoom + cy + ty;

  return { x: screenX, y: screenY };
}
