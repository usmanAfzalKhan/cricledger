import MatchOverProgress from "../match-ui/MatchOverProgress";

import type { QuickDelivery } from "./useQuickScoring";

type Props = {
  deliveries: QuickDelivery[];
};

export default function QuickOverProgress({
  deliveries,
}: Props) {
  return (
    <MatchOverProgress
      deliveries={deliveries.map(
        (delivery) => ({
          label: delivery.label,

          wicket:
            !!delivery.wicket,

          extra:
            !delivery.legal,
        })
      )}
    />
  );
}
