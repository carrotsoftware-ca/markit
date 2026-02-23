import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MarkItWeb() {
  return (
    <View style={{ flex: 1 }}>
      <WithSkiaWeb
        // Explicitly return the default export from the module
        getComponent={() => import("./index.native")}
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
