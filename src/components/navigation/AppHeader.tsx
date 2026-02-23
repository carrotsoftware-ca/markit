import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AppHeaderProps {
  title?: string;
  showMenuButton?: boolean;
}

export const AppHeader = ({ title, showMenuButton }: AppHeaderProps) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();

  const handleToggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ backgroundColor: theme.colors.surface }}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        {showMenuButton && (
          <TouchableOpacity
            onPress={handleToggleDrawer}
            style={styles.menuButton}
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color={theme.colors.safetyOrange}
            />
          </TouchableOpacity>
        )}
        <Text
          style={[
            styles.brand,
            {
              color: isDark
                ? theme.colors.primary
                : theme.colors.industrialBlack,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          markit!
        </Text>
        {title && (
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily.bold,
              },
            ]}
          >
            {title}
          </Text>
        )}
        <TouchableOpacity onPress={toggleTheme} style={styles.toggle}>
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={24}
            color={theme.colors.safetyOrange}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuButton: {
    padding: 4,
    marginRight: 8,
  },
  brand: {
    fontSize: 22,
    marginRight: 16,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  toggle: {
    padding: 8,
  },
});
