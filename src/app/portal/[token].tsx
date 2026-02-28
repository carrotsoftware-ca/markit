import { ActivityFeed, MessageComposer } from "@/src/components/ui/activity";
import { FileWithEvents } from "@/src/components/ui/portal/PortalFileRow";
import { PortalFiles } from "@/src/components/ui/portal/PortalFiles";
import { PortalQuoteCard } from "@/src/components/ui/portal/PortalQuoteCard";
import { useActivity } from "@/src/hooks/useActivity";
import { usePortalQuote } from "@/src/hooks/usePortalQuote";
import { usePortalUpload } from "@/src/hooks/usePortalUpload";
import { getAuth } from "@/src/services/firebase";
import {
  getPortalEvents,
  getPortalFiles,
  getProjectByToken,
} from "@/src/services/projects/getPortalProject";
import { activatePortal, getPortalCustomToken } from "@/src/services/projects/sendPortalInvite";
import { watchQuote } from "@/src/services/projects/watchQuote";
import { Project, Quote } from "@/src/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const BG = "#1a1a1a";
const CARD = "#242424";
const ORANGE = "#FF6B00";
const TEXT = "#ffffff";
const MUTED = "#888888";

export default function PortalPage() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [revoked, setRevoked] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [items, setItems] = useState<FileWithEvents[]>([]);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("Client");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [activeSection, setActiveSection] = useState<"quote" | "files" | "chat" | null>(null);

  // Scroll to top when switching sections
  const scrollViewRef = useRef<ScrollView>(null);
  const openSection = (key: "quote" | "files" | "chat") => {
    setActiveSection(key);
    setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: false }), 0);
  };

  // Hooks
  const { uploads, handleUpload } = usePortalUpload(project?.id ?? "", setItems);
  const { respond, requestRevision, isResponding } = usePortalQuote(
    project?.id ?? "",
    quote,
    clientId,
    clientName,
  );
  const { events, send, isSending } = useActivity({
    projectId: project?.id ?? "",
    visibility: "all",
    authorId: clientId,
    authorName: clientName,
  });

  useEffect(() => {
    if (!project?.id) return;
    return watchQuote(project.id, setQuote);
  }, [project?.id]);

  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const customToken = await getPortalCustomToken(token);
        await getAuth().signInWithCustomToken(customToken);

        const currentUser = getAuth().currentUser;
        if (currentUser) setClientId(currentUser.uid);

        const proj = await getProjectByToken(token);
        if (!proj) {
          setRevoked(true);
          return;
        }
        setProject(proj);
        if (proj.client_email) setClientName(proj.client_email);

        const platform =
          Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
        activatePortal(token, platform).catch(() => {});

        const files = await getPortalFiles(proj.id);
        const withEvents = await Promise.all(
          files
            .filter((f) => f.status === "done")
            .map(async (file) => ({ file, events: await getPortalEvents(proj.id, file.id) })),
        );
        setItems(withEvents);
      } catch {
        setRevoked(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useLayoutEffect(() => {
    if (typeof document !== "undefined" && project?.name) {
      document.title = `${project.name} — markit!`;
    }
  }, [project?.name]);

  if (loading) {
    return (
      <View style={styles.centred}>
        <ActivityIndicator size="large" color={ORANGE} />
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
      params: { fileUrl: item.file.url, projectId: project.id, fileId: item.file.id },
    });
  };

  const showQuote = !!quote && quote.status !== "draft";

  // Default to "files" on first load if no quote yet
  const effectiveSection = activeSection ?? (showQuote ? null : "files");

  return (
    <ScrollView ref={scrollViewRef} style={styles.page} contentContainerStyle={styles.content}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.logo}>
          markit<Text style={styles.logoAccent}>!</Text>
        </Text>
      </View>

      {/* ── Project meta ── */}
      <View style={styles.section}>
        <Text style={styles.projectName}>{project.name}</Text>
        {project.description ? <Text style={styles.projectDesc}>{project.description}</Text> : null}
        <View style={[styles.statusPill, styles[`status_${project.status ?? "draft"}`]]}>
          <Text style={styles.statusText}>{project.status ?? "draft"}</Text>
        </View>
      </View>

      {/* ── Tile grid ── */}
      <View style={styles.tileGrid}>
        {showQuote && (
          <Tile
            icon="📋"
            label="Quote"
            badge={quote!.status}
            badgeColor={
              quote!.status === "accepted"
                ? "#2ecc71"
                : quote!.status === "rejected"
                  ? "#e74c3c"
                  : ORANGE
            }
            active={effectiveSection === "quote"}
            onPress={() => openSection("quote")}
          />
        )}
        <Tile
          icon="📁"
          label="Files"
          badge={items.length > 0 ? String(items.length) : null}
          active={effectiveSection === "files"}
          onPress={() => openSection("files")}
        />
        <Tile
          icon="💬"
          label="Chat"
          badge={events.length > 0 ? String(events.length) : null}
          active={effectiveSection === "chat"}
          onPress={() => openSection("chat")}
        />
      </View>

      <View style={styles.divider} />

      {/* ── Quote ── */}
      {effectiveSection === "quote" && showQuote && (
        <View style={styles.section}>
          <PortalQuoteCard
            quote={quote!}
            isResponding={isResponding}
            onRespond={respond}
            onRequestRevision={requestRevision}
          />
        </View>
      )}

      {/* ── Files ── */}
      {effectiveSection === "files" && (
        <View style={styles.section}>
          <PortalFiles
            items={items}
            uploads={uploads}
            onFilePress={handleFilePress}
            onUpload={handleUpload}
          />
        </View>
      )}

      {/* ── Chat ── */}
      {effectiveSection === "chat" && (
        <View style={styles.section}>
          <View style={styles.feedContainer}>
            <ActivityFeed events={events} currentUserId={clientId} />
          </View>
          <MessageComposer onSend={send} isSending={isSending} showInternalToggle={false} />
        </View>
      )}

      <Text style={styles.footer}>Powered by markit!</Text>
    </ScrollView>
  );
}

