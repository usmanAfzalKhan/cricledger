import type { Pip } from "./OverProgress";
import type { InningsState } from "./matchModel";

export function currentOverPips(
  all: Pip[],
  legalBallsInOver: number
): Pip[] {
  if (all.length === 0) return [];

  const out: Pip[] = [];
  let legal = 0;

  for (let i = all.length - 1; i >= 0; i--) {
    const pip = all[i];

    const isLegal =
      pip.t === "run" ||
      pip.t === "wicket" ||
      pip.t === "b" ||
      pip.t === "lb";

    out.push(pip);

    if (isLegal) {
      legal += 1;

      if (legal === legalBallsInOver) {
        break;
      }
    }
  }

  return out.reverse();
}

export function availableCount(
  innings: InningsState
) {
  return innings.batters.filter(
    (batter) => !batter.out
  ).length;
}

export function lessThanTwoAvailable(
  innings: InningsState
) {
  return availableCount(innings) < 2;
}

export function canDeclare(
  innings: InningsState
) {
  return availableCount(innings) >= 3;
}

export function swapStrike(
  innings: InningsState
) {
  const striker = innings.strikerIdx;

  innings.strikerIdx =
    innings.nonStrikerIdx;

  innings.nonStrikerIdx = striker;
}