import { getFirestore } from "@/src/services/firebase";
import firestore from "@react-native-firebase/firestore";
import { User } from "@types";

export async function insertUser(user: User): Promise<void> {
  const { id, ...data } = user;
  await getFirestore()
    .collection("users")
    .doc(id)
    .set({
      ...data,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}
