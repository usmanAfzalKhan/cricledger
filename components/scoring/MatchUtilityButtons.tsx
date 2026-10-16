import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  onTeamSheets: () => void;
  onGuide: () => void;
};

export default function MatchUtilityButtons({
  onTeamSheets,
  onGuide,
}: Props) {
  return (
    <View style={s.row}>
      <Pressable
        style={s.button}
        onPress={onTeamSheets}
      >
        <Text style={s.icon}>
          📋
        </Text>

        <Text style={s.text}>
          Team Sheets
        </Text>
      </Pressable>

      <Pressable
        style={s.button}
        onPress={onGuide}
      >
        <Text style={s.icon}>
          📖
        </Text>

        <Text style={s.text}>
          Guide
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",

    gap: 9,

    paddingHorizontal: 15,

    marginTop: 3,
  },

  button: {
    flex: 1,

    minHeight: 52,

    borderRadius: 15,

    backgroundColor:
      "rgba(6,17,24,0.90)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 7,
  },

  icon: {
    fontSize: 15,
  },

  text: {
    color: "#FFFFFF",

    fontSize: 12,
    fontWeight: "800",
  },
});
