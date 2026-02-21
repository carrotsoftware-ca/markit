import { useAuth } from "@/src/context/AuthContext";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Theme toggle button */}
      <TouchableOpacity 
        style={[styles.themeToggle, { backgroundColor: theme.colors.surface }]}
        onPress={toggleTheme}
      >
        <Text style={[styles.themeToggleText, { 
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.regular 
        }]}>
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { 
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: theme.typography.fontSize["3xl"]
        }]}>
          markit!
        </Text>
        <Text style={[styles.subtitle, { 
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamily.regular,
          fontSize: theme.typography.fontSize.base
        }]}>
          Welcome back to your construction management platform
        </Text>

        <View style={[styles.loginCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.semiBold,
            fontSize: theme.typography.fontSize.xl
          }]}>
            Sign In
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={login}
          >
            <Text style={[styles.buttonText, { 
              fontFamily: theme.typography.fontFamily.semiBold 
            }]}>
              Continue to Dashboard
            </Text>
          </TouchableOpacity>

          <Text style={[styles.note, { 
            color: theme.colors.text.muted,
            fontFamily: theme.typography.fontFamily.regular,
            fontSize: theme.typography.fontSize.sm
          }]}>
            Development Mode - Tap to enter app
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  themeToggleText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 40,
    opacity: 0.8,
  },
  loginCard: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    padding: 24,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  note: {
    textAlign: "center",
    opacity: 0.6,
  },
});
