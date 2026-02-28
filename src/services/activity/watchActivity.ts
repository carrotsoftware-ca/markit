import { getFirestore } from "@/src/services/firebase";
import { ActivityEvent, ActivityVisibility } from "@/src/types";

/**
 * Real-time listener on projects/{projectId}/activity, ordered oldest-first.
 *
 * @param projectId  - The project to watch.
 * @param visibility - "all" shows only public events (client portal).
 *                     "contractor" shows everything.
 * @param setEvents  - State setter called on every snapshot update.
 * @param onError    - Optional callback when the listener errors (e.g. index building).
 * @returns Unsubscribe function — call in useEffect cleanup.
 */
export function watchActivity(
  projectId: string,
  visibility: ActivityVisibility,
  setEvents: (events: ActivityEvent[]) => void,
  onError?: () => void,
): () => void {
  if (!projectId) return () => {};
  const db = getFirestore();

  const baseQuery = db
    .collection("projects")
    .doc(projectId)
    .collection("activity")
    .orderBy("createdAt", "asc");

  // Helper: map a snapshot doc to ActivityEvent
  const mapDoc = (doc: any): ActivityEvent => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? new Date().toISOString(),
    } as ActivityEvent;
  };

  // For portal visibility ("all") we need a composite index (visibleTo + createdAt).
  // If that index is still building (failed-precondition) we fall back to the simple
  // orderBy-only query and filter client-side so the portal works immediately.
  if (visibility === "all") {
    const compositeQuery = baseQuery.where("visibleTo", "==", "all") as typeof baseQuery;

    // Track the active unsubscribe so the fallback listener can also be torn down
    let unsubscribeFallback: (() => void) | null = null;

    const unsubscribeComposite = compositeQuery.onSnapshot(
      (snapshot) => {
        if (!snapshot) return;
        setEvents(snapshot.docs.map(mapDoc));
      },
      (error) => {
        console.warn("watchActivity composite error:", error.code, error.message);

        // Index still building — fall back to unfiltered query + client-side filter
        if (error.code === "failed-precondition") {
          console.warn(
            "watchActivity: composite index not ready, falling back to client-side filter",
          );
          unsubscribeFallback = baseQuery.onSnapshot(
            (snapshot) => {
              if (!snapshot) return;
              const events = snapshot.docs
                .map(mapDoc)
                .filter((e) => (e as any).visibleTo === "all");
              setEvents(events);
            },
            (fallbackError) => {
              console.warn(
                "watchActivity fallback error:",
                fallbackError.code,
                fallbackError.message,
              );
              setEvents([]);
              onError?.();
            },
          );
        } else {
          setEvents([]);
          onError?.();
        }
      },
    );

    return () => {
      unsubscribeComposite();
      unsubscribeFallback?.();
    };
  }

  // Contractor view — no composite index needed
  return baseQuery.onSnapshot(
    (snapshot) => {
      if (!snapshot) return;
      setEvents(snapshot.docs.map(mapDoc));
    },
    (error) => {
      console.warn("watchActivity error:", error.code, error.message);
      setEvents([]);
      onError?.();
    },
  );
}
