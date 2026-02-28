import { getFirestore } from "@/src/services/firebase";
import { ActivityEvent, ActivityVisibility } from "@/src/types";

export function watchActivity(
  projectId: string,
  visibility: ActivityVisibility,
  setEvents: (events: ActivityEvent[]) => void,
  onError?: () => void,
): () => void {
  if (!projectId) return () => {};

  const db = getFirestore();

  const query = db
    .collection("projects")
    .doc(projectId)
    .collection("activity")
    .orderBy("createdAt", "asc");

  const mapDoc = (doc: any): ActivityEvent => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString?.() ?? data.createdAt ?? new Date().toISOString(),
    } as ActivityEvent;
  };

  return query.onSnapshot(
    (snapshot) => {
      if (!snapshot) return;
      const events = snapshot.docs.map(mapDoc);
      // Contractor sees everything. Portal ("all") hides contractor-only events.
      const filtered =
        visibility === "contractor"
          ? events
          : events.filter((e) => (e as any).visibleTo !== "contractor");
      setEvents(filtered);
    },
    (error) => {
      console.warn("watchActivity error:", error.code, error.message);
      setEvents([]);
      onError?.();
    },
  );
}
