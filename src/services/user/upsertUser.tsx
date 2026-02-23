import { getFirestore } from "@/src/services/firebase";
import firestore from "@react-native-firebase/firestore";
import { User } from "@types";

export async function upsertUser(user: User): Promise<void> {
  const { id, ...data } = user;
  await getFirestore()
    .collection("users")
    .doc(id)
    .set(
      {
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
