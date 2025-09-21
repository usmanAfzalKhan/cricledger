import React, { createContext, useContext, useMemo, useState } from "react";

type Team = "A" | "B";
type Extra = "WD" | "NB";

export type Setup = {
  teamAName: string;
  teamBName: string;
  overs: number;
  playersA: number;
  playersB: number;
  /** optional player names (you said names are optional) */
  playerNamesA?: string[];
  playerNamesB?: string[];
};

export type InningsState = {
  /** 1 or 2 */
  currentInnings: 1 | 2;
  /** which team is batting in this innings */
  battingTeam: Team;
  runs: number;
  wickets: number;
  /** legal balls bowled in this innings */
  legalBalls: number;
  /** strike indices (1-based within batting team’s squad size) */
  striker: number;
  nonStriker: number;
};

type MatchContextValue = {
  /** null until user finishes setup */
  setup: Setup | null;
  /** null until toss has been done (and innings started) */
  innings: InningsState | null;
  /** computed convenience flags */
  matchStarted: boolean;
  matchOver: boolean;

  /** setup + lifecycle */
  setSetup: (s: Setup) => void;
  setTossAndStart: (winner: Team, chooses: "bat" | "bowl") => void;
  declareInnings: () => void;
  resetAll: () => void;

  /** scoring */
  addBall: (runs: number) => void;          // 0,1,2,3,4,6
  addExtra: (t: Extra) => void;             // WD, NB (+1 run, not a ball)
  wicket: () => void;
};

const MatchContext = createContext<MatchContextValue | undefined>(undefined);

export const useMatch = () => {
  const ctx = useContext(MatchContext);
  if (!ctx) throw new Error("useMatch must be used inside MatchProvider");
  return ctx;
};

function ballsToOverBall(legalBalls: number) {
  const over = Math.floor(legalBalls / 6);
  const ball = legalBalls % 6;
  return { over, ball };
}

export default function MatchProvider({ children }: { children: React.ReactNode }) {
  const [setup, setSetupState] = useState<Setup | null>(null);
  const [innings, setInnings] = useState<InningsState | null>(null);
  const [ended, setEnded] = useState(false);

  const setSetup = (s: Setup) => setSetupState(s);

  const setTossAndStart: MatchContextValue["setTossAndStart"] = (winner, chooses) => {
    if (!setup) return;

    // who bats first
    const battingTeam: Team = chooses === "bat" ? winner : (winner === "A" ? "B" : "A");

    // pick initial strikers within that team’s squad count
    const squad = battingTeam === "A" ? setup.playersA : setup.playersB;
    const striker = 1;
    const nonStriker = Math.min(2, Math.max(1, squad === 1 ? 1 : 2));

    setInnings({
      currentInnings: 1,
      battingTeam,
      runs: 0,
      wickets: 0,
      legalBalls: 0,
      striker,
      nonStriker,
    });
    setEnded(false);
  };

  /** rotate strike at the end of an over */
  const rotateStrikeIfOver = (legalBalls: number, cur: InningsState) => {
    if (legalBalls > 0 && legalBalls % 6 === 0) {
      return { ...cur, striker: cur.nonStriker, nonStriker: cur.striker };
    }
    return cur;
  };

  const addBall: MatchContextValue["addBall"] = (runs) => {
    if (!setup || !innings) return;

    const next = { ...innings };
    next.runs += runs;
    next.legalBalls += 1;

    // odd runs swap strike
    if (runs % 2 === 1) {
      const s = next.striker;
      next.striker = next.nonStriker;
      next.nonStriker = s;
    }

    // over boundary swap
    const rotated = rotateStrikeIfOver(next.legalBalls, next);
    setInnings(rotated);
  };

  const addExtra: MatchContextValue["addExtra"] = (t) => {
    if (!innings) return;
    // extras add a run, do not increment legal ball
    setInnings({ ...innings, runs: innings.runs + 1 });
  };

  const wicket = () => {
    if (!setup || !innings) return;

    const maxWickets = (innings.battingTeam === "A" ? setup.playersA : setup.playersB) - 1;
    const newWkts = Math.min(maxWickets, innings.wickets + 1);

    const next = { ...innings, wickets: newWkts, legalBalls: innings.legalBalls + 1 };

    // next batter in takes strike (simple, no names required)
    const squad = innings.battingTeam === "A" ? setup.playersA : setup.playersB;
    const nextIndex = Math.min(squad, Math.max(next.striker, next.nonStriker) + 1);
    next.striker = nextIndex;

    const rotated = rotateStrikeIfOver(next.legalBalls, next);
    setInnings(rotated);
  };

  const declareInnings = () => {
    if (!setup || !innings) return;

    if (innings.currentInnings === 1) {
      // start 2nd innings — swap batting team
      const other: Team = innings.battingTeam === "A" ? "B" : "A";
      const squad = other === "A" ? setup.playersA : setup.playersB;
      setInnings({
        currentInnings: 2,
        battingTeam: other,
        runs: 0,
        wickets: 0,
        legalBalls: 0,
        striker: 1,
        nonStriker: Math.min(2, squad > 1 ? 2 : 1),
      });
    } else {
      // match over
      setEnded(true);
    }
  };

  const resetAll = () => {
    setSetupState(null);
    setInnings(null);
    setEnded(false);
  };

  const matchStarted = !!setup && !!innings;
  const matchOver = !!setup && !!innings && ended;

  const value = useMemo<MatchContextValue>(
    () => ({
      setup,
      innings,
      matchStarted,
      matchOver,
      setSetup,
      setTossAndStart,
      addBall,
      addExtra,
      wicket,
      declareInnings,
      resetAll,
    }),
    [setup, innings, matchStarted, matchOver]
  );

  return <MatchContext.Provider value={value}>{children}</MatchContext.Provider>;
}
