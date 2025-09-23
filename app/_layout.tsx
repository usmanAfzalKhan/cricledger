// app/_layout.tsx
import "react-native-gesture-handler"; // ← must be first

import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="match/setup" />
        <Stack.Screen name="match/players" />
        <Stack.Screen name="match/lineups" />
        <Stack.Screen name="match/summary" />
      </Stack>
    </GestureHandlerRootView>
  );
}
