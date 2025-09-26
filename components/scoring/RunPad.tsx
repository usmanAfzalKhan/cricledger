import { Pressable, Text, View } from "react-native";
import { styles as s } from "../../app/styles/scoring";

export type PadKey =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6"
  | "NB" | "Wd" | "B" | "LB" | "W"
  | "Declare" | "Undo";

export function RunPad({ onPress }: { onPress: (k: PadKey) => void }) {
  const primary: PadKey[] = ["0", "1", "2", "3", "4", "5", "6"];
  const extras: PadKey[] = ["NB", "Wd", "B", "LB", "W"];
  const actions: PadKey[] = ["Declare", "Undo"];

  return (
    <View style={s.padCard}>
      <View style={s.padRow}>
        {primary.map((k) => (
          <Pressable key={k} style={s.padBtn} onPress={() => onPress(k)}>
            <Text style={s.padBtnText}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.padRow}>
        {extras.map((k) => (
          <Pressable key={k} style={[s.padBtn, s.btnGhost]} onPress={() => onPress(k)}>
            <Text style={s.padBtnText}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.padRow}>
        {actions.map((k) => (
          <Pressable key={k} style={[s.padBtn, k === "Undo" ? s.btnDanger : s.btn]} onPress={() => onPress(k)}>
            <Text style={s.padBtnText}>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
