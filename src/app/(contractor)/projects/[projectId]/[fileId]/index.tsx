import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useConfirmDialog } from "@/src/hooks/useConfirmDialog";
import { deleteProjectFile, updateProjectFile } from "@/src/services/projects";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProjectFileScreen() {
  const { projectId, fileId } = useLocalSearchParams<{
    projectId: string;
    fileId: string;
  }>();
  const { watchProjectFiles, files } = useProjects();
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const dialog = useConfirmDialog();

  // Find this specific file from the watched files list
  const file = files.find((f) => f.id === fileId);

  // Local editable state — seeded from Firestore once the file loads
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Watch the parent project's files subcollection so we get live data,
  // and reset local edit state each time the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      const unsub = watchProjectFiles(projectId);
      return unsub;
    }, [projectId]),
  );

  // Seed local state whenever the file data arrives or the screen re-focuses.
  // We intentionally depend on the Firestore values so navigating back always
  // shows the latest saved state rather than stale local state.
  useEffect(() => {
    if (file) {
      setName(file.name ?? "");
      setNotes(file.notes ?? "");
      setDirty(false);
    }
  }, [file?.name, file?.notes]);

  const handleSave = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await updateProjectFile(projectId, fileId, { name, notes });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMarkIt = () => {
    if (!file?.url) return;
    router.push({
      pathname: "/(contractor)/projects/measure",
      params: {
        fileUrl: file.url,
        projectId,
        fileId,
        // Pass EXIF as a JSON string so the measure screen can forward it to MarkIt
        exif: file.exif ? JSON.stringify(file.exif) : undefined,
      },
    });
  };

  const handleDelete = () => {
    if (!file) return;
    dialog.show({
      title: "Delete File",
      message: `Are you sure you want to delete "${file.name || file.filename}"? This cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: async () => {
        await deleteProjectFile(projectId, file, user?.id, user?.displayName);
        router.back();
      },
    });
  };

  const canOpenMarkIt =
    file?.status === "done" &&
    !!file?.url &&
    (file.mimeType?.startsWith("image/") ??
      ["png", "jpg", "jpeg", "gif", "webp"].includes(
        file.filename.split(".").pop()?.toLowerCase() ?? "",
      ));

  return (
    <>
      <DetailsWrapper>
        <DetailsWrapper.NavAction>
          <Pressable onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
          </Pressable>
        </DetailsWrapper.NavAction>
        <DetailsWrapper.Title>File Details</DetailsWrapper.Title>
        <DetailsWrapper.Subtitle>{file?.name || file?.filename || ""}</DetailsWrapper.Subtitle>
        <DetailsWrapper.HeaderAction>
          <Pressable onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={theme.colors.error} />
          </Pressable>
        </DetailsWrapper.HeaderAction>

        <DetailsWrapper.Content>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Open in MarkIt */}
            {canOpenMarkIt && (
              <Pressable
                style={[styles.markitButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleOpenMarkIt}
              >
                <MaterialCommunityIcons
                  name="ruler"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.markitButtonText,
                    { fontFamily: theme.typography.fontFamily.bold },
                  ]}
                >
                  Open in MarkIt
                </Text>
              </Pressable>
            )}

            {/* File metadata */}
            <View style={[styles.metaCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.metaRow}>
                <Text
                  style={[
                    styles.metaLabel,
                    {
                      color: theme.colors.text.secondary,
                      fontFamily: theme.typography.fontFamily.medium,
                    },
                  ]}
                >
                  Added
                </Text>
                <Text
                  style={[
                    styles.metaValue,
                    {
                      color: theme.colors.text.primary,
                      fontFamily: theme.typography.fontFamily.regular,
                    },
                  ]}
                >
                  {file?.date ?? "—"}
                </Text>
              </View>
            </View>

            {/* Editable fields */}
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.typography.fontFamily.bold,
                  },
                ]}
              >
                DISPLAY NAME
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily.regular,
                    borderColor: theme.colors.gray[700],
                  },
                ]}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setDirty(true);
                }}
                placeholder={file?.filename ?? "Friendly name…"}
                placeholderTextColor={theme.colors.text.secondary}
                autoCorrect={false}
              />
            </View>

            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontFamily: theme.typography.fontFamily.bold,
                  },
                ]}
              >
                NOTES
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.notesInput,
                  {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily.regular,
                    borderColor: theme.colors.gray[700],
                  },
                ]}
                value={notes}
                onChangeText={(v) => {
                  setNotes(v);
                  setDirty(true);
                }}
                placeholder="Add notes about this file…"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Save button */}
            <Pressable
              style={[
                styles.saveButton,
                {
                  backgroundColor: dirty ? theme.colors.primary : theme.colors.surface,
                  borderColor: dirty ? theme.colors.primary : theme.colors.gray[700],
                },
              ]}
              onPress={handleSave}
              disabled={!dirty || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color: dirty ? "#fff" : theme.colors.text.secondary,
                      fontFamily: theme.typography.fontFamily.bold,
                    },
                  ]}
                >
                  {dirty ? "Save Changes" : "No Changes"}
                </Text>
              )}
            </Pressable>
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
  markitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
  },
  markitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  metaCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  notesInput: {
    minHeight: 120,
    paddingTop: 10,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
  },
});
