import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MarkItWebProps {
  imageUrl?: string;
  projectId?: string;
  fileId?: string;
  exif?: Record<string, any>;
}

export default function MarkItWeb({ imageUrl, projectId, fileId, exif }: MarkItWebProps) {
  return (
    <View style={{ flex: 1 }}>
      <WithSkiaWeb
        getComponent={() => import("./index.native")}
        componentProps={{ imageUrl, projectId, fileId, exif }}
        opts={{ locateFile: () => "/canvaskit.wasm" }}
        fallback={
          <View style={styles.loading}>
            <Text>Loading Skia Engine...</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
