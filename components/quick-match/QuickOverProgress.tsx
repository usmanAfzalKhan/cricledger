import { Text, View } from "react-native";

import { styles as s } from "./quickScoringStyles";
import { QuickDelivery } from "./useQuickScoring";

type Props = {
  deliveries: QuickDelivery[];
};

export default function QuickOverProgress({
  deliveries,
}: Props) {
  return (
    <View style={s.overCard}>
      <Text style={s.sectionTitle}>Over Progress</Text>

      {deliveries.length === 0 ? (
        <Text style={s.muted}>No deliveries yet.</Text>
      ) : (
        <View style={s.pipsWrap}>
          {deliveries.map((delivery, index) => (
            <View
              key={`${delivery.label}-${index}`}
              style={[
                s.pip,
                delivery.wicket && s.wicketPip,
                !delivery.legal && s.extraPip,
              ]}
            >
              <Text style={s.pipText}>{delivery.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}