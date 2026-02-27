import { SmallButton } from "@/src/components/ui/buttons/SmallButton";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface QuickAction {
  icon: React.ComponentProps<typeof SmallButton>["icon"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface DashboardQuickActionsProps {
  actions: QuickAction[];
}

const COLUMNS = 3;

export function DashboardQuickActions({ actions }: DashboardQuickActionsProps) {
  const { theme } = useTheme();

  // Chunk into rows of COLUMNS
  const rows: QuickAction[][] = [];
  for (let i = 0; i < actions.length; i += COLUMNS) {
    rows.push(actions.slice(i, i + COLUMNS));
  }

  return (
    <View style={styles.section}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        QUICK ACTIONS
      </Text>
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((action) => (
              <SmallButton
                key={action.label}
                icon={action.icon}
                label={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
              />
            ))}
            {/* Fill empty cells in last row so layout stays consistent */}
            {row.length < COLUMNS &&
              Array.from({ length: COLUMNS - row.length }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.emptyCell} />
              ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  emptyCell: {
    flex: 1,
    aspectRatio: 1,
  },
});
