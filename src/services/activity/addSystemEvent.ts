import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { ActivityEventType } from "@/src/types";

/**
 * Writes a system event into the activity feed.
 * Called internally by other services (uploadProjectFile, quote services, etc.)
 * — never called directly from UI components.
 *
 * @param projectId  - The project to post to.
 * @param type       - The event type (e.g. "file_uploaded", "video_analysed").
 * @param payload    - Type-specific data object.
 * @param authorId   - Optional UID of the person who triggered the event (e.g. portal client).
 * @param authorName - Optional display name for the actor.
 * @param visibleTo  - Defaults to "all" so clients see system events.
 */
export async function addSystemEvent(
  projectId: string,
  type: ActivityEventType,
  payload: Record<string, unknown>,
  authorId?: string | null,
  authorName?: string | null,
  visibleTo: "all" | "contractor" = "all",
): Promise<void> {
  await getFirestore()
    .collection("projects")
    .doc(projectId)
    .collection("activity")
    .add({
      type,
      actor: authorId ? "client" : "system",
      authorId: authorId ?? null,
      authorName: authorName ?? null,
      visibleTo,
      payload,
      createdAt: FirestoreFieldValue.serverTimestamp(),
    });
}
