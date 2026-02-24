import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { FileRow } from "./FileRow";

interface UploadedFile {
  id: string;
  filename: string;
  size: string;
  date: string;
  status?: "uploading" | "done" | "error";
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
            status={file.status}
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
