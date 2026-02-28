import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { ActivityEventType } from "@/src/types";

/**
 * Writes a system event into the activity feed.
 * Called internally by other services (uploadProjectFile, quote services, etc.)
 * — never called directly from UI components.
 *
 * @param projectId - The project to post to.
 * @param type      - The event type (e.g. "file_uploaded", "video_analysed").
 * @param payload   - Type-specific data object.
 * @param visibleTo - Defaults to "all" so clients see system events.
 */
export async function addSystemEvent(
  projectId: string,
  type: ActivityEventType,
  payload: Record<string, unknown>,
  visibleTo: "all" | "contractor" = "all",
): Promise<void> {
  await getFirestore().collection("projects").doc(projectId).collection("activity").add({
    type,
    actor: "system",
    authorId: null,
    authorName: null,
    visibleTo,
    payload,
    createdAt: FirestoreFieldValue.serverTimestamp(),
  });
}
