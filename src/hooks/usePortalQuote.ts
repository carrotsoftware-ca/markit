import { FirestoreFieldValue, getFirestore } from "@/src/services/firebase";
import { Quote } from "@/src/types";
import { useState } from "react";
import { Alert } from "react-native";

export function usePortalQuote(
  projectId: string,
  quote: Quote | null,
  clientId: string,
  clientName: string,
) {
  const [isResponding, setIsResponding] = useState(false);

  const respond = async (response: "accepted" | "rejected") => {
    if (!projectId) return;
    setIsResponding(true);
    try {
      const db = getFirestore();
      const batch = (db as any).batch();

      const quoteRef = db.collection("projects").doc(projectId).collection("quote").doc("current");
      batch.set(
        quoteRef,
        { status: response, respondedAt: FirestoreFieldValue.serverTimestamp() },
        { merge: true },
      );

      const activityRef = db.collection("projects").doc(projectId).collection("activity").doc();
      batch.set(activityRef, {
        type: response === "accepted" ? "quote_accepted" : "quote_rejected",
        actor: "client",
        authorId: clientId,
        authorName: clientName,
        visibleTo: "all",
        payload: { version: quote?.version ?? 1 },
        createdAt: FirestoreFieldValue.serverTimestamp(),
      });

      await batch.commit();
    } catch {
      Alert.alert("Error", "Could not submit your response. Please try again.");
    } finally {
      setIsResponding(false);
    }
  };

  const requestRevision = async (message: string) => {
    if (!projectId || !message.trim()) return;
    setIsResponding(true);
    try {
      const db = getFirestore();
      const batch = (db as any).batch();

      // Set quote back to draft so contractor can edit and re-send
      const quoteRef = db.collection("projects").doc(projectId).collection("quote").doc("current");
      batch.set(
        quoteRef,
        { status: "revision_requested", respondedAt: FirestoreFieldValue.serverTimestamp() },
        { merge: true },
      );

      // Post a system event so the contractor sees the request in their chat feed
      const activityRef = db.collection("projects").doc(projectId).collection("activity").doc();
      batch.set(activityRef, {
        type: "quote_revision_requested",
        actor: "client",
        authorId: clientId,
        authorName: clientName,
        visibleTo: "all",
        payload: { version: quote?.version ?? 1, message: message.trim() },
        createdAt: FirestoreFieldValue.serverTimestamp(),
      });

      await batch.commit();
    } catch {
      Alert.alert("Error", "Could not send your revision request. Please try again.");
    } finally {
      setIsResponding(false);
    }
  };

  return { respond, requestRevision, isResponding };
}
