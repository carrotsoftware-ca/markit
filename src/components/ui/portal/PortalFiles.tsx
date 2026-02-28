import { UploadState } from "@/src/hooks/usePortalUpload";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { FileWithEvents, PortalFileRow, getActiveEvents } from "./PortalFileRow";

const ORANGE = "#FF6B00";
const CARD = "#242424";
const MUTED = "#888888";

interface PortalFilesProps {
  items: FileWithEvents[];
  uploads: UploadState[];
  onFilePress: (item: FileWithEvents) => void;
  onUpload: () => void;
}

export function PortalFiles({ items, uploads, onFilePress, onUpload }: PortalFilesProps) {
  return (
    <View>
      {items.length === 0 && uploads.length === 0 ? (
        <Text style={styles.empty}>No files have been added to this project yet.</Text>
      ) : (
        <View style={styles.list}>
          {items.map((item) => {
            const active = getActiveEvents(item.events);
            const measurementCount = active.filter((e) => e.type === "measurement").length;
            return (
              <PortalFileRow
                key={item.file.id}
                file={item.file}
                measurementCount={measurementCount}
                onPress={() => onFilePress(item)}
              />
            );
          })}

          {uploads.map((u) => (
            <View key={u.filename} style={styles.uploadRow}>
              <View style={styles.thumb}>
                <ActivityIndicator size="small" color={ORANGE} />
              </View>
              <View style={styles.uploadInfo}>
                <Text style={styles.uploadName} numberOfLines={1}>
                  {u.filename}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${u.progress}%` as any }]} />
                </View>
                <Text style={styles.uploadMeta}>{u.done ? "Processing…" : `${u.progress}%`}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={onUpload}
        style={({ pressed }) => [styles.uploadBtn, pressed && { opacity: 0.8 }]}
      >
        <Text style={styles.uploadBtnIcon}>＋</Text>
        <Text style={styles.uploadBtnLabel}>Upload Photos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: MUTED, textAlign: "center", marginTop: 32, fontSize: 15 },
  list: { backgroundColor: CARD, borderRadius: 12, overflow: "hidden" },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  uploadInfo: { flex: 1 },
  uploadName: { color: "#fff", fontWeight: "600", fontSize: 15, marginBottom: 4 },
  uploadMeta: { color: MUTED, fontSize: 13 },
  progressTrack: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: ORANGE, borderRadius: 2 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ORANGE,
  },
  uploadBtnIcon: { color: "#fff", fontSize: 20, fontWeight: "bold", marginRight: 8 },
  uploadBtnLabel: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
