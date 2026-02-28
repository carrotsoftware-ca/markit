import { getFirestore } from "@services/firebase";

export function watchProject(projectId: string, setProject: (project: any) => void) {
  const db = getFirestore();
  const unsubscribe = db
    .collection("projects")
    .doc(projectId)
    .onSnapshot(
      (doc) => {
        if (doc && doc.exists) {
          const data = doc.data();
          setProject({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? null,
          });
        } else {
          // Doc was deleted — clear context so consumers don't crash on stale data
          setProject(null);
        }
      },
      (error) => {
        console.warn("watchProject error:", error.code, error.message);
      },
    );

  return unsubscribe;
}
