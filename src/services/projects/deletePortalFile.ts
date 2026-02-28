import { addSystemEvent } from "@/src/services/activity";
import { getFirestore, getStorage } from "@/src/services/firebase";
import { ProjectFile } from "@/src/types";

/**
 * Deletes a file from a project via the portal (authenticated as portal client).
 * Removes the Storage object and Firestore file doc, then emits a file_deleted
 * activity event visible to both the contractor and the client.
 */
export async function deletePortalFile(
  projectId: string,
  file: ProjectFile,
  authorId?: string,
  authorName?: string,
): Promise<void> {
  if (file.storagePath) {
    try {
      await getStorage().ref(file.storagePath).delete();
    } catch {
      // already gone — that's fine
    }
  }

  await getFirestore()
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(file.id)
    .delete();

  await addSystemEvent(
    projectId,
    "file_deleted",
    { fileId: file.id, filename: file.filename },
    authorId,
    authorName,
  );
}
