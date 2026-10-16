import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function GameChoice({ label, selected, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[s.choice, selected && s.selected]}>
      <Text style={[s.text, selected && s.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  choice: {
    flex: 1,

    minHeight: 52,

    alignItems: "center",
    justifyContent: "center",

    borderBottomWidth: 2,

    borderBottomColor: "rgba(255,255,255,0.10)",
  },

  selected: {
    borderBottomColor: "#79D99C",
  },

  text: {
    color: "rgba(255,255,255,0.53)",

    fontSize: 15,
    fontWeight: "800",
  },

  textSelected: {
    color: "#FFFFFF",
  },
});
