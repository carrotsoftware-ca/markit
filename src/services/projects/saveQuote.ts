import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { Quote } from "@/src/types";

/**
 * Persists the current draft quote to projects/{projectId}/quote/current.
 * Always a merge — safe to call on every keystroke (debounce upstream).
 */
export async function saveQuote(projectId: string, quote: Quote): Promise<void> {
  await getFirestore()
    .collection("projects")
    .doc(projectId)
    .collection("quote")
    .doc("current")
    .set(
      {
        status: quote.status,
        version: quote.version,
        lineItems: quote.lineItems,
        currency: quote.currency,
        notes: quote.notes ?? null,
        updatedAt: FirestoreFieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
