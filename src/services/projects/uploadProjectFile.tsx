import { getFirestore, getStorage } from "@/src/services/firebase";
import { ProjectFile } from "@/src/types";
import { Platform } from "react-native";

export async function uploadProjectFile(
  projectId: string,
  localUri: string,
  filename: string,
  mimeType: string | undefined,
  fileSize: number | undefined,
): Promise<void> {
  const storagePath = `projects/${projectId}/${Date.now()}_${filename}`;
  const ref = getStorage().ref(storagePath);

  if (Platform.OS === "web") {
    const response = await fetch(localUri);
    const blob = await response.blob();
    await ref.put(blob, { contentType: mimeType });
  } else {
    await ref.putFile(localUri);
  }

  const url = await ref.getDownloadURL();

  const file: ProjectFile = {
    id: storagePath,
    filename,
    size: fileSize ? `${(fileSize / 1024).toFixed(0)} KB` : "—",
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: "done",
    url,
    storagePath,
    mimeType,
  };

  const db = getFirestore();
  const ref2 = db.collection("projects").doc(projectId);
  const snap = await ref2.get();
  const existing: ProjectFile[] = snap.data()?.files ?? [];
  await ref2.update({ files: [...existing, file] });
}
