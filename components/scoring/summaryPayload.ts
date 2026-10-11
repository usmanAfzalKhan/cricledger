import type { InningsState, MatchState } from "./matchModel";

type SummaryMeta = {
  teamAName: string;
  teamBName: string;
  teamA: string[];
  teamB: string[];
  captainA: string;
  captainB: string;
  teamALogoUri: string;
  teamBLogoUri: string;
};

export function buildSummaryPayload(state: MatchState, info: SummaryMeta) {
  const snap = (innings: InningsState) => ({
    battingTeamName: innings.battingTeamName,
    bowlingTeamName: innings.bowlingTeamName,
    runs: innings.runs,
    wickets: innings.wickets,
    completedOvers: innings.completedOvers,
    legalBalls: innings.legalBalls,
    pips: innings.pips,

    batters: innings.batters.map((batter) => ({
      name: batter.name,
      runs: batter.runs,
      balls: batter.balls,
      out: batter.out,
    })),

    bowlers: innings.bowlers.map((bowler) => ({
      name: bowler.name,
      conceded: bowler.conceded,
      legalBalls: bowler.legalBalls,
    })),
  });

  return {
    oversLimit: state.oversLimit,
    result: state.result ?? "",

    innings: [snap(state.innings[0]), snap(state.innings[1])],

    meta: {
      ...info,
      oversLimit: state.oversLimit,
    },
  };
}
