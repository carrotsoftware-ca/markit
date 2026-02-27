import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { CreateProjectInput } from "@/src/types";

export async function createProject(project: CreateProjectInput): Promise<string> {
  try {
    const projectRef = await getFirestore()
      .collection("projects")
      .add({
        ...project,
        status: "draft",
        createdAt: FirestoreFieldValue.serverTimestamp(),
        updatedAt: FirestoreFieldValue.serverTimestamp(),
      });
    console.log(projectRef.id);
    return projectRef.id;
  } catch (error) {
    console.log(error);
  }
}
