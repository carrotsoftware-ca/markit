import { getFirestore } from "@/src/services/firebase";
import { User } from "@types";

export async function getUser(id: string): Promise<User | null> {
  const doc = await getFirestore().collection("users").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as User;
}
