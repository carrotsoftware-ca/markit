import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

interface ProjectDescriptionProps {
  description?: string;
  client_email?: string;
  /** If provided, an edit button is shown and saving calls this with the new email */
  onSaveEmail?: (email: string) => void;
}

export default function ProjectDescription({
  description,
  client_email,
  onSaveEmail,
}: ProjectDescriptionProps) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(client_email ?? "");

  const handleSave = () => {
    onSaveEmail?.(draft.trim());
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(client_email ?? "");
    setEditing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface ?? "#1e1e1e" }]}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        DESCRIPTION
      </Text>
      {description && (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.regular,
              marginBottom: 16,
            },
          ]}
        >
          {description}
        </Text>
      )}

      <View style={[styles.divider, { backgroundColor: theme.colors.text.secondary + "33" }]} />

      {/* Client email row */}
      <View style={styles.emailSection}>
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.bold,
              marginBottom: 8,
            },
          ]}
        >
          CLIENT EMAIL
        </Text>

        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.safetyOrange,
                  fontFamily: theme.typography.fontFamily.regular,
                  backgroundColor: theme.colors.background ?? "#111",
                },
              ]}
              value={draft}
              onChangeText={setDraft}
              placeholder="client@example.com"
              placeholderTextColor={theme.colors.text.secondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
            <View style={styles.editActions}>
              <Pressable
                onPress={handleSave}
                style={[styles.actionBtn, { backgroundColor: theme.colors.safetyOrange }]}
              >
                <Text
                  style={[styles.actionBtnText, { fontFamily: theme.typography.fontFamily.bold }]}
                >
                  Save
                </Text>
              </Pressable>
              <Pressable
                onPress={handleCancel}
                style={[styles.actionBtn, { backgroundColor: theme.colors.text.secondary + "33" }]}
              >
                <Text
                  style={[
                    styles.actionBtnText,
                    {
                      color: theme.colors.text.secondary,
                      fontFamily: theme.typography.fontFamily.regular,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.emailRow}>
            <MaterialCommunityIcons
              name="account-outline"
              size={18}
              color={theme.colors.safetyOrange}
              style={styles.emailIcon}
            />
            <Text
              style={[
                styles.email,
                {
                  color: client_email ? theme.colors.text.primary : theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily.regular,
                  flex: 1,
                  fontStyle: client_email ? "normal" : "italic",
                },
              ]}
            >
              {client_email || "No client email set"}
            </Text>
            {onSaveEmail && (
              <Pressable
                onPress={() => {
                  setDraft(client_email ?? "");
                  setEditing(true);
                }}
                hitSlop={8}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={16}
                  color={theme.colors.text.secondary}
                />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  emailSection: {
    gap: 0,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emailIcon: {
    marginRight: 8,
  },
  email: {
    fontSize: 14,
  },
  editRow: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 14,
    color: "#fff",
  },
});
