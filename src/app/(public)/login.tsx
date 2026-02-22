import SmallCard from "@/src/components/ui/cards/SmallCard";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function Login() {
  const { theme, isDark } = useTheme();
  const { login } = useAuth();

  const cardStyle = {
    backgroundColor: theme.colors.midnightBlue,
    borderWidth: 1,
    borderColor: theme.colors.safetyOrange,
  };
  const textStyle = {
    color: theme.colors.safetyTint,
    fontWeight: "bold",
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Pressable
        onPress={() => login("google")}
        style={({ pressed }) => [
          pressed && { opacity: 0.7, borderColor: theme.colors.primary },
        ]}
      >
        <SmallCard
          title="Sign in with Google"
          icon={
            <FontAwesome
              name="google"
              size={24}
              color={theme.colors.safetyTint}
            />
          }
          style={cardStyle}
          titleStyle={textStyle}
        />
      </Pressable>
      <Pressable
        onPress={() => login("apple")}
        style={({ pressed }) => [
          pressed && { opacity: 0.7, borderColor: theme.colors.primary },
        ]}
      >
        <SmallCard
          title="Sign in with Apple"
          icon={
            <MaterialCommunityIcons
              name="apple"
              size={24}
              color={theme.colors.safetyTint}
            />
          }
          style={cardStyle}
          titleStyle={textStyle}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 24,
  },
});
