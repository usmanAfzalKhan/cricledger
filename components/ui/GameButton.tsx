import { useRef } from "react";
import {
    Animated,
    Pressable,
    StyleProp,
    StyleSheet,
    Text,
    View,
    ViewStyle,
} from "react-native";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  subtitle?: string;
  icon?: string;
  rightText?: string;

  variant?: Variant;

  onPress: () => void;

  disabled?: boolean;

  style?: StyleProp<ViewStyle>;
};

export default function GameButton({
  title,
  subtitle,
  icon,
  rightText = "›",
  variant = "secondary",
  onPress,
  disabled = false,
  style,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, {
      toValue: 0.97,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }

  function pressOut() {
    Animated.spring(scale, {
      toValue: 1,
      speed: 28,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale }],
        },
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          s.button,

          variant === "primary" && s.primary,

          variant === "secondary" && s.secondary,

          variant === "ghost" && s.ghost,

          variant === "danger" && s.danger,

          disabled && s.disabled,
        ]}
      >
        {icon ? (
          <View
            style={[s.iconWrap, variant === "primary" && s.iconWrapPrimary]}
          >
            <Text style={s.icon}>{icon}</Text>
          </View>
        ) : null}

        <View style={s.textWrap}>
          <Text style={[s.title, variant === "primary" && s.titlePrimary]}>
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={[s.subtitle, variant === "primary" && s.subtitlePrimary]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightText ? (
          <Text style={[s.right, variant === "primary" && s.rightPrimary]}>
            {rightText}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  button: {
    minHeight: 74,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,

    borderRadius: 20,

    borderWidth: 1,
  },

  primary: {
    backgroundColor: "#79D99C",
    borderColor: "rgba(255,255,255,0.18)",
  },

  secondary: {
    backgroundColor: "rgba(5,17,24,0.88)",

    borderColor: "rgba(255,255,255,0.10)",
  },

  ghost: {
    minHeight: 58,

    backgroundColor: "rgba(255,255,255,0.035)",

    borderColor: "rgba(255,255,255,0.07)",
  },

  danger: {
    minHeight: 52,

    backgroundColor: "rgba(223,72,82,0.09)",

    borderColor: "rgba(255,100,110,0.20)",
  },

  disabled: {
    opacity: 0.38,
  },

  iconWrap: {
    width: 46,
    height: 46,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 13,

    backgroundColor: "rgba(255,255,255,0.07)",
  },

  iconWrapPrimary: {
    backgroundColor: "rgba(5,20,25,0.10)",
  },

  icon: {
    fontSize: 21,
  },

  textWrap: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 18,
    fontWeight: "900",
  },

  titlePrimary: {
    color: "#07171D",
  },

  subtitle: {
    color: "rgba(255,255,255,0.45)",

    fontSize: 11,
    fontWeight: "600",

    marginTop: 3,
  },

  subtitlePrimary: {
    color: "rgba(7,23,29,0.62)",
  },

  right: {
    color: "rgba(255,255,255,0.38)",

    fontSize: 29,
    fontWeight: "600",

    marginLeft: 10,
  },

  rightPrimary: {
    color: "rgba(7,23,29,0.60)",
  },
});
