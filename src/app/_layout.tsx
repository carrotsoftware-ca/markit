import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, Platform } from "react-native";
import { Toaster } from "sonner-native";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

LogBox.ignoreLogs([
  "Sending `onAnimatedValueUpdate` with no listeners registered.",
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize Firebase - platform resolution doesn't work with static export,
// so we explicitly require per platform
if (Platform.OS === "web") {
  require("@/src/services/firebase/index.web");
} else {
  require("@/src/services/firebase/index");
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "SpaceGrotesk-Light": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-Regular": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-SemiBold": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk-Bold": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Keep splash screen visible
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
