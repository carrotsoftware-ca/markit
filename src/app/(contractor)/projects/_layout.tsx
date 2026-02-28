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
      <Stack.Screen name={"[projectId]/index"} />
      <Stack.Screen name={"[projectId]/quote"} />
      <Stack.Screen name={"[projectId]/files"} />
      <Stack.Screen name={"[projectId]/chat"} />
      <Stack.Screen name={"[projectId]/access"} />
      <Stack.Screen name={"[projectId]/[fileId]/index"} />
      <Stack.Screen name={"measure"} options={{ presentation: "fullScreenModal" }} />
    </Stack>
  );
}
