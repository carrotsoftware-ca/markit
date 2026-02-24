import { useTheme } from "@/src/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Switch, Text, View } from "react-native";

interface ToggleWrapperProps {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export default ({
  title,
  subtitle,
  value,
  onValueChange,
  icon,
}: ToggleWrapperProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.leftContent}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={24}
            color={theme.colors.primary || "#FF6B35"}
            style={styles.icon}
          />
        )}
        <View style={styles.textContent}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.onSurface || "#FFFFFF" },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.onSurface
                  ? theme.colors.onSurface + "80"
                  : "#FFFFFF80",
              },
            ]}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor={value ? "#FFFFFF" : "#F4F3F4"}
        trackColor={{
          false: "#767577",
          true: theme.colors.primary || "#FF6B35",
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
    borderRadius: 8,
    minHeight: 60,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});
