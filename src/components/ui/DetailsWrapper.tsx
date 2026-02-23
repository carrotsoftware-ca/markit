import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function DetailsWrapper({
  title,
  subtitle,
  onBack,
  onDelete,
  onSave,
  children,
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onDelete}>
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={24}
            color="red"
          />
        </TouchableOpacity>
        {/* Optionally add a save button */}
        {/* <TouchableOpacity onPress={onSave}><MaterialCommunityIcons name="content-save" size={24} /></TouchableOpacity> */}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerText: { flex: 1, marginLeft: 8 },
  title: { fontSize: 20, fontWeight: "bold" },
  subtitle: { fontSize: 14, color: "#888" },
  content: { flex: 1, padding: 16 },
});
