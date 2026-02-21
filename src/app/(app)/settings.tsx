import { useTheme } from "@/src/context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";

export default function Profile() {
  const { theme } = useTheme();
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text>Settings</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
