import { AppHeader } from "@/src/components/navigation/AppHeader";
import { useAuth } from "@/src/context/AuthContext";
import { ProjectsProvider } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";

export default function Layout() {
  const { isReady, isLoggedIn } = useAuth();
  const { theme, isDark } = useTheme();

  if (!isReady) return null;

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <ProjectsProvider>
      <>
        <StatusBar style={isDark ? "light" : "dark"} backgroundColor={theme.colors.midnightBlue} />
        {/* Status bar background view for Android */}
        {Platform.OS === "android" && (
          <View style={{ backgroundColor: theme.colors.midnightBlue }} />
        )}
        <AppHeader />
        <Tabs
          screenOptions={{
            animation: "none",
            unmountOnBlur: true,
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDark ? theme.colors.midnightBlue : theme.colors.surface,
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
    </ProjectsProvider>
  );
}
