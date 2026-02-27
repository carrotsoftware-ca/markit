import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FileRow } from "./FileRow";

interface UploadedFile {
  id: string;
  filename: string;
  name?: string;
  date: string;
  url?: string;
  status?: "uploading" | "done" | "error";
}

interface UploadedFilesProps {
  files: UploadedFile[];
  onFileMenu?: (fileId: string) => void;
  onFilePress?: (fileId: string) => void;
}

export default function UploadedFiles({ files, onFileMenu, onFilePress }: UploadedFilesProps) {
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
            filename={file.name || file.filename}
            date={file.date}
            status={file.status}
            onPress={file.status === "done" ? () => onFilePress?.(file.id) : undefined}
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
  empty: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
});
