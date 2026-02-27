import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DashboardGreetingProps {
  greeting: string;
  displayName: string;
}

export function DashboardGreeting({ greeting, displayName }: DashboardGreetingProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.greeting,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
      >
        {greeting}
        {displayName ? "," : "."}
      </Text>
      {displayName ? (
        <Text
          style={[
            styles.name,
            {
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          {displayName}.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 28,
    lineHeight: 34,
  },
});
