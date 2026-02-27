import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

type FileType = "image" | "pdf" | "zip" | "other";

function getFileType(filename: string | undefined): FileType {
  if (!filename) return "other";
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? "")) return "image";
  if (ext === "pdf") return "pdf";
  if (ext === "zip") return "zip";
  return "other";
}

function getFileIcon(type: FileType) {
  switch (type) {
    case "image":
      return { name: "image-outline", color: "#5b8dee" };
    case "pdf":
      return { name: "file-pdf-box", color: "#e05c5c" };
    case "zip":
      return { name: "folder-zip-outline", color: "#f0a500" };
    default:
      return { name: "file-outline", color: "#aaa" };
  }
}

export interface FileRowProps {
  filename: string;
  date: string;
  status?: "uploading" | "done" | "error";
  onPress?: () => void;
  onMenu?: () => void;
}

export function FileRow({ filename, date, status, onPress, onMenu }: FileRowProps) {
  const { theme } = useTheme();
  const fileType = getFileType(filename);
  const icon = getFileIcon(fileType);

  const opacity = useSharedValue(1);

  useEffect(() => {
    if (status === "uploading") {
      opacity.value = withRepeat(
        withSequence(withTiming(0.35, { duration: 600 }), withTiming(1, { duration: 600 })),
        -1,
        false,
      );
    } else {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.row, { backgroundColor: theme.colors.surface ?? "#1e1e1e" }, animatedStyle]}
    >
      <Pressable style={styles.rowContent} onPress={onPress} disabled={!onPress}>
        <View style={[styles.iconCircle, { backgroundColor: icon.color + "22" }]}>
          <MaterialCommunityIcons name={icon.name as any} size={22} color={icon.color} />
        </View>
        <View style={styles.info}>
          <Text
            style={[
              styles.filename,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
            numberOfLines={1}
          >
            {filename}
          </Text>
          <Text
            style={[
              styles.meta,
              {
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
          >
            {status === "uploading" ? "Uploading..." : date}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={onMenu} style={styles.menu}>
        <MaterialCommunityIcons
          name="dots-vertical"
          size={20}
          color={theme.colors.text.secondary}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  filename: {
    fontSize: 14,
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
  },
  menu: {
    padding: 4,
  },
});
