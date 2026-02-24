import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProjectDescriptionProps {
  description?: string;
  client_email?: string;
}

export default function ProjectDescription({
  description,
  client_email,
}: ProjectDescriptionProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface ?? "#1e1e1e" },
      ]}
    >
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
              marginBottom: client_email ? 16 : 0,
            },
          ]}
        >
          {description}
        </Text>
      )}
      {client_email && (
        <>
          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.text.secondary + "33" },
            ]}
          />
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
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {client_email}
            </Text>
          </View>
        </>
      )}
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
    marginBottom: 12,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  emailIcon: {
    marginRight: 8,
  },
  email: {
    fontSize: 14,
  },
});
