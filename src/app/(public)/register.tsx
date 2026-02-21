import { Button, Card, ThemedText, ThemedView } from "@components/ui";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";

export default function Register() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText variant="heading" style={styles.title}>
          markit!
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Join the future of construction project management
        </ThemedText>

        <Card title="Create Account" style={styles.registerCard}>
          <Button variant="primary" onPress={() => router.back()}>
            Get Started
          </Button>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/login")}
          >
            <ThemedText variant="caption" color="primary">
              Already have an account? Sign in
            </ThemedText>
          </TouchableOpacity>
        </Card>
      </ThemedView>
    </ThemedView>
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
  },
  loginLink: {
    padding: 8,
    marginTop: 16,
  },
});
