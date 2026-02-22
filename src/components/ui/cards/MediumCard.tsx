import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MediumCard({ title, subtitle, icon, style, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {/* Icon placeholder */}
      <View style={styles.icon}>{icon}</View>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#222",
    marginVertical: 6,
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
