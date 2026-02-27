import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Register() {
  const { theme } = useTheme();
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ email, password });
    } catch (err: any) {
      Alert.alert("Registration failed", err?.message ?? "Please try again.");
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={[styles.title, { color: "#FFFFFF", fontFamily: t.fontFamily.bold, fontSize: t.fontSize["3xl"] }]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, { color: c.gray[400], fontFamily: t.fontFamily.regular, fontSize: t.fontSize.sm }]}>
          Join the future of construction project management
        </Text>

        {/* Email */}
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

        {/* Password */}
        <Text style={[styles.label, { color: c.gray[300], fontFamily: t.fontFamily.semiBold, marginTop: 16 }]}>PASSWORD</Text>
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

        {/* Confirm Password */}
        <Text style={[styles.label, { color: c.gray[300], fontFamily: t.fontFamily.semiBold, marginTop: 16 }]}>CONFIRM PASSWORD</Text>
        <View style={[styles.inputRow, { backgroundColor: c.slateGray, borderColor: c.gray[700] }]}>
          <MaterialCommunityIcons name="lock-check-outline" size={18} color={c.gray[400]} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: "#FFF", fontFamily: t.fontFamily.regular }]}
            placeholder="••••••••"
            placeholderTextColor={c.gray[500]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Register button */}
        <Pressable
          style={({ pressed }) => [styles.btn, { backgroundColor: c.safetyOrange, opacity: pressed ? 0.85 : 1 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[styles.btnText, { fontFamily: t.fontFamily.bold }]}>Create Account →</Text>
          )}
        </Pressable>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: c.gray[400], fontFamily: t.fontFamily.regular }]}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/login")}>
            <Text style={[styles.loginLink, { color: c.safetyOrange, fontFamily: t.fontFamily.regular }]}>
              Sign in
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
    marginBottom: 24,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { fontSize: 13 },
  loginLink: { fontSize: 13 },
});
