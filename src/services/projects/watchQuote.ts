import { getFirestore } from "@/src/services/firebase";
import { Quote } from "@/src/types";

function docToQuote(snap: any): Quote | null {
  if (!snap.exists) return null;
  const data = snap.data();
  if (!data) return null;
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
 * Subscribes to projects/{projectId}/quote/current (a single doc).
 * Calls onQuote(null) if the doc doesn't exist yet.
 */
export function watchQuote(projectId: string, onQuote: (quote: Quote | null) => void): () => void {
  if (!projectId) return () => {};
  return getFirestore()
    .collection("projects")
    .doc(projectId)
    .collection("quote")
    .doc("current")
    .onSnapshot((snap) => onQuote(docToQuote(snap)));
}
