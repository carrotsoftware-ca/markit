import { Stack } from "expo-router";

// Opt the entire portal group out of static HTML generation.
// The portal is 100% dynamic (requires a token + Firebase auth) so there is
// no meaningful HTML to pre-render. Skipping SSR eliminates the React node-ID
// mismatch (hydration error #418) that occurs when React Native Web's internal
// element counter differs between the pre-render pass and the client hydration.
export const unstable_settings = {
  unstable_noStaticGeneration: true,
};

export default function PortalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[token]" />
      <Stack.Screen name="measure" options={{ presentation: "fullScreenModal" }} />
    </Stack>
  );
}
