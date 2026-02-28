import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { Quote, calcQuoteTotal } from "@/src/types";

/**
 * Marks the quote as sent and appends a quote_sent activity event so it
 * appears in both the contractor feed and the client portal.
 */
export async function sendQuote(
  projectId: string,
  quote: Quote,
  authorId: string,
  authorName: string,
): Promise<void> {
  const db = getFirestore();
  // Bump version if this is a re-send (quote was previously sent or revision was requested)
  const previouslySent = quote.status === "sent" || quote.status === "revision_requested";
  const nextVersion = previouslySent ? (quote.version ?? 1) + 1 : (quote.version ?? 1);
  const totalCents = calcQuoteTotal(quote.lineItems);

  const batch = db.batch();

  // 1. Update the quote doc → status: sent
  const quoteRef = db.collection("projects").doc(projectId).collection("quote").doc("current");
  batch.set(
    quoteRef,
    {
      status: "sent",
      version: nextVersion,
      lineItems: quote.lineItems,
      currency: quote.currency,
      notes: quote.notes ?? null,
      sentAt: FirestoreFieldValue.serverTimestamp(),
      updatedAt: FirestoreFieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  // 2. Append a quote_sent activity event
  const activityRef = db.collection("projects").doc(projectId).collection("activity").doc();
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
    createdAt: FirestoreFieldValue.serverTimestamp(),
  });

  await batch.commit();
}
