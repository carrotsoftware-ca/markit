import { useTheme } from "@/src/context/ThemeContext";
import { sendPasswordReset } from "@/src/services/auth/email";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const c = theme.colors;
  const t = theme.typography;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.industrialBlack }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* Header */}
        <Text
          style={[
            styles.title,
            { color: "#FFFFFF", fontFamily: t.fontFamily.bold, fontSize: t.fontSize["3xl"] },
          ]}
        >
          Reset Password
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: c.gray[400], fontFamily: t.fontFamily.regular, fontSize: t.fontSize.sm },
          ]}
        >
          {sent
            ? `A reset link has been sent to ${email}`
            : "Enter your email and we'll send you a reset link"}
        </Text>

        {!sent && (
          <>
            <Text style={[styles.label, { color: c.gray[300], fontFamily: t.fontFamily.semiBold }]}>
              EMAIL ADDRESS
            </Text>
            <View
              style={[styles.inputRow, { backgroundColor: c.slateGray, borderColor: c.gray[700] }]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={c.gray[400]}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: "#FFF", fontFamily: t.fontFamily.regular }]}
                placeholder="name@company.com"
                placeholderTextColor={c.gray[500]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: c.safetyOrange, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[styles.btnText, { fontFamily: t.fontFamily.bold }]}>
                  Send Reset Link →
                </Text>
              )}
            </Pressable>
          </>
        )}

        {sent && (
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: c.safetyOrange, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.replace("/login")}
          >
            <Text style={[styles.btnText, { fontFamily: t.fontFamily.bold }]}>Back to Sign In</Text>
          </Pressable>
        )}

        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={[styles.backText, { color: c.gray[500], fontFamily: t.fontFamily.regular }]}>
            ← Back to sign in
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
  },
  backRow: {
    alignItems: "center",
    marginTop: 8,
  },
  backText: {
    fontSize: 13,
  },
});
