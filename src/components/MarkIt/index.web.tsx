import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MarkItWebProps {
  imageUrl?: string;
}

export default function MarkItWeb({ imageUrl }: MarkItWebProps) {
  return (
    <View style={{ flex: 1 }}>
      <WithSkiaWeb
        getComponent={() => import("./index.native")}
        componentProps={{ imageUrl }}
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
