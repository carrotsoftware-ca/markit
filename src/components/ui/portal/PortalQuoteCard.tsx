import { Quote, QuoteLineItem, calcQuoteTotal, formatCurrency } from "@/src/types";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const ORANGE = "#FF6B00";
const CARD = "#242424";
const TEXT = "#ffffff";
const MUTED = "#888888";

interface PortalQuoteCardProps {
  quote: Quote;
  isResponding: boolean;
  onRespond: (response: "accepted" | "rejected") => void;
  onRequestRevision: (message: string) => void;
}

export function PortalQuoteCard({
  quote,
  isResponding,
  onRespond,
  onRequestRevision,
}: PortalQuoteCardProps) {
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionMessage, setRevisionMessage] = useState("");

  const statusColor =
    quote.status === "accepted"
      ? "#2ecc71"
      : quote.status === "rejected"
        ? "#e74c3c"
        : quote.status === "revision_requested"
          ? "#f39c12"
          : ORANGE;

  const statusLabel =
    quote.status === "revision_requested" ? "REVISIONS REQUESTED" : quote.status.toUpperCase();

  const handleSendRevision = () => {
    if (!revisionMessage.trim()) return;
    onRequestRevision(revisionMessage);
    setRevisionMessage("");
    setShowRevisionInput(false);
  };

  return (
    <View style={styles.card}>
      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
      </View>

      {/* Line items */}
      {quote.lineItems.map((item: QuoteLineItem) => (
        <View key={item.id} style={styles.lineItem}>
          <View style={styles.lineLeft}>
            <Text style={styles.lineCategory}>{item.category}</Text>
            {item.description ? <Text style={styles.lineDesc}>{item.description}</Text> : null}
            <Text style={styles.lineMeta}>
              {item.quantity} {item.unit}
            </Text>
          </View>
          <Text style={styles.lineAmount}>
            {formatCurrency(item.quantity * item.unitPrice, quote.currency)}
          </Text>
        </View>
      ))}

      {/* Total */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>
          {formatCurrency(calcQuoteTotal(quote.lineItems), quote.currency)}
        </Text>
      </View>

      {/* Contractor notes */}
      {quote.notes ? <Text style={styles.notes}>{quote.notes}</Text> : null}

      {/* Actions — only when status is "sent" */}
      {quote.status === "sent" && (
        <>
          <View style={styles.actions}>
            <Pressable
              onPress={() => onRespond("accepted")}
              disabled={isResponding}
              style={({ pressed }) => [
                styles.acceptBtn,
                { opacity: pressed || isResponding ? 0.6 : 1 },
              ]}
            >
              {isResponding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.acceptText}>✓ Accept</Text>
              )}
            </Pressable>
            <Pressable
              onPress={() => onRespond("rejected")}
              disabled={isResponding}
              style={({ pressed }) => [
                styles.declineBtn,
                { opacity: pressed || isResponding ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.declineText}>✕ Decline</Text>
            </Pressable>
          </View>

          {!showRevisionInput ? (
            <Pressable onPress={() => setShowRevisionInput(true)} style={styles.revisionTrigger}>
              <Text style={styles.revisionTriggerText}>✏️ Request revisions</Text>
            </Pressable>
          ) : (
            <View style={styles.revisionBox}>
              <Text style={styles.revisionLabel}>What needs to change?</Text>
              <TextInput
                value={revisionMessage}
                onChangeText={setRevisionMessage}
                placeholder="e.g. Please break down the labour costs…"
                placeholderTextColor={MUTED}
                multiline
                style={styles.revisionInput}
                autoFocus
              />
              <View style={styles.revisionActions}>
                <Pressable
                  onPress={() => {
                    setShowRevisionInput(false);
                    setRevisionMessage("");
                  }}
                  style={styles.revisionCancel}
                >
                  <Text style={styles.revisionCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSendRevision}
                  disabled={!revisionMessage.trim() || isResponding}
                  style={({ pressed }) => [
                    styles.revisionSend,
                    { opacity: pressed || !revisionMessage.trim() || isResponding ? 0.5 : 1 },
                  ]}
                >
                  {isResponding ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.revisionSendText}>Send Request</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: CARD, borderRadius: 12, padding: 16 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  lineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  lineLeft: { flex: 1, marginRight: 12 },
  lineCategory: { color: ORANGE, fontSize: 12, fontWeight: "700", marginBottom: 2 },
  lineDesc: { color: TEXT, fontSize: 14, marginBottom: 2 },
  lineMeta: { color: MUTED, fontSize: 12 },
  lineAmount: { color: TEXT, fontSize: 14, fontWeight: "600" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
    marginTop: 4,
  },
  totalLabel: { color: TEXT, fontSize: 16, fontWeight: "700" },
  totalAmount: { color: ORANGE, fontSize: 22, fontWeight: "800" },
  notes: { color: MUTED, fontSize: 13, marginTop: 12, fontStyle: "italic" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  acceptBtn: {
    flex: 1,
    backgroundColor: "#2ecc71",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  acceptText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  declineBtn: {
    flex: 1,
    backgroundColor: "rgba(231,76,60,0.15)",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
  },
  declineText: { color: "#e74c3c", fontWeight: "700", fontSize: 15 },
  revisionTrigger: { alignItems: "center", paddingVertical: 12, marginTop: 4 },
  revisionTriggerText: { color: MUTED, fontSize: 14, fontWeight: "500" },
  revisionBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#f39c1244",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "rgba(243,156,18,0.05)",
  },
  revisionLabel: { color: "#f39c12", fontSize: 12, fontWeight: "700", marginBottom: 8 },
  revisionInput: {
    color: TEXT,
    fontSize: 14,
    minHeight: 72,
    textAlignVertical: "top",
    paddingTop: 0,
  },
  revisionActions: { flexDirection: "row", gap: 8, marginTop: 10, justifyContent: "flex-end" },
  revisionCancel: { paddingHorizontal: 14, paddingVertical: 8 },
  revisionCancelText: { color: MUTED, fontSize: 14 },
  revisionSend: {
    backgroundColor: "#f39c12",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  revisionSendText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
