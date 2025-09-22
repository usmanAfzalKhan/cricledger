import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings/index" options={{ headerShown: false }} />
      <Stack.Screen name="match/setup" options={{ headerShown: false }} />
      <Stack.Screen name="match/summary" options={{ headerShown: false }} />
    </Stack>
  );
}
