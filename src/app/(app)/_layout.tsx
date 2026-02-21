import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";

export default function Layout() {
  const { isReady, isLoggedIn, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (!isReady) return null;

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs
      screenOptions={{
        animation: "none",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.midnightBlue,
          borderTopWidth: 0,
          paddingTop: 12,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: theme.colors.safetyOrange,
        tabBarInactiveTintColor: theme.colors.slateGray,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
