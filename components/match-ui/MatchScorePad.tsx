import {
  useState,
} from "react";

import {
  Pressable,
  Text,
  View,
} from "react-native";

import { styles as s } from "../quick-match/quickScoringStyles";

export type MatchExtraKind =
  | "Wd"
  | "NB"
  | "B"
  | "LB";

type Props = {
  disabled?: boolean;

  canUndo: boolean;

  primaryActionLabel: string;

  primaryActionDisabled?: boolean;

  inlineExtraPicker?: boolean;

  onRun: (run: number) => void;

  onWicket: () => void;

  onExtra: (
    kind: MatchExtraKind,
    amount?: number
  ) => void;

  onUndo: () => void;

  onPrimaryAction: () => void;
};

export default function MatchScorePad({
  disabled = false,

  canUndo,

  primaryActionLabel,

  primaryActionDisabled = false,

  inlineExtraPicker = false,

  onRun,
  onWicket,
  onExtra,
  onUndo,
  onPrimaryAction,
}: Props) {
  const [
    pendingExtra,
    setPendingExtra,
  ] =
    useState<MatchExtraKind | null>(
      null
    );

  const runButtons = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
  ];

  const extras: MatchExtraKind[] = [
    "Wd",
    "NB",
    "B",
    "LB",
  ];

  const extraOptions =
    pendingExtra === "Wd" ||
    pendingExtra === "NB"
      ? [0, 1, 2, 3, 4]
      : [1, 2, 3, 4];

  function pressExtra(
    extra: MatchExtraKind
  ) {
    if (inlineExtraPicker) {
      setPendingExtra(extra);
      return;
    }

    onExtra(extra);
  }

  function chooseExtra(amount: number) {
    if (!pendingExtra) {
      return;
    }

    onExtra(
      pendingExtra,
      amount
    );

    setPendingExtra(null);
  }

  return (
    <View style={s.padCard}>
      <Pressable
        disabled={disabled}
        style={[
          s.wicketButton,
          disabled &&
            s.disabledButton,
        ]}
        onPress={onWicket}
      >
        <Text
          style={s.wicketButtonText}
        >
          WICKET
        </Text>
      </Pressable>

      <View style={s.runGrid}>
        {runButtons.map((run) => (
          <Pressable
            key={run}
            disabled={disabled}
            style={[
              s.runButton,
              disabled &&
                s.disabledButton,
            ]}
            onPress={() =>
              onRun(run)
            }
          >
            <Text
              style={s.runButtonText}
            >
              {run}
            </Text>
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

              pendingExtra === extra &&
                s.extraButtonActive,

              disabled &&
                s.disabledButton,
            ]}
            onPress={() =>
              pressExtra(extra)
            }
          >
            <Text
              style={s.extraButtonText}
            >
              {extra}
            </Text>
          </Pressable>
        ))}
      </View>

      {inlineExtraPicker &&
      pendingExtra ? (
        <View style={s.extraPicker}>
          <Text
            style={s.extraPickerTitle}
          >
            {pendingExtra === "Wd" ||
            pendingExtra === "NB"
              ? pendingExtra +
                " + additional runs"
              : pendingExtra +
                " runs"}
          </Text>

          <View
            style={s.extraPickerRow}
          >
            {extraOptions.map(
              (amount) => (
                <Pressable
                  key={amount}
                  style={
                    s.extraAmountButton
                  }
                  onPress={() =>
                    chooseExtra(
                      amount
                    )
                  }
                >
                  <Text
                    style={
                      s.extraAmountText
                    }
                  >
                    {pendingExtra ===
                      "Wd" ||
                    pendingExtra ===
                      "NB"
                      ? "+" + amount
                      : amount}
                  </Text>
                </Pressable>
              )
            )}
          </View>

          <Pressable
            onPress={() =>
              setPendingExtra(null)
            }
            style={s.cancelExtra}
          >
            <Text
              style={
                s.cancelExtraText
              }
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={s.actionRow}>
        <Pressable
          disabled={!canUndo}
          style={[
            s.undoButton,

            !canUndo &&
              s.disabledButton,
          ]}
          onPress={onUndo}
        >
          <Text style={s.actionText}>
            Undo
          </Text>
        </Pressable>

        <Pressable
          disabled={
            primaryActionDisabled
          }
          style={[
            s.endButton,

            primaryActionDisabled &&
              s.disabledButton,
          ]}
          onPress={onPrimaryAction}
        >
          <Text style={s.actionText}>
            {primaryActionLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
