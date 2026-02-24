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
  const db = getFirestore();
  const projectRef = db.collection("projects").doc(projectId);

  // Optimistic write — shows the row immediately with "uploading" pulse
  const optimisticFile: ProjectFile = {
    id: storagePath,
    filename,
    size: fileSize ? `${(fileSize / 1024).toFixed(0)} KB` : "—",
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: "uploading",
    url: "",
    storagePath,
    ...(mimeType !== undefined && { mimeType }),
  };

  const snapBefore = await projectRef.get();
  const existingBefore: ProjectFile[] = (snapBefore.data()?.files ?? []).filter(
    (f: any) => f && f.id && f.filename,
  );
  await projectRef.set(
    { files: [...existingBefore, optimisticFile].map(stripUndefined) },
    { merge: true },
  );

  // Do the actual upload
  if (Platform.OS === "web") {
    const response = await fetch(localUri);
    const blob = await response.blob();
    await ref.put(blob, mimeType ? { contentType: mimeType } : undefined);
  } else {
    await ref.putFile(localUri);
  }

  const url = await ref.getDownloadURL();

  // Replace the optimistic entry with the completed file
  const snapAfter = await projectRef.get();
  const existingAfter: ProjectFile[] = (snapAfter.data()?.files ?? []).filter(
    (f: any) => f && f.id && f.filename,
  );
  const updatedFiles = existingAfter.map((f) =>
    f.id === storagePath
      ? stripUndefined({ ...f, status: "done" as const, url })
      : f,
  );
  await projectRef.set({ files: updatedFiles }, { merge: true });
}
