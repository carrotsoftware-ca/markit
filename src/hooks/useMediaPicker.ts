import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

async function getFileSize(uri: string): Promise<number | undefined> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return info.exists ? (info as any).size : undefined;
  } catch {
    return undefined;
  }
}

export interface PickedMedia {
  uri: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
}

export async function useMediaPicker(): Promise<PickedMedia | null> {
  throw new Error("useMediaPicker must be called as a function, not a hook.");
}

export async function pickMedia(): Promise<PickedMedia | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsMultipleSelection: false,
    quality: 1,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];

  const isHeic =
    asset.mimeType === "image/heic" ||
    asset.mimeType === "image/heif" ||
    asset.uri.toLowerCase().endsWith(".heic") ||
    asset.uri.toLowerCase().endsWith(".heif");

  if (isHeic) {
    const converted = await ImageManipulator.manipulateAsync(
      asset.uri,
      [],
      { format: ImageManipulator.SaveFormat.PNG },
    );
    const originalName = asset.fileName ?? asset.uri.split("/").pop() ?? "upload";
    const pngFilename = originalName.replace(/\.heic$|\.heif$/i, ".png");
    const fileSize = await getFileSize(converted.uri);

    return {
      uri: converted.uri,
      filename: pngFilename,
      mimeType: "image/png",
      fileSize,
    };
  }

  const fileSize = asset.fileSize ?? (await getFileSize(asset.uri));

  return {
    uri: asset.uri,
    filename: asset.fileName ?? asset.uri.split("/").pop() ?? "upload",
    mimeType: asset.mimeType ?? undefined,
    fileSize,
  };
}
