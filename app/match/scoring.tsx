// app/match/scoring.tsx
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 🔽 static imports fix Metro asset resolution
import bg from "../../assets/bg/stadium.png";
import fourImg from "../../assets/signals/optimized/boundary_four.png";
import byeImg from "../../assets/signals/optimized/bye.png";
import deadBallImg from "../../assets/signals/optimized/dead_ball.png";
import legByeImg from "../../assets/signals/optimized/leg_bye.png";
import noBallImg from "../../assets/signals/optimized/no_ball.png";
import outImg from "../../assets/signals/optimized/out.png";
import sixImg from "../../assets/signals/optimized/six.png";
import wideImg from "../../assets/signals/optimized/wide.png";

import { styles as home, THEME } from "../styles/home";
import { styles as s } from "../styles/scoring";

import { OverProgress, Pip } from "../../components/scoring/OverProgress";
import { PadKey, RunPad } from "../../components/scoring/RunPad";
import { SelectModal } from "../../components/scoring/SelectModal";

/** Static images for guide */
const IMG = {
  noBall: noBallImg,
  wide: wideImg,
  bye: byeImg,
  legBye: legByeImg,
  four: fourImg,
  six: sixImg,
  out: outImg,
  deadBall: deadBallImg,
};

/** AsyncStorage shim (safe if package not installed yet) */
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

type Dismissal = "Bowled" | "Caught" | "Run-out";
type TeamID = "A" | "B";
type Batter = {
  name: string;
  runs: number;
  balls: number;
  out?: { how: Dismissal | "Declared"; by?: string; catcher?: string; runOutBy?: string };
};
type Bowler = { name: string; conceded: number; legalBalls: number };
type InningsState = {
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
  hatTrickCandidate: { bowlerIdx: number; chain: number } | null;
  batterMilestonesShown: Record<string, { fifty?: boolean; hundred?: boolean }>;
  showSheets: boolean;
};
type MatchState = {
  oversLimit: number;
  inningsIndex: 0 | 1;
  innings: [InningsState, InningsState];
  target?: number;
  result?: string;
  matchOver: boolean;
  superOvers: { active: boolean; index: 0 | 1; innings: [InningsState, InningsState] } | null;
};

const KEY = "cricledger_match_v1";
const ovText = (completed: number, ballsInOver: number) => `${completed}.${ballsInOver}`;
const econ = (b: Bowler) => (b.legalBalls === 0 ? 0 : b.conceded / (b.legalBalls / 6));
const rr = (runs: number, totalLegalBalls: number) =>
  totalLegalBalls === 0 ? 0 : runs / (totalLegalBalls / 6);
const toTwo = (n: number) => n.toFixed(2);
function safeJSON<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
const toInt = (v: any, d = 1) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d;
};

function newInnings(
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
    batters: battingSquad.map((name) => ({ name, runs: 0, balls: 0 })),
    bowlers: bowlingSquad.map((name) => ({ name, conceded: 0, legalBalls: 0 })),
    freeHit: false,
    hatTrickCandidate: null,
    batterMilestonesShown: {},
    showSheets: false,
  };
}

async function save(state: MatchState) {
  try {
    await Storage.setItem(KEY, JSON.stringify(state));
  } catch {}
}
async function load(): Promise<MatchState | null> {
  try {
    const raw = await Storage.getItem(KEY);
    return raw ? (JSON.parse(raw) as MatchState) : null;
  } catch {
    return null;
  }
}

