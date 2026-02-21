import { AppHeader } from "@/src/components/navigation/AppHeader";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StatusBar, Text } from "react-native";

export default function Layout() {
  const { isReady, isLoggedIn, isLoading } = useAuth();
  const { theme, isDark } = useTheme();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  if (!isReady) return null;

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }
  return (
    <>
      <StatusBar
        backgroundColor={theme.colors.midnightBlue}
        barStyle={
          theme.colors.background === "#FFFFFF"
            ? "dark-content"
            : "light-content"
        }
      />
      <AppHeader />
      <Tabs
        screenOptions={{
          animation: "none",
          headerShown: false,
          tabBarStyle: {
            backgroundColor: isDark
              ? theme.colors.midnightBlue
              : theme.colors.surface,
            borderTopWidth: 0,
            borderTopColor: theme.colors.gray[200], // subtle separation
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
          name="projects"
          options={{
            title: "Projects",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
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
      </Tabs>
    </>
  );
}
