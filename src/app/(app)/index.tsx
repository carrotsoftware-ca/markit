import { Card, ThemedText, ThemedView } from "@components/ui";
import { StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Index() {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText variant="heading" style={styles.title}>
        markit!
      </ThemedText>
      <ThemedText variant="subheading" color="primary" style={styles.subtitle}>
        DESIGN SYSTEM V1.0
      </ThemedText>

      <Card title="The Vision">
        <ThemedText variant="body" style={styles.cardText}>
          Empowering contractors to manage projects with precision. markit!
          bridges the gap between rugged field operations and sophisticated
          digital management.
        </ThemedText>
      </Card>

      {/* Color Palette Demo */}
      <Card title="Brand Colors">
        <ThemedView style={styles.colorGrid}>
          <ThemedView
            style={[
              styles.colorBox,
              { backgroundColor: theme.colors.safetyOrange },
            ]}
          >
            <ThemedText variant="caption" weight="medium">
              Safety Orange
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.colorBox,
              { backgroundColor: theme.colors.slateGray },
            ]}
          >
            <ThemedText variant="caption" weight="medium">
              Slate Gray
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.colorBox,
              { backgroundColor: theme.colors.industrialBlack },
            ]}
          >
            <ThemedText variant="caption" weight="medium">
              Industrial Black
            </ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.colorBox,
              { backgroundColor: theme.colors.safetyTint },
            ]}
          >
            <ThemedText
              variant="caption"
              weight="medium"
              style={{ color: theme.colors.industrialBlack }}
            >
              Safety Tint
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </Card>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    fontSize: 12,
    letterSpacing: 2,
  },
  cardText: {
    lineHeight: 22,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorBox: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
});
