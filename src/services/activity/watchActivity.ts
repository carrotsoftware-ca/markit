import { getFirestore } from "@/src/services/firebase";
import { ActivityEvent, ActivityVisibility } from "@/src/types";

/**
 * Real-time listener on projects/{projectId}/activity, ordered oldest-first.
 *
 * @param projectId  - The project to watch.
 * @param visibility - "all" shows only public events (client portal).
 *                     "contractor" shows everything.
 * @param setEvents  - State setter called on every snapshot update.
 * @returns Unsubscribe function — call in useEffect cleanup.
 */
export function watchActivity(
  projectId: string,
  visibility: ActivityVisibility,
  setEvents: (events: ActivityEvent[]) => void,
): () => void {
  if (!projectId) return () => {};
  const db = getFirestore();

  let query = db
    .collection("projects")
    .doc(projectId)
    .collection("activity")
    .orderBy("createdAt", "asc");

  // Clients only see events marked visible to everyone
  if (visibility === "all") {
    query = query.where("visibleTo", "==", "all") as typeof query;
  }

  return query.onSnapshot((snapshot) => {
    if (!snapshot) return;
    const events: ActivityEvent[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        // Normalise Firestore Timestamp to ISO string
        createdAt:
          data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? new Date().toISOString(),
      } as ActivityEvent;
    });
    setEvents(events);
  });
}
