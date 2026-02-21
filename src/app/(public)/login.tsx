import { useAuth } from "@/src/context/AuthContext";
import { Button, Card, ThemedText, ThemedView } from "@components/ui";
import { StyleSheet } from "react-native";

export default function Login() {
  const { login } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText variant="heading" style={styles.title}>
          markit!
        </ThemedText>
        <ThemedText variant="body" style={styles.subtitle}>
          Welcome back to your construction management platform
        </ThemedText>

        <Card title="Sign In" style={styles.loginCard}>
          <Button variant="primary" onPress={login}>
            Continue to Dashboard
          </Button>

          <ThemedText variant="caption" style={styles.note}>
            Development Mode - Tap to enter app
          </ThemedText>
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
  loginCard: {
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
  },
  note: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 16,
  },
});
