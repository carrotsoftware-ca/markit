import { getFirestore } from "@/src/services/firebase";

export interface UpdateProjectFileInput {
  name?: string;
  notes?: string;
}

export async function updateProjectFile(
  projectId: string,
  fileId: string,
  updates: UpdateProjectFileInput,
): Promise<void> {
  await getFirestore()
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(fileId)
    .update(updates);
}
