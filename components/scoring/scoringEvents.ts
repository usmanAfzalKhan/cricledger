import type { InningsState } from "./matchModel";
import { swapStrike } from "./scoringHelpers";

type Announce = (message: string) => void;
type NextBowler = () => void;

export function ensureMilestones(
  innings: InningsState,
  batterIndex: number,
  announce: Announce,
) {
  const batter = innings.batters[batterIndex];
  const key = batter.name;

  const seen = innings.batterMilestonesShown[key] || {};

  if (batter.runs >= 50 && !seen.fifty) {
    innings.batterMilestonesShown[key] = {
      ...seen,
      fifty: true,
    };

    announce(`FIFTY for ${batter.name}`);
  }

  if (batter.runs >= 100 && !seen.hundred) {
    innings.batterMilestonesShown[key] = {
      ...innings.batterMilestonesShown[key],
      hundred: true,
    };

    announce(`CENTURY for ${batter.name}`);
  }
}

export function onLegalBallComplete(
  innings: InningsState,
  wicketByBowler: boolean,
  announce: Announce,
) {
  if (wicketByBowler && innings.bowlerIdx !== null) {
    const sameBowler =
      innings.hatTrickCandidate &&
      innings.hatTrickCandidate.bowlerIdx === innings.bowlerIdx;

    const chain = sameBowler ? innings.hatTrickCandidate!.chain + 1 : 1;

    innings.hatTrickCandidate = {
      bowlerIdx: innings.bowlerIdx,
      chain,
    };

    if (chain === 3) {
      announce("HATTRICK!!!");
    }

    return;
  }

  innings.hatTrickCandidate = null;
}

export function endOver(
  innings: InningsState,
  lastBallOdd: boolean,
  requestNextBowler: NextBowler,
) {
  innings.completedOvers += 1;
  innings.legalBalls = 0;

  if (!lastBallOdd) {
    swapStrike(innings);
  }

  innings.prevBowlerIdx = innings.bowlerIdx;

  innings.bowlerIdx = null;

  requestNextBowler();
}
