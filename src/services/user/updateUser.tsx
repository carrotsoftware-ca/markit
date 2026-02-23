import { getFirestore } from "@/src/services/firebase";
import firestore from "@react-native-firebase/firestore";
import { UpdateUserInput } from "@types";

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<void> {
  await getFirestore()
    .collection("users")
    .doc(id)
    .update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
}
