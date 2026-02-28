import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { ActivityActor, ActivityVisibility } from "@/src/types";

/**
 * Sends a chat message into the activity feed.
 *
 * @param projectId  - The project to post to.
 * @param text       - Message body.
 * @param actor      - "contractor" or "client".
 * @param authorId   - Firebase UID of the sender.
 * @param authorName - Display name of the sender.
 * @param visibleTo  - Defaults to "all". Pass "contractor" for internal notes.
 */
export async function sendMessage(
  projectId: string,
  text: string,
  actor: ActivityActor,
  authorId: string,
  authorName: string,
  visibleTo: ActivityVisibility = "all",
): Promise<void> {
  await getFirestore().collection("projects").doc(projectId).collection("activity").add({
    type: "message",
    actor,
    authorId,
    authorName,
    visibleTo,
    text,
    createdAt: FirestoreFieldValue.serverTimestamp(),
  });
}
