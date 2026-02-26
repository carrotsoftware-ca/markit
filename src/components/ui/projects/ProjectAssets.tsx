import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SmallButton } from "../buttons/SmallButton";

interface ProjectAssetsProps {
  onUpload?: () => void;
  onCamera?: () => void;
}

export default function ProjectAssets({
  onUpload,
  onCamera,
}: ProjectAssetsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        ASSETS
      </Text>
      {Platform.OS === "web" ? (
        <Pressable
          onPress={onUpload}
          style={[
            styles.uploadArea,
            { borderColor: theme.colors.text.secondary },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.surface ?? "#2a2a2a" },
            ]}
          >
            <MaterialCommunityIcons
              name="cloud-upload-outline"
              size={32}
              color={theme.colors.safetyOrange}
            />
          </View>
          <Text
            style={[
              styles.uploadTitle,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            Upload Files
          </Text>
          <Text
            style={[
              styles.uploadSubtitle,
              {
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            Images, and Videos
          </Text>
        </Pressable>
      ) : (
        <View style={styles.buttonRow}>
          <SmallButton
            icon="camera"
            label="Camera"
            onPress={onCamera ?? (() => {})}
          />
          <SmallButton
            icon="image-multiple"
            label="Media"
            onPress={onUpload ?? (() => {})}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 8,
  },
  uploadArea: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
});
