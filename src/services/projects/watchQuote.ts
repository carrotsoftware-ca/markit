import { getFirestore } from "@/src/services/firebase";
import { Quote } from "@/src/types";
import { DocumentSnapshot, collection, doc, onSnapshot } from "firebase/firestore";

function docToQuote(snap: DocumentSnapshot): Quote | null {
  if (!snap.exists()) return null;
  const data = snap.data()!;
  return {
    id: snap.id,
    status: data.status ?? "draft",
    version: data.version ?? 1,
    lineItems: data.lineItems ?? [],
    currency: data.currency ?? "CAD",
    notes: data.notes,
    sentAt: data.sentAt?.toDate?.()?.toISOString() ?? data.sentAt,
    respondedAt: data.respondedAt?.toDate?.()?.toISOString() ?? data.respondedAt,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
  };
}

/**
 * Subscribes to projects/{projectId}/quote (a single doc).
 * Calls onQuote(null) if the doc doesn't exist yet.
 */
export function watchQuote(projectId: string, onQuote: (quote: Quote | null) => void): () => void {
  if (!projectId) return () => {};
  const db = getFirestore();
  const ref = doc(collection(db, "projects", projectId, "quote"), "current");
  return onSnapshot(ref, (snap) => onQuote(docToQuote(snap)));
}
