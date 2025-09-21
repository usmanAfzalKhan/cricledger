// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import MatchProvider from "../store/MatchContext"; // ⬅️ correct relative path

export default function RootLayout() {
  return (
    <MatchProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MatchProvider>
  );
}
