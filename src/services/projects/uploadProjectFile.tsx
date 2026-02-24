import { getFirestore, getStorage } from "@/src/services/firebase";
import { ProjectFile } from "@/src/types";
import { Platform } from "react-native";

function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as T;
}

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
    await ref.put(blob, mimeType ? { contentType: mimeType } : undefined);
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
    ...(mimeType !== undefined && { mimeType }),
  };

  const db = getFirestore();
  const ref2 = db.collection("projects").doc(projectId);
  const snap = await ref2.get();
  const existing: ProjectFile[] = (snap.data()?.files ?? []).filter(
    (f: any) => f && f.id && f.filename,
  );
  const files = [...existing, file].map(stripUndefined);
  await ref2.set({ files }, { merge: true });
}
