import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { sendPasswordReset } from "@/src/services/auth/email";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login("email", { email, password });
    } catch (err: any) {
      Alert.alert("Sign in failed", err?.message ?? "Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      router.push("/forgot-password");
      return;
    }
    try {
      await sendPasswordReset(email);
      Alert.alert("Email sent", `Password reset email sent to ${email}.`);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not send reset email.");
    }
  };

  const c = theme.colors;
  const t = theme.typography;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: c.industrialBlack }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={[styles.title, { color: "#FFFFFF", fontFamily: t.fontFamily.bold, fontSize: t.fontSize["3xl"] }]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, { color: c.gray[400], fontFamily: t.fontFamily.regular, fontSize: t.fontSize.sm }]}>
          Professional tools for construction management
        </Text>

        {/* Federated buttons */}
        <Pressable
          style={({ pressed }) => [styles.federatedBtn, styles.googleBtn, pressed && { opacity: 0.8 }]}
          onPress={() => login("google")}
        >
          <FontAwesome name="google" size={18} color="#333" style={styles.btnIcon} />
          <Text style={[styles.googleBtnText, { fontFamily: t.fontFamily.semiBold }]}>Continue with Google</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.federatedBtn, styles.appleBtn, pressed && { opacity: 0.8 }]}
          onPress={() => login("apple")}
        >
          <MaterialCommunityIcons name="apple" size={20} color="#FFF" style={styles.btnIcon} />
          <Text style={[styles.appleBtnText, { fontFamily: t.fontFamily.semiBold }]}>Continue with Apple</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: c.gray[700] }]} />
          <Text style={[styles.dividerText, { color: c.gray[500], fontFamily: t.fontFamily.regular }]}>
            OR CONTINUE WITH
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: c.gray[700] }]} />
        </View>

        {/* Email field */}
        <Text style={[styles.label, { color: c.gray[300], fontFamily: t.fontFamily.semiBold }]}>EMAIL ADDRESS</Text>
        <View style={[styles.inputRow, { backgroundColor: c.slateGray, borderColor: c.gray[700] }]}>
          <MaterialCommunityIcons name="email-outline" size={18} color={c.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: "#FFF", fontFamily: t.fontFamily.regular }]}
            placeholder="name@company.com"
            placeholderTextColor={c.gray[500]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password field */}
        <View style={styles.passwordLabelRow}>
          <Text style={[styles.label, { color: c.gray[300], fontFamily: t.fontFamily.semiBold }]}>PASSWORD</Text>
          <Pressable onPress={handleForgotPassword}>
            <Text style={[styles.forgot, { color: c.safetyOrange, fontFamily: t.fontFamily.regular }]}>Forgot?</Text>
          </Pressable>
        </View>
        <View style={[styles.inputRow, { backgroundColor: c.slateGray, borderColor: c.gray[700] }]}>
          <MaterialCommunityIcons name="lock-outline" size={18} color={c.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: "#FFF", fontFamily: t.fontFamily.regular }]}
            placeholder="••••••••"
            placeholderTextColor={c.gray[500]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Sign in button */}
        <Pressable
          style={({ pressed }) => [styles.signInBtn, { backgroundColor: c.safetyOrange, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.signInBtnText, { fontFamily: t.fontFamily.bold }]}>Sign In with Email →</Text>
          )}
        </Pressable>

        {/* Register link */}
        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: c.gray[400], fontFamily: t.fontFamily.regular }]}>
            Don't have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text style={[styles.registerLink, { color: c.safetyOrange, fontFamily: t.fontFamily.regular }]}>
              Start free trial
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
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
  federatedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 14,
    marginBottom: 12,
  },
  googleBtn: {
    backgroundColor: "#FFFFFF",
  },
  appleBtn: {
    backgroundColor: "#000000",
  },
  btnIcon: {
    marginRight: 10,
  },
  googleBtnText: {
    color: "#333",
    fontSize: 15,
  },
  appleBtnText: {
    color: "#FFF",
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    marginHorizontal: 12,
    letterSpacing: 0.8,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 6,
  },
  forgot: {
    fontSize: 13,
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
  signInBtn: {
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  signInBtnText: {
    color: "#FFF",
    fontSize: 16,
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
  },
});
