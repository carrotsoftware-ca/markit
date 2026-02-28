import { getFirestore } from "@services/firebase";

export function watchProjects(setProjects, id) {
  const db = getFirestore();
  const unsubscribe = db
    .collection("projects")
    .where("ownerId", "==", id)
    .onSnapshot(
      (snapshot) => {
        if (snapshot && snapshot.docs) {
          const projects = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? null,
              updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() ?? data.updatedAt ?? null,
            };
          });
          setProjects(projects);
        }
      },
      (error) => {
        console.warn("watchProjects error:", error.code, error.message);
      },
    );

  return unsubscribe;
}
