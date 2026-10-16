import { useEffect, useRef, useState } from "react";

import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import LogoMark from "../LogoMark";

export default function LaunchIntro() {
  const [visible, setVisible] = useState(true);

  const overlayOpacity = useRef(new Animated.Value(1)).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;

  const logoScale = useRef(new Animated.Value(0.94)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;

  const textTranslate = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    const intro = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(logoScale, {
          toValue: 1,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 230,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),

        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(420),

      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 260,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    intro.start(({ finished }) => {
      if (finished) {
        setVisible(false);
      }
    });

    return () => {
      intro.stop();
    };
  }, [logoOpacity, logoScale, overlayOpacity, textOpacity, textTranslate]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        StyleSheet.absoluteFill,
        styles.root,
        {
          opacity: overlayOpacity,
        },
      ]}
    >
      <View style={styles.center}>
        <Animated.View
          style={{
            opacity: logoOpacity,

            transform: [
              {
                scale: logoScale,
              },
            ],
          }}
        >
          <LogoMark size={86} />
        </Animated.View>

        <Animated.View
          style={[
            styles.copy,

            {
              opacity: textOpacity,

              transform: [
                {
                  translateY: textTranslate,
                },
              ],
            },
          ]}
        >
          <Text style={styles.name}>CricLedger</Text>

          <View style={styles.accent} />

          <Text style={styles.tagline}>MATCH DAY, SIMPLIFIED</Text>
        </Animated.View>
      </View>

      <Text style={styles.footer}>BY TAHA KHAN</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 20000,

    elevation: 100,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "#071117",
  },

  center: {
    alignItems: "center",

    justifyContent: "center",

    marginTop: -24,
  },

  copy: {
    alignItems: "center",

    marginTop: 18,
  },

  name: {
    color: "#FFFFFF",

    fontSize: 31,

    fontWeight: "900",

    letterSpacing: -0.8,
  },

  accent: {
    width: 25,

    height: 2,

    borderRadius: 2,

    marginTop: 12,

    marginBottom: 11,

    backgroundColor: "#79D99C",
  },

  tagline: {
    color: "rgba(255,255,255,0.45)",

    fontSize: 9,

    fontWeight: "800",

    letterSpacing: 2.1,
  },

  footer: {
    position: "absolute",

    bottom: 37,

    color: "rgba(255,255,255,0.20)",

    fontSize: 8,

    fontWeight: "800",

    letterSpacing: 1.7,
  },
});
