import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type FileType = "image" | "pdf" | "zip" | "other";

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

function getFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext ?? ""))
    return "image";
  if (ext === "pdf") return "pdf";
  if (ext === "zip") return "zip";
  return "other";
}

interface FileRowProps {
  filename: string;
  size: string;
  date: string;
  onMenu?: () => void;
}

export function FileRow({ filename, size, date, onMenu }: FileRowProps) {
  const { theme } = useTheme();
  const fileType = getFileType(filename);
  const icon = getFileIcon(fileType);

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: theme.colors.surface ?? "#1e1e1e" },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: icon.color + "22" }]}>
        <MaterialCommunityIcons
          name={icon.name as any}
          size={22}
          color={icon.color}
        />
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
          {size} · {date}
        </Text>
      </View>
      <Pressable onPress={onMenu} style={styles.menu}>
        <MaterialCommunityIcons
          name="dots-vertical"
          size={20}
          color={theme.colors.text.secondary}
        />
      </Pressable>
    </View>
  );
}

interface UploadedFile {
  id: string;
  filename: string;
  size: string;
  date: string;
}

interface UploadedFilesProps {
  files: UploadedFile[];
  onFileMenu?: (fileId: string) => void;
}

export default function UploadedFiles({
  files,
  onFileMenu,
}: UploadedFilesProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          UPLOADED FILES
        </Text>
      </View>
      {files.length === 0 ? (
        <Text
          style={[
            styles.empty,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.regular,
            },
          ]}
        >
          No Files Attached
        </Text>
      ) : (
        files.map((file) => (
          <FileRow
            key={file.id}
            filename={file.filename}
            size={file.size}
            date={file.date}
            onMenu={() => onFileMenu?.(file.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
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
  empty: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
});
