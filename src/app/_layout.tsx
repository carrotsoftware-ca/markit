import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, Platform } from "react-native";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Disable the "reading .value during render" strict-mode warning.
// Our SharedValue reads happen inside gesture callbacks, effects, and
// async handlers — never during React render — so this warning is a
// false positive caused by Reanimated's conservative static analysis.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

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
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
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
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
