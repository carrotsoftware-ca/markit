import { getFirestore } from "@/src/services/firebase";
import { ProjectFile } from "@/src/types";

/**
 * Subscribes to real-time updates on the files subcollection for a project.
 * Returns an unsubscribe function (call it in a useEffect cleanup).
 *
 * Path: projects/{projectId}/files/{fileId}
 */
export function watchProjectFiles(
  projectId: string,
  setFiles: (files: ProjectFile[]) => void,
): () => void {
  const db = getFirestore();

  const unsubscribe = db
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .onSnapshot((snapshot) => {
      if (!snapshot) return;
      const files: ProjectFile[] = snapshot.docs
        .map((doc) => ({
          ...(doc.data() as ProjectFile),
          id: doc.id,
        }))
        // Newest first — fileId starts with Date.now() so lexicographic desc == time desc
        .sort((a, b) => b.id.localeCompare(a.id));
      setFiles(files);
    });

  return unsubscribe;
}