/* ============== Themed pill picker with optional Close ============== */
type PickerOpt = { label: string; value: string | number; disabled?: boolean };
function PillPickerModal({
  open,
  title,
  options,
  onClose,
  onSelect,
  requireChoice = false,
}: {
  open: boolean;
  title: string;
  options: PickerOpt[];
  onClose: () => void;
  onSelect: (v: string | number) => void;
  requireChoice?: boolean;
}) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!requireChoice) onClose();
      }}
    >
      <View style={{ flex: 1, backgroundColor: "#000A", padding: 16, justifyContent: "center" }}>
        <View
          style={{
            backgroundColor: "rgba(12,18,24,0.95)",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: THEME.BORDER,
            padding: 14,
            maxHeight: "80%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 16, fontWeight: "900" }}>
              {title}
            </Text>
            {!requireChoice && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: pressed ? "rgba(255,95,95,0.18)" : "rgba(255,255,255,0.06)",
                    borderWidth: 1,
                    borderColor: pressed ? THEME.ACCENT : "rgba(255,255,255,0.18)",
                  },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>✕</Text>
              </Pressable>
            )}
          </View>

          <ScrollView style={{ maxHeight: "70%" }}>
            <View style={{ gap: 10 }}>
              {options.map((o, idx) => (
                <Pressable
                  key={`${o.value}-${idx}`}
                  disabled={o.disabled}
                  onPress={() => onSelect(o.value)}
                  style={({ pressed }) => [
                    {
                      paddingVertical: 12,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: o.disabled
                        ? "rgba(255,255,255,0.04)"
                        : pressed
                        ? THEME.ACCENT
                        : "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: o.disabled
                        ? "rgba(255,255,255,0.12)"
                        : pressed
                        ? THEME.ACCENT
                        : "rgba(255,255,255,0.14)",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: o.disabled ? "rgba(255,255,255,0.45)" : "#fff",
                      fontWeight: "800",
                    }}
                  >
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {!requireChoice && (
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                {
                  marginTop: 12,
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: pressed
                    ? "rgba(255,255,255,0.16)"
                    : "rgba(255,255,255,0.09)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.16)",
                },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>Close</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function Scoring() {
  // params
  const p = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamA?: string;
    teamB?: string;
    /** 🔹 carry captains & logos through so Summary can restart with same squads */
    captainA?: string;
    captainB?: string;
    teamALogoUri?: string;
    teamBLogoUri?: string;

    tossWinner?: "A" | "B";
    decision?: "Bat" | "Bowl";
    overs?: string;
  }>();
  const teamAName = (p.teamAName && String(p.teamAName).trim()) || "Team A";
  const teamBName = (p.teamBName && String(p.teamBName).trim()) || "Team B";
  const teamA = safeJSON<string[]>(p.teamA, []);
  const teamB = safeJSON<string[]>(p.teamB, []);
  const tossWinner = p.tossWinner === "A" || p.tossWinner === "B" ? p.tossWinner : "A";
  const decision = p.decision === "Bat" || p.decision === "Bowl" ? p.decision : "Bat";
  const oversLimit = toInt(p.overs, 1);
  const ballsPerOver = 6;

  const captainA = typeof p.captainA === "string" ? p.captainA : "";
  const captainB = typeof p.captainB === "string" ? p.captainB : "";
  const teamALogoUri = typeof p.teamALogoUri === "string" ? p.teamALogoUri : "";
  const teamBLogoUri = typeof p.teamBLogoUri === "string" ? p.teamBLogoUri : "";

  const battingFirst: TeamID =
    (tossWinner === "A" && decision === "Bat") ||
    (tossWinner === "B" && decision === "Bowl")
      ? "A"
      : "B";

  const firstBatName = battingFirst === "A" ? teamAName : teamBName;
  const firstBowlName = battingFirst === "A" ? teamBName : teamAName;
  const firstBat = battingFirst === "A" ? teamA : teamB;
  const firstBowl = battingFirst === "A" ? teamB : teamA;

  const secondBatName = battingFirst === "A" ? teamBName : teamAName;
  const secondBowlName = battingFirst === "A" ? teamAName : teamBName;
  const secondBat = battingFirst === "A" ? teamB : teamA;
  const secondBowl = battingFirst === "A" ? teamA : teamB;

  const [state, setState] = useState<MatchState>(() => ({
    oversLimit,
    inningsIndex: 0,
    innings: [
      newInnings(firstBatName, firstBowlName, firstBat, firstBowl),
      newInnings(secondBatName, secondBowlName, secondBat, secondBowl),
    ],
    target: undefined,
    result: undefined,
    matchOver: false,
    superOvers: null,
  }));
  const inn = state.innings[state.inningsIndex];

  // side-effect runner for match-end transitions
  const afterRef = useRef<null | (() => void)>(null);

  // toast + strip pulse
  const [toast, setToast] = useState<string>("");
  const toastAnim = useRef(new Animated.Value(0)).current;
  const stripAck = useRef(new Animated.Value(0)).current;
  const flash = (msg: string) => {
    setToast(msg);
    toastAnim.stopAnimation();
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();
  };
  const ackStrip = () => {
    stripAck.stopAnimation();
    stripAck.setValue(0);
    Animated.sequence([
      Animated.timing(stripAck, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(stripAck, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  // 🔔 FREE HIT pulse
  const freeHitPulse = useRef(new Animated.Value(0)).current;
  const freeHitLoop = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    if (inn.freeHit) {
      freeHitPulse.setValue(0.2);
      freeHitLoop.current?.stop();
      freeHitLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(freeHitPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(freeHitPulse, { toValue: 0.2, duration: 500, useNativeDriver: true }),
        ])
      );
      freeHitLoop.current.start();
    } else {
      freeHitLoop.current?.stop();
      freeHitLoop.current = null;
      Animated.timing(freeHitPulse, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    }
  }, [inn.freeHit]);

  useEffect(() => {
    (async () => {
      const restored = await load();
      if (restored) setState(restored);
    })();
  }, []);
  useEffect(() => {
    save(state);
  }, [state]);

  // === innings switch notifier (ensures toast happens immediately when switching to 2nd innings)
  const prevInningsIndexRef = useRef(state.inningsIndex);
  useEffect(() => {
    if (prevInningsIndexRef.current === 0 && state.inningsIndex === 1) {
      const first = state.innings[0];
      setOpenBowler(false);
      _setOpenStriker(true);
      _setOpenNon(true);
      flash(
        `End of ${first.battingTeamName} innings — ${first.runs}/${first.wickets}. Target ${
          first.runs + 1
        }`
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    prevInningsIndexRef.current = state.inningsIndex;
  }, [state.inningsIndex, state.innings]);

  const striker = inn.strikerIdx !== null ? inn.batters[inn.strikerIdx] : null;
  const nonStriker = inn.nonStrikerIdx !== null ? inn.batters[inn.nonStrikerIdx] : null;
  const bowler = inn.bowlerIdx !== null ? inn.bowlers[inn.bowlerIdx] : null;
  const totalLegal = inn.completedOvers * ballsPerOver + inn.legalBalls;
  const currRR = rr(inn.runs, totalLegal);

  // ===== derive current over pips (shows only ongoing over) =====
  function currentOverPips(all: Pip[], legalBallsInOver: number): Pip[] {
    if (all.length === 0) return [];
    const out: Pip[] = [];
    let legal = 0;
    for (let i = all.length - 1; i >= 0; i--) {
      const p = all[i];
      const isLegal = p.t === "run" || p.t === "wicket" || p.t === "b" || p.t === "lb";
      out.push(p);
      if (isLegal) {
        legal += 1;
        if (legal === legalBallsInOver) break;
      }
    }
    return out.reverse();
  }
  const pipsForThisOver = currentOverPips(inn.pips, inn.legalBalls);

  // UI state
  const [openStriker, _setOpenStriker] = useState(false);
  const [openNon, _setOpenNon] = useState(false);
  const [openBowler, setOpenBowler] = useState(false);
  // Guide modal toggle
  const [showGuide, setShowGuide] = useState(false);

  // Gate striker/non openers while bowler modal is open
  const setOpenStriker = (v: boolean) => {
    if (openBowler && v)
      return Alert.alert("Pick bowler first", "Select the bowler for the next over.");
    _setOpenStriker(v);
  };
  const setOpenNon = (v: boolean) => {
    if (openBowler && v)
      return Alert.alert("Pick bowler first", "Select the bowler for the next over.");
    _setOpenNon(v);
  };

  const [openPlusPicker, setOpenPlusPicker] =
    useState<null | { kind: "NB" | "Wd" | "B" | "LB" }>(null);

  // Wicket flow
  const [openWicket, setOpenWicket] = useState(false);
  const [openWhoOut, setOpenWhoOut] = useState<null | "striker" | "nonStriker">(null);
  const [openDismissal, setOpenDismissal] = useState(false);
  const [openCatchFielder, setOpenCatchFielder] = useState(false);
  const [openRunOutFielder, setOpenRunOutFielder] = useState(false);

  // Incoming batter (mandatory) + remember who left
  const [incomingBatterOpen, setIncomingBatterOpen] = useState(false);
  const lastOutRef = useRef<null | "striker" | "nonStriker">(null);

  // Declarations: track which outgoing was declared
  const declareRef = useRef<null | "striker" | "nonStriker">(null);

  // Undo stack
  function pushUndo() {
    undoRef.current.push(JSON.stringify(state));
  }
  const undoRef = useRef<string[]>([]);
  function onUndo() {
    const snap = undoRef.current.pop();
    if (!snap) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setState(JSON.parse(snap) as MatchState);
  }

  function setInnCore(up: (i: InningsState) => void) {
    setState((prev) => {
      const next: MatchState = {
        ...prev,
        innings: [...prev.innings] as [InningsState, InningsState],
      };
      const idx = next.inningsIndex;
      const clone = JSON.parse(JSON.stringify(next.innings[idx])) as InningsState;
      up(clone);
      next.innings[idx] = clone;
      return next;
    });
  }

  // ===== availability helpers =====
  const availableCount = (i: InningsState) => i.batters.filter((b) => !b.out).length; // NOT OUT only
  const lessThanTwoAvailable = (i: InningsState) => availableCount(i) < 2;
  const canDeclare = (i: InningsState) => availableCount(i) >= 3; // must leave at least 2 after declaring one

  // Unified: mutate innings and apply transitions atomically
  function setInnWithTransitions(up: (i: InningsState) => void) {
    setState((prev) => {
      const next: MatchState = {
        ...prev,
        innings: [...prev.innings] as [InningsState, InningsState],
      };
      const idx = next.inningsIndex;
      const i = JSON.parse(JSON.stringify(next.innings[idx])) as InningsState;

      // Apply the scoring mutation
      up(i);

      // ---- TRANSITIONS ----
      const oversDone = i.completedOvers >= next.oversLimit && i.legalBalls === 0;

      if (idx === 0) {
        if (oversDone || i.wickets >= i.battingSquad.length - 1 || lessThanTwoAvailable(i)) {
          next.innings[idx] = i;
          next.inningsIndex = 1 as 0 | 1;
          next.target = i.runs + 1;
          // do NOT toast here; use useEffect on inningsIndex to toast immediately after commit
          return next;
        }
      } else {
        const chased = next.target != null && i.runs >= next.target;
        const inningsEnded =
          oversDone || i.wickets >= i.battingSquad.length - 1 || lessThanTwoAvailable(i);

        if (chased || inningsEnded) {
          // 🔹 TIE FIX: if innings ended without chase and the chasing team finished exactly on target-1 -> tie
          let result: string;
          if (!chased && next.target != null && next.target - i.runs === 1) {
            result = "Match tied";
          } else if (chased) {
            const wktsRemaining = i.battingSquad.length - 1 - i.wickets;
            result = `${i.battingTeamName} won by ${wktsRemaining} wicket${wktsRemaining === 1 ? "" : "s"}`;
          } else {
            // defending side win
            const need = next.target == null ? 0 : next.target - i.runs;
            const margin = Math.max(1, need - 1); // safety guard (non-zero)
            result = `${i.bowlingTeamName} won by ${margin} run${margin === 1 ? "" : "s"}`;
          }

          next.matchOver = true;
          next.result = result;
          next.innings[idx] = i;

          afterRef.current = () => {
            setOpenBowler(false);
            flash(chased ? "Target chased!" : "Innings complete");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          };
          return next;
        }
      }

      // No transition; just commit the innings
      next.innings[idx] = i;
      return next;
    });

    // run side effect (if any) after state update
    const fn = afterRef.current;
    afterRef.current = null;
    if (fn) fn();
  }

  function swapStrike(i: InningsState) {
    const a = i.strikerIdx;
    i.strikerIdx = i.nonStrikerIdx;
    i.nonStrikerIdx = a;
  }
  function ensureMilestones(i: InningsState, idx: number) {
    const b = i.batters[idx];
    const key = b.name;
    const seen = i.batterMilestonesShown[key] || {};
    if (b.runs >= 50 && !seen.fifty) {
      i.batterMilestonesShown[key] = { ...seen, fifty: true };
      flash(`FIFTY for ${b.name}`);
    }
    if (b.runs >= 100 && !seen.hundred) {
      i.batterMilestonesShown[key] = { ...seen, hundred: true };
      flash(`CENTURY for ${b.name}`);
    }
  }
  function onLegalBallComplete(i: InningsState, wicketByBowler: boolean) {
    if (wicketByBowler && i.bowlerIdx !== null) {
      const same = i.hatTrickCandidate && i.hatTrickCandidate.bowlerIdx === i.bowlerIdx;
      const chain = same ? i.hatTrickCandidate!.chain + 1 : 1;
      i.hatTrickCandidate = { bowlerIdx: i.bowlerIdx, chain };
      if (chain === 3) flash("HATTRICK!!!");
    } else {
      i.hatTrickCandidate = null;
    }
  }

  function endOver(i: InningsState, lastBallOdd: boolean) {
    i.completedOvers += 1;
    i.legalBalls = 0;
    if (!lastBallOdd) {
      swapStrike(i);
    }
    i.prevBowlerIdx = i.bowlerIdx;
    i.bowlerIdx = null;
    setOpenBowler(true); // bowler for NEXT over (closed if innings ends)
  }

  const needSetup =
    inn.strikerIdx === null || inn.nonStrikerIdx === null || inn.bowlerIdx === null;

  // ======= Scoring actions (blocked when waiting for incoming or matchOver) =======
  function guardInputs(): boolean {
    if (state.matchOver) {
      Alert.alert("Match finished", "Tap End Match to view summary, or Undo to revise.");
      return false;
    }
    if (incomingBatterOpen) {
      Alert.alert("Select incoming batter", "Choose the next batter to continue.");
      return false;
    }
    if (needSetup) {
      Alert.alert("Pick players", "Select striker, non-striker, and bowler first.");
      return false;
    }
    return true;
  }

  function addRun(n: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    if (!guardInputs()) return;
    pushUndo();
    Haptics.impactAsync(
      n === 6
        ? Haptics.ImpactFeedbackStyle.Heavy
        : n === 4
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light
    );
    ackStrip();
    setInnWithTransitions((i) => {
      i.pips.push({ t: "run", v: n });
      if (i.strikerIdx !== null) {
        i.batters[i.strikerIdx].runs += n;
        i.batters[i.strikerIdx].balls += 1;
        ensureMilestones(i, i.strikerIdx);
      }
      if (i.bowlerIdx !== null) {
        i.bowlers[i.bowlerIdx].conceded += n;
        i.bowlers[i.bowlerIdx].legalBalls += 1;
      }
      i.runs += n;
      i.legalBalls += 1;

      const isOverEnd = i.legalBalls === 6;
      if (isOverEnd) {
        endOver(i, n % 2 === 1);
      } else if (n % 2 === 1) {
        swapStrike(i);
      }

      onLegalBallComplete(i, false);
      i.freeHit = false;
    });
  }

  function addExtras(kind: "NB" | "Wd" | "B" | "LB", plus: number) {
    if (!guardInputs()) return;
    pushUndo();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    ackStrip();
    setInnWithTransitions((i) => {
      if (kind === "NB") {
        const total = 1 + plus;
        i.pips.push({ t: "nb", v: total });
        i.runs += total;
        if (i.bowlerIdx !== null) i.bowlers[i.bowlerIdx].conceded += total;
        i.freeHit = true;
      } else if (kind === "Wd") {
        const total = 1 + plus;
        i.pips.push({ t: "wd", v: total });
        i.runs += total;
        if (i.bowlerIdx !== null) i.bowlers[i.bowlerIdx].conceded += total;
      } else {
        const v = Math.max(1, Math.min(6, plus)) as 1 | 2 | 3 | 4 | 5 | 6;
        if (kind === "B") i.pips.push({ t: "b", v });
        else i.pips.push({ t: "lb", v });
        i.runs += v;
        if (i.bowlerIdx !== null) {
          i.bowlers[i.bowlerIdx].conceded += v;
          i.bowlers[i.bowlerIdx].legalBalls += 1;
        }
        i.legalBalls += 1;

        const isOverEnd = i.legalBalls === 6;
        if (isOverEnd) {
          endOver(i, v % 2 === 1);
        } else if (v % 2 === 1) {
          swapStrike(i);
        }

        onLegalBallComplete(i, false);
        i.freeHit = false;
      }
    });
  }

  function takeWicket(how: Dismissal, who: "striker" | "nonStriker", fielder?: string) {
    if (!guardInputs()) return;
    pushUndo();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    ackStrip();

    setInnWithTransitions((i) => {
      const outIdx = who === "striker" ? i.strikerIdx : i.nonStrikerIdx;
      if (outIdx === null) return;

      // Record wicket ball
      i.legalBalls += 1;
      if (i.bowlerIdx !== null) i.bowlers[i.bowlerIdx].legalBalls += 1;
      i.pips.push({ t: "wicket", how });

      // Update batter out (respect free hit)
      const b = i.batters[outIdx];
      b.balls += 1;
      b.out = {
        how,
        by: i.bowlerIdx !== null ? i.bowlers[i.bowlerIdx].name : undefined,
      };
      if (how === "Caught" && fielder) b.out.catcher = fielder;
      if (how === "Run-out" && fielder) b.out.runOutBy = fielder;

      let wicketCounts = true;
      if (i.freeHit && how !== "Run-out") {
        b.out = undefined;
        wicketCounts = false;
      }

      if (wicketCounts) i.wickets += 1;

      const bowlerWicket = wicketCounts && (how === "Bowled" || how === "Caught");
      onLegalBallComplete(i, !!bowlerWicket);

      // Determine over end and all-out NOW
      const isOverEnd = i.legalBalls === 6;
      const isAllOutNow =
        availableCount(i) < 2 || i.wickets >= i.battingSquad.length - 1;

      // Remember who went out (for replacement if needed)
      lastOutRef.current = wicketCounts ? who : null;

      if (isAllOutNow) {
        // If over finished on the wicket, quietly close the over without strike swap / picker
        if (isOverEnd) {
          i.completedOvers += 1;
          i.legalBalls = 0;
          i.prevBowlerIdx = i.bowlerIdx;
          i.bowlerIdx = null;
        }
        // No incoming batter on all-out
      } else {
        // Not all-out — must select incoming batter immediately
        setIncomingBatterOpen(true);
        if (isOverEnd) endOver(i, false);
      }

      i.freeHit = false;
    });
  }

  function onPad(k: PadKey) {
    if (state.matchOver || incomingBatterOpen) {
      return guardInputs();
    }
    if (needSetup) {
      Alert.alert("Pick players", "Select striker, non-striker, and bowler first.");
      return;
    }
    switch (k) {
      case "0":
        return addRun(0);
      case "1":
        return addRun(1);
      case "2":
        return addRun(2);
      case "3":
        return addRun(3);
      case "4":
        return addRun(4);
      case "5":
        return addRun(5);
      case "6":
        return addRun(6);
      case "NB":
        return setOpenPlusPicker({ kind: "NB" });
      case "Wd":
        return setOpenPlusPicker({ kind: "Wd" });
      case "B":
        return setOpenPlusPicker({ kind: "B" });
      case "LB":
        return setOpenPlusPicker({ kind: "LB" });
      case "W": {
        if (!striker || !nonStriker) return;
        setOpenWhoOut(null);
        setOpenWicket(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      }
      case "Declare": {
        if (!canDeclare(inn)) {
          Alert.alert("Cannot declare", "You must have at least two eligible batters remaining.");
          return;
        }
        declareRef.current = null;
        const choose = (w: "striker" | "nonStriker") => {
          declareRef.current = w;
          setIncomingBatterOpen(true);
        };
        const options = [
          { text: `Replace ${striker?.name} (striker)`, onPress: () => choose("striker") },
          { text: `Replace ${nonStriker?.name} (non-striker)`, onPress: () => choose("nonStriker") },
          { text: "Cancel", style: "cancel" as const },
        ];
        Alert.alert("Declare (retired not out)", "Choose which batter to replace.", options);
        return;
      }
      case "Undo":
        return onUndo();
    }
  }

  // ===== helper text for 2nd innings =====
  const needText = (() => {
    if (state.inningsIndex !== 1 || state.target == null) return null;
    const ballsBowled = inn.completedOvers * ballsPerOver + inn.legalBalls;
    const ballsLeft = state.oversLimit * ballsPerOver - ballsBowled;
    const need = Math.max(0, state.target - inn.runs);
    return `Need ${need} from ${ballsLeft} balls`;
  })();

  // render strip pulse
  const stripStyle = {
    transform: [{ scale: stripAck.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }],
  };

  // --- build summary payload for summary screen
  function buildSummaryPayload(state: MatchState) {
    const snap = (i: InningsState) => ({
      battingTeamName: i.battingTeamName,
      bowlingTeamName: i.bowlingTeamName,
      runs: i.runs,
      wickets: i.wickets,
      completedOvers: i.completedOvers,
      legalBalls: i.legalBalls,
      pips: i.pips,
      batters: i.batters.map(b => ({ name: b.name, runs: b.runs, balls: b.balls, out: b.out })),
      bowlers: i.bowlers.map(b => ({ name: b.name, conceded: b.conceded, legalBalls: b.legalBalls })),
    });

    // 🔹 Add meta so Summary can restart with identical squads/logos without asking again
    const meta = {
      teamAName,
      teamBName,
      teamA,
      teamB,
      captainA,
      captainB,
      oversLimit: state.oversLimit,
      teamALogoUri,
      teamBLogoUri,
    };

    return {
      oversLimit: state.oversLimit,
      result: state.result ?? "",
      innings: [snap(state.innings[0]), snap(state.innings[1])],
      // @ts-ignore — allow meta bag for downstream use
      meta,
    };
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E11" }}>
      <ImageBackground source={bg} style={{ flex: 1 }} resizeMode="cover">
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
          {/* Heading */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ color: THEME.TEXT, fontSize: 18, fontWeight: "900", letterSpacing: 0.3 }}>
              Scoring
            </Text>
            <Text style={{ color: THEME.TEXT_MUTED, marginTop: 2, fontSize: 12 }}>
              Select openers & bowler, then score.
            </Text>
          </View>

          {state.matchOver && (
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <View
                style={{
                  padding: 14,
                  backgroundColor: "rgba(30,38,49,0.9)",
                  borderWidth: 1,
                  borderColor: THEME.BORDER,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: "#FFEB99", fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
                  {state.result ?? "Match over"}
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Pressable
                    onPress={() => {
                      const payload = buildSummaryPayload(state);
                      router.push({
                        pathname: "/match/summary",
                        params: {
                          teamAName,
                          teamBName,
                          overs: String(state.oversLimit),
                          result: state.result ?? "",
                          // names that summary.tsx expects:
                          aRuns: String(state.innings[0].runs),
                          aWkts: String(state.innings[0].wickets),
                          bRuns: String(state.innings[1].runs),
                          bWkts: String(state.innings[1].wickets),
                          // 🔹 carry logos through if available
                          ...(teamALogoUri ? { teamALogoUri } : {}),
                          ...(teamBLogoUri ? { teamBLogoUri } : {}),
                          summary: JSON.stringify(payload),
                        },
                      });
                    }}
                    style={[s.padBtn, { backgroundColor: THEME.ACCENT, borderColor: THEME.ACCENT, flex: 1 }]}
                  >
                    <Text style={[s.padBtnText, { color: "#0B0F14" }]}>End Match → Summary</Text>
                  </Pressable>

                  <Pressable onPress={onUndo} style={[s.padBtn, s.btnDanger, { flex: 1 }]}>
                    <Text style={s.padBtnText}>Undo last ball</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          {needSetup ? (
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <View
                style={{
                  padding: 14,
                  backgroundColor: "rgba(12,18,24,0.65)",
                  borderWidth: 1,
                  borderColor: THEME.BORDER,
                  borderRadius: 16,
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 16, fontWeight: "800", marginBottom: 10 }}>
                  Select openers & bowler
                </Text>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 12, marginBottom: 6 }}>Striker</Text>
                <Pressable onPress={() => setOpenStriker(true)} style={pillFieldStyle}>
                  <Text style={pillFieldTextStyle}>
                    {inn.strikerIdx === null ? "Select Striker" : inn.batters[inn.strikerIdx].name}
                  </Text>
                </Pressable>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 12, marginBottom: 6, marginTop: 10 }}>
                  Non-striker
                </Text>
                <Pressable onPress={() => setOpenNon(true)} style={pillFieldStyle}>
                  <Text style={pillFieldTextStyle}>
                    {inn.nonStrikerIdx === null ? "Select Non-striker" : inn.batters[inn.nonStrikerIdx].name}
                  </Text>
                </Pressable>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Bowler</Text>
                <Pressable onPress={() => setOpenBowler(true)} style={pillFieldStyle}>
                  <Text style={pillFieldTextStyle}>
                    {inn.bowlerIdx === null ? "Select Bowler" : inn.bowlers[inn.bowlerIdx].name}
                  </Text>
                </Pressable>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 11, marginTop: 10 }}>
                  Batting: {inn.battingTeamName}   •   Bowling: {inn.bowlingTeamName}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* TV strip */}
              <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                <Animated.View
                  style={[
                    {
                      padding: 14,
                      backgroundColor: "rgba(12,18,24,0.65)",
                      borderWidth: 1,
                      borderColor: THEME.BORDER,
                      borderRadius: 16,
                    },
                    stripStyle,
                  ]}
                >
                  <View style={s.stripRow}>
                    <Text style={s.stripLine}>
                      {inn.battingTeamName} {inn.runs}/{inn.wickets} <Text style={s.sep}>|</Text>{" "}
                      <Text style={[s.name, { color: THEME.ACCENT }]}>
                        🏏 {striker?.name} {typeof striker?.runs === "number" ? `${striker?.runs}*` : ""}
                      </Text>{" "}
                      <Text style={s.sep}>  </Text>
                      <Text style={s.name}>
                        {nonStriker?.name} {typeof nonStriker?.runs === "number" ? `${nonStriker?.runs}` : ""}
                      </Text>{" "}
                      <Text style={s.sep}>|</Text>{" "}
                      <Text style={[s.name, { color: "#ff6666" }]}>
                        🔴 {bowler?.name} {ovText(inn.completedOvers, inn.legalBalls)}
                      </Text>{" "}
                      <Text style={s.sep}>|</Text>{" "}
                      <Text style={[s.name, { color: THEME.TEXT_MUTED }]}>
                        Inns {ovText(inn.completedOvers, inn.legalBalls)}/{state.oversLimit}
                      </Text>
                    </Text>
                  </View>
                  <Text style={[s.stripSub, { marginTop: 6 }]}>Run Rate: {toTwo(currRR)}</Text>
                  {needText ? <Text style={[s.stripSub, { marginTop: 4 }]}>{needText}</Text> : null}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    {!!inn.hatTrickCandidate && inn.hatTrickCandidate.chain === 2 && (
                      <View style={s.chip}>
                        <Text style={s.chipText}>HATTRICK BALL</Text>
                      </View>
                    )}
                    {inn.freeHit && (
                      <Animated.View
                        style={[
                          s.chip,
                          {
                            backgroundColor: "rgba(0, 230, 118, 0.12)",
                            borderColor: "#00E676",
                            opacity: freeHitPulse,
                          },
                        ]}
                      >
                        <Text style={[s.chipText, { color: "#00E676", fontWeight: "900" }]}>FREE HIT</Text>
                      </Animated.View>
                    )}
                  </View>
                </Animated.View>
              </View>

              {/* Over progress = this over only */}
              <OverProgress pips={pipsForThisOver} />

              {/* Big WICKET button + RunPad */}
              <View style={{ paddingHorizontal: 16 }}>
                <Pressable
                  disabled={state.matchOver || incomingBatterOpen || needSetup}
                  onPress={() => onPad("W")}
                  style={[
                    s.padBtn,
                    s.btnDanger,
                    { marginBottom: 6, paddingVertical: 18, opacity: state.matchOver || incomingBatterOpen || needSetup ? 0.6 : 1 },
                  ]}
                >
                  <Text style={[s.padBtnText, { fontWeight: "900" }]}>WICKET</Text>
                </Pressable>
              </View>

              <RunPad onPress={onPad} disabled={state.matchOver || incomingBatterOpen || needSetup} />

              <View style={{ paddingHorizontal: 16 }}>
                <Pressable style={[s.padBtn, s.btnGhost]} onPress={() => setInnCore((i) => { i.showSheets = true; })}>
                  <Text style={s.padBtnText}>Team Sheets</Text>
                </Pressable>

                {/* Guide button */}
                <Pressable
                  style={[s.padBtn, s.btnGhost, { marginTop: 8 }]}
                  onPress={() => setShowGuide(true)}
                >
                  <Text style={s.padBtnText}>Guide</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>

        {/* Toast */}
        <Animated.View
          pointerEvents="none"
          style={[
            s.toast,
            {
              opacity: toastAnim,
              transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }],
            },
          ]}
        >
          <Text style={s.toastText}>{toast}</Text>
        </Animated.View>

        {/* Pickers (Striker/Non/Bowler) */}
        <PillPickerModal
          open={openStriker}
          title="Select Striker"
          options={inn.batters.map((b, idx) => ({
            label: b.name,
            value: idx,
            disabled: inn.nonStrikerIdx === idx || !!b.out,
          }))}
          onClose={() => _setOpenStriker(false)}
          onSelect={(v) => {
            _setOpenStriker(false);
            setInnCore((i) => {
              i.strikerIdx = Number(v);
            });
          }}
        />
        <PillPickerModal
          open={openNon}
          title="Select Non-striker"
          options={inn.batters.map((b, idx) => ({
            label: b.name,
            value: idx,
            disabled: inn.strikerIdx === idx || !!b.out,
          }))}
          onClose={() => _setOpenNon(false)}
          onSelect={(v) => {
            _setOpenNon(false);
            setInnCore((i) => {
              i.nonStrikerIdx = Number(v);
            });
          }}
        />
        <PillPickerModal
          open={openBowler}
          title="Select Bowler"
          options={inn.bowlers.map((b, idx) => ({
            label: b.name + (inn.prevBowlerIdx === idx ? " (bowled last over)" : ""),
            value: idx,
            disabled: inn.prevBowlerIdx === idx,
          }))}
          onClose={() => setOpenBowler(false)}
          onSelect={(v) => {
            setOpenBowler(false);
            setInnCore((i) => {
              i.bowlerIdx = Number(v);
            });
          }}
        />

        {/* Extras */}
        <PillPickerModal
          open={!!openPlusPicker}
          title={
            openPlusPicker?.kind === "NB" || openPlusPicker?.kind === "Wd"
              ? `${openPlusPicker?.kind} + (overthrows)`
              : `${openPlusPicker?.kind} (1–6)`
          }
          options={
            openPlusPicker?.kind === "NB" || openPlusPicker?.kind === "Wd"
              ? Array.from({ length: 7 }).map((_, n) => ({ label: `+${n}`, value: n }))
              : Array.from({ length: 6 }).map((_, i) => ({ label: `+${i + 1}`, value: i + 1 }))
          }
          onClose={() => setOpenPlusPicker(null)}
          onSelect={(v) => {
            if (!openPlusPicker) return;
            const plus = Number(v);
            const k = openPlusPicker.kind;
            setOpenPlusPicker(null);
            addExtras(k, plus);
          }}
        />

        {/* Who is out? — mandatory */}
        <SelectModal
          open={openWicket}
          title="Who is out?"
          options={[
            { label: `Striker (${striker?.name ?? "-"})`, value: "striker" },
            { label: `Non-striker (${nonStriker?.name ?? "-"})`, value: "nonStriker" },
          ]}
          onClose={() => {}}
          onSelect={(v: string | number) => {
            setOpenWicket(false);
            setOpenWhoOut(v as "striker" | "nonStriker");
            setOpenDismissal(true);
          }}
          requireChoice
        />

        {/* Dismissal type — mandatory */}
        <SelectModal
          open={openDismissal}
          title="Dismissal type"
          options={[
            { label: "Bowled", value: "Bowled" },
            { label: "Caught", value: "Caught" },
            { label: "Run-out", value: "Run-out" },
          ]}
          onClose={() => {}}
          onSelect={(v) => {
            const how = String(v) as Dismissal;
            setOpenDismissal(false);
            if (how === "Caught") {
              setOpenCatchFielder(true);
            } else if (how === "Run-out") {
              setOpenRunOutFielder(true);
            } else {
              confirmDismissal("Bowled");
            }
          }}
          requireChoice
        />

        {/* Fielders — mandatory */}
        <SelectModal
          open={openCatchFielder}
          title="Who took the catch?"
          options={inn.bowlingSquad.map((n, idx) => ({ label: n, value: `${n}-${idx}` }))}
          onClose={() => {}}
          onSelect={(v: string | number) => {
            setOpenCatchFielder(false);
            confirmDismissal("Caught", String(v).split("-")[0]);
          }}
          requireChoice
        />
        <SelectModal
          open={openRunOutFielder}
          title="Who effected the run-out?"
          options={inn.bowlingSquad.map((n, idx) => ({ label: n, value: `${n}-${idx}` }))}
          onClose={() => {}}
          onSelect={(v: string | number) => {
            const name = String(v).split("-")[0];
            setOpenRunOutFielder(false);
            Alert.alert("Which batter was run out?", "", [
              {
                text: `Striker (${striker?.name})`,
                onPress: () => {
                  setOpenWhoOut("striker");
                  confirmDismissal("Run-out", name);
                },
              },
              {
                text: `Non-striker (${nonStriker?.name})`,
                onPress: () => {
                  setOpenWhoOut("nonStriker");
                  confirmDismissal("Run-out", name);
                },
              },
              { text: "Cancel", style: "cancel" },
            ]);
          }}
          requireChoice
        />

        {/* Incoming batter — mandatory; blocks inputs until chosen */}
        <SelectModal
          open={incomingBatterOpen}
          title="Select incoming batter"
          options={inn.batters
            .map((b, idx) => ({ b, idx }))
            .filter((x) => x.idx !== inn.strikerIdx && x.idx !== inn.nonStrikerIdx && !x.b.out)
            .map((x, i) => ({ label: x.b.name, value: `${x.idx}-${i}` }))}
          onClose={() => {}}
          onSelect={(v: string | number) => {
            const val = String(v);
            const idx = Number(val.split("-")[0]);
            setIncomingBatterOpen(false);

            // Declare flow
            if (declareRef.current) {
              setInnCore((i) => {
                const outIdx = declareRef.current === "striker" ? i.strikerIdx : i.nonStrikerIdx;
                if (outIdx != null) i.batters[outIdx].out = { how: "Declared" };
                if (declareRef.current === "striker") i.strikerIdx = idx;
                else i.nonStrikerIdx = idx;
              });
              declareRef.current = null;
              lastOutRef.current = null;
            } else {
              // Wicket flow — replace the correct slot based on remembered out batter
              const who = lastOutRef.current ?? openWhoOut ?? "striker";
              setInnCore((i) => {
                if (who === "striker") i.strikerIdx = idx;
                else i.nonStrikerIdx = idx;
              });
              lastOutRef.current = null;
            }
            setOpenWhoOut(null);
          }}
          requireChoice
        />

        {/* Team sheets overlay */}
        {inn.showSheets && (
          <>
            <Pressable
              style={s.sheetBackdrop}
              onPress={() => setInnCore((i) => {
                i.showSheets = false;
              })}
            />
            <View style={s.sheetCard}>
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Team Sheets</Text>
                <View />
              </View>
              <ScrollView style={s.sheetBody}>
                <Text style={[s.colH, { marginBottom: 6 }]}>
                  Batting — {inn.battingTeamName}
                </Text>
                <View style={[s.row]}>
                  <Text style={[s.colH, { flex: 2 }]}>Player</Text>
                  <Text style={[s.colH, { flex: 2 }]}>Dismissal</Text>
                  <Text style={[s.colH, { width: 50, textAlign: "right" }]}>Runs</Text>
                </View>
                {inn.batters.map((b, iIdx) => {
                  const isStriker = iIdx === inn.strikerIdx;
                  const isNon = iIdx === inn.nonStrikerIdx;
                  const notOut = !b.out && (isStriker || isNon);
                  let dism = "";
                  if (b.out) {
                    if (b.out.how === "Declared") dism = "declared";
                    else if (b.out.how === "Bowled") dism = `b ${b.out.by ?? ""}`.trim();
                    else if (b.out.how === "Caught")
                      dism = `b ${b.out.by ?? ""}   c ${b.out.catcher ?? ""}`.trim();
                    else if (b.out.how === "Run-out") dism = `r ${b.out.runOutBy ?? ""}`.trim();
                  } else if (!b.out && !notOut && b.balls === 0 && b.runs === 0) dism = "";
                  else if (!b.out && !notOut) dism = "retired not out";
                  return (
                    <View key={iIdx} style={s.row}>
                      <Text style={[s.col, { flex: 2 }]}>
                        {(isStriker ? "🏏 " : "")}
                        {b.name}
                        {notOut ? "*" : ""}
                      </Text>
                      <Text style={[s.col, { flex: 2 }]} numberOfLines={1} ellipsizeMode="tail">
                        {dism}
                      </Text>
                      <Text style={[s.col, { width: 50, textAlign: "right" }]}>{b.runs}</Text>
                    </View>
                  );
                })}

                <Text style={[s.colH, { marginTop: 16, marginBottom: 6 }]}>
                  Bowling — {inn.bowlingTeamName}
                </Text>
                <View style={[s.row]}>
                  <Text style={[s.colH, { flex: 2 }]}>Bowler</Text>
                  <Text style={[s.colH, { width: 80, textAlign: "right" }]}>Econ</Text>
                  <Text style={[s.colH, { width: 60, textAlign: "right" }]}>Overs</Text>
                  <Text style={[s.colH, { width: 70, textAlign: "right" }]}>Conceded</Text>
                </View>
                {inn.bowlers.map((b, iIdx) => (
                  <View key={iIdx} style={s.row}>
                    <Text style={[s.col, { flex: 2 }]}>{b.name}</Text>
                    <Text style={[s.col, { width: 80, textAlign: "right" }]}>{toTwo(econ(b))}</Text>
                    <Text style={[s.col, { width: 60, textAlign: "right" }]}>
                      {ovText(Math.floor(b.legalBalls / 6), b.legalBalls % 6)}
                    </Text>
                    <Text style={[s.col, { width: 70, textAlign: "right" }]}>{b.conceded}</Text>
                  </View>
                ))}

                <Pressable
                  onPress={() => setInnCore((i) => {
                    i.showSheets = false;
                  })}
                  style={[s.padBtn, { marginTop: 16, backgroundColor: THEME.ACCENT, borderColor: THEME.ACCENT }]}
                >
                  <Text style={[s.padBtnText, { color: "#0b0f14" }]}>Back</Text>
                </Pressable>
              </ScrollView>
            </View>
          </>
        )}

        {/* Guide overlay with images */}
        {showGuide && (
          <>
            <Pressable
              style={s.sheetBackdrop}
              onPress={() => setShowGuide(false)}
            />
            <View style={s.sheetCard}>
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Guide — Signals & Scoring</Text>
                <View />
              </View>
              <ScrollView style={s.sheetBody} contentContainerStyle={{ paddingBottom: 10 }}>
                <GuideCard
                  title="No Ball (NB)"
                  desc={`Illegal delivery (front foot over, high full toss, dangerous bowling, incorrect fielding positions, etc.).
Award: +1 no-ball to batting side, plus any runs scored off the ball. Ball does not count in the over.
Next ball is a FREE HIT (only RUN-OUT can dismiss the striker; bowled/caught/LBW don't apply).`}
                  img={IMG.noBall}
                />
                <GuideCard
                  title="Wide (Wd)"
                  desc={`Ball is out of the batter’s reach in a normal stance/shot.
Award: +1 wide to batting side, plus any completed runs. Ball does not count in the over.`}
                  img={IMG.wide}
                />
                <GuideCard
                  title="Bye (B)"
                  desc={`Ball passes the batter without bat contact, keeper misses, and batters run.
Award: Runs as Byes (extras). Counts as a legal ball (adds to the over).`}
                  img={IMG.bye}
                />
                <GuideCard
                  title="Leg Bye (LB)"
                  desc={`Ball hits the batter’s body (and batter attempted a shot) and they run.
Award: Runs as Leg Byes (extras). Counts as a legal ball.`}
                  img={IMG.legBye}
                />
                <GuideCard
                  title="Boundary Four"
                  desc={`Ball reaches boundary after touching the ground.
Award: 4 runs to batting side (ball is dead).`}
                  img={IMG.four}
                />
                <GuideCard
                  title="Six"
                  desc={`Ball clears boundary on the full (no ground contact).
Award: 6 runs to batting side (ball is dead).`}
                  img={IMG.six}
                />
                <GuideCard
                  title="Out (Example: LBW / General)"
                  desc={`General signal for OUT is the raised index finger.
Dismissal types include Bowled, Caught, LBW, Run-out, etc. Scoring follows laws for the specific dismissal.`}
                  img={IMG.out}
                />
                <GuideCard
                  title="Dead Ball"
                  desc={`Ball is out of play due to interference or special conditions (e.g., ball hits helmet on ground, serious distraction).
Award: No runs; delivery does not count if declared dead immediately.`}
                  img={IMG.deadBall}
                />

                <Pressable
                  onPress={() => setShowGuide(false)}
                  style={[
                    s.padBtn,
                    { marginTop: 8, backgroundColor: THEME.ACCENT, borderColor: THEME.ACCENT },
                  ]}
                >
                  <Text style={[s.padBtnText, { color: "#0b0f14" }]}>Back</Text>
                </Pressable>
              </ScrollView>
            </View>
          </>
        )}
      </ImageBackground>
    </SafeAreaView>
  );

  function confirmDismissal(how: Dismissal, fielder?: string) {
    const who = openWhoOut ?? "striker";
    setOpenWhoOut(null);
    lastOutRef.current = who; // remember who to replace
    takeWicket(how, who, fielder);
  }
}

/* Reusable card with title, description, and an image */
function GuideCard({ title, desc, img }: { title: string; desc: string; img: any }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[s.colH, { marginBottom: 6 }]}>{title}</Text>
      <Text style={[s.col, { marginBottom: 8, lineHeight: 18 }]}>{desc}</Text>
      <View
        style={{
          width: "100%",
          height: 200,
          borderRadius: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: THEME.BORDER,
          backgroundColor: "rgba(255,255,255,0.02)",
        }}
      >
        <Image
          source={img}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

/* small pill field styles */
const pillFieldStyle = {
  paddingVertical: 12,
  borderRadius: 999 as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
};
const pillFieldTextStyle = {
  color: "rgba(255,255,255,0.95)",
  fontWeight: "800" as const,
};
