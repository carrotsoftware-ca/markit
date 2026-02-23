import { useTheme } from "@/src/context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";

export default ({ title, children }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: theme.colors.safetyOrange,
          fontFamily: theme.typography.fontFamily.bold,
          fontSize: 14,
          paddingVertical: 12,
        }}
      >
        {title}
      </Text>
      <View>{children}</View>
      <View></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
});
