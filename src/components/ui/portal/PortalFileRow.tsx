import { MarkitEvent, ProjectFile } from "@/src/types";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export type FileWithEvents = { file: ProjectFile; events: MarkitEvent[] };

export function getActiveEvents(events: MarkitEvent[]): MarkitEvent[] {
  const deleted = new Set(
    events.filter((e) => e.type === "delete").map((e) => (e as any).targetEventId as string),
  );
  return events.filter((e) => e.type !== "delete" && !deleted.has(e.id));
}

interface PortalFileRowProps {
  file: ProjectFile;
  measurementCount: number;
  onPress: () => void;
}

export function PortalFileRow({ file, measurementCount, onPress }: PortalFileRowProps) {
  const displayName = file.name || file.filename;
  const dateStr = file.date
    ? new Date(file.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.thumb}>
        {file.url ? (
          <Image source={{ uri: file.url }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <Text style={styles.thumbPlaceholder}>📄</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.meta}>
          {dateStr}
          {measurementCount > 0
            ? `  ·  ${measurementCount} measurement${measurementCount !== 1 ? "s" : ""}`
            : ""}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  rowPressed: { backgroundColor: "#2e2e2e" },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#111",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  thumbImage: { width: 52, height: 52 },
  thumbPlaceholder: { fontSize: 24 },
  info: { flex: 1, marginRight: 8 },
  name: { color: "#fff", fontWeight: "600", fontSize: 15, marginBottom: 4 },
  meta: { color: "#888", fontSize: 13 },
  chevron: { color: "#888", fontSize: 24, lineHeight: 28 },
});
