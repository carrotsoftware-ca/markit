import {
  getPortalEvents,
  getPortalFiles,
  getProjectByToken,
  uploadPortalFile,
} from "@/src/services/projects/getPortalProject";
import { activatePortal } from "@/src/services/projects/sendPortalInvite";
import { MarkitEvent, Project, ProjectFile } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

type UploadState = { filename: string; progress: number; done: boolean };

export default function PortalPage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revoked, setRevoked] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<FileWithEvents[]>([]);
  const [uploads, setUploads] = useState<UploadState[]>([]);

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

        // Transition draft → active when the client opens the portal.
        // Fire-and-forget: don't block the rest of the load if this fails.
        activatePortal(token).catch(() => {});

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

  const handleUpload = async () => {
    if (!project) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library to upload files.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) return;

    for (const asset of result.assets) {
      const filename = asset.fileName ?? asset.uri.split("/").pop() ?? `photo_${Date.now()}.jpg`;
      const uploadKey = filename;

      setUploads((prev) => [...prev, { filename, progress: 0, done: false }]);

      try {
        await uploadPortalFile(
          project.id,
          asset.uri,
          filename,
          asset.mimeType ?? "image/jpeg",
          asset.fileSize,
          (pct) => {
            setUploads((prev) =>
              prev.map((u) => (u.filename === uploadKey ? { ...u, progress: pct } : u)),
            );
          },
        );

        setUploads((prev) =>
          prev.map((u) => (u.filename === uploadKey ? { ...u, progress: 100, done: true } : u)),
        );

        // Refresh the file list after a brief pause so the new file appears
        setTimeout(async () => {
          if (!project) return;
          const files = await getPortalFiles(project.id);
          const doneFiles = files.filter((f) => f.status === "done");
          const withEvents = await Promise.all(
            doneFiles.map(async (file) => {
              const events = await getPortalEvents(project.id, file.id);
              return { file, events };
            }),
          );
          setItems(withEvents);
          setUploads((prev) => prev.filter((u) => u.filename !== uploadKey));
        }, 1500);
      } catch (err) {
        console.error("Portal upload error:", err);
        setUploads((prev) => prev.filter((u) => u.filename !== uploadKey));
        Alert.alert("Upload failed", "Something went wrong uploading that file. Please try again.");
      }
    }
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
      {items.length === 0 && uploads.length === 0 ? (
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

          {/* In-progress uploads */}
          {uploads.map((u) => (
            <View key={u.filename} style={styles.uploadRow}>
              <View style={styles.thumb}>
                <ActivityIndicator size="small" color={ORANGE} />
              </View>
              <View style={styles.fileRowInfo}>
                <Text style={styles.fileRowName} numberOfLines={1}>
                  {u.filename}
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${u.progress}%` as any }]} />
                </View>
                <Text style={styles.fileRowMeta}>{u.done ? "Processing…" : `${u.progress}%`}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Upload button */}
      <Pressable
        onPress={handleUpload}
        style={({ pressed }) => [styles.uploadButton, pressed && styles.uploadButtonPressed]}
      >
        <Text style={styles.uploadButtonIcon}>＋</Text>
        <Text style={styles.uploadButtonLabel}>Upload Photos</Text>
      </Pressable>

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

  // Upload button
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ORANGE,
  },
  uploadButtonPressed: { opacity: 0.8 },
  uploadButtonIcon: { color: "#fff", fontSize: 20, fontWeight: "bold", marginRight: 8 },
  uploadButtonLabel: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // In-progress upload row
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#2e2e2e",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: ORANGE, borderRadius: 2 },
});
