import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function DetailsWrapper({ children }) {
  const { theme } = useTheme();

  // Find slot children
  const navAction = React.Children.toArray(children).find(
    (child) => child.type === DetailsWrapper.NavAction,
  );
  const headerActions = React.Children.toArray(children).filter(
    (child) => child.type === DetailsWrapper.HeaderAction,
  );
  const title = React.Children.toArray(children).find(
    (child) => child.type === DetailsWrapper.Title,
  );
  const subtitle = React.Children.toArray(children).find(
    (child) => child.type === DetailsWrapper.Subtitle,
  );
  const content = React.Children.toArray(children).find(
    (child) => child.type === DetailsWrapper.Content,
  );

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
        {/* Navigation action slot on the left */}
        {navAction}
        {/* Title and subtitle in the center, flex: 1 */}
        <View style={styles.headerText}>
          {title}
          {subtitle}
        </View>
        {/* Header actions slot on the right */}
        {headerActions}
      </View>
      <View style={styles.content}>{content}</View>
    </View>
  );
}

DetailsWrapper.NavAction = function NavAction({ children }) {
  return <>{children}</>;
};
DetailsWrapper.HeaderAction = function HeaderAction({ children }) {
  return <>{children}</>;
};
DetailsWrapper.Title = function Title({ children }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.title,
        {
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.bold,
        },
      ]}
    >
      {children}
    </Text>
  );
};
DetailsWrapper.Subtitle = function Subtitle({ children }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        styles.subtitle,
        {
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamily.regular,
        },
      ]}
    >
      {children}
    </Text>
  );
};
DetailsWrapper.Content = function Content({ children }) {
  return <>{children}</>;
};

export default DetailsWrapper;

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
