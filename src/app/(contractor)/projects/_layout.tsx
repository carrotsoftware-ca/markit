import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        unmountOnBlur: true,
      }}
    >
      <Stack.Screen name={"index"} />
      <Stack.Screen name={"add-project"} options={{ presentation: "modal" }} />
    </Stack>
  );
}
