import MatchScorePad from "../match-ui/MatchScorePad";
import type { MatchExtraKind } from "../match-ui/MatchScorePad";

export type PadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "NB"
  | "Wd"
  | "B"
  | "LB"
  | "W"
  | "Declare"
  | "Undo";

type Props = {
  onPress: (key: PadKey) => void;
  disabled?: boolean;
};

export function RunPad({
  onPress,
  disabled = false,
}: Props) {
  return (
    <MatchScorePad
      disabled={disabled}
      canUndo={!disabled}
      primaryActionLabel="Declare"
      primaryActionDisabled={
        disabled
      }
      onRun={(run) =>
        onPress(
          String(run) as PadKey
        )
      }
      onWicket={() =>
        onPress("W")
      }
      onExtra={(
        kind: MatchExtraKind
      ) =>
        onPress(kind as PadKey)
      }
      onUndo={() =>
        onPress("Undo")
      }
      onPrimaryAction={() =>
        onPress("Declare")
      }
    />
  );
}
