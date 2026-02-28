import { addSystemEvent } from "@/src/services/activity";
import { getFirestore, getStorage } from "@/src/services/firebase";
import { ProjectFile, ProjectFileType } from "@/src/types";
import { Platform } from "react-native";

function inferFileType(mimeType?: string): ProjectFileType {
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType?.startsWith("image/")) return "image";
  return "document";
}

export async function uploadProjectFile(
  projectId: string,
  localUri: string,
  filename: string,
  mimeType: string | undefined,
  fileSize: number | undefined,
): Promise<{ fileId: string; url: string }> {
  const fileId = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storagePath = `projects/${projectId}/${fileId}`;
  const storageRef = getStorage().ref(storagePath);
  const db = getFirestore();

  // The file subcollection path: projects/{projectId}/files/{fileId}
  // fileId has no slashes so Firestore won't misinterpret it as a nested path.
  const fileRef = db.collection("projects").doc(projectId).collection("files").doc(fileId);

  // Write the optimistic "uploading" row immediately so the UI shows it right away
  const optimisticFile: ProjectFile = {
    id: fileId,
    type: inferFileType(mimeType),
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
  await fileRef.set(optimisticFile);

  // Do the actual upload to Firebase Storage
  if (Platform.OS === "web") {
    const response = await fetch(localUri);
    const blob = await response.blob();
    await storageRef.put(blob, mimeType ? { contentType: mimeType } : undefined);
  } else {
    await storageRef.putFile(localUri);
  }

  const url = await storageRef.getDownloadURL();

  // Update just the status + url fields on the file doc — no array juggling needed
  await fileRef.update({ status: "done", url });

  // Emit a system event so the activity feed reflects the upload
  await addSystemEvent(projectId, "file_uploaded", {
    fileId,
    filename,
    fileType: inferFileType(mimeType),
  });

  return { fileId, url };
}
