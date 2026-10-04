import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { styles as s } from "./quickScoringStyles";
import { ExtraKind } from "./useQuickScoring";

type Props = {
  disabled?: boolean;
  canUndo: boolean;
  endLabel: string;
  onRun: (run: number) => void;
  onWicket: () => void;
  onExtra: (kind: ExtraKind, amount: number) => void;
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
  const [pendingExtra, setPendingExtra] =
    useState<ExtraKind | null>(null);

  const runButtons = [0, 1, 2, 3, 4, 5, 6];
  const extras: ExtraKind[] = ["Wd", "NB", "B", "LB"];

  const extraOptions =
    pendingExtra === "Wd" || pendingExtra === "NB"
      ? [0, 1, 2, 3, 4]
      : [1, 2, 3, 4];

  function chooseExtra(amount: number) {
    if (!pendingExtra) return;

    onExtra(pendingExtra, amount);
    setPendingExtra(null);
  }

  return (
    <View style={s.padCard}>
      <Pressable
        disabled={disabled}
        style={[
          s.wicketButton,
          disabled && s.disabledButton,
        ]}
        onPress={onWicket}
      >
        <Text style={s.wicketButtonText}>WICKET</Text>
      </Pressable>

      <View style={s.runGrid}>
        {runButtons.map((run) => (
          <Pressable
            key={run}
            disabled={disabled}
            style={[
              s.runButton,
              disabled && s.disabledButton,
            ]}
            onPress={() => onRun(run)}
          >
            <Text style={s.runButtonText}>{run}</Text>
          </Pressable>
        ))}
      </View>

      <View style={s.extraRow}>
        {extras.map((extra) => (
          <Pressable
            key={extra}
            disabled={disabled}
            style={[
              s.extraButton,
              pendingExtra === extra && s.extraButtonActive,
              disabled && s.disabledButton,
            ]}
            onPress={() => setPendingExtra(extra)}
          >
            <Text style={s.extraButtonText}>{extra}</Text>
          </Pressable>
        ))}
      </View>

      {pendingExtra ? (
        <View style={s.extraPicker}>
          <Text style={s.extraPickerTitle}>
            {pendingExtra === "Wd" || pendingExtra === "NB"
              ? `${pendingExtra} + additional runs`
              : `${pendingExtra} runs`}
          </Text>

          <View style={s.extraPickerRow}>
            {extraOptions.map((amount) => (
              <Pressable
                key={amount}
                style={s.extraAmountButton}
                onPress={() => chooseExtra(amount)}
              >
                <Text style={s.extraAmountText}>
                  {pendingExtra === "Wd" ||
                  pendingExtra === "NB"
                    ? `+${amount}`
                    : amount}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setPendingExtra(null)}
            style={s.cancelExtra}
          >
            <Text style={s.cancelExtraText}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={s.actionRow}>
        <Pressable
          disabled={!canUndo}
          style={[
            s.undoButton,
            !canUndo && s.disabledButton,
          ]}
          onPress={onUndo}
        >
          <Text style={s.actionText}>Undo</Text>
        </Pressable>

        <Pressable style={s.endButton} onPress={onEnd}>
          <Text style={s.actionText}>{endLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}