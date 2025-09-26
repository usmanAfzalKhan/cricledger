// app/match/scoring.tsx
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../assets/bg/stadium.png";
import { styles as home, THEME } from "../styles/home";
import { styles as s } from "../styles/scoring";

import { BallIcon, BatIcon } from "../../components/scoring/Icons";
import { OverProgress, Pip } from "../../components/scoring/OverProgress";
import { PadKey, RunPad } from "../../components/scoring/RunPad";
import { SelectModal } from "../../components/scoring/SelectModal";

/** AsyncStorage shim (keeps this file compiling if you haven’t installed it yet) */
type StorageLike = { setItem(k: string, v: string): Promise<void>; getItem(k: string): Promise<string | null> };
const Storage: StorageLike = { async setItem(){}, async getItem(){ return null; } };

type Dismissal = "Bowled" | "Caught" | "Run-out";
type TeamID = "A" | "B";
type Batter = { name: string; runs: number; balls: number; out?: { how: Dismissal; by?: string; catcher?: string; runOutBy?: string } };
type Bowler = { name: string; conceded: number; legalBalls: number };
type InningsState = {
  battingTeamName: string; bowlingTeamName: string;
  battingSquad: string[]; bowlingSquad: string[];
  strikerIdx: number | null; nonStrikerIdx: number | null;
  bowlerIdx: number | null; prevBowlerIdx: number | null;
  runs: number; wickets: number; legalBalls: number; completedOvers: number;
  pips: Pip[]; batters: Batter[]; bowlers: Bowler[];
  freeHit: boolean; hatTrickCandidate: { bowlerIdx: number; chain: number } | null;
  batterMilestonesShown: Record<string, { fifty?: boolean; hundred?: boolean }>;
  showSheets: boolean;
};
type MatchState = {
  inningsIndex: 0 | 1;
  innings: [InningsState, InningsState];
  target?: number;
  superOvers: { active: boolean; index: 0 | 1; innings: [InningsState, InningsState] } | null;
};

const KEY = "cricledger_match_v1";
const ovText = (completed: number, ballsInOver: number) => `${completed}.${ballsInOver}`;
const econ = (b: Bowler) => (b.legalBalls === 0 ? 0 : b.conceded / (b.legalBalls / 6));
const rr = (runs: number, totalLegalBalls: number) => (totalLegalBalls === 0 ? 0 : runs / (totalLegalBalls / 6));
const toTwo = (n: number) => n.toFixed(2);
function safeJSON<T>(raw: unknown, fallback: T): T { if (typeof raw !== "string") return fallback; try { return JSON.parse(raw) as T; } catch { return fallback; } }

function newInnings(battingTeamName: string, bowlingTeamName: string, battingSquad: string[], bowlingSquad: string[]): InningsState {
  return {
    battingTeamName, bowlingTeamName, battingSquad, bowlingSquad,
    strikerIdx: null, nonStrikerIdx: null, bowlerIdx: null, prevBowlerIdx: null,
    runs: 0, wickets: 0, legalBalls: 0, completedOvers: 0, pips: [],
    batters: battingSquad.map(name => ({ name, runs: 0, balls: 0 })),
    bowlers: bowlingSquad.map(name => ({ name, conceded: 0, legalBalls: 0 })),
    freeHit: false, hatTrickCandidate: null, batterMilestonesShown: {}, showSheets: false,
  };
}

async function save(state: MatchState) { try { await Storage.setItem(KEY, JSON.stringify(state)); } catch {} }
async function load(): Promise<MatchState | null> { try { const raw = await Storage.getItem(KEY); return raw ? (JSON.parse(raw) as MatchState) : null; } catch { return null; } }

/* ==============================
   THEMED PILL PICKER MODAL (local)
   Used for: Striker / Non-striker / Bowler + Dismissal type
   ============================== */
