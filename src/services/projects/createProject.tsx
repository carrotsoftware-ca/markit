import { getFirestore, FirestoreFieldValue } from "@/src/services/firebase";
import { CreateProjectInput } from "@/src/types";
import firestore from "@react-native-firebase/firestore";

export async function createProject(
  project: CreateProjectInput,
): Promise<string> {
  const projectRef = await getFirestore()
    .collection("projects")
    .add({
      ...project,
      status: 'draft',
      createdAt: FirestoreFieldValue.serverTimestamp(),
      updatedAt: FirestoreFieldValue.serverTimestamp(),
    });
  console.log(projectRef.id);
  return projectRef.id;
}
