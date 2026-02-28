import { addSystemEvent } from "@/src/services/activity";
import { getFirestore, getStorage } from "@/src/services/firebase";
import { MarkitEvent, PortalSession, Project, ProjectFile, ProjectFileType } from "@/src/types";
import { Platform } from "react-native";

function inferFileType(mimeType?: string): ProjectFileType {
  if (mimeType?.startsWith("video/")) return "video";
  if (mimeType?.startsWith("image/")) return "image";
  return "document";
}

/**
 * Fetches a project by its portal token.
 * Does not require authentication — Firestore rules permit this read
 * when portalActive === true and the token matches.
 *
 * Returns null if the token is invalid or the portal has been revoked.
 */
export async function getProjectByToken(token: string): Promise<Project | null> {
  const db = getFirestore();
  const snap = await db
    .collection("projects")
    .where("portalToken", "==", token)
    .where("portalActive", "==", true)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<Project, "id">) };
}

/**
 * Fetches all files for a project (portal — no auth required).
 */
export async function getPortalFiles(projectId: string): Promise<ProjectFile[]> {
  const db = getFirestore();
  const snap = await db.collection("projects").doc(projectId).collection("files").get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ProjectFile, "id">),
  }));
}

/**
 * Real-time listener on the files subcollection for a portal project.
 * Fires on every add/update/delete so the UI stays in sync without polling.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function watchPortalFiles(
  projectId: string,
  onFiles: (files: ProjectFile[]) => void,
): () => void {
  if (!projectId) return () => {};
  const db = getFirestore();
  return db
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .onSnapshot(
      (snap) =>
        onFiles(
          snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<ProjectFile, "id">) })),
        ),
      () => onFiles([]),
    );
}

/**
 * Fetches all MarkIt events for a specific file (portal — no auth required).
 */
export async function getPortalEvents(projectId: string, fileId: string): Promise<MarkitEvent[]> {
  const db = getFirestore();
  const snap = await db
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(fileId)
    .collection("events")
    .orderBy("createdAt", "asc")
    .get();

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<MarkitEvent, "id">),
  }));
}

/**
 * Uploads a file to a project from the portal (unauthenticated).
 * Storage rules allow portal writes when portalActive == true.
 * Progress is reported via the onProgress callback (0–100).
 */
export async function uploadPortalFile(
  projectId: string,
  localUri: string,
  filename: string,
  mimeType: string | undefined,
  fileSize: number | undefined,
  onProgress?: (pct: number) => void,
  authorId?: string,
  authorName?: string,
): Promise<{ fileId: string; url: string }> {
  const fileId = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const storagePath = `projects/${projectId}/${fileId}`;
  const storageRef = getStorage().ref(storagePath);
  const db = getFirestore();

  const fileRef = db.collection("projects").doc(projectId).collection("files").doc(fileId);

  const optimisticFile: ProjectFile = {
    id: fileId,
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

  if (Platform.OS === "web") {
    const response = await fetch(localUri);
    const blob = await response.blob();
    await storageRef.put(blob, mimeType ? { contentType: mimeType } : undefined);
  } else {
    const task = storageRef.putFile(localUri);
    if (onProgress) {
      task.on("state_changed", (snapshot: any) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(pct);
      });
    }
    await task;
  }

  const url = await storageRef.getDownloadURL();
  await fileRef.update({ status: "done", url });

  // Emit a file_uploaded activity event visible to everyone (contractor + portal)
  await addSystemEvent(
    projectId,
    "file_uploaded",
    { fileId, filename, fileType: inferFileType(mimeType) },
    authorId,
    authorName,
  );

  return { fileId, url };
}

/**
 * Subscribes to the portalSessions subcollection for a project in real time.
 * Only the project owner can read this (enforced by Firestore rules).
 * Returns an unsubscribe function.
 */
export function watchPortalSessions(
  projectId: string,
  onSessions: (sessions: PortalSession[]) => void,
): () => void {
  const db = getFirestore();
  return db
    .collection("projects")
    .doc(projectId)
    .collection("portalSessions")
    .onSnapshot(
      (snap) => onSessions(snap.docs.map((doc) => doc.data() as PortalSession)),
      () => onSessions([]),
    );
}
