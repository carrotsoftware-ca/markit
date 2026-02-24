import { getFirestore } from "@/src/services/firebase";

export async function deleteProject(projectId: string): Promise<void> {
  const db = getFirestore();
  await db.collection("projects").doc(projectId).delete();
}
