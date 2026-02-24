import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { User } from "@types";

export async function upsertUser(user: User): Promise<void> {
  const { id, ...data } = user;
  await getFirestore()
    .collection("users")
    .doc(id)
    .set(
      {
        ...data,
        updatedAt: FirestoreFieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
