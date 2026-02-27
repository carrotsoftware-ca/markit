import {
  getPortalEvents,
  getPortalFiles,
  getProjectByToken,
} from "@/src/services/projects/getPortalProject";
import { MarkitEvent, Project, ProjectFile } from "@/src/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getActiveEvents(events: MarkitEvent[]): MarkitEvent[] {
  const deleted = new Set(
    events.filter((e) => e.type === "delete").map((e) => (e as any).targetEventId as string),
  );
  return events.filter((e) => e.type !== "delete" && !deleted.has(e.id));
}

// ---------------------------------------------------------------------------
// File list row
// ---------------------------------------------------------------------------

interface FileRowProps {
  file: ProjectFile;
  measurementCount: number;
  onPress: () => void;
}

function FileRow({ file, measurementCount, onPress }: FileRowProps) {
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
      style={({ pressed }) => [styles.fileRow, pressed && styles.fileRowPressed]}
    >
      {/* Thumbnail */}
      <View style={styles.thumb}>
        {file.url ? (
          <Image source={{ uri: file.url }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <Text style={styles.thumbPlaceholder}>📄</Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.fileRowInfo}>
        <Text style={styles.fileRowName} numberOfLines={1}>
          {displayName}
        </Text>
        <Text style={styles.fileRowMeta}>
          {dateStr}
          {measurementCount > 0
            ? `  ·  ${measurementCount} measurement${measurementCount !== 1 ? "s" : ""}`
            : ""}
        </Text>
      </View>

      {/* Chevron */}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Portal page
// ---------------------------------------------------------------------------

type FileWithEvents = { file: ProjectFile; events: MarkitEvent[] };

export default function PortalPage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revoked, setRevoked] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<FileWithEvents[]>([]);

  useEffect(() => {
    if (!token) return;

    (async () => {
      setLoading(true);
      try {
        const proj = await getProjectByToken(token);
        if (!proj) {
          setRevoked(true);
          return;
        }
        setProject(proj);

        const files = await getPortalFiles(proj.id);
        const doneFiles = files.filter((f) => f.status === "done");

        const withEvents = await Promise.all(
          doneFiles.map(async (file) => {
            const events = await getPortalEvents(proj.id, file.id);
            return { file, events };
          }),
        );
        setItems(withEvents);
      } catch {
        setRevoked(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Set document title on web
  useLayoutEffect(() => {
    if (typeof document !== "undefined" && project?.name) {
      document.title = `${project.name} — markit!`;
    }
  }, [project?.name]);

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (revoked || !project) {
    return (
      <View style={styles.centred}>
        <Text style={styles.revokedIcon}>🔒</Text>
        <Text style={styles.revokedTitle}>Access Revoked</Text>
        <Text style={styles.revokedSub}>
          This link is no longer active. Contact your contractor for a new invite.
        </Text>
      </View>
    );
  }

  const handleFilePress = (item: FileWithEvents) => {
    if (!item.file.url) return;
    router.push({
      pathname: "/portal/measure",
      params: {
        fileUrl: item.file.url,
        projectId: project.id,
        fileId: item.file.id,
      },
    });
  };

  // File list view
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          markit<Text style={styles.logoAccent}>!</Text>
        </Text>
      </View>

      {/* Project info */}
      <View style={styles.projectMeta}>
        <Text style={styles.projectName}>{project.name}</Text>
        {project.description ? <Text style={styles.projectDesc}>{project.description}</Text> : null}
        <View style={[styles.statusBadge, styles[`status_${project.status ?? "draft"}`]]}>
          <Text style={styles.statusText}>{project.status ?? "draft"}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* File list */}
      {items.length === 0 ? (
        <Text style={styles.emptyText}>No files have been added to this project yet.</Text>
      ) : (
        <View style={styles.fileList}>
          {items.map((item) => {
            const active = getActiveEvents(item.events);
            const measurementCount = active.filter((e) => e.type === "measurement").length;
            return (
              <FileRow
                key={item.file.id}
                file={item.file}
                measurementCount={measurementCount}
                onPress={() => handleFilePress(item)}
              />
            );
          })}
        </View>
      )}

      <Text style={styles.footer}>Powered by markit!</Text>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const BG = "#1a1a1a";
const CARD = "#242424";
const ORANGE = "#FF6B00";
const TEXT = "#ffffff";
const MUTED = "#888888";

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  pageContent: { maxWidth: 680, alignSelf: "center", width: "100%" as any, paddingBottom: 64 },

  centred: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 },
  logo: { fontSize: 28, fontWeight: "900", color: TEXT, letterSpacing: -1 },
  logoAccent: { color: ORANGE },

  projectMeta: { paddingHorizontal: 24, paddingBottom: 16 },
  projectName: { fontSize: 26, fontWeight: "bold", color: TEXT, marginBottom: 6 },
  projectDesc: { fontSize: 15, color: MUTED, marginBottom: 12 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  status_active: { backgroundColor: "rgba(34,197,94,0.15)" },
  status_draft: { backgroundColor: "rgba(234,179,8,0.15)" },
  status_completed: { backgroundColor: "rgba(100,100,100,0.2)" },
  statusText: { fontSize: 12, fontWeight: "600", color: MUTED, textTransform: "uppercase" as any },

  divider: { height: 1, backgroundColor: "#333", marginHorizontal: 24, marginVertical: 8 },

  // File list
  fileList: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: CARD,
    borderRadius: 12,
    overflow: "hidden",
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  fileRowPressed: { backgroundColor: "#2e2e2e" },
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
  fileRowInfo: { flex: 1, marginRight: 8 },
  fileRowName: { color: TEXT, fontWeight: "600", fontSize: 15, marginBottom: 4 },
  fileRowMeta: { color: MUTED, fontSize: 13 },
  chevron: { color: MUTED, fontSize: 24, lineHeight: 28 },

  emptyText: { color: MUTED, textAlign: "center", marginTop: 48, fontSize: 15 },
  footer: { color: "#444", textAlign: "center", fontSize: 12, marginTop: 48 },

  revokedIcon: { fontSize: 48, marginBottom: 16 },
  revokedTitle: { fontSize: 22, fontWeight: "bold", color: TEXT, marginBottom: 8 },
  revokedSub: { fontSize: 15, color: MUTED, textAlign: "center", maxWidth: 320 },
});
