import { ReactNode, useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

type Props = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
};

export default function AnimatedSection({
  children,
  delay = 0,
  distance = 18,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        delay,
        speed: 18,
        bounciness: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, distance, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [
            {
              translateY,
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
