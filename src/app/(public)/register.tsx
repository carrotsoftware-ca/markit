import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function Register() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          Join the future of construction project management
        </Text>

        <View style={[styles.registerCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { 
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.semiBold,
            fontSize: theme.typography.fontSize.xl
          }]}>
            Create Account
          </Text>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.buttonText, { 
              fontFamily: theme.typography.fontFamily.semiBold 
            }]}>
              Get Started
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/login")}
          >
            <Text style={[styles.linkText, { 
              color: theme.colors.primary,
              fontFamily: theme.typography.fontFamily.regular,
              fontSize: theme.typography.fontSize.sm
            }]}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  registerCard: {
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
  loginLink: {
    padding: 8,
  },
  linkText: {
    textAlign: "center",
  },
});
