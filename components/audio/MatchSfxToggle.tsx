import { Ionicons } from "@expo/vector-icons";

import { Pressable, StyleSheet, Text } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCricAudio } from "./AudioProvider";

export default function MatchSfxToggle() {
  const insets = useSafeAreaInsets();

  const { sfxEnabled, toggleSfx } = useCricAudio();

  return (
    <Pressable
      accessibilityLabel={
        sfxEnabled ? "Turn match sounds off" : "Turn match sounds on"
      }
      onPress={toggleSfx}
      style={({ pressed }) => [
        s.button,

        {
          top: insets.top + 51,
        },

        pressed && s.pressed,
      ]}
    >
      <Ionicons
        name={sfxEnabled ? "volume-high-outline" : "volume-mute-outline"}
        size={16}
        color={sfxEnabled ? "#79D99C" : "rgba(255,255,255,0.45)"}
      />

      <Text style={[s.text, sfxEnabled && s.textOn]}>SFX</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  button: {
    position: "absolute",

    right: 12,

    zIndex: 9998,

    elevation: 29,

    height: 35,

    paddingHorizontal: 10,

    borderRadius: 18,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: 5,

    backgroundColor: "rgba(5,17,24,0.94)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.10)",
  },

  pressed: {
    opacity: 0.68,
  },

  text: {
    color: "rgba(255,255,255,0.43)",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  textOn: {
    color: "#79D99C",
  },
});
