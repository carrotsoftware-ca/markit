import { useTheme } from "@/src/context/ThemeContext";
import { StyleSheet, Text, View } from "react-native";

export default ({ title, children, error }: { title: string; children: React.ReactNode; error?: any }) => {
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
      {error?.message ? (
        <Text style={{ color: theme.colors.error ?? "#ef4444", fontSize: 12, marginTop: 4 }}>
          {error.message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
  },
});
