import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const AppHeader = ({ title }: { title?: string }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: theme.colors.surface }}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text
          style={[
            styles.brand,
            {
              color: isDark
                ? theme.colors.primary
                : theme.colors.industrialBlack,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          markit!
        </Text>
        {title && (
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
        )}
        <TouchableOpacity onPress={toggleTheme} style={styles.toggle}>
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={24}
            color={theme.colors.safetyOrange}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  brand: {
    fontSize: 22,
    marginRight: 16,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  toggle: {
    padding: 8,
  },
});
