import { getFirestore } from "@/src/services/firebase";
import { MarkitEvent } from "@/src/types";

/**
 * Subscribes to real-time updates on the events subcollection for a file.
 * Events are ordered by createdAt ascending so replay is always in order.
 *
 * Path: projects/{projectId}/files/{fileId}/events/{eventId}
 *
 * Returns an unsubscribe function (call it in a useEffect cleanup).
 */
export function watchMarkitEvents(
  projectId: string,
  fileId: string,
  setEvents: (events: MarkitEvent[]) => void,
): () => void {
  const db = getFirestore();

  const unsubscribe = db
    .collection("projects")
    .doc(projectId)
    .collection("files")
    .doc(fileId)
    .collection("events")
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      if (!snapshot) return;
      const events = snapshot.docs.map((doc) => ({
        ...(doc.data() as MarkitEvent),
        id: doc.id,
      }));
      setEvents(events);
    });

  return unsubscribe;
}
