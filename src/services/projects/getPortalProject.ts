import { getFirestore } from "@/src/services/firebase";
import { MarkitEvent, Project, ProjectFile } from "@/src/types";

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
