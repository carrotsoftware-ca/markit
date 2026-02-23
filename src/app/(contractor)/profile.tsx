import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <AuthScreenWrapper
      title={user?.displayName || "Profile"}
      subtitle="Manage your profile"
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            color: theme.colors.safetyOrange,
            fontFamily: theme.typography.fontFamily.bold,
            fontSize: 18,
            paddingVertical: 12,
          }}
          onPress={logout}
        >
          Logout
        </Text>
      </View>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
