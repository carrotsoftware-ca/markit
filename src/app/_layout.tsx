import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "SpaceGrotesk-Light": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Light.ttf"),
    "SpaceGrotesk-Regular": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Medium": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-SemiBold": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk-Bold": require("../../assets/fonts/space_grotesk/static/SpaceGrotesk-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
