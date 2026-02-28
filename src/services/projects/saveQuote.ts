import { getFirestore } from "@/src/services/firebase";
import { Quote } from "@/src/types";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

/**
 * Persists the current draft quote to projects/{projectId}/quote/current.
 * Always a merge — safe to call on every keystroke (debounce upstream).
 */
export async function saveQuote(projectId: string, quote: Quote): Promise<void> {
  const db = getFirestore();
  const ref = doc(collection(db, "projects", projectId, "quote"), "current");
  await setDoc(
    ref,
    {
      status: quote.status,
      version: quote.version,
      lineItems: quote.lineItems,
      currency: quote.currency,
      notes: quote.notes ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
