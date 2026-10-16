import MatchScorePad from "../match-ui/MatchScorePad";
import type { MatchExtraKind } from "../match-ui/MatchScorePad";

import type { ExtraKind } from "./useQuickScoring";

type Props = {
  disabled?: boolean;

  canUndo: boolean;

  endLabel: string;

  onRun: (run: number) => void;

  onWicket: () => void;

  onExtra: (
    kind: ExtraKind,
    amount: number
  ) => void;

  onUndo: () => void;

  onEnd: () => void;
};

export default function QuickScorePad({
  disabled = false,

  canUndo,

  endLabel,

  onRun,
  onWicket,
  onExtra,
  onUndo,
  onEnd,
}: Props) {
  return (
    <MatchScorePad
      disabled={disabled}
      canUndo={canUndo}
      primaryActionLabel={
        endLabel
      }
      inlineExtraPicker
      onRun={onRun}
      onWicket={onWicket}
      onExtra={(
        kind: MatchExtraKind,
        amount
      ) =>
        onExtra(
          kind as ExtraKind,
          amount ?? 0
        )
      }
      onUndo={onUndo}
      onPrimaryAction={onEnd}
    />
  );
}
