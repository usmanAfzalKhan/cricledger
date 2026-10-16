import {
  Text,
  View,
} from "react-native";

import { styles as s } from "../quick-match/quickScoringStyles";

export type MatchDelivery = {
  label: string;
  wicket?: boolean;
  extra?: boolean;
};

type Props = {
  deliveries: MatchDelivery[];
};

export default function MatchOverProgress({
  deliveries,
}: Props) {
  return (
    <View style={s.overCard}>
      <Text style={s.sectionTitle}>
        Over Progress
      </Text>

      {deliveries.length === 0 ? (
        <Text style={s.muted}>
          No deliveries yet.
        </Text>
      ) : (
        <View style={s.pipsWrap}>
          {deliveries.map(
            (delivery, index) => (
              <View
                key={
                  delivery.label +
                  "-" +
                  index
                }
                style={[
                  s.pip,

                  delivery.wicket &&
                    s.wicketPip,

                  delivery.extra &&
                    s.extraPip,
                ]}
              >
                <Text style={s.pipText}>
                  {delivery.label}
                </Text>
              </View>
            )
          )}
        </View>
      )}
    </View>
  );
}
