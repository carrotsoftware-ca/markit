import { getFirestore } from "@/src/services/firebase";
import { UpdateProjectInput } from "@/src/types/projects";

export async function updateProject(projectId: string, updates: UpdateProjectInput): Promise<void> {
  await getFirestore().collection("projects").doc(projectId).update(updates);
}
