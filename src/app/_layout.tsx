import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
import { Toaster } from "sonner-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

// Disable the "reading .value during render" strict-mode warning.
// Our SharedValue reads happen inside gesture callbacks, effects, and
// async handlers — never during React render — so this warning is a
// false positive caused by Reanimated's conservative static analysis.
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

LogBox.ignoreLogs(["Sending `onAnimatedValueUpdate` with no listeners registered."]);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Initialize Firebase - platform resolution doesn't work with static export,
// so we explicitly require per platform
if (Platform.OS === "web") {
  require("@/src/services/firebase/index.web");
} else {
  require("@/src/services/firebase/index");
}

// The Firebase compat SDK (v8 API over v9 internals) has a dual error path:
// it calls the user-supplied onError callback AND re-dispatches the error
// through its internal AsyncQueue via setTimeout. The second dispatch bypasses
// our onError handlers and reaches React as an unhandled rejection, triggering
// React error #418. We intercept it here at the window level and swallow
// Firestore listener errors that we've already handled in each watcher.
if (Platform.OS === "web" && typeof window !== "undefined") {
  const FIRESTORE_LISTENER_ERRORS = new Set([
    "permission-denied",
    "failed-precondition",
    "unavailable",
    "unauthenticated",
  ]);

  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;
    if (error?.name === "FirebaseError" && FIRESTORE_LISTENER_ERRORS.has(error?.code)) {
      event.preventDefault();
      console.warn("[Firestore] Suppressed unhandled listener error:", error.code, error.message);
    }
  });
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

  // On web, returning null during font load causes a hydration mismatch (React
  // error #418) because the static pre-render always has the full tree.
  // Fonts load near-instantly on web, so we just render immediately.
  if (!fontsLoaded && Platform.OS !== "web") {
    return null; // Keep splash screen visible (native only)
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
