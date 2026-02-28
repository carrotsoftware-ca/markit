import { getFirestore } from "@/src/services/firebase";
import { Quote, calcQuoteTotal } from "@/src/types";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";

/**
 * Marks the quote as sent, bumps the version, and appends a quote_sent
 * activity event so it appears in both the contractor feed and the portal.
 */
export async function sendQuote(
  projectId: string,
  quote: Quote,
  authorId: string,
  authorName: string,
): Promise<void> {
  const db = getFirestore();
  const nextVersion = quote.version ?? 1;
  const totalCents = calcQuoteTotal(quote.lineItems);

  const batch = writeBatch(db);

  // 1. Update the quote doc → status: sent
  const quoteRef = doc(collection(db, "projects", projectId, "quote"), "current");
  batch.set(
    quoteRef,
    {
      status: "sent",
      version: nextVersion,
      lineItems: quote.lineItems,
      currency: quote.currency,
      notes: quote.notes ?? null,
      sentAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  // 2. Append a quote_sent activity event
  const activityRef = doc(collection(db, "projects", projectId, "activity"));
  batch.set(activityRef, {
    type: "quote_sent",
    actor: "contractor",
    authorId,
    authorName,
    visibleTo: "all",
    payload: {
      version: nextVersion,
      totalAmount: totalCents,
      currency: quote.currency,
    },
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}
