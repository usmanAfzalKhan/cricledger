import { useMemo, useRef, useState } from "react";

export type ExtraKind = "Wd" | "NB" | "B" | "LB";

export type QuickDelivery = {
  label: string;
  legal: boolean;
  runs: number;
  wicket?: boolean;
  over: number;
};

type ScoreState = {
  runs: number;
  wickets: number;
  legalBalls: number;
  deliveries: QuickDelivery[];
};

const initialScore: ScoreState = {
  runs: 0,
  wickets: 0,
  legalBalls: 0,
  deliveries: [],
};

export function useQuickScoring(maxOvers: number) {
  const [score, setScore] = useState<ScoreState>(initialScore);
  const undoStack = useRef<ScoreState[]>([]);

  const maxBalls = maxOvers * 6;
  const oversComplete = score.legalBalls >= maxBalls;

  function saveUndo() {
    undoStack.current.push({
      ...score,
      deliveries: [...score.deliveries],
    });
  }

  function addRun(run: number) {
    if (oversComplete) return;

    saveUndo();

    const over = Math.floor(score.legalBalls / 6);

    setScore({
      ...score,
      runs: score.runs + run,
      legalBalls: score.legalBalls + 1,
      deliveries: [
        ...score.deliveries,
        {
          label: String(run),
          legal: true,
          runs: run,
          over,
        },
      ],
    });
  }

  function addWicket() {
    if (oversComplete) return;

    saveUndo();

    const over = Math.floor(score.legalBalls / 6);

    setScore({
      ...score,
      wickets: score.wickets + 1,
      legalBalls: score.legalBalls + 1,
      deliveries: [
        ...score.deliveries,
        {
          label: "W",
          legal: true,
          runs: 0,
          wicket: true,
          over,
        },
      ],
    });
  }

  function addExtra(kind: ExtraKind, amount: number) {
    if (oversComplete) return;

    saveUndo();

    const over = Math.floor(score.legalBalls / 6);

    if (kind === "Wd" || kind === "NB") {
      const total = 1 + amount;

      setScore({
        ...score,
        runs: score.runs + total,
        deliveries: [
          ...score.deliveries,
          {
            label: amount === 0 ? kind : `${kind}+${amount}`,
            legal: false,
            runs: total,
            over,
          },
        ],
      });

      return;
    }

    setScore({
      ...score,
      runs: score.runs + amount,
      legalBalls: score.legalBalls + 1,
      deliveries: [
        ...score.deliveries,
        {
          label: `${kind}${amount}`,
          legal: true,
          runs: amount,
          over,
        },
      ],
    });
  }

  function undo() {
    const previous = undoStack.current.pop();

    if (previous) {
      setScore(previous);
    }
  }

  const completedOvers = Math.floor(score.legalBalls / 6);
  const ballsInOver = score.legalBalls % 6;

  const oversText = `${completedOvers}.${ballsInOver}`;

  const runRate =
    score.legalBalls === 0
      ? 0
      : score.runs / (score.legalBalls / 6);

  const currentOver = Math.floor(score.legalBalls / 6);

  const currentOverDeliveries = useMemo(
    () =>
      score.deliveries.filter(
        (delivery) => delivery.over === currentOver
      ),
    [score.deliveries, currentOver]
  );

  return {
    runs: score.runs,
    wickets: score.wickets,
    legalBalls: score.legalBalls,
    oversText,
    runRate,
    currentOverDeliveries,
    oversComplete,
    canUndo: undoStack.current.length > 0,
    addRun,
    addWicket,
    addExtra,
    undo,
  };
}