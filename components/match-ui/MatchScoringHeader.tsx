import {
  Pressable,
  Text,
  View,
} from "react-native";

import { styles as s } from "../quick-match/quickScoringStyles";

type Props = {
  title: string;
  inningsLabel: string;
  onBack: () => void;
};

export default function MatchScoringHeader({
  title,
  inningsLabel,
  onBack,
}: Props) {
  return (
    <View style={s.header}>
      <Pressable
        style={s.backButton}
        onPress={onBack}
      >
        <Text style={s.backText}>
          ‹ Back
        </Text>
      </Pressable>

      <View style={{ alignItems: "center" }}>
        <Text style={s.headerTitle}>
          {title}
        </Text>

        <Text style={s.inningText}>
          {inningsLabel}
        </Text>
      </View>

      <View style={s.headerSpacer} />
    </View>
  );
}
