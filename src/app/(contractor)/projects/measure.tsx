import MarkIt from "@/src/components/MarkIt";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MeasureScreen() {
  const { fileUrl, projectId, fileId, exif } = useLocalSearchParams<{
    fileUrl: string;
    projectId: string;
    fileId: string;
    exif?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const parsedExif = exif
    ? (() => {
        try {
          return JSON.parse(exif);
        } catch {
          return undefined;
        }
      })()
    : undefined;

  return (
    <View style={styles.container}>
      <MarkIt imageUrl={fileUrl} projectId={projectId} fileId={fileId} exif={parsedExif} />
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { top: insets.top + 12 }]}
      >
        <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
