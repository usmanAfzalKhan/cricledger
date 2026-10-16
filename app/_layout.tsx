import "react-native-gesture-handler";

import { Stack } from "expo-router";


import { GestureHandlerRootView } from "react-native-gesture-handler";

import AudioProvider from "../components/audio/AudioProvider";

import { AppAlertHost } from "../components/ui/AppAlert";

import LaunchIntro from "../components/ui/LaunchIntro";

export default function RootLayout() {
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
      }}
    >
      <AudioProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />

          <Stack.Screen name="matches" />

          <Stack.Screen name="match/setup" />

          <Stack.Screen name="match/players" />

          <Stack.Screen name="match/lineups" />

          <Stack.Screen name="match/summary" />
        </Stack>

        <AppAlertHost />

        <LaunchIntro />
      </AudioProvider>
    </GestureHandlerRootView>
  );
}
