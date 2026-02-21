import React from "react";
import { ViewStyle } from "react-native";
import { ThemedText, ThemedView } from "../ThemedComponents";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ title, children, style }) => {
  return (
    <ThemedView background="surface" style={[defaultStyles.card, style]}>
      {title && (
        <ThemedText variant="subheading" style={defaultStyles.cardTitle}>
          {title}
        </ThemedText>
      )}
      {children}
    </ThemedView>
  );
};

const defaultStyles = {
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
};
