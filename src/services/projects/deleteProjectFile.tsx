import { getFirestore, getStorage } from "@/src/services/firebase";
import { ProjectFile } from "@/src/types";

export async function deleteProjectFile(
  projectId: string,
  file: ProjectFile,
): Promise<void> {
  // Delete the file from Firebase Storage first (best-effort)
  if (file.storagePath) {
    try {
      await getStorage().ref(file.storagePath).delete();
    } catch {
      // file may already be gone — that's fine
    }
  }

  // Delete the file document from the subcollection.
  // Note: this does NOT delete the events subcollection under it —
  // Firestore subcollections must be deleted separately (or via a Cloud Function).
  // For now we leave orphaned events in place; they'll be unreachable without
  // the file doc and can be cleaned up later.
  await getFirestore()
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(file.id)
    .delete();
}
