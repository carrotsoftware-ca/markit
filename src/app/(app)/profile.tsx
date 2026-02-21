import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Button, StyleSheet, Text, View } from "react-native";

export default function Profile() {
  const { logout } = useAuth();
  const { theme } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={{color: theme.colors.text.primary}}>Profile</Text>
      <Button
        styles={{ color: theme.colors.saftyOrange }}
        title="Logout"
        onPress={logout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent:'center',
    alignItems:'center',
  },
});
