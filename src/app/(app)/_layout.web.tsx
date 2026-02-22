import { AppHeader } from "@/src/components/navigation/AppHeader";
import { useAuth } from "@/src/context/AuthContext";
import { JobsProvider } from "@/src/context/JobsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import { Redirect } from "expo-router";
import { StatusBar } from "react-native";

export default function Layout() {
  const { isReady, isLoggedIn } = useAuth();
  const { theme, isDark } = useTheme();

  if (!isReady) return null;

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <JobsProvider>
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
        <Drawer
          screenOptions={{
            headerShown: false,
            drawerType: "permanent",
            drawerStyle: {
              backgroundColor: isDark
                ? theme.colors.midnightBlue
                : theme.colors.surface,
              width: 240,
            },
            drawerActiveTintColor: theme.colors.safetyOrange,
            drawerInactiveTintColor: theme.colors.slateGray,
          }}
        >
          <Drawer.Screen
            name="index"
            options={{
              drawerLabel: "Home",
              title: "Home",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="projects"
            options={{
              drawerLabel: "Projects",
              title: "Projects",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="briefcase-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="profile"
            options={{
              drawerLabel: "Profile",
              title: "Profile",
              drawerIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Drawer>
      </>
    </JobsProvider>
  );
}
