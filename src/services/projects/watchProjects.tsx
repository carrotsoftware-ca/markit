import { getFirestore } from "@services/firebase";

export function watchProjects(setProjects, id) {
  const db = getFirestore();
  const unsubscribe = db
    .collection("projects")
    .where("ownerId", "==", id)
    .onSnapshot((snapshot) => {
      if (snapshot && snapshot.docs) {
        const projects = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projects);
      }
    });

  return unsubscribe;
}
