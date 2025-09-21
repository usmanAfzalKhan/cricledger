import React from "react";
import { Animated, View } from "react-native";
import { THEME } from "../app/styles/home";

type Props = {
  pulse?: Animated.Value;
  size?: number; // ← NEW: control visual size
};

export default function LogoMark({ pulse, size = 44 }: Props) {
  const scale = pulse
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] })
    : 1;
  const opacity = pulse
    ? pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })
    : 1;

  const R = size / 2;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: R,
        backgroundColor: THEME.ACCENT,
        borderWidth: 1,
        borderColor: "#C8D2BE",
        shadowColor: THEME.ACCENT,
        shadowOpacity: 0.6,
        shadowRadius: Math.max(6, size * 0.25),
        transform: [{ scale }],
        opacity,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* cricket ball seam */}
      <View
        style={{
          width: Math.max(2, size * 0.09),
          height: Math.max(14, size * 0.64),
          backgroundColor: "#0B1220",
          borderRadius: 2,
        }}
      />
    </Animated.View>
  );
}
