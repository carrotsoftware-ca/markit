import { getFirestore } from "@services/firebase";

export function watchProjects() {
  const db = getFirestore();

  return () => console.log("calling the clean up");
}
