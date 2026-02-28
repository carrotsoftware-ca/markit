import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type ProjectTab = "feed" | "files" | "quote" | "access";

interface ProjectTabBarProps {
  active: ProjectTab;
  onChange: (tab: ProjectTab) => void;
}

const TABS: { key: ProjectTab; label: string }[] = [
  { key: "feed", label: "Feed" },
  { key: "files", label: "Files" },
  { key: "quote", label: "Quote" },
  { key: "access", label: "Access" },
];

export function ProjectTabBar({ active, onChange }: ProjectTabBarProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.text.secondary + "22" }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={styles.tab}>
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.safetyOrange : theme.colors.text.secondary,
                  fontFamily: isActive
                    ? theme.typography.fontFamily.bold
                    : theme.typography.fontFamily.regular,
                },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && (
              <View style={[styles.indicator, { backgroundColor: theme.colors.safetyOrange }]} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    position: "relative",
  },
  label: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    borderRadius: 1,
  },
});
