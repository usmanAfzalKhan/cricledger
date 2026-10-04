import type { Pip } from "./OverProgress";

type StorageLike = {
  setItem(k: string, v: string): Promise<void>;
  getItem(k: string): Promise<string | null>;
};

const Storage: StorageLike = {
  async setItem() {},
  async getItem() {
    return null;
  },
};

export type Dismissal = "Bowled" | "Caught" | "Run-out";

export type TeamID = "A" | "B";

export type Batter = {
  name: string;
  runs: number;
  balls: number;
  out?: {
    how: Dismissal | "Declared";
    by?: string;
    catcher?: string;
    runOutBy?: string;
  };
};

export type Bowler = {
  name: string;
  conceded: number;
  legalBalls: number;
};

export type InningsState = {
  battingTeamName: string;
  bowlingTeamName: string;
  battingSquad: string[];
  bowlingSquad: string[];

  strikerIdx: number | null;
  nonStrikerIdx: number | null;
  bowlerIdx: number | null;
  prevBowlerIdx: number | null;

  runs: number;
  wickets: number;
  legalBalls: number;
  completedOvers: number;

  pips: Pip[];

  batters: Batter[];
  bowlers: Bowler[];

  freeHit: boolean;

  hatTrickCandidate: {
    bowlerIdx: number;
    chain: number;
  } | null;

  batterMilestonesShown: Record<
    string,
    {
      fifty?: boolean;
      hundred?: boolean;
    }
  >;

  showSheets: boolean;
};

export type MatchState = {
  oversLimit: number;

  inningsIndex: 0 | 1;

  innings: [InningsState, InningsState];

  target?: number;
  result?: string;

  matchOver: boolean;

  superOvers: {
    active: boolean;
    index: 0 | 1;
    innings: [InningsState, InningsState];
  } | null;
};

const KEY = "cricledger_match_v1";

export const ovText = (
  completed: number,
  ballsInOver: number
) => `${completed}.${ballsInOver}`;

export const econ = (bowler: Bowler) =>
  bowler.legalBalls === 0
    ? 0
    : bowler.conceded / (bowler.legalBalls / 6);

export const rr = (
  runs: number,
  totalLegalBalls: number
) =>
  totalLegalBalls === 0
    ? 0
    : runs / (totalLegalBalls / 6);

export const toTwo = (n: number) => n.toFixed(2);

export function safeJSON<T>(
  raw: unknown,
  fallback: T
): T {
  if (typeof raw !== "string") {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function toInt(v: unknown, d = 1) {
  const n = Number(v);

  return Number.isFinite(n) && n > 0
    ? Math.floor(n)
    : d;
}

export function newInnings(
  battingTeamName: string,
  bowlingTeamName: string,
  battingSquad: string[],
  bowlingSquad: string[]
): InningsState {
  return {
    battingTeamName,
    bowlingTeamName,
    battingSquad,
    bowlingSquad,

    strikerIdx: null,
    nonStrikerIdx: null,
    bowlerIdx: null,
    prevBowlerIdx: null,

    runs: 0,
    wickets: 0,
    legalBalls: 0,
    completedOvers: 0,

    pips: [],

    batters: battingSquad.map((name) => ({
      name,
      runs: 0,
      balls: 0,
    })),

    bowlers: bowlingSquad.map((name) => ({
      name,
      conceded: 0,
      legalBalls: 0,
    })),

    freeHit: false,
    hatTrickCandidate: null,
    batterMilestonesShown: {},
    showSheets: false,
  };
}

export async function save(state: MatchState) {
  try {
    await Storage.setItem(
      KEY,
      JSON.stringify(state)
    );
  } catch {}
}

export async function load(): Promise<MatchState | null> {
  try {
    const raw = await Storage.getItem(KEY);

    return raw
      ? (JSON.parse(raw) as MatchState)
      : null;
  } catch {
    return null;
  }
}