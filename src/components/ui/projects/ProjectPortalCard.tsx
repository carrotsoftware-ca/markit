import { useTheme } from "@/src/context/ThemeContext";
import { watchPortalSessions } from "@/src/services/projects/getPortalProject";
import {
  deletePortal,
  disablePortal,
  enablePortal,
  sendPortalInvite,
} from "@/src/services/projects/sendPortalInvite";
import { PortalSession, Project } from "@/src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Switch, Text, View } from "react-native";

interface ProjectPortalCardProps {
  project: Project;
  projectId: string;
}

function formatLastSeen(ts: any): string {
  if (!ts) return "Never";
  // Firestore Timestamp has .toDate(), plain JS Date otherwise
  const date: Date = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

const PLATFORM_ICONS: Record<string, string> = {
  web: "web",
  ios: "apple",
  android: "android",
};

export default function ProjectPortalCard({ project, projectId }: ProjectPortalCardProps) {
  const { theme } = useTheme();
  const [sessions, setSessions] = useState<PortalSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [resending, setResending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasPortal = !!project.portalToken;
  const isActive = project.portalActive === true;

  useEffect(() => {
    if (!hasPortal) return;
    setLoadingSessions(true);
    const unsub = watchPortalSessions(projectId, (data) => {
      setSessions(data);
      setLoadingSessions(false);
    });
    return unsub;
  }, [projectId, hasPortal]);

  if (!hasPortal) return null;

  // The latest session across all docs
  const latestSession = sessions.reduce<PortalSession | null>((latest, s) => {
    if (!latest) return s;
    const aTime = s.lastSeenAt?.toDate?.()?.getTime?.() ?? 0;
    const bTime = latest.lastSeenAt?.toDate?.()?.getTime?.() ?? 0;
    return aTime > bTime ? s : latest;
  }, null);

  const allPlatforms = Array.from(new Set(sessions.flatMap((s) => s.platforms ?? [])));

  const handleToggle = async (value: boolean) => {
    setToggling(true);
    try {
      if (value) {
        await enablePortal(projectId);
      } else {
        await disablePortal(projectId);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong.");
    } finally {
      setToggling(false);
    }
  };

  const handleResend = async () => {
    if (!project.client_email) {
      Alert.alert("No client email", "Add a client email before resending.");
      return;
    }
    setResending(true);
    try {
      await sendPortalInvite(projectId);
      Alert.alert("Invite sent!", `Portal link resent to ${project.client_email}.`);
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Please try again.");
    } finally {
      setResending(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Portal",
      "This will permanently revoke the client's access. They will need a new invite to view this project. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deletePortal(projectId);
            } catch (e: any) {
              Alert.alert("Error", e?.message ?? "Something went wrong.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const s = theme.colors.surface;
  const orange = theme.colors.safetyOrange;
  const textPrimary = theme.colors.text.primary;
  const textSecondary = theme.colors.text.secondary;
  const fontBold = theme.typography.fontFamily.bold;
  const fontRegular = theme.typography.fontFamily.regular;

  return (
    <View style={[styles.card, { backgroundColor: s }]}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="link-variant"
            size={18}
            color={orange}
            style={styles.icon}
          />
          <Text style={[styles.sectionLabel, { color: textSecondary, fontFamily: fontBold }]}>
            PORTAL
          </Text>
        </View>
        {toggling ? (
          <ActivityIndicator size="small" color={orange} />
        ) : (
          <Switch
            value={isActive}
            onValueChange={handleToggle}
            thumbColor="#FFFFFF"
            trackColor={{ false: "#555", true: orange }}
          />
        )}
      </View>

      {/* Session info */}
      <View style={[styles.metaRow, { borderTopColor: textSecondary + "22" }]}>
        <View style={styles.metaItem}>
          <Text style={[styles.metaLabel, { color: textSecondary, fontFamily: fontRegular }]}>
            Last seen
          </Text>
          {loadingSessions ? (
            <ActivityIndicator size="small" color={textSecondary} style={{ marginTop: 2 }} />
          ) : (
            <Text style={[styles.metaValue, { color: textPrimary, fontFamily: fontBold }]}>
              {latestSession ? formatLastSeen(latestSession.lastSeenAt) : "Not yet opened"}
            </Text>
          )}
        </View>

        {allPlatforms.length > 0 && (
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: textSecondary, fontFamily: fontRegular }]}>
              Platforms
            </Text>
            <View style={styles.platformRow}>
              {allPlatforms.map((p) => (
                <MaterialCommunityIcons
                  key={p}
                  name={PLATFORM_ICONS[p] as any}
                  size={16}
                  color={textSecondary}
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Pressable
          onPress={handleResend}
          disabled={resending}
          style={({ pressed }) => [
            styles.actionBtn,
            { borderColor: orange, opacity: pressed || resending ? 0.6 : 1 },
          ]}
        >
          {resending ? (
            <ActivityIndicator size="small" color={orange} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="email-arrow-right-outline"
                size={15}
                color={orange}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.actionLabel, { color: orange, fontFamily: fontBold }]}>
                Resend Invite
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={handleDelete}
          disabled={deleting}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              borderColor: theme.colors.error ?? "#EF4444",
              opacity: pressed || deleting ? 0.6 : 1,
            },
          ]}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={theme.colors.error ?? "#EF4444"} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="link-variant-off"
                size={15}
                color={theme.colors.error ?? "#EF4444"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.actionLabel,
                  { color: theme.colors.error ?? "#EF4444", fontFamily: fontBold },
                ]}
              >
                Delete Portal
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: "row",
    gap: 24,
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 14,
  },
  metaItem: {
    gap: 3,
  },
  metaLabel: {
    fontSize: 11,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  actionLabel: {
    fontSize: 13,
  },
});
