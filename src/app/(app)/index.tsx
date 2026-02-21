import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Index() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { 
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.fontSize["3xl"]
      }]}>
        markit!
      </Text>
      <Text style={[styles.subtitle, { 
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 12
      }]}>
        DESIGN SYSTEM V1.0
      </Text>
      
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { 
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.semiBold,
          fontSize: theme.typography.fontSize.xl
        }]}>
          The Vision
        </Text>
        <Text style={[styles.cardText, { 
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.regular,
          fontSize: theme.typography.fontSize.base
        }]}>
          Empowering contractors to manage projects with precision. markit!
          bridges the gap between rugged field operations and sophisticated
          digital management.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { 
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.semiBold,
          fontSize: theme.typography.fontSize.xl
        }]}>
          Brand Colors
        </Text>
        <View style={styles.colorGrid}>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.safetyOrange }]}>
            <Text style={[styles.colorLabel, { 
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: theme.typography.fontSize.sm
            }]}>
              Safety Orange
            </Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.slateGray }]}>
            <Text style={[styles.colorLabel, { 
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: theme.typography.fontSize.sm
            }]}>
              Slate Gray
            </Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.industrialBlack }]}>
            <Text style={[styles.colorLabel, { 
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: theme.typography.fontSize.sm
            }]}>
              Industrial Black
            </Text>
          </View>
          <View style={[styles.colorBox, { backgroundColor: theme.colors.safetyTint }]}>
            <Text style={[styles.colorLabel, { 
              color: theme.colors.industrialBlack,
              fontFamily: theme.typography.fontFamily.medium,
              fontSize: theme.typography.fontSize.sm
            }]}>
              Safety Tint
            </Text>
          </View>
        </View>
      </View>
    </View>
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
    letterSpacing: 2,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
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
  colorLabel: {
    color: "#FFFFFF",
    textAlign: "center",
  },
});