type PickerOpt = { label: string; value: string | number; disabled?: boolean };
function PillPickerModal({
  open, title, options, onClose, onSelect,
}: { open: boolean; title: string; options: PickerOpt[]; onClose: () => void; onSelect: (v: string | number) => void }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
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
          {/* Header row with pretty close */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 16, fontWeight: "900" }}>{title}</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [{
                paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
                backgroundColor: pressed ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
              }]}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>×</Text>
            </Pressable>
          </View>

          {/* Options as full-width pills */}
          <ScrollView style={{ maxHeight: "70%" }}>
            <View style={{ gap: 10 }}>
              {options.map((o) => (
                <Pressable
                  key={`${o.value}`}
                  disabled={o.disabled}
                  onPress={() => onSelect(o.value)}
                  style={({ pressed }) => [{
                    paddingVertical: 12, borderRadius: 999, alignItems: "center", justifyContent: "center",
                    backgroundColor: o.disabled ? "rgba(255,255,255,0.04)" : (pressed ? THEME.ACCENT : "rgba(255,255,255,0.06)"),
                    borderWidth: 1, borderColor: o.disabled ? "rgba(255,255,255,0.12)" : (pressed ? THEME.ACCENT : "rgba(255,255,255,0.14)"),
                  }]}
                >
                  <Text style={{ color: o.disabled ? "rgba(255,255,255,0.45)" : "#fff", fontWeight: "800" }}>
                    {o.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Footer close (secondary) */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [{
              marginTop: 12,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: "center",
              backgroundColor: pressed ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.09)",
              borderWidth: 1, borderColor: "rgba(255,255,255,0.16)",
            }]}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function Scoring() {
  // ===== params from players/toss
  const p = useLocalSearchParams<{
    teamAName?: string; teamBName?: string; teamA?: string; teamB?: string; tossWinner?: "A" | "B"; decision?: "Bat" | "Bowl";
  }>();
  const teamAName = (p.teamAName && String(p.teamAName).trim()) || "Team A";
  const teamBName = (p.teamBName && String(p.teamBName).trim()) || "Team B";
  const teamA = safeJSON<string[]>(p.teamA, []);
  const teamB = safeJSON<string[]>(p.teamB, []);
  const tossWinner = p.tossWinner === "A" || p.tossWinner === "B" ? p.tossWinner : "A";
  const decision = p.decision === "Bat" || p.decision === "Bowl" ? p.decision : "Bat";
  const battingFirst: TeamID = (tossWinner === "A" && decision === "Bat") || (tossWinner === "B" && decision === "Bowl") ? "A" : "B";

  const firstBatName = battingFirst === "A" ? teamAName : teamBName;
  const firstBowlName = battingFirst === "A" ? teamBName : teamAName;
  const firstBat = battingFirst === "A" ? teamA : teamB;
  const firstBowl = battingFirst === "A" ? teamB : teamA;

  const secondBatName = battingFirst === "A" ? teamBName : teamAName;
  const secondBowlName = battingFirst === "A" ? teamAName : teamBName;
  const secondBat = battingFirst === "A" ? teamB : teamA;
  const secondBowl = battingFirst === "A" ? teamA : teamB;

  const [state, setState] = useState<MatchState>(() => ({
    inningsIndex: 0,
    innings: [newInnings(firstBatName, firstBowlName, firstBat, firstBowl), newInnings(secondBatName, secondBowlName, secondBat, secondBowl)],
    target: undefined, superOvers: null,
  }));
  const inn = state.innings[state.inningsIndex];

  // Toast + strip pulse
  const [toast, setToast] = useState<string>("");
  const toastAnim = useRef(new Animated.Value(0)).current;
  const stripAck = useRef(new Animated.Value(0)).current;
  const flash = (msg: string) => {
    setToast(msg);
    toastAnim.stopAnimation(); toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(toastAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start();
  };
  const ackStrip = () => {
    stripAck.stopAnimation(); stripAck.setValue(0);
    Animated.sequence([
      Animated.timing(stripAck, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(stripAck, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { (async () => { const restored = await load(); if (restored) setState(restored); })(); }, []);
  useEffect(() => { save(state); }, [state]);

  const striker = inn.strikerIdx !== null ? inn.batters[inn.strikerIdx] : null;
  const nonStriker = inn.nonStrikerIdx !== null ? inn.batters[inn.nonStrikerIdx] : null;
  const bowler = inn.bowlerIdx !== null ? inn.bowlers[inn.bowlerIdx] : null;
  const totalLegal = inn.completedOvers * 6 + inn.legalBalls;
  const currRR = rr(inn.runs, totalLegal);
  const target = state.target;
  const reqRR = state.inningsIndex === 1 && target !== undefined
    ? (inn.runs >= target ? 0 : (target - inn.runs) / (((20 - inn.completedOvers - (inn.legalBalls > 0 ? 1 : 0)) * 6 + (6 - inn.legalBalls)) / 6))
    : undefined;

  // UI state
  const [openStriker, setOpenStriker] = useState(false);
  const [openNon, setOpenNon] = useState(false);
  const [openBowler, setOpenBowler] = useState(false);

  const [openPlusPicker, setOpenPlusPicker] = useState<null | { kind: "NB" | "Wd" | "B" | "LB" }>(null);
  const [openWicket, setOpenWicket] = useState(false);
  const [openWhoOut, setOpenWhoOut] = useState<null | "striker" | "nonStriker">(null);

  // NEW: themed dismissal picker modal
  const [openDismissal, setOpenDismissal] = useState(false);

  const [openCatchFielder, setOpenCatchFielder] = useState(false);
  const [openRunOutFielder, setOpenRunOutFielder] = useState(false);
  const [incomingBatterOpen, setIncomingBatterOpen] = useState(false);
  const [dismissalType, setDismissalType] = useState<Dismissal | null>(null);
  const [sheetTab, setSheetTab] = useState<"i1" | "i2" | "so">("i1");

  function setInn(up: (i: InningsState) => void) {
    setState(prev => {
      const next = { ...prev, innings: [...prev.innings] as [InningsState, InningsState] };
      const clone = JSON.parse(JSON.stringify(next.innings[next.inningsIndex])) as InningsState;
      up(clone); next.innings[next.inningsIndex] = clone; return next;
    });
  }
  function swapStrike(i: InningsState) { const a = i.strikerIdx; i.strikerIdx = i.nonStrikerIdx; i.nonStrikerIdx = a; }
  function ensureMilestones(i: InningsState, idx: number) {
    const b = i.batters[idx]; const key = b.name; const seen = i.batterMilestonesShown[key] || {};
    if (b.runs >= 50 && !seen.fifty) { i.batterMilestonesShown[key] = { ...seen, fifty: true }; flash(`FIFTY for ${b.name}`); }
    if (b.runs >= 100 && !seen.hundred) { i.batterMilestonesShown[key] = { ...seen, hundred: true }; flash(`CENTURY for ${b.name}`); }
  }
  function onLegalBallComplete(i: InningsState, wicketByBowler: boolean) {
    if (wicketByBowler && i.bowlerIdx !== null) {
      const same = i.hatTrickCandidate && i.hatTrickCandidate.bowlerIdx === i.bowlerIdx;
      const chain = same ? (i.hatTrickCandidate!.chain + 1) : 1;
      i.hatTrickCandidate = { bowlerIdx: i.bowlerIdx, chain };
      if (chain === 3) flash("HATTRICK!!!");
    } else { i.hatTrickCandidate = null; }
  }
  function endOver(i: InningsState, lastBallOdd: boolean) {
    i.completedOvers += 1; i.legalBalls = 0;
    swapStrike(i); if (lastBallOdd) swapStrike(i);
    i.prevBowlerIdx = i.bowlerIdx; i.bowlerIdx = null; setOpenBowler(true);
  }
  function pushUndo() { undoRef.current.push(JSON.stringify(state)); }
  const undoRef = useRef<string[]>([]);
  function onUndo() { const snap = undoRef.current.pop(); if (!snap) return; Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setState(JSON.parse(snap) as MatchState); }

  const needSetup = inn.strikerIdx === null || inn.nonStrikerIdx === null || inn.bowlerIdx === null;

  // Actions
  function addRun(n: 0 | 1 | 2 | 3 | 4 | 5 | 6) {
    pushUndo();
    Haptics.impactAsync(n === 6 ? Haptics.ImpactFeedbackStyle.Heavy : n === 4 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    ackStrip();
    setInn(i => {
      i.pips.push({ t: "run", v: n });
      if (i.strikerIdx !== null) { i.batters[i.strikerIdx].runs += n; i.batters[i.strikerIdx].balls += 1; ensureMilestones(i, i.strikerIdx); }
      if (i.bowlerIdx !== null) { i.bowlers[i.bowlerIdx].conceded += n; i.bowlers[i.bowlerIdx].legalBalls += 1; }
      i.runs += n; i.legalBalls += 1;
      if (n % 2 === 1) swapStrike(i);
      onLegalBallComplete(i, false);
      if (i.legalBalls === 6) endOver(i, n % 2 === 1);
      i.freeHit = false;
    });
  }
  function addExtras(kind: "NB" | "Wd" | "B" | "LB", plus: number) {
    pushUndo(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); ackStrip();
    setInn(i => {
      if (kind === "NB") {
        const total = 1 + plus; i.pips.push({ t: "nb", v: total }); i.runs += total;
        if (i.bowlerIdx !== null) i.bowlers[i.bowlerIdx].conceded += total; i.freeHit = true;
      } else if (kind === "Wd") {
        const total = 1 + plus; i.pips.push({ t: "wd", v: total }); i.runs += total;
        if (i.bowlerIdx !== null) i.bowlers[i.bowlerIdx].conceded += total;
      } else {
        const v = Math.max(1, Math.min(6, plus)) as 1 | 2 | 3 | 4 | 5 | 6;
        if (kind === "B") i.pips.push({ t: "b", v }); else i.pips.push({ t: "lb", v });
        i.runs += v; if (i.bowlerIdx !== null) { i.bowlers[i.bowlerIdx].conceded += v; i.bowlers[i.bowlerIdx].legalBalls += 1; }
        i.legalBalls += 1; if (v % 2 === 1) swapStrike(i);
        onLegalBallComplete(i, false);
        if (i.legalBalls === 6) endOver(i, v % 2 === 1);
        i.freeHit = false;
      }
    });
  }
  function takeWicket(how: Dismissal, who: "striker" | "nonStriker", fielder?: string) {
    pushUndo(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); ackStrip();
    setInn(i => {
      const outIdx = who === "striker" ? i.strikerIdx : i.nonStrikerIdx; if (outIdx === null) return;
      i.legalBalls += 1; if (i.bowlerIdx !== null) i.bowlers[i.bowlerIdx].legalBalls += 1;
      i.pips.push({ t: "wicket", how });
      const b = i.batters[outIdx]; b.balls += 1; b.out = { how, by: i.bowlerIdx !== null ? i.bowlers[i.bowlerIdx].name : undefined };
      if (how === "Caught" && fielder) b.out.catcher = fielder; if (how === "Run-out" && fielder) b.out.runOutBy = fielder;
      if (i.freeHit && how !== "Run-out") { b.out = undefined; } else { i.wickets += 1; }
      const bowlerWicket = how === "Bowled" || how === "Caught"; onLegalBallComplete(i, bowlerWicket);
      setIncomingBatterOpen(true); if (i.legalBalls === 6) endOver(i, false); i.freeHit = false;
    });
  }

  function onPad(k: PadKey) {
    if (needSetup) { Alert.alert("Pick players", "Select striker, non-striker, and bowler first."); return; }
    switch (k) {
      case "0": return addRun(0);
      case "1": return addRun(1);
      case "2": return addRun(2);
      case "3": return addRun(3);
      case "4": return addRun(4);
      case "5": return addRun(5);
      case "6": return addRun(6);
      case "NB": return setOpenPlusPicker({ kind: "NB" });
      case "Wd": return setOpenPlusPicker({ kind: "Wd" });
      case "B":  return setOpenPlusPicker({ kind: "B" });
      case "LB": return setOpenPlusPicker({ kind: "LB" });
      case "W": {
        if (!striker || !nonStriker) return;
        setOpenWhoOut(null); setOpenWicket(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        return;
      }
      case "Declare": {
        const options = [
          { text: `Replace ${striker?.name} (striker)`, onPress: () => declareFlow("striker") },
          { text: `Replace ${nonStriker?.name} (non-striker)`, onPress: () => declareFlow("nonStriker") },
          { text: "Cancel", style: "cancel" as const },
        ];
        Alert.alert("Declare (retired not out)", "Choose which batter to replace.", options);
        return;
      }
      case "Undo": return onUndo();
    }
  }
  function declareFlow(which: "striker" | "nonStriker") { setIncomingBatterOpen(true); setOpenWhoOut(which); }

  // Render
  const stripStyle = {
    transform: [{ scale: stripAck.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) }],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0B0E11" }}>
      <ImageBackground source={bg} style={{ flex: 1 }} resizeMode="cover">
        <View style={home.scrim} /><View style={home.bgGlow} /><View style={home.bgCorner} />

        <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
          {/* Heading */}
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <Text style={{ color: THEME.TEXT, fontSize: 18, fontWeight: "900", letterSpacing: 0.3 }}>Scoring</Text>
            <Text style={{ color: THEME.TEXT_MUTED, marginTop: 2, fontSize: 12 }}>Select openers & bowler, then score.</Text>
          </View>

          {needSetup ? (
            // On-theme setup card (pills)
            <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
              <View style={{ padding: 14, backgroundColor: "rgba(12,18,24,0.65)", borderWidth: 1, borderColor: THEME.BORDER, borderRadius: 16 }}>
                <Text style={{ color: "rgba(255,255,255,0.92)", fontSize: 16, fontWeight: "800", marginBottom: 10 }}>Choose openers & bowler</Text>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 12, marginBottom: 6 }}>Striker</Text>
                <Pressable onPress={() => setOpenStriker(true)} style={pillFieldStyle}>
                  <Text style={pillFieldTextStyle}>{inn.strikerIdx === null ? "Select Striker" : inn.batters[inn.strikerIdx].name}</Text>
                </Pressable>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Non-striker</Text>
                <Pressable onPress={() => setOpenNon(true)} style={pillFieldStyle}>
                  <Text style={pillFieldTextStyle}>{inn.nonStrikerIdx === null ? "Select Non-striker" : inn.batters[inn.nonStrikerIdx].name}</Text>
                </Pressable>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Bowler</Text>
                <Pressable onPress={() => setOpenBowler(true)} style={pillFieldStyle}>
                  <Text style={pillFieldTextStyle}>{inn.bowlerIdx === null ? "Select Bowler" : inn.bowlers[inn.bowlerIdx].name}</Text>
                </Pressable>

                <Text style={{ color: THEME.TEXT_MUTED, fontSize: 11, marginTop: 10 }}>
                  Batting: {inn.battingTeamName}   •   Bowling: {inn.bowlingTeamName}
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* TV strip card */}
              <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
                <Animated.View style={[{ padding: 14, backgroundColor: "rgba(12,18,24,0.65)", borderWidth: 1, borderColor: THEME.BORDER, borderRadius: 16 }, stripStyle]}>
                  <View style={s.stripRow}>
                    <Text style={s.stripLine}>
                      {inn.battingTeamName} {inn.runs}/{inn.wickets} <Text style={s.sep}>|</Text>{" "}
                      <Text style={s.name}><BatIcon /> {striker?.name}</Text>{" "}
                      <Text style={s.sep}>  </Text>
                      <Text style={s.name}>{nonStriker?.name}</Text>{" "}
                      <Text style={s.sep}>|</Text>{" "}
                      <Text style={s.name}><BallIcon /> {bowler?.name} {ovText(inn.completedOvers, inn.legalBalls)}</Text>
                    </Text>
                  </View>
                  <Text style={[s.stripSub, { marginTop: 6 }]}>
                    Run Rate: {toTwo(currRR)}{state.inningsIndex === 1 && (reqRR !== undefined) && (<>   |   Req RR: {toTwo(reqRR)}</>)}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    {!!inn.hatTrickCandidate && inn.hatTrickCandidate.chain === 2 && (<View style={s.chip}><Text style={s.chipText}>HATTRICK BALL</Text></View>)}
                    {inn.freeHit && (<View style={s.chip}><Text style={s.chipText}>FREE HIT</Text></View>)}
                  </View>
                </Animated.View>
              </View>

              <OverProgress pips={inn.pips} />

              {/* Red WICKET button */}
              <View style={{ paddingHorizontal: 16, marginTop: -4 }}>
                <Pressable onPress={() => onPad("W")} style={[s.padBtn, s.btnDanger, { alignSelf: "stretch", marginBottom: 10 }]}>
                  <Text style={s.padBtnText}>WICKET</Text>
                </Pressable>
              </View>

              <RunPad onPress={onPad} />

              <View style={{ paddingHorizontal: 16 }}>
                <Pressable style={[s.padBtn, s.btnGhost]} onPress={() => setInn(i => { i.showSheets = true; })}>
                  <Text style={s.padBtnText}>Team Sheets</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>

        {/* Toast */}
        <Animated.View pointerEvents="none" style={[s.toast, { opacity: toastAnim, transform: [{ scale: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }]}>
          <Text style={s.toastText}>{toast}</Text>
        </Animated.View>

        {/* ====== Pickers (themed where requested) ====== */}
        {/* Striker / Non-striker / Bowler use PillPickerModal now */}
        <PillPickerModal
          open={openStriker}
          title="Select Striker"
          options={inn.batters.map((b, idx) => ({ label: b.name, value: idx, disabled: inn.nonStrikerIdx === idx }))}
          onClose={() => setOpenStriker(false)}
          onSelect={(v) => { setOpenStriker(false); setInn(i => { i.strikerIdx = Number(v); }); }}
        />
        <PillPickerModal
          open={openNon}
          title="Select Non-striker"
          options={inn.batters.map((b, idx) => ({ label: b.name, value: idx, disabled: inn.strikerIdx === idx }))}
          onClose={() => setOpenNon(false)}
          onSelect={(v) => { setOpenNon(false); setInn(i => { i.nonStrikerIdx = Number(v); }); }}
        />
        <PillPickerModal
          open={openBowler}
          title="Select Bowler"
          options={inn.bowlers.map((b, idx) => ({
            label: b.name + (inn.prevBowlerIdx === idx ? " (bowled last over)" : ""), value: idx, disabled: inn.prevBowlerIdx === idx,
          }))}
          onClose={() => setOpenBowler(false)}
          onSelect={(v) => { setOpenBowler(false); setInn(i => { i.bowlerIdx = Number(v); }); }}
        />

        {/* Extras picker (kept your existing SelectModal) */}
        <SelectModal
          open={!!openPlusPicker}
          title={openPlusPicker?.kind === "NB" || openPlusPicker?.kind === "Wd" ? `${openPlusPicker?.kind} + (overthrows)` : `${openPlusPicker?.kind} (1–6)`}
          options={Array.from({ length: openPlusPicker?.kind === "NB" || openPlusPicker?.kind === "Wd" ? 7 : 6 }).map((_, idx) => {
            const n = openPlusPicker?.kind === "NB" || openPlusPicker?.kind === "Wd" ? idx : (idx + 1);
            return { label: `+${n}`, value: n };
          })}
          onClose={() => setOpenPlusPicker(null)}
          onSelect={(v: string | number) => { const plus = Number(v); if (!openPlusPicker) return; const k = openPlusPicker.kind; setOpenPlusPicker(null); addExtras(k, plus); }}
        />

        {/* Who is out? (kept your existing SelectModal) */}
        <SelectModal
          open={openWicket}
          title="Who is out?"
          options={[
            { label: `Striker (${striker?.name ?? "-"})`, value: "striker" },
            { label: `Non-striker (${nonStriker?.name ?? "-"})`, value: "nonStriker" },
          ]}
          onClose={() => setOpenWicket(false)}
          onSelect={(v: string | number) => {
            setOpenWicket(false);
            setOpenWhoOut(v as "striker" | "nonStriker");
            // Open themed dismissal modal (replaces the old Alert)
            setOpenDismissal(true);
          }}
        />

        {/* NEW: Dismissal type — themed modal */}
        <PillPickerModal
          open={openDismissal}
          title="Dismissal type"
          options={[
            { label: "Bowled", value: "Bowled" },
            { label: "Caught", value: "Caught" },
            { label: "Run-out", value: "Run-out" },
          ]}
          onClose={() => setOpenDismissal(false)}
          onSelect={(v) => {
            const how = String(v) as Dismissal;
            setOpenDismissal(false);
            if (how === "Caught") {
              setDismissalType("Caught");
              setOpenCatchFielder(true);
            } else if (how === "Run-out") {
              setDismissalType("Run-out");
              setOpenRunOutFielder(true);
            } else {
              confirmDismissal("Bowled");
            }
          }}
        />

        {/* Caught / Run-out fielders (kept existing SelectModal to save scope) */}
        <SelectModal
          open={openCatchFielder}
          title="Who took the catch?"
          options={inn.bowlingSquad.map((n) => ({ label: n, value: n }))}
          onClose={() => setOpenCatchFielder(false)}
          onSelect={(v: string | number) => { setOpenCatchFielder(false); confirmDismissal("Caught", String(v)); }}
        />
        <SelectModal
          open={openRunOutFielder}
          title="Who effected the run-out?"
          options={inn.bowlingSquad.map((n) => ({ label: n, value: n }))}
          onClose={() => setOpenRunOutFielder(false)}
          onSelect={(v: string | number) => {
            setOpenRunOutFielder(false);
            Alert.alert("Which batter was run out?", "", [
              { text: `Striker (${striker?.name})`, onPress: () => { setOpenWhoOut("striker"); confirmDismissal("Run-out", String(v)); } },
              { text: `Non-striker (${nonStriker?.name})`, onPress: () => { setOpenWhoOut("nonStriker"); confirmDismissal("Run-out", String(v)); } },
              { text: "Cancel", style: "cancel" },
            ]);
          }}
        />

        {/* Incoming batter (unchanged) */}
        <SelectModal
          open={incomingBatterOpen}
          title="Select incoming batter"
          options={inn.batters
            .map((b, idx) => ({ b, idx }))
            .filter(x => x.idx !== inn.strikerIdx && x.idx !== inn.nonStrikerIdx && !x.b.out)
            .map(x => ({ label: x.b.name, value: x.idx }))}
          onClose={() => setIncomingBatterOpen(false)}
          onSelect={(v: string | number) => {
            const idx = Number(v); setIncomingBatterOpen(false);
            if (openWhoOut) setInn(i => { if (openWhoOut === "striker") i.strikerIdx = idx; else i.nonStrikerIdx = idx; });
          }}
        />

        {/* Team sheets overlay preserved */}
        {inn.showSheets && (
          <>
            <Pressable style={s.sheetBackdrop} onPress={() => setInn(i => { i.showSheets = false; })} />
            <View style={s.sheetCard}>
              <View style={s.sheetHeader}>
                <Text style={s.sheetTitle}>Team Sheets</Text>
                <Pressable onPress={() => setInn(i => { i.showSheets = false; })}><Text style={{ color: "#EAF2F8", fontWeight: "800" }}>Back</Text></Pressable>
              </View>
              <ScrollView style={s.sheetBody}>
                <Text style={[s.colH, { marginBottom: 6 }]}>Batting — {inn.battingTeamName}</Text>
                <View style={[s.row]}>
                  <Text style={[s.colH, { flex: 2 }]}>Player</Text>
                  <Text style={[s.colH, { flex: 2 }]}>Dismissal</Text>
                  <Text style={[s.colH, { width: 50, textAlign: "right" }]}>Runs</Text>
                </View>
                {inn.batters.map((b, iIdx) => {
                  const notOut = (!b.out && (iIdx === inn.strikerIdx || iIdx === inn.nonStrikerIdx));
                  let dism = "";
                  if (b.out) {
                    if (b.out.how === "Bowled") dism = `b ${b.out.by ?? ""}`.trim();
                    if (b.out.how === "Caught") dism = `b ${b.out.by ?? ""}   c ${b.out.catcher ?? ""}`.trim();
                    if (b.out.how === "Run-out") dism = `r ${b.out.runOutBy ?? ""}`.trim();
                  } else if (!b.out && !notOut && (b.balls === 0 && b.runs === 0)) dism = "";
                  else if (!b.out && !notOut) dism = "retired not out";
                  return (
                    <View key={iIdx} style={s.row}>
                      <Text style={[s.col, { flex: 2 }]}>{b.name}{notOut ? "*" : ""}</Text>
                      <Text style={[s.col, { flex: 2 }]} numberOfLines={1} ellipsizeMode="tail">{dism}</Text>
                      <Text style={[s.col, { width: 50, textAlign: "right" }]}>{b.runs}</Text>
                    </View>
                  );
                })}
                <Text style={[s.colH, { marginTop: 16, marginBottom: 6 }]}>Bowling — {inn.bowlingTeamName}</Text>
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
                    <Text style={[s.col, { width: 60, textAlign: "right" }]}>{ovText(Math.floor(b.legalBalls / 6), b.legalBalls % 6)}</Text>
                    <Text style={[s.col, { width: 70, textAlign: "right" }]}>{b.conceded}</Text>
                  </View>
                ))}
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
    takeWicket(how, who, fielder);
  }
}

/* Small pill field styles for the setup card */
const pillFieldStyle = {
  paddingVertical: 12,
  borderRadius: 999 as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
};
const pillFieldTextStyle = { color: "rgba(255,255,255,0.95)", fontWeight: "800" as const };
