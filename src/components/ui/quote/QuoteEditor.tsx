import { useTheme } from "@/src/context/ThemeContext";
import { QuoteLineItem, calcQuoteTotal, formatCurrency } from "@/src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface QuoteEditorProps {
  lineItems: QuoteLineItem[];
  currency: string;
  status: string;
  isSaving: boolean;
  isSending: boolean;
  onUpdateLineItem: (id: string, patch: Partial<QuoteLineItem>) => void;
  onAddLineItem: () => void;
  onRemoveLineItem: (id: string) => void;
  onSend: () => void;
}

export function QuoteEditor({
  lineItems,
  currency,
  status,
  isSaving,
  isSending,
  onUpdateLineItem,
  onAddLineItem,
  onRemoveLineItem,
  onSend,
}: QuoteEditorProps) {
  const { theme } = useTheme();
  const totalCents = calcQuoteTotal(lineItems);
  const isSent = status === "sent" || status === "accepted" || status === "rejected";

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[styles.container, { paddingBottom: 48 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: theme.colors.text.primary }]}>Quote</Text>
        <View style={styles.headerRight}>
          {isSaving && (
            <Text style={[styles.savingText, { color: theme.colors.text.secondary }]}>Saving…</Text>
          )}
          {isSent && (
            <View style={[styles.statusBadge, { backgroundColor: "rgba(46,204,113,0.15)" }]}>
              <Text style={[styles.statusBadgeText, { color: "#2ecc71" }]}>
                {status.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Column headers */}
      <View style={styles.colHeaders}>
        <Text style={[styles.colLabel, { flex: 3, color: theme.colors.text.secondary }]}>
          Category / Description
        </Text>
        <Text
          style={[
            styles.colLabel,
            { flex: 1, textAlign: "center", color: theme.colors.text.secondary },
          ]}
        >
          Qty
        </Text>
        <Text
          style={[
            styles.colLabel,
            { flex: 2, textAlign: "right", color: theme.colors.text.secondary },
          ]}
        >
          Unit Price
        </Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Line items */}
      {lineItems.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="robot-outline"
            size={36}
            color={theme.colors.text.secondary}
          />
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No line items yet.{"\n"}Upload a video walkthrough to auto-generate categories, or add
            items manually.
          </Text>
        </View>
      ) : (
        lineItems.map((item) => (
          <LineItemRow
            key={item.id}
            item={item}
            currency={currency}
            disabled={isSent}
            onUpdate={(patch) => onUpdateLineItem(item.id, patch)}
            onRemove={() => onRemoveLineItem(item.id)}
            theme={theme}
          />
        ))
      )}

      {/* Add line item */}
      {!isSent && (
        <Pressable
          onPress={onAddLineItem}
          style={({ pressed }) => [
            styles.addButton,
            { borderColor: theme.colors.border, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <MaterialCommunityIcons name="plus" size={18} color={theme.colors.text.secondary} />
          <Text style={[styles.addButtonText, { color: theme.colors.text.secondary }]}>
            Add line item
          </Text>
        </Pressable>
      )}

      {/* Total */}
      <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>Total</Text>
        <Text style={[styles.totalAmount, { color: theme.colors.safetyOrange }]}>
          {formatCurrency(totalCents, currency)}
        </Text>
      </View>

      {/* Send button */}
      {!isSent && (
        <Pressable
          onPress={onSend}
          disabled={isSending || lineItems.length === 0}
          style={({ pressed }) => [
            styles.sendButton,
            {
              backgroundColor: theme.colors.safetyOrange,
              opacity: pressed || isSending || lineItems.length === 0 ? 0.5 : 1,
            },
          ]}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="send"
                size={18}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sendButtonText}>Send Quote to Client</Text>
            </>
          )}
        </Pressable>
      )}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Line item row
// ---------------------------------------------------------------------------

interface LineItemRowProps {
  item: QuoteLineItem;
  currency: string;
  disabled: boolean;
  onUpdate: (patch: Partial<QuoteLineItem>) => void;
  onRemove: () => void;
  theme: any;
}

function LineItemRow({ item, currency, disabled, onUpdate, onRemove, theme }: LineItemRowProps) {
  const lineTotal = item.quantity * item.unitPrice;

  return (
    <View
      style={[
        styles.itemCard,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
      ]}
    >
      {/* Category badge */}
      <View style={styles.itemTopRow}>
        <View style={[styles.categoryBadge, { backgroundColor: "rgba(255,107,0,0.12)" }]}>
          <Text style={[styles.categoryText, { color: theme.colors.safetyOrange }]}>
            {item.category}
          </Text>
        </View>
        {!disabled && (
          <Pressable onPress={onRemove} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={16} color={theme.colors.text.secondary} />
          </Pressable>
        )}
      </View>

      {/* Description */}
      <TextInput
        value={item.description}
        onChangeText={(v) => onUpdate({ description: v })}
        placeholder="Description…"
        placeholderTextColor={theme.colors.text.secondary}
        editable={!disabled}
        style={[
          styles.descInput,
          {
            color: theme.colors.text.primary,
            borderBottomColor: theme.colors.border,
          },
        ]}
      />

      {/* Qty / Unit / Price row */}
      <View style={styles.itemBottomRow}>
        <View style={styles.qtyGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>Qty</Text>
          <TextInput
            value={String(item.quantity)}
            onChangeText={(v) => onUpdate({ quantity: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
            editable={!disabled}
            style={[
              styles.smallInput,
              { color: theme.colors.text.primary, borderColor: theme.colors.border },
            ]}
          />
        </View>

        <View style={styles.qtyGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>Unit</Text>
          <TextInput
            value={item.unit}
            onChangeText={(v) => onUpdate({ unit: v })}
            placeholder="each"
            placeholderTextColor={theme.colors.text.secondary}
            editable={!disabled}
            style={[
              styles.smallInput,
              { color: theme.colors.text.primary, borderColor: theme.colors.border },
            ]}
          />
        </View>

        <View style={[styles.qtyGroup, { flex: 2 }]}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
            Unit price ({currency})
          </Text>
          <TextInput
            value={item.unitPrice === 0 ? "" : String(item.unitPrice / 100)}
            onChangeText={(v) => onUpdate({ unitPrice: Math.round((parseFloat(v) || 0) * 100) })}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={theme.colors.text.secondary}
            editable={!disabled}
            style={[
              styles.smallInput,
              { color: theme.colors.text.primary, borderColor: theme.colors.border },
            ]}
          />
        </View>

        <View style={styles.lineTotalGroup}>
          <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
            Line total
          </Text>
          <Text style={[styles.lineTotalText, { color: theme.colors.text.primary }]}>
            {formatCurrency(lineTotal, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  savingText: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },

  colHeaders: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingHorizontal: 4 },
  colLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase" },

  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20, maxWidth: 280 },

  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryText: { fontSize: 12, fontWeight: "700" },

  descInput: {
    fontSize: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    marginBottom: 10,
  },

  itemBottomRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  qtyGroup: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
  smallInput: {
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  lineTotalGroup: { flex: 1.5, alignItems: "flex-end", gap: 4 },
  lineTotalText: { fontSize: 14, fontWeight: "600" },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  addButtonText: { fontSize: 14 },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 20,
  },
  totalLabel: { fontSize: 16, fontWeight: "700" },
  totalAmount: { fontSize: 22, fontWeight: "800" },

  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
  },
  sendButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
