import { CommonActions } from "@react-navigation/native";

import { AppHeader } from "@/src/components/navigation/AppHeader";
import { useAuth } from "@/src/context/AuthContext";
import { JobsProvider } from "@/src/context/JobsContext";
import { ProjectsProvider } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "react-native";

export default function Layout() {
  const { isReady, isLoggedIn } = useAuth();
  const { theme, isDark, breakpoint } = useTheme();
  const isSmallScreen = breakpoint === "sm" || breakpoint === "md";

  if (!isReady) return null;

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <ProjectsProvider>
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
          <Drawer
            screenOptions={{
              headerShown: true,
              header: () => <AppHeader showMenuButton={isSmallScreen} />,
              drawerType: isSmallScreen ? "front" : "permanent",
              popToTopOnBlur: true,
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
                  <Ionicons
                    name="briefcase-outline"
                    size={size}
                    color={color}
                  />
                ),
              }}
              listeners={({ navigation }) => ({
                drawerItemPress: (e) => {
                  // 1. Stop the default "switch focus" behavior
                  e.preventDefault();

                  // 2. Force the entire stack to reset to its index screen
                  navigation.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [
                        {
                          name: "projects",
                          state: {
                            routes: [{ name: "index" }], // This targets the nested stack's index
                          },
                        },
                      ],
                    }),
                  );
                },
              })}
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
    </ProjectsProvider>
  );
}
