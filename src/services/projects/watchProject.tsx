import { getFirestore } from "@services/firebase";

export function watchProject(
  projectId: string,
  setProject: (project: any) => void,
) {
  const db = getFirestore();
  const unsubscribe = db
    .collection("projects")
    .doc(projectId)
    .onSnapshot((doc) => {
      if (doc && doc.exists) {
        setProject({ id: doc.id, ...doc.data() });
      }
    });

  return unsubscribe;
}
