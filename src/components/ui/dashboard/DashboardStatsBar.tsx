import { useTheme } from "@/src/context/ThemeContext";
import { DashboardStats } from "@/src/hooks/useDashboard";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatPillProps {
  label: string;
  value: number;
  color: string;
}

function StatPill({ label, value, color }: StatPillProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text
        style={[
          styles.value,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

interface DashboardStatsBarProps {
  stats: DashboardStats;
}

export function DashboardStatsBar({ stats }: DashboardStatsBarProps) {
  return (
    <View style={styles.container}>
      <StatPill label="Active" value={stats.active} color="#10B981" />
      <StatPill label="Draft" value={stats.draft} color="#F59E0B" />
      <StatPill label="Done" value={stats.completed} color="#6B7280" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  value: {
    fontSize: 15,
  },
  label: {
    fontSize: 13,
  },
});
