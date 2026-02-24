import { getFirestore, getStorage } from "@/src/services/firebase";
import { ProjectFile } from "@/src/types";

export async function deleteProjectFile(
  projectId: string,
  file: ProjectFile,
): Promise<void> {
  if (file.storagePath) {
    try {
      await getStorage().ref(file.storagePath).delete();
    } catch {
      // file may already be gone
    }
  }

  const db = getFirestore();
  const ref = db.collection("projects").doc(projectId);
  const snap = await ref.get();
  const existing: ProjectFile[] = snap.data()?.files ?? [];
  await ref.update({ files: existing.filter((f) => f.id !== file.id) });
}