// ── Tile sub-component ──────────────────────────────────────────────────────

function Tile({
  icon,
  label,
  badge,
  badgeColor = ORANGE,
  active = false,
  onPress,
}: {
  icon: string;
  label: string;
  badge?: string | null;
  badgeColor?: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        active && styles.tileActive,
        pressed && { opacity: 0.75 },
      ]}
      onPress={onPress}
    >
      <View style={styles.tileIconWrap}>
        <Text style={styles.tileIcon}>{icon}</Text>
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
      {badge && (
        <View style={[styles.tileBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.tileBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: BG },
  content: { maxWidth: 680, alignSelf: "center", width: "100%" as any, paddingBottom: 64 },
  centred: {
    flex: 1,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },

  header: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8 },
  logo: { fontSize: 28, fontWeight: "900", color: TEXT, letterSpacing: -1 },
  logoAccent: { color: ORANGE },

  section: { paddingHorizontal: 24, paddingTop: 16 },
  sectionLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    marginBottom: 10,
  },

  projectName: { fontSize: 26, fontWeight: "bold", color: TEXT, marginBottom: 6 },
  projectDesc: { fontSize: 15, color: MUTED, marginBottom: 12 },
  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  status_active: { backgroundColor: "rgba(34,197,94,0.15)" },
  status_draft: { backgroundColor: "rgba(234,179,8,0.15)" },
  status_completed: { backgroundColor: "rgba(100,100,100,0.2)" },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED,
    textTransform: "uppercase" as const,
  },

  divider: { height: 1, backgroundColor: "#333", marginHorizontal: 24, marginTop: 16 },

  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  tile: {
    width: 100,
    aspectRatio: 1,
    backgroundColor: CARD,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  tileActive: {
    borderColor: ORANGE,
    backgroundColor: "rgba(255,107,0,0.08)",
  },
  tileIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,107,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  tileIcon: { fontSize: 24 },
  tileLabel: { color: TEXT, fontSize: 12, fontWeight: "600", textAlign: "center" },
  tileBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tileBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  feedContainer: {
    backgroundColor: CARD,
    borderRadius: 12,
    minHeight: 200,
    maxHeight: 400,
    overflow: "hidden",
  },

  revokedIcon: { fontSize: 48, marginBottom: 16 },
  revokedTitle: { fontSize: 22, fontWeight: "bold", color: TEXT, marginBottom: 8 },
  revokedSub: { fontSize: 15, color: MUTED, textAlign: "center", maxWidth: 320 },
  footer: { color: "#444", textAlign: "center", fontSize: 12, marginTop: 48, paddingBottom: 16 },
});
