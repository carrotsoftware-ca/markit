import { useAuth } from "@/src/context/AuthContext";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    
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
