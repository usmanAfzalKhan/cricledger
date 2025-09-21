import { Stack } from "expo-router";
import React from "react";

export default function MatchLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#0B1220" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#0B1220" },
      }}
    />
  );
}
