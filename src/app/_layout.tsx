import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { Toaster } from "sonner-native";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
LogBox.ignoreLogs([
  "Sending `onAnimatedValueUpdate` with no listeners registered.",
]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize Firebase (resolves to index.web.tsx on web, index.tsx on native)
require("@/src/services/firebase");

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
