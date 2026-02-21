import { AppHeader } from "@/src/components/navigation/AppHeader";
import { useAuth } from "@/src/context/AuthContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Redirect } from "expo-router";
import { StatusBar, Text } from "react-native";
import IndexScreen from "./index";
import ProfileScreen from "./profile";
import ProjectsScreen from "./projects";

const Drawer = createDrawerNavigator();

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
      <Drawer.Navigator
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
          name="Home"
          component={IndexScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Projects"
          component={ProjectsScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="briefcase-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            drawerIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </>
  );
}
