import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '../components/GradientBackground';
import { BigBtn, SmallBtn } from '../components/ui/Buttons';
import GuideRow from '../components/ui/GuideRow';
import PickerList from '../components/ui/PickerList';

type TeamKey = 'A' | 'B';
type Batter = {
  name: string;
  runs: number;
  balls: number;
  out: boolean;
  howOut?: string; // "c Name b Bowler", "b Bowler", "run out (S)", "retired"
};
type Bowler = { name: string; balls: number; runs: number; wickets: number };
type DeliveryRec = {
  symbol: string;
  legal: boolean;
  runs: number;
  wickets: number;
  strikerBefore: number;
  nonStrikerBefore: number;
  bowlerName: string;
  extraType?: 'WD' | 'NB' | 'B' | 'LB';
  offBat?: number;
  dismissal?: 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUNOUT';
  outAt?: 'STRIKER' | 'NON_STRIKER';
  newBatterIndex?: number;
  caughtBy?: string;
};

const overText = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
const econRate = (runs: number, balls: number) => (balls ? (runs * 6) / balls : 0);
const strikeRate = (runs: number, balls: number) => (balls ? (runs * 100) / balls : 0);
const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

export default function Scoring() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    teamA = 'Team A',
    teamB = 'Team B',
    playersA = '[]',
    playersB = '[]',
    captainAIndex = '-1',
    captainBIndex = '-1',
    firstBatting = 'A',
  } = params as Record<string, string>;

  const parsed = useMemo(() => {
    let A: string[] = [];
    let B: string[] = [];
    try { A = JSON.parse(playersA); } catch {}
    try { B = JSON.parse(playersB); } catch {}
    return { A, B };
  }, [playersA, playersB]);

  const capA = normCapIdx(captainAIndex, parsed.A);
  const capB = normCapIdx(captainBIndex, parsed.B);

  const battingTeamKey: TeamKey = (firstBatting as TeamKey) ?? 'A';
  const bowlingTeamKey: TeamKey = battingTeamKey === 'A' ? 'B' : 'A';
  const battingTeamName = battingTeamKey === 'A' ? teamA : teamB;
  const bowlingTeamName = bowlingTeamKey === 'A' ? teamA : teamB;
  const battingList = battingTeamKey === 'A' ? parsed.A : parsed.B;
  const bowlingList = bowlingTeamKey === 'A' ? parsed.A : parsed.B;
  const battingCaptain = battingTeamKey === 'A' ? capA : capB;
  const bowlingCaptain = bowlingTeamKey === 'A' ? capA : capB;

  // Score state
  const [batters, setBatters] = useState<Batter[]>(
    battingList.map((n) => ({ name: n || '', runs: 0, balls: 0, out: false }))
  );
  const [bowlers, setBowlers] = useState<Record<string, Bowler>>({});

  // Atomic pair to remove swap bugs
  const [pair, setPair] = useState<{ striker: number | null; non: number | null }>({
    striker: null,
    non: null,
  });

  const [currentBowler, setCurrentBowler] = useState<string | null>(null);

  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [legalBalls, setLegalBalls] = useState(0);
  const [thisOver, setThisOver] = useState<string[]>([]);
  const [history, setHistory] = useState<DeliveryRec[]>([]);
  const [freeHit, setFreeHit] = useState(false);

  // UI modals
  const [showStartModal, setShowStartModal] = useState(true);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showNewBowler, setShowNewBowler] = useState(false);
  const [showByesModal, setShowByesModal] = useState<null | 'B' | 'LB'>(null);
  const [showNbModal, setShowNbModal] = useState(false);
  const [showWideModal, setShowWideModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Retire batter
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [retireWho, setRetireWho] = useState<'STRIKER' | 'NON_STRIKER'>('STRIKER');
  const [retireReason, setRetireReason] = useState<'RETIRED' | 'RETIRED_HURT'>('RETIRED');
  const [retireNewPick, setRetireNewPick] = useState<number | null>(null);
  const [retireOnStrike, setRetireOnStrike] = useState(true);

  // Stats
  const [showStats, setShowStats] = useState(false);

  // Wicket modal state
  const [dismissal, setDismissal] = useState<'BOWLED' | 'CAUGHT' | 'LBW' | 'RUNOUT'>('BOWLED');
  const [outAt, setOutAt] = useState<'STRIKER' | 'NON_STRIKER'>('STRIKER');
  const [caughtBy, setCaughtBy] = useState<string | null>(null);
  const [runOutRuns, setRunOutRuns] = useState<0 | 1 | 2>(0);
  const [newBatterPick, setNewBatterPick] = useState<number | null>(null);
  const [newBatterOnStrike, setNewBatterOnStrike] = useState(true);

  // Initialize striker/non-striker once
  useEffect(() => {
    if (battingList.length > 0 && pair.striker == null && pair.non == null) {
      const namedIdxs = battingList
        .map((n, i) => ({ n: n?.trim(), i }))
        .filter(x => !!x.n)
        .map(x => x.i);
      setPair({
        striker: namedIdxs[0] ?? 0,
        non: namedIdxs[1] ?? (namedIdxs[0] === 0 ? 1 : 0),
      });
    }
  }, [battingList, pair.striker, pair.non]);

  // Guard: if both pointers ever equal, auto-fix non-striker to next available
  useEffect(() => {
    if (pair.striker != null && pair.non != null && pair.striker === pair.non) {
      const fallback = findNextAvailable(batters, pair.striker);
      if (fallback != null) setPair(p => ({ striker: p.striker, non: fallback }));
    }
  }, [pair.striker, pair.non, batters]);

  const flipStrike = () => {
    setPair(p => (p.striker == null || p.non == null) ? p : ({ striker: p.non, non: p.striker }));
  };

  const ensureBowlerObject = (name: string) => {
    setBowlers((prev) => (prev[name] ? prev : { ...prev, [name]: { name, balls: 0, runs: 0, wickets: 0 } }));
  };

  // Core commit
  const commitDelivery = (rec: DeliveryRec) => {
    setRuns((r) => r + rec.runs);
    setWickets((w) => w + rec.wickets);

    const ballSwap =
      (!rec.extraType && rec.runs % 2 === 1) ||
      ((rec.extraType === 'B' || rec.extraType === 'LB') && rec.runs % 2 === 1) ||
      (rec.extraType === 'NB' && (rec.offBat ?? 0) % 2 === 1) ||
      (rec.extraType === 'WD' && rec.runs % 2 === 1);

    if (rec.legal) {
      setLegalBalls((b) => b + 1);
      if (freeHit) setFreeHit(false);
    }

    setBatters((prev) => {
      const next = deepClone(prev);
      const si = rec.strikerBefore;
      if (rec.legal) next[si].balls += 1;
      if (!rec.extraType && rec.offBat == null) next[si].runs += rec.runs;
      else if (rec.extraType === 'NB' && rec.offBat) next[si].runs += rec.offBat;

      if (rec.wickets > 0) {
        const outIndex = rec.outAt === 'NON_STRIKER' ? rec.nonStrikerBefore : rec.strikerBefore;
        next[outIndex].out = true;
        const bow = rec.bowlerName || '—';
        if (rec.dismissal === 'BOWLED')      next[outIndex].howOut = `b ${bow}`;
        if (rec.dismissal === 'LBW')         next[outIndex].howOut = `lbw b ${bow}`;
        if (rec.dismissal === 'CAUGHT')      next[outIndex].howOut = `c ${rec.caughtBy ?? '—'} b ${bow}`;
        if (rec.dismissal === 'RUNOUT')      next[outIndex].howOut = `run out (${rec.outAt === 'STRIKER' ? 'S' : 'NS'})`;
        if (typeof rec.newBatterIndex === 'number') next[rec.newBatterIndex].out = false;
      }
      return next;
    });

    setBowlers((prev) => {
      const bw = { ...prev };
      const name = rec.bowlerName;
      if (!bw[name]) bw[name] = { name, balls: 0, runs: 0, wickets: 0 };
      if (rec.legal) bw[name].balls += 1;
      bw[name].runs += rec.runs;
      if (rec.wickets > 0 && rec.dismissal !== 'RUNOUT') bw[name].wickets += 1;
      return bw;
    });

    setThisOver((arr) => [...arr, rec.symbol]);

    if (ballSwap) flipStrike();

    setHistory((h) => [...h, rec]);

    // End of over: do one deterministic swap
    const afterLegal = legalBalls + (rec.legal ? 1 : 0);
    if (rec.legal && afterLegal % 6 === 0) {
      setTimeout(() => {
        flipStrike(); // makes "odd last ball ⇒ same striker next over"
        setShowNewBowler(true);
        setThisOver([]);
      }, 0);
    }
  };

  // Helpers for bowler label even if blank
  const currentOverIndex = Math.floor(legalBalls / 6) + 1;
  const activeBowlerName = (currentBowler && currentBowler.trim())
    ? currentBowler.trim()
    : `Bowler ${currentOverIndex}`;

  // Buttons
  const canScore =
    pair.striker != null &&
    pair.non != null &&
    !batters[pair.striker]?.out &&
    !batters[pair.non]?.out;

  const onRuns = (n: 0 | 1 | 2 | 3 | 4 | 6) => {
    if (!canScore || pair.striker == null || pair.non == null) return;
    ensureBowlerObject(activeBowlerName);
    commitDelivery({
      symbol: n === 0 ? '.' : String(n),
      legal: true,
      runs: n,
      wickets: 0,
      strikerBefore: pair.striker,
      nonStrikerBefore: pair.non,
      bowlerName: activeBowlerName,
    });
  };
  const onWide = (n: 1 | 2 | 3 | 4 | 5 = 1) => {
    if (!canScore || pair.striker == null || pair.non == null) return;
    ensureBowlerObject(activeBowlerName);
    commitDelivery({
      symbol: n === 1 ? 'Wd' : `Wd+${n - 1}`,
      legal: false,
      runs: n,
      wickets: 0,
      strikerBefore: pair.striker,
      nonStrikerBefore: pair.non,
      bowlerName: activeBowlerName,
      extraType: 'WD',
    });
  };
  const onNb = (offBat?: 0 | 1 | 2 | 4 | 6) => {
    if (!canScore || pair.striker == null || pair.non == null) return;
    ensureBowlerObject(activeBowlerName);
    const teamRuns = 1 + (offBat || 0);
    setFreeHit(true);
    commitDelivery({
      symbol: offBat ? `Nb+${offBat}` : 'Nb',
      legal: false,
      runs: teamRuns,
      wickets: 0,
      strikerBefore: pair.striker,
      nonStrikerBefore: pair.non,
      bowlerName: activeBowlerName,
      extraType: 'NB',
      offBat,
    });
  };
  const onByes = (kind: 'B' | 'LB', n: 1 | 2 | 3 | 4) => {
    if (!canScore || pair.striker == null || pair.non == null) return;
    ensureBowlerObject(activeBowlerName);
    commitDelivery({
      symbol: `${kind}${n}`,
      legal: true,
      runs: n,
      wickets: 0,
      strikerBefore: pair.striker,
      nonStrikerBefore: pair.non,
      bowlerName: activeBowlerName,
      extraType: kind,
    });
  };

  const onWicket = () => {
    if (!canScore || pair.striker == null || pair.non == null) return;
    setDismissal(freeHit ? 'RUNOUT' : 'BOWLED');
    setOutAt('STRIKER');
    setCaughtBy(null);
    setRunOutRuns(0);
    setNewBatterPick(null);
    setNewBatterOnStrike(true);
    setShowWicketModal(true);
  };

  const confirmWicket = () => {
    if (pair.striker == null || pair.non == null) return;
    if (freeHit && dismissal !== 'RUNOUT') {
      Alert.alert('Free Hit', 'Only RUN OUT is valid on a Free Hit.');
      return;
    }
    if (dismissal === 'CAUGHT' && !caughtBy) {
      Alert.alert('Missing fielder', 'Please select who caught the ball.');
      return;
    }
    if (newBatterPick == null) {
      Alert.alert('Select new batter', 'Pick the incoming batter.');
      return;
    }

    let teamAdd = 0;
    let sym = 'W';
    if (dismissal === 'RUNOUT') {
      teamAdd = runOutRuns;
      sym = teamAdd > 0 ? `W+${teamAdd}` : 'W';
    }

    const rec: DeliveryRec = {
      symbol: sym,
      legal: true,
      runs: teamAdd,
      wickets: 1,
      strikerBefore: pair.striker,
      nonStrikerBefore: pair.non,
      bowlerName: activeBowlerName,
      dismissal,
      outAt: dismissal === 'RUNOUT' ? outAt : 'STRIKER',
      newBatterIndex: newBatterPick,
      caughtBy: dismissal === 'CAUGHT' ? (caughtBy || undefined) : undefined,
    };

    ensureBowlerObject(activeBowlerName);
    commitDelivery(rec);

    const outIndex = rec.outAt === 'NON_STRIKER' ? pair.non : pair.striker;
    setPair(p => {
      if (outIndex === p.striker) {
        return newBatterOnStrike
          ? { striker: newBatterPick, non: p.non }
          : { striker: p.non, non: newBatterPick };
      } else {
        return newBatterOnStrike
          ? { striker: newBatterPick, non: p.striker }
          : { striker: p.striker, non: newBatterPick };
      }
    });

    setShowWicketModal(false);
  };

  const onEndOver = () => {
    if (legalBalls % 6 !== 0) {
      const left = 6 - (legalBalls % 6);
      Alert.alert('Over in progress', `${left} ball(s) remaining in this over.`);
      return;
    }
    setShowNewBowler(true);
    setThisOver([]);
  };

  const onUndo = () => {
    const last = history[history.length - 1];
    if (!last) return;

    setRuns((r) => r - last.runs);
    setWickets((w) => w - last.wickets);
    if (last.legal) {
      setLegalBalls((b) => b - 1);
      const idx = history.length - 1;
      const prevNb = [...history]
        .slice(0, idx)
        .reverse()
        .find((d) => d.extraType === 'NB');
      if (prevNb) {
        const afterPrev = history.slice(history.indexOf(prevNb) + 1, idx);
        const firstLegalAfterPrev = afterPrev.find((d) => d.legal);
        if (!firstLegalAfterPrev) setFreeHit(true);
      }
    }

    setBatters((prev) => {
      const next = deepClone(prev);
      const si = last.strikerBefore;
      if (last.legal) next[si].balls -= 1;
      if (!last.extraType && last.offBat == null) next[si].runs -= last.runs;
      else if (last.extraType === 'NB' && last.offBat) next[si].runs -= last.offBat;
      if (last.wickets > 0) {
        const oi = last.outAt === 'NON_STRIKER' ? last.nonStrikerBefore : last.strikerBefore;
        next[oi].out = false;
        next[oi].howOut = undefined;
      }
      return next;
    });

    setBowlers((prev) => {
      const bw = { ...prev };
      const name = last.bowlerName;
      if (!bw[name]) bw[name] = { name, balls: 0, runs: 0, wickets: 0 };
      if (last.legal) bw[name].balls -= 1;
      bw[name].runs -= last.runs;
      if (last.wickets > 0 && last.dismissal !== 'RUNOUT') bw[name].wickets -= 1;
      return bw;
    });

    setPair({ striker: last.strikerBefore, non: last.nonStrikerBefore });
    setThisOver((arr) => arr.slice(0, -1));
    setHistory((h) => h.slice(0, -1));
  };

  // RETIRE (declare batter)
  const onRetire = () => {
    if (pair.striker == null || pair.non == null) return;
    setRetireWho('STRIKER');
    setRetireReason('RETIRED');
    setRetireNewPick(null);
    setRetireOnStrike(true);
    setShowRetireModal(true);
  };

  const confirmRetire = () => {
    if (pair.striker == null || pair.non == null) return;
    if (retireNewPick == null) {
      Alert.alert('Pick incoming batter', 'Select the replacement batter.');
      return;
    }

    const outIndex = retireWho === 'STRIKER' ? pair.striker : pair.non;
    setBatters(prev => {
      const next = deepClone(prev);
      next[outIndex].out = true;
      next[outIndex].howOut = retireReason === 'RETIRED_HURT' ? 'retired hurt' : 'retired';
      next[retireNewPick].out = false;
      return next;
    });

    // place incoming batter on chosen end; no runs/balls/wicket recorded
    setPair(p => {
      if (retireWho === 'STRIKER') {
        return retireOnStrike
          ? { striker: retireNewPick, non: p.non }
          : { striker: p.non, non: retireNewPick };
      } else {
        return retireOnStrike
          ? { striker: retireNewPick, non: p.striker }
          : { striker: p.striker, non: retireNewPick };
      }
    });

    setShowRetireModal(false);
  };

  // Derived
  const oversData = useMemo(() => buildOvers(history), [history]);
  const battingStats = useMemo(() => buildBatterStats(batters, history), [batters, history]);

  const bowlerFig = bowlers[activeBowlerName];

  const maxOverRuns = Math.max(8, ...oversData.map((o) => o.totalRuns));
  const maxBatterRuns = Math.max(10, ...battingStats.map((s) => s.runs));
  const maxBowlerEcon = Math.max(2, ...Object.values(bowlers).map((bw) => econRate(bw.runs, bw.balls)));

  const strikerOutFlag = pair.striker != null && batters[pair.striker]?.out;
  const nonStrikerOutFlag = pair.non != null && batters[pair.non!]?.out;

  // Dismissals list (bottom card)
  const dismissals = batters
    .map((b, i) => ({ i, name: b.name || `Player ${i + 1}`, howOut: b.howOut }))
    .filter(x => !!x.howOut);

  // Stats modal data
  const battingTable = batters.map((b, i) => {
    const s = battingStats[i];
    const status = b.howOut ? b.howOut : 'not out';
    return {
      name: b.name || `Player ${i + 1}`,
      runs: b.runs,
      balls: b.balls,
      fours: s?.fours ?? 0,
      sixes: s?.sixes ?? 0,
      sr: strikeRate(b.runs, b.balls).toFixed(1),
      status,
    };
  });
  const bowlingTable = Object.values(bowlers).map(bw => ({
    name: bw.name,
    overs: `${Math.floor(bw.balls/6)}.${bw.balls%6}`,
    runs: bw.runs,
    wkts: bw.wickets,
    econ: econRate(bw.runs, bw.balls).toFixed(1),
  }));

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
          {/* Banner */}
          {(pair.striker == null || pair.non == null || strikerOutFlag || nonStrikerOutFlag) && (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                {pair.striker == null || pair.non == null
                  ? 'Set striker & non-striker.'
                  : (strikerOutFlag || nonStrikerOutFlag)
                  ? 'Pick an incoming batter.'
                  : 'Action required.'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                {(strikerOutFlag || nonStrikerOutFlag) && (
                  <Pressable onPress={() => setShowWicketModal(true)} style={[styles.smallChip, styles.chipDanger]}>
                    <Text style={styles.smallChipText}>Pick Batter</Text>
                  </Pressable>
                )}
                {(pair.striker == null || pair.non == null) && (
                  <Pressable onPress={() => setShowStartModal(true)} style={[styles.smallChip, styles.chipPrimary]}>
                    <Text style={styles.smallChipText}>Open Pair</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* Score strip */}
          <View style={styles.strip}>
            <Text style={styles.teamName}>
              {battingTeamName} <Text style={styles.subtleSmall}>(bat)</Text>
            </Text>
            <View style={{ flex: 1 }} />
            {freeHit ? <Text style={styles.freeHitBadge}>FREE HIT</Text> : null}
            <Text style={styles.scoreText}>{runs} / {wickets}</Text>
            <Text style={styles.overText}>Ov {overText(legalBalls)}</Text>
          </View>

          {/* Who's who */}
          <View style={styles.whoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Striker</Text>
              <Text style={styles.nameLine}>
                {idxName(batters, pair.striker)} {isCap(battingCaptain, pair.striker) ? <Text style={styles.capTag}>(C)</Text> : null}
              </Text>
              <Text style={styles.subtle}>
                {batters[pair.striker ?? 0]?.runs ?? 0} ({batters[pair.striker ?? 0]?.balls ?? 0}) • SR {strikeRate(batters[pair.striker ?? 0]?.runs ?? 0, batters[pair.striker ?? 0]?.balls ?? 0).toFixed(1)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Non-Striker</Text>
              <Text style={styles.nameLine}>
                {idxName(batters, pair.non)} {isCap(battingCaptain, pair.non) ? <Text style={styles.capTag}>(C)</Text> : null}
              </Text>
              <Text style={styles.subtle}>
                {batters[pair.non ?? 0]?.runs ?? 0} ({batters[pair.non ?? 0]?.balls ?? 0}) • SR {strikeRate(batters[pair.non ?? 0]?.runs ?? 0, batters[pair.non ?? 0]?.balls ?? 0).toFixed(1)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Bowler</Text>
              <Text style={styles.nameLine}>{activeBowlerName}</Text>
              <Text style={styles.subtle}>
                {bowlerFig ? `${Math.floor(bowlerFig.balls / 6)}.${bowlerFig.balls % 6} ov • ${bowlerFig.runs} r • ${bowlerFig.wickets} w • Econ ${econRate(bowlerFig.runs, bowlerFig.balls).toFixed(1)}` : '—'}
              </Text>
            </View>
          </View>

          {/* This over */}
          <View style={styles.overLine}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.label}>This over</Text>
              {freeHit ? <Text style={styles.freeHitChip}>FREE HIT</Text> : null}
            </View>
            <View style={styles.ballsWrap}>
              {thisOver.length === 0 ? (
                <Text style={styles.subtle}>—</Text>
              ) : (
                thisOver.map((s, i) => (
                  <View key={i} style={styles.ballPill}><Text style={styles.ballPillText}>{s}</Text></View>
                ))
              )}
            </View>
          </View>

          {/* Umpire Panel */}
          <Text style={styles.sectionTitle}>Umpire Panel</Text>
          <View style={styles.grid}>
            {([0,1,2,3,4,6] as const).map((n) => (
              <BigBtn key={n} label={String(n)} onPress={() => onRuns(n)} disabled={!canScore} />
            ))}
            <BigBtn label="Wd" onPress={() => setShowWideModal(true)} disabled={!canScore} />
            <BigBtn label="Nb" onPress={() => setShowNbModal(true)} disabled={!canScore} />
            <BigBtn label="B"  onPress={() => setShowByesModal('B')}  disabled={!canScore} />
            <BigBtn label="Lb" onPress={() => setShowByesModal('LB')} disabled={!canScore} />
            <BigBtn label="W"  onPress={onWicket} danger disabled={!canScore} />
            <BigBtn label="Swap" onPress={flipStrike} disabled={!canScore} />
            <BigBtn label="Pair" onPress={() => setShowStartModal(true)} />
            <BigBtn label="Undo" onPress={onUndo} />
            <BigBtn label="End Over" onPress={onEndOver} />
            <BigBtn label="Guide" onPress={() => setShowGuide(true)} />
            <BigBtn label="Retire" onPress={onRetire} />
            <BigBtn label="Stats" onPress={() => setShowStats(true)} />
            <BigBtn label="Home" onPress={() => router.replace('/')} />
          </View>

          {/* LIVE STATS */}
          <Text style={[styles.sectionTitle, { marginTop: 14 }]}>Live Stats</Text>

          {/* Runs per over */}
          <View style={styles.card}>
            <Text style={styles.label}>Runs per Over</Text>
            {oversData.length === 0 ? (
              <Text style={styles.subtle}>No data yet.</Text>
            ) : (
              oversData.map((o, i) => (
                <View key={i} style={{ marginTop: 6 }}>
                  <Text style={styles.statLine}>Over {i+1}: {o.totalRuns} runs</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(o.totalRuns / maxOverRuns) * 100}%` }]} />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Batting */}
          <View style={styles.card}>
            <Text style={styles.label}>Batting</Text>
            {battingStats.map((s, i) => (
              <View key={i} style={{ marginTop: 6 }}>
                <Text style={styles.statLine}>
                  {batters[i]?.name || `Player ${i+1}`} — {batters[i]?.runs ?? 0} ({batters[i]?.balls ?? 0}) • 4s {s.fours} • 6s {s.sixes} • SR {s.sr.toFixed(1)}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${(s.runs / maxBatterRuns) * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>

          {/* Bowling */}
          <View style={styles.card}>
            <Text style={styles.label}>Bowling</Text>
            {Object.values(bowlers).length === 0 ? (
              <Text style={styles.subtle}>No bowlers yet.</Text>
            ) : (
              Object.values(bowlers).map((bw) => (
                <View key={bw.name} style={{ marginTop: 6 }}>
                  <Text style={styles.statLine}>
                    {bw.name} — {Math.floor(bw.balls/6)}.{bw.balls%6} ov • {bw.runs}/{bw.wickets} • Econ {econRate(bw.runs, bw.balls).toFixed(1)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(econRate(bw.runs, bw.balls) / maxBowlerEcon) * 100}%` }]} />
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Dismissals */}
          {dismissals.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.label}>Dismissals</Text>
              {dismissals.map((d) => (
                <Text key={d.i} style={{ color: '#EAF2F8', marginTop: 6 }}>
                  {d.name}: {d.howOut}
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.footerNote}>
            Wd/Nb don’t count as balls. Byes/Leg-byes do; odd totals rotate strike. End of over always swaps ends once more.
          </Text>
        </ScrollView>

        {/* Start / Change Pair modal */}
        <Modal visible={showStartModal} animationType="slide" transparent>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '88%' }]}>
              <Text style={styles.modalTitle}>Start / Change Pair</Text>
              <Text style={styles.subtle}>Pick striker & non-striker. Bowler is optional.</Text>

              <Text style={[styles.label, { marginTop: 10 }]}>{battingTeamName} (Striker)</Text>
              <PickerList
                items={batters.map((b, i) => ({ key: String(i), label: labelledName(b.name, i === battingCaptain) }))}
                selectedKey={pair.striker != null ? String(pair.striker) : undefined}
                onSelect={(k) => setPair(p => ({ striker: Number(k), non: p.non }))}
                disabledKeys={batters
                  .map((b,i)=> (b.out || i === pair.non) ? String(i) : null)
                  .filter(Boolean) as string[]}
              />
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="Type striker name"
                placeholderTextColor="#A8C0D6"
                value={pair.striker!=null ? (batters[pair.striker]?.name || '') : ''}
                onChangeText={(t) => {
                  if (pair.striker==null) return;
                  setBatters((prev)=> {
                    const next = deepClone(prev); next[pair.striker!].name = t; return next;
                  });
                }}
              />

              <Text style={[styles.label, { marginTop: 10 }]}>{battingTeamName} (Non-Striker)</Text>
              <PickerList
                items={batters.map((b, i) => ({ key: String(i), label: labelledName(b.name, i === battingCaptain) }))}
                selectedKey={pair.non != null ? String(pair.non) : undefined}
                onSelect={(k) => setPair(p => ({ striker: p.striker, non: Number(k) }))}
                disabledKeys={batters
                  .map((b,i)=> (b.out || i === pair.striker) ? String(i) : null)
                  .filter(Boolean) as string[]}
              />
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="Type non-striker name"
                placeholderTextColor="#A8C0D6"
                value={pair.non!=null ? (batters[pair.non]?.name || '') : ''}
                onChangeText={(t) => {
                  if (pair.non==null) return;
                  setBatters((prev)=> {
                    const next = deepClone(prev); next[pair.non!].name = t; return next;
                  });
                }}
              />

              <Text style={[styles.label, { marginTop: 10 }]}>{bowlingTeamName} (Bowler — optional)</Text>
              {bowlingList.filter(n=>n?.trim()).length > 0 && (
                <PickerList
                  items={bowlingList.map((n, i) => ({ key: String(i), label: labelledName(n, i === bowlingCaptain) }))}
                  selectedKey={
                    currentBowler != null
                      ? String(Math.max(0, bowlingList.findIndex(n => n === currentBowler)))
                      : undefined
                  }
                  onSelect={(k) => setCurrentBowler(bowlingList[Number(k)] || null)}
                />
              )}
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="Or type bowler name (optional)"
                placeholderTextColor="#A8C0D6"
                value={currentBowler || ''}
                onChangeText={(t) => setCurrentBowler(t || null)}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setShowStartModal(false)}>
                  <Text style={styles.btnText}>CLOSE</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, (pair.striker!=null && pair.non!=null)? styles.btnPrimary : styles.btnDisabled, { flex: 1 }]}
                  onPress={() => setShowStartModal(false)}
                  disabled={!(pair.striker!=null && pair.non!=null)}
                >
                  <Text style={styles.btnText}>APPLY</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Byes/LB modal */}
        <Modal visible={!!showByesModal} animationType="fade" transparent onRequestClose={() => setShowByesModal(null)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '80%' }]}>
              <Text style={styles.modalTitle}>{showByesModal === 'B' ? 'Byes' : 'Leg Byes'}</Text>
              <Text style={styles.subtle}>Choose runs</Text>
              <View style={styles.smallGrid}>
                {[1,2,3,4].map((n) => (
                  <SmallBtn
                    key={n}
                    label={String(n)}
                    onPress={() => { onByes(showByesModal!, n as 1|2|3|4); setShowByesModal(null); }}
                  />
                ))}
              </View>
              <Pressable style={[styles.btn, styles.btnSecondary, { marginTop: 10 }]} onPress={() => setShowByesModal(null)}>
                <Text style={styles.btnText}>CLOSE</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* No-ball modal */}
        <Modal visible={showNbModal} animationType="fade" transparent onRequestClose={() => setShowNbModal(false)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '80%' }]}>
              <Text style={styles.modalTitle}>No-ball</Text>
              <Text style={styles.subtle}>Off-bat runs (optional). Next legal ball will be a FREE HIT.</Text>
              <View style={styles.smallGrid}>
                <SmallBtn label="Nb (1)" onPress={() => { onNb(0); setShowNbModal(false); }} />
                <SmallBtn label="Nb+1" onPress={() => { onNb(1); setShowNbModal(false); }} />
                <SmallBtn label="Nb+2" onPress={() => { onNb(2); setShowNbModal(false); }} />
                <SmallBtn label="Nb+4" onPress={() => { onNb(4); setShowNbModal(false); }} />
                <SmallBtn label="Nb+6" onPress={() => { onNb(6); setShowNbModal(false); }} />
              </View>
              <Pressable style={[styles.btn, styles.btnSecondary, { marginTop: 10 }]} onPress={() => setShowNbModal(false)}>
                <Text style={styles.btnText}>CLOSE</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Wide modal */}
        <Modal visible={showWideModal} animationType="fade" transparent onRequestClose={() => setShowWideModal(false)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '80%' }]}>
              <Text style={styles.modalTitle}>Wide</Text>
              <Text style={styles.subtle}>Runs as wides (ball does NOT count).</Text>
              <View style={styles.smallGrid}>
                {[1,2,3,4,5].map((n) => (
                  <SmallBtn key={n} label={n===1 ? 'Wd' : `Wd+${n-1}`} onPress={() => { onWide(n as 1|2|3|4|5); setShowWideModal(false); }} />
                ))}
              </View>
              <Pressable style={[styles.btn, styles.btnSecondary, { marginTop: 10 }]} onPress={() => setShowWideModal(false)}>
                <Text style={styles.btnText}>CLOSE</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Wicket modal */}
        <Modal visible={showWicketModal} animationType="slide" transparent onRequestClose={() => setShowWicketModal(false)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '88%' }]}>
              <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
                <Text style={styles.modalTitle}>Wicket</Text>
                <Text style={styles.subtle}>{freeHit ? 'Free Hit: only RUN OUT is valid.' : 'Fill in the wicket details.'}</Text>

                <View style={styles.segmentRow}>
                  {(['BOWLED','CAUGHT','LBW','RUNOUT'] as const).map(k => (
                    <Seg
                      key={k}
                      active={dismissal===k}
                      onPress={() => !freeHit || k === 'RUNOUT' ? setDismissal(k as any) : null}
                      disabled={!!freeHit && k !== 'RUNOUT'}
                    >
                      {k}
                    </Seg>
                  ))}
                </View>

                {dismissal === 'CAUGHT' && (
                  <>
                    <Text style={[styles.label, { marginTop: 10 }]}>Caught by (fielder)</Text>
                    <PickerList
                      items={bowlingList.map((n, i) => ({ key: String(i), label: labelledName(n, i === bowlingCaptain) }))}
                      selectedKey={
                        caughtBy
                          ? String(Math.max(0, bowlingList.findIndex(n => n === caughtBy)))
                          : undefined
                      }
                      onSelect={(k) => setCaughtBy(bowlingList[Number(k)] || null)}
                    />
                  </>
                )}

                {dismissal === 'RUNOUT' && (
                  <>
                    <Text style={[styles.label, { marginTop: 10 }]}>Who is out?</Text>
                    <View style={styles.segmentRow}>
                      <Seg active={outAt==='STRIKER'} onPress={() => setOutAt('STRIKER')}>Striker</Seg>
                      <Seg active={outAt==='NON_STRIKER'} onPress={() => setOutAt('NON_STRIKER')}>Non-striker</Seg>
                    </View>

                    <Text style={[styles.label, { marginTop: 10 }]}>Runs on the ball</Text>
                    <View style={styles.segmentRow}>
                      {[0,1,2].map(n => (
                        <Seg key={n} active={runOutRuns===n} onPress={() => setRunOutRuns(n as 0|1|2)}>{String(n)}</Seg>
                      ))}
                    </View>
                  </>
                )}

                <Text style={[styles.label, { marginTop: 10 }]}>Incoming batter</Text>
                <PickerList
                  items={batters.map((b, i) => ({ key: String(i), label: b.name || `Player ${i+1}` }))}
                  selectedKey={newBatterPick != null ? String(newBatterPick) : undefined}
                  onSelect={(k) => setNewBatterPick(Number(k))}
                  disabledKeys={batters
                    .map((b, i) =>
                      (b.out || i===pair.striker || i===pair.non) ? String(i) : null
                    )
                    .filter(Boolean) as string[]}
                />

                <Text style={[styles.label, { marginTop: 10 }]}>New batter on strike?</Text>
                <View style={styles.segmentRow}>
                  <Seg active={newBatterOnStrike} onPress={() => setNewBatterOnStrike(true)}>Yes</Seg>
                  <Seg active={!newBatterOnStrike} onPress={() => setNewBatterOnStrike(false)}>No</Seg>
                </View>
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setShowWicketModal(false)}>
                  <Text style={styles.btnText}>CANCEL</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={confirmWicket}>
                  <Text style={styles.btnText}>CONFIRM</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Change bowler modal (optional) */}
        <Modal visible={showNewBowler} animationType="slide" transparent onRequestClose={() => setShowNewBowler(false)}>
          <View style={styles.modalWrap}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>New Over</Text>
              <Text style={styles.subtle}>Select next bowler (optional)</Text>
              {bowlingList.filter(n=>n?.trim()).length > 0 && (
                <PickerList
                  items={bowlingList.map((n, i) => ({ key: String(i), label: labelledName(n, i === bowlingCaptain) }))}
                  selectedKey={
                    currentBowler != null
                      ? String(Math.max(0, bowlingList.findIndex(n => n === currentBowler)))
                      : undefined
                  }
                  onSelect={(k) => setCurrentBowler(bowlingList[Number(k)] || null)}
                />
              )}
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="Or type bowler name (optional)"
                placeholderTextColor="#A8C0D6"
                value={currentBowler || ''}
                onChangeText={(t) => setCurrentBowler(t || null)}
              />
              <Pressable
                style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]}
                onPress={() => setShowNewBowler(false)}
              >
                <Text style={styles.btnText}>CONTINUE</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* GUIDE modal */}
        <Modal visible={showGuide} animationType="fade" transparent onRequestClose={() => setShowGuide(false)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '88%' }]}>
              <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 10 }}>
                <Text style={styles.modalTitle}>Umpire’s Guide</Text>
                <Text style={styles.subtle}>Quick actions for common events.</Text>

                <GuideRow title="Wide" steps={['Tap Wd', 'Pick Wd+N if they ran']} />
                <GuideRow title="No-Ball" steps={['Tap Nb', 'Choose off-bat runs (optional)', 'Next LEGAL ball is FREE HIT']} />
                <GuideRow title="Byes / Leg-byes" steps={['Tap B or Lb', 'Pick runs; odd = swap strike']} />
                <GuideRow title="Free Hit" steps={['Only RUN OUT can be out', `${freeHit ? 'Active now' : 'Activates after Nb'}`]} />
                <GuideRow title="Wicket" steps={['Tap W', 'Pick dismissal', 'If runout: choose who is out and runs', 'Pick incoming batter & who’s on strike']} />
                <GuideRow title="Over Complete" steps={['Strike auto swaps', 'Pick next bowler (optional)']} />
                <GuideRow title="Fix Mistake" steps={['Tap Undo', 'Re-enter the ball']}/>
                <GuideRow title="Retire" steps={['Tap Retire', 'Pick who retires', 'Choose incoming batter & strike']} />
                <GuideRow title="Stats" steps={['Tap Stats to see full scorecards']} />
              </ScrollView>

              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setShowGuide(false)}>
                <Text style={styles.btnText}>GOT IT</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* RETIRE modal */}
        <Modal visible={showRetireModal} animationType="slide" transparent onRequestClose={() => setShowRetireModal(false)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '88%' }]}>
              <Text style={styles.modalTitle}>Retire Batter</Text>
              <Text style={styles.subtle}>Declare a batter’s innings (no ball, no wicket).</Text>

              <Text style={[styles.label, { marginTop: 10 }]}>Who retires?</Text>
              <View style={styles.segmentRow}>
                <Seg active={retireWho==='STRIKER'} onPress={() => setRetireWho('STRIKER')}>Striker</Seg>
                <Seg active={retireWho==='NON_STRIKER'} onPress={() => setRetireWho('NON_STRIKER')}>Non-striker</Seg>
              </View>

              <Text style={[styles.label, { marginTop: 10 }]}>Reason</Text>
              <View style={styles.segmentRow}>
                <Seg active={retireReason==='RETIRED'} onPress={() => setRetireReason('RETIRED')}>Retired</Seg>
                <Seg active={retireReason==='RETIRED_HURT'} onPress={() => setRetireReason('RETIRED_HURT')}>Retired hurt</Seg>
              </View>

              <Text style={[styles.label, { marginTop: 10 }]}>Incoming batter</Text>
              <PickerList
                items={batters.map((b, i) => ({ key: String(i), label: b.name || `Player ${i+1}` }))}
                selectedKey={retireNewPick != null ? String(retireNewPick) : undefined}
                onSelect={(k) => setRetireNewPick(Number(k))}
                disabledKeys={batters
                  .map((b, i) => (b.out || i===pair.striker || i===pair.non) ? String(i) : null)
                  .filter(Boolean) as string[]}
              />

              <Text style={[styles.label, { marginTop: 10 }]}>New batter on strike?</Text>
              <View style={styles.segmentRow}>
                <Seg active={retireOnStrike} onPress={() => setRetireOnStrike(true)}>Yes</Seg>
                <Seg active={!retireOnStrike} onPress={() => setRetireOnStrike(false)}>No</Seg>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <Pressable style={[styles.btn, styles.btnSecondary, { flex: 1 }]} onPress={() => setShowRetireModal(false)}>
                  <Text style={styles.btnText}>CANCEL</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnPrimary, { flex: 1 }]} onPress={confirmRetire}>
                  <Text style={styles.btnText}>CONFIRM</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* STATS modal */}
        <Modal visible={showStats} animationType="fade" transparent onRequestClose={() => setShowStats(false)}>
          <View style={styles.modalWrap}>
            <View style={[styles.modalCard, { maxHeight: '90%' }]}>
              <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
                <Text style={styles.modalTitle}>Match Stats</Text>

                <View style={[styles.card, { marginTop: 10 }]}>
                  <Text style={styles.label}>Summary</Text>
                  <Text style={styles.statLine}>&bull; {battingTeamName}: {runs}/{wickets} in {overText(legalBalls)} overs</Text>
                </View>

                <View style={[styles.card, { marginTop: 10 }]}>
                  <Text style={styles.label}>Batting</Text>
                  {battingTable.map((r, idx) => (
                    <View key={idx} style={{ marginTop: 8 }}>
                      <Text style={{ color: '#EAF2F8', fontWeight: '800' }}>{r.name}</Text>
                      <Text style={styles.subtle}>
                        {r.runs} ({r.balls}) • 4s {r.fours} • 6s {r.sixes} • SR {r.sr} — {r.status}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.card, { marginTop: 10 }]}>
                  <Text style={styles.label}>Bowling</Text>
                  {bowlingTable.length === 0 ? (
                    <Text style={styles.subtle}>No bowlers yet.</Text>
                  ) : bowlingTable.map((r, idx) => (
                    <View key={idx} style={{ marginTop: 8 }}>
                      <Text style={{ color: '#EAF2F8', fontWeight: '800' }}>{r.name}</Text>
                      <Text style={styles.subtle}>
                        {r.overs} ov • {r.runs}/{r.wkts} • Econ {r.econ}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setShowStats(false)}>
                <Text style={styles.btnText}>CLOSE</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

/* ---------------- Small UI pieces ---------------- */

function Seg({ children, active, onPress, disabled }: { children: React.ReactNode; active: boolean; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.seg, active ? styles.segOn : styles.segOff, disabled && { opacity: 0.4 }]}>
      <Text style={styles.segText}>{children}</Text>
    </Pressable>
  );
}

/* ---------------- Utils ---------------- */

function labelledName(n: string, cap: boolean) {
  const name = n?.trim() || '—';
  return cap ? `${name} (C)` : name;
}
function idxName(batters: Batter[], idx: number | null) { return idx == null ? '—' : (batters[idx]?.name || `Player ${idx + 1}`); }
function isCap(capIndex: number, idx: number | null) { return capIndex >= 0 && idx != null && capIndex === idx; }
function normCapIdx(indexStr: string, list: string[]) {
  const n = list.length;
  let idx = Number.parseInt(String(indexStr), 10);
  if (!Number.isFinite(idx) || idx < 0 || idx >= n) idx = -1;
  if (idx === -1 || !(list[idx]?.trim())) {
    const firstNamed = list.findIndex((p) => p?.trim());
    return firstNamed >= 0 ? firstNamed : -1;
  }
  return idx;
}
function buildOvers(history: DeliveryRec[]) {
  const overs: { index: number; balls: DeliveryRec[]; totalRuns: number }[] = [];
  let cur: DeliveryRec[] = [];
  let legal = 0;
  history.forEach((d) => {
    cur.push(d);
    if (d.legal) {
      legal += 1;
      if (legal % 6 === 0) {
        overs.push({ index: overs.length, balls: cur, totalRuns: cur.reduce((a, b) => a + b.runs, 0) });
        cur = [];
      }
    }
  });
  if (cur.length > 0) {
    overs.push({ index: overs.length, balls: cur, totalRuns: cur.reduce((a, b) => a + b.runs, 0) });
  }
  return overs;
}
function buildBatterStats(batters: Batter[], history: DeliveryRec[]) {
  const stats = batters.map((b, i) => ({
    name: b.name,
    runs: b.runs,
    balls: b.balls,
    fours: 0,
    sixes: 0,
    dots: 0,
    sr: strikeRate(b.runs, b.balls),
  }));
  history.forEach((d) => {
    const idx = d.strikerBefore;
    if (d.legal) {
      let batterRuns = 0;
      if (!d.extraType && d.offBat == null) batterRuns = d.runs;
      if (d.extraType === 'NB' && d.offBat) batterRuns = d.offBat;
      if (batterRuns === 0) stats[idx].dots += 1;
      if (batterRuns === 4) stats[idx].fours += 1;
      if (batterRuns === 6) stats[idx].sixes += 1;
    }
  });
  return stats;
}
function findNextAvailable(bats: Batter[], avoid: number | null) {
  for (let i = 0; i < bats.length; i++) {
    if (i !== avoid && !bats[i]?.out) return i;
  }
  return null;
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  banner: {
    padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#6b2a2a',
    backgroundColor: 'rgba(139,42,42,0.18)', marginBottom: 10,
  },
  bannerText: { color: '#ffd1d1', fontWeight: '700' },
  smallChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, alignSelf: 'flex-start',
  },
  chipPrimary: { backgroundColor: 'rgba(42,115,214,0.18)', borderColor: '#2A73D6' },
  chipDanger:  { backgroundColor: 'rgba(139,42,42,0.18)',  borderColor: '#8b2a2a' },
  smallChipText: { color: '#EAF2F8', fontWeight: '800' },

  strip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 12,
    backgroundColor: 'rgba(16,22,30,0.85)',
    borderRadius: 14, borderWidth: 1, borderColor: '#1e2a3a',
    gap: 10,
  },
  teamName: { color: '#EAF2F8', fontWeight: '900', fontSize: 16 },
  subtleSmall: { color: '#9bb4c9', fontSize: 12 },
  scoreText: { color: '#EAF2F8', fontWeight: '900', fontSize: 18 },
  overText: { color: '#63E6BE', fontWeight: '900' },
  freeHitBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: '#8f7f2a',
    color: '#FFD700', fontWeight: '900',
  },

  whoRow: {
    flexDirection: 'row', gap: 10, marginTop: 10,
    padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)',
  },
  label: { color: '#CFE3FF', marginBottom: 4, fontSize: 12, letterSpacing: 0.5 },
  nameLine: { color: '#EAF2F8', fontWeight: '800' },
  capTag: { color: '#63E6BE', fontWeight: '900' },

  overLine: {
    marginTop: 10,
    padding: 10, borderRadius: 14, borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)',
  },
  ballsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  ballPill: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999, backgroundColor: '#1b2430', borderWidth: 1, borderColor: '#283445' },
  ballPillText: { color: '#EAF2F8', fontWeight: '800' },
  freeHitChip: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
    backgroundColor: 'rgba(255,215,0,0.12)', borderWidth: 1, borderColor: '#8f7f2a',
    color: '#FFD700', fontSize: 11, fontWeight: '900',
  },

  sectionTitle: { color: '#EAF2F8', fontSize: 16, fontWeight: '900', marginTop: 12, marginBottom: 6 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },

  card: {
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.82)',
    borderRadius: 16, padding: 12, marginTop: 10,
  },
  footerNote: { color: '#9bb4c9', marginTop: 10, textAlign: 'center' },

  modalWrap: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16, borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.95)',
    padding: 14,
  },
  modalTitle: { color: '#EAF2F8', fontWeight: '900', fontSize: 18 },

  smallGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },

  seg: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#283445', backgroundColor: '#1b2430',
    alignItems: 'center', justifyContent: 'center',
  },
  segOn: { borderColor: '#2A73D6', backgroundColor: 'rgba(42,115,214,0.18)' },
  segOff: {},
  segText: { color: '#EAF2F8', fontWeight: '800' },
  segmentRow: { flexDirection: 'row', gap: 8, marginTop: 6 },

  btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2A73D6', borderColor: '#2A73D6' },
  btnSecondary: { backgroundColor: '#1b2430', borderColor: '#283445' },
  btnDisabled: { backgroundColor: '#243142', borderColor: '#2a3a4f' },

  input: {
    backgroundColor: '#121924',
    color: '#EAF2F8',
    borderWidth: 1,
    borderColor: '#2A3A50',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  subtle: { color: '#9bb4c9' },
  statLine: { color: '#EAF2F8' },

  barTrack: { height: 8, borderRadius: 6, backgroundColor: '#233041', overflow: 'hidden', marginTop: 4 },
  barFill: { height: 8, backgroundColor: '#2A73D6' },
});
