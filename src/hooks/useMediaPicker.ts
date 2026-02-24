import * as ImagePicker from "expo-image-picker";

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

  return {
    uri: asset.uri,
    filename: asset.fileName ?? asset.uri.split("/").pop() ?? "upload",
    mimeType: asset.mimeType ?? undefined,
    fileSize: asset.fileSize ?? undefined,
  };
}
