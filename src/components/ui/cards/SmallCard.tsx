import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SmallCard({
  title,
  icon,
  style,
  titleStyle,
  onPress, // keep for compatibility, but not used
  ...props
}) {
  return (
    <View style={[styles.card, style]} {...props}>
      {/* Icon component */}
      <View style={styles.icon}>{icon}</View>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  icon: {
    marginRight: 12,
  },
});
