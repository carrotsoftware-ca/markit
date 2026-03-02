import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export interface CapturedPhoto {
  uri: string;
  filename: string;
  mimeType: string;
  fileSize: number | undefined;
  /** Displayed width in pixels (EXIF-corrected — use this, not raw Skia image.width()) */
  width: number;
  /** Displayed height in pixels (EXIF-corrected — use this, not raw Skia image.height()) */
  height: number;
  /** Raw EXIF metadata — includes FocalLength, FocalLengthIn35mmFilm, Make, Model, etc. */
  exif?: Record<string, any>;
}

/**
 * Opens the native camera and returns the captured photo, or null if the
 * user cancelled or denied permission.
 */
export async function takePhoto(): Promise<CapturedPhoto | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();

  if (status !== "granted") {
    Alert.alert(
      "Camera Permission Required",
      "Please allow markit to access your camera in Settings.",
    );
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    quality: 0.9,
    allowsEditing: false,
    exif: true, // Request EXIF data for focal length correction
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;

  return {
    uri: asset.uri,
    filename,
    mimeType: asset.mimeType ?? "image/jpeg",
    fileSize: asset.fileSize,
    // asset.width/height are EXIF-corrected (what the user sees).
    // Skia's image.width()/height() reads raw sensor pixels and ignores EXIF rotation.
    // We pass these through so MarkIt can use the correct aspect ratio.
    width: asset.width,
    height: asset.height,
    exif: (asset as any).exif,
  };
}
