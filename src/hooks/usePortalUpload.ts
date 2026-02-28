import { FileWithEvents } from "@/src/components/ui/portal/PortalFileRow";
import {
  getPortalEvents,
  getPortalFiles,
  uploadPortalFile,
} from "@/src/services/projects/getPortalProject";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";

export type UploadState = { filename: string; progress: number; done: boolean };

export function usePortalUpload(
  projectId: string,
  onFilesRefreshed: (items: FileWithEvents[]) => void,
  authorId?: string,
  authorName?: string,
) {
  const [uploads, setUploads] = useState<UploadState[]>([]);

  const refreshFiles = async () => {
    const files = await getPortalFiles(projectId);
    const doneFiles = files.filter((f) => f.status === "done");
    const withEvents = await Promise.all(
      doneFiles.map(async (file) => {
        const events = await getPortalEvents(projectId, file.id);
        return { file, events };
      }),
    );
    onFilesRefreshed(withEvents);
  };

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to upload files.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) return;

    for (const asset of result.assets) {
      const filename = asset.fileName ?? asset.uri.split("/").pop() ?? `photo_${Date.now()}.jpg`;

      setUploads((prev) => [...prev, { filename, progress: 0, done: false }]);

      try {
        await uploadPortalFile(
          projectId,
          asset.uri,
          filename,
          asset.mimeType ?? "image/jpeg",
          asset.fileSize,
          (pct) => {
            setUploads((prev) =>
              prev.map((u) => (u.filename === filename ? { ...u, progress: pct } : u)),
            );
          },
          authorId,
          authorName,
        );

        setUploads((prev) =>
          prev.map((u) => (u.filename === filename ? { ...u, progress: 100, done: true } : u)),
        );

        setTimeout(async () => {
          await refreshFiles();
          setUploads((prev) => prev.filter((u) => u.filename !== filename));
        }, 1500);
      } catch (err) {
        console.error("Portal upload error:", err);
        setUploads((prev) => prev.filter((u) => u.filename !== filename));
        Alert.alert("Upload failed", "Something went wrong uploading that file. Please try again.");
      }
    }
  };

  return { uploads, handleUpload, refreshFiles };
}
