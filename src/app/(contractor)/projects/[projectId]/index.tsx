import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useConfirmDialog } from "@/src/hooks/useConfirmDialog";
import { useQuote } from "@/src/hooks/useQuote";
import { sendPortalInvite } from "@/src/services/projects";
import { calcQuoteTotal, formatCurrency } from "@/src/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// ---------------------------------------------------------------------------
// Row definitions
// ---------------------------------------------------------------------------

type RowId = "quote" | "files" | "chat" | "access";

interface ActionRow {
  id: RowId;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
}

const ROWS: ActionRow[] = [
  { id: "quote", icon: "file-document-edit-outline", label: "Quote" },
  { id: "files", icon: "folder-open-outline", label: "Files" },
  { id: "chat", icon: "chat-outline", label: "Chat" },
  { id: "access", icon: "shield-account-outline", label: "Access" },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function ProjectDashboard() {
  const { projectId, name, status } = useLocalSearchParams();
  const { deleteProject, watchProject, watchProjectFiles, project, files } = useProjects();
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const dialog = useConfirmDialog();
  const [inviting, setInviting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const unsubProject = watchProject(projectId as string);
      const unsubFiles = watchProjectFiles(projectId as string);
      return () => {
        unsubProject();
        unsubFiles();
      };
    }, [projectId]),
  );

  const { quote } = useQuote(
    projectId as string,
    files,
    user?.id ?? "",
    user?.displayName ?? user?.email ?? "Contractor",
  );

  const handleInviteClient = async () => {
    if (!project?.client_email) {
      Alert.alert("No client email", "Add a client email address before sending an invite.");
      return;
    }
    setInviting(true);
    try {
      await sendPortalInvite(projectId as string);
      Alert.alert("Invite sent!", `Portal link sent to ${project.client_email}.`);
    } catch (e: any) {
      Alert.alert("Failed to send invite", e?.message ?? "Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const handleRowPress = (id: RowId) => {
    router.push({
      pathname: `/(contractor)/projects/[projectId]/${id}` as any,
      params: { projectId: projectId as string, name: name as string, status: status as string },
    });
  };

  // Per-row detail text shown under the label
  const rowDetail = (id: RowId): string | null => {
    switch (id) {
      case "quote": {
        if (!quote || quote.status === "draft") return "Draft";
        const total = formatCurrency(calcQuoteTotal(quote.lineItems), quote.currency);
        const statusLabel =
          quote.status === "revision_requested"
            ? "Revisions requested"
            : quote.status.charAt(0).toUpperCase() + quote.status.slice(1);
        return `${statusLabel} · ${total}`;
      }
      case "files":
        return files.length > 0
          ? `${files.length} file${files.length !== 1 ? "s" : ""}`
          : "No files yet";
      case "chat":
        return null;
      case "access":
        return project?.client_email ?? "No client email";
    }
  };

  // Accent dot colour for urgent states
  const rowAccent = (id: RowId): string | null => {
    if (id === "quote" && quote?.status === "revision_requested") return "#f39c12";
    if (id === "quote" && quote?.status === "accepted") return "#2ecc71";
    if (id === "quote" && quote?.status === "rejected") return "#e74c3c";
    return null;
  };

  const ORANGE = theme.colors.safetyOrange;

  return (
    <>
      <DetailsWrapper>
        <DetailsWrapper.NavAction>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
          </Pressable>
        </DetailsWrapper.NavAction>
        <DetailsWrapper.Title>{name}</DetailsWrapper.Title>
        <DetailsWrapper.Subtitle>{status}</DetailsWrapper.Subtitle>
        <DetailsWrapper.HeaderAction>
          <Pressable onPress={handleInviteClient} disabled={inviting} style={{ marginRight: 16 }}>
            <MaterialCommunityIcons
              name="email-arrow-right-outline"
              size={24}
              color={inviting ? theme.colors.text.secondary : ORANGE}
            />
          </Pressable>
          <Pressable
            onPress={() =>
              dialog.show({
                title: "Delete Project",
                message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
                confirmLabel: "Delete",
                onConfirm: async () => {
                  // Navigate first so the screen unmounts and listeners
                  // are cleaned up before the deletion snapshot fires.
                  router.replace("/(contractor)/projects");
                  await deleteProject(projectId);
                },
              })
            }
          >
            <MaterialCommunityIcons name="trash-can-outline" size={24} color="red" />
          </Pressable>
        </DetailsWrapper.HeaderAction>

        <DetailsWrapper.Content>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {ROWS.map((row) => {
              const detail = rowDetail(row.id);
              const accent = rowAccent(row.id);
              return (
                <Pressable
                  key={row.id}
                  onPress={() => handleRowPress(row.id)}
                  style={({ pressed }) => [
                    styles.row,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    pressed && styles.rowPressed,
                  ]}
                >
                  {/* Icon */}
                  <View style={[styles.iconWrap, { backgroundColor: ORANGE + "1A" }]}>
                    <MaterialCommunityIcons name={row.icon} size={24} color={ORANGE} />
                  </View>

                  {/* Labels */}
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, { color: theme.colors.text.primary }]}>
                      {row.label}
                    </Text>
                    {detail ? (
                      <Text
                        style={[styles.rowDetail, { color: accent ?? theme.colors.text.secondary }]}
                        numberOfLines={1}
                      >
                        {detail}
                      </Text>
                    ) : null}
                  </View>

                  {/* Accent dot for urgent states */}
                  {accent && <View style={[styles.accentDot, { backgroundColor: accent }]} />}

                  {/* Chevron */}
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={22}
                    color={theme.colors.text.secondary}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </DetailsWrapper.Content>
      </DetailsWrapper>

      <ConfirmDialog
        visible={dialog.visible}
        title={dialog.options?.title ?? ""}
        message={dialog.options?.message ?? ""}
        confirmLabel={dialog.options?.confirmLabel}
        cancelLabel={dialog.options?.cancelLabel}
        loading={dialog.loading}
        onConfirm={dialog.confirm}
        onCancel={dialog.hide}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
  },
  rowPressed: { opacity: 0.7 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  rowDetail: {
    fontSize: 13,
    fontWeight: "400",
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
});
