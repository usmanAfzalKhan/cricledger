import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;

  step?: string;

  showBack?: boolean;

  onBack?: () => void;
};

export default function GameHeader({
  title,
  subtitle,
  step,
  showBack = false,
  onBack,
}: Props) {
  return (
    <View style={s.wrap}>
      <View style={s.top}>
        {showBack ? (
          <Pressable style={s.back} onPress={onBack}>
            <Text style={s.backText}>‹</Text>
          </Pressable>
        ) : (
          <View style={s.backSpacer} />
        )}

        {step ? <Text style={s.step}>{step}</Text> : <View />}
      </View>

      <Text style={s.title}>{title}</Text>

      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },

  top: {
    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 10,
  },

  back: {
    width: 42,
    height: 42,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(5,17,24,0.72)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },

  backSpacer: {
    width: 42,
  },

  backText: {
    color: "#FFFFFF",

    fontSize: 31,
    lineHeight: 32,

    marginTop: -3,
  },

  step: {
    color: "rgba(255,255,255,0.45)",

    fontSize: 10,
    fontWeight: "900",

    letterSpacing: 1.5,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 32,
    lineHeight: 38,

    fontWeight: "900",

    letterSpacing: -0.8,
  },

  subtitle: {
    color: "rgba(255,255,255,0.53)",

    fontSize: 13,
    lineHeight: 19,

    marginTop: 6,

    maxWidth: 330,
  },
});
