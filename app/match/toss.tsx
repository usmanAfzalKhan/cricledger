// app/match/toss.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TeamKey = 'A' | 'B';
type Call = 'Heads' | 'Tails';
type Decision = 'Bat' | 'Bowl';

export default function Toss() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    teamA = 'Team A',
    teamB = 'Team B',
    overs = '10',
    countA = '11',
    countB = '11',
    playersA = '[]',
    playersB = '[]',
    captainAIndex = '-1',
    captainBIndex = '-1',
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

  // Toss state
  const [caller, setCaller] = useState<TeamKey>('A');
  const [call, setCall] = useState<Call>('Heads');
  const [flipping, setFlipping] = useState(false);
  const [tossed, setTossed] = useState(false);
  const [result, setResult] = useState<Call | null>(null);
  const [winner, setWinner] = useState<TeamKey | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  // Animation (rotation only — no scale)
  const spinDeg = useRef(new Animated.Value(0)).current;
  const rotateYFront = spinDeg.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'extend',
  });
  const rotateYBack = spinDeg.interpolate({
    inputRange: [0, 360],
    outputRange: ['180deg', '540deg'],
    extrapolate: 'extend',
  });
  const coinShadow = spinDeg.interpolate({
    inputRange: [0, 180, 360],
    outputRange: [6, 14, 6],
  });

  const flipCoin = () => {
    if (flipping) return;
    setFlipping(true);
    setDecision(null);
    setTossed(false);
    setWinner(null);
    setResult(null);

    spinDeg.stopAnimation(); // be safe
    spinDeg.setValue(0);

    const finalCall: Call = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const fullSpins = 4 + Math.floor(Math.random() * 3); // 4..6 spins
    const target = fullSpins * 360 + (finalCall === 'Heads' ? 0 : 180);

    Animated.timing(spinDeg, {
      toValue: target,
      duration: 1200 + fullSpins * 140,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setFlipping(false);
      setTossed(true);
      setResult(finalCall);
      const callerWon = finalCall === call;
      const w = callerWon ? caller : other(caller);
      setWinner(w);
    });
  };

  const startScoring = () => {
    if (!winner || !decision) return;
    const firstBatting = decision === 'Bat' ? winner : other(winner);
    router.replace({
      pathname: '/match/scoring',
      params: {
        teamA, teamB, overs, countA, countB,
        playersA, playersB,
        captainAIndex: String(capA),
        captainBIndex: String(capB),
        tossCaller: caller,
        tossCall: call,
        tossResult: result ?? '',
        tossWinner: winner,
        tossDecision: decision,
        firstBatting,
      },
    });
  };

  const disablePickers = flipping || tossed;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f14' }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
        <Text style={styles.header}>Team Sheets & Toss</Text>
        <Text style={styles.umpireNote}>
          Hand over the device to the umpire to perform the toss.
        </Text>
        <Text style={styles.subtle}>
          Overs: {overs} • {teamA}: {countA} • {teamB}: {countB}
        </Text>

        {/* Team sheets */}
        <View style={styles.teamsRow}>
          <TeamCard title={teamA} list={parsed.A} captainIndex={capA} />
          <TeamCard title={teamB} list={parsed.B} captainIndex={capB} right />
        </View>

        {/* Toss controller + coin */}
        <View style={styles.tossCard}>
          <Text style={styles.tossTitle}>Coin Toss</Text>

          {/* Selector row */}
          <View style={styles.rowWrap}>
            <View style={styles.row}>
              <Text style={styles.label}>Caller</Text>
              <View style={styles.segment}>
                <SegButton disabled={disablePickers} active={caller === 'A'} onPress={() => setCaller('A')}>
                  {teamA}
                </SegButton>
                <SegButton disabled={disablePickers} active={caller === 'B'} onPress={() => setCaller('B')}>
                  {teamB}
                </SegButton>
              </View>
            </View>

            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={styles.label}>Call</Text>
              <View style={styles.segment}>
                <SegButton disabled={disablePickers} active={call === 'Heads'} onPress={() => setCall('Heads')}>
                  Heads
                </SegButton>
                <SegButton disabled={disablePickers} active={call === 'Tails'} onPress={() => setCall('Tails')}>
                  Tails
                </SegButton>
              </View>
            </View>
          </View>

          {/* Big coin */}
          <Pressable
            onPress={flipCoin}
            disabled={flipping}
            style={{ alignItems: 'center', marginTop: 12 }}
            android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: true }}
          >
            <Animated.View
              style={[
                styles.coinShadowWrap,
                { shadowRadius: coinShadow as any },
              ]}
            >
              {/* HEADS (front) */}
              <Animated.View
                style={[
                  styles.coin,
                  { transform: [{ perspective: 800 }, { rotateY: rotateYFront }] },
                ]}
              >
                <View style={[styles.face, styles.headsFace]}>
                  <View style={[styles.faceInnerRing, { borderColor: '#c2981d' }]} />
                  <Text style={styles.faceTextHeads}>HEADS</Text>
                </View>
              </Animated.View>

              {/* TAILS (back) */}
              <Animated.View
                style={[
                  styles.coin,
                  styles.coinBack,
                  { transform: [{ perspective: 800 }, { rotateY: rotateYBack }] },
                ]}
              >
                <View style={[styles.face, styles.tailsFace]}>
                  <View style={styles.faceContentFlip}>
                    <View style={[styles.faceInnerRing, { borderColor: '#A6B0BA' }]} />
                    <Text style={styles.faceTextTails}>TAILS</Text>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>

            <Text style={[styles.flipHint, flipping && { opacity: 0.6 }]}>
              {flipping ? 'Flipping…' : tossed ? 'Tap to flip again' : 'Tap coin to flip'}
            </Text>
          </Pressable>

          {/* Result */}
          {tossed && result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                Result:&nbsp;
                <Text style={{ color: '#63E6BE', fontWeight: '900' }}>{result}</Text>
              </Text>
              <Text style={styles.resultText}>
                {(winner === 'A' ? teamA : teamB)} won the toss.
              </Text>
            </View>
          )}

          {/* Decision by winner */}
          {winner && (
            <>
              <Text style={[styles.label, { marginTop: 10 }]}>
                Decision ({winner === 'A' ? teamA : teamB})
              </Text>
              <View style={styles.segment}>
                <SegButton disabled={!winner || flipping} active={decision === 'Bat'} onPress={() => setDecision('Bat')}>
                  Bat
                </SegButton>
                <SegButton disabled={!winner || flipping} active={decision === 'Bowl'} onPress={() => setDecision('Bowl')}>
                  Bowl
                </SegButton>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={styles.footer}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => router.back()} disabled={flipping}>
            <Text style={styles.btnText}>BACK</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, decision ? styles.btnPrimary : styles.btnDisabled]}
            onPress={startScoring}
            disabled={!decision || flipping}
          >
            <Text style={styles.btnText}>START SCORING</Text>
          </Pressable>
        </View>

        {/* Home */}
        <Pressable style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]} onPress={() => router.replace('/')}>
          <Text style={styles.btnText}>HOME</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------ small components ------------ */

function TeamCard({ title, list, captainIndex, right }: { title: string; list: string[]; captainIndex: number; right?: boolean }) {
  const shown = list.map(s => s?.trim()).filter(Boolean);
  return (
    <View style={[styles.teamCard, right && { marginLeft: 6 }]}>
      <Text style={styles.teamTitle}>{title}</Text>
      {shown.length === 0 ? (
        <Text style={styles.subtle}>No names provided.</Text>
      ) : (
        <View style={{ marginTop: 6 }}>
          {list.map((p, i) => {
            const name = p?.trim();
            if (!name) return null;
            const isCap = i === captainIndex;
            return (
              <Text key={i} style={styles.playerRowTxt}>
                • {name} {isCap ? <Text style={{ color: '#63E6BE' }}>(C)</Text> : null}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SegButton({
  active,
  onPress,
  children,
  disabled,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.segBtn, active ? styles.segOn : styles.segOff, disabled && { opacity: 0.6 }]}
      android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
    >
      <Text style={styles.segText}>{children}</Text>
    </Pressable>
  );
}

/* ------------ helpers ------------ */

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
function other<T extends 'A' | 'B'>(t: T): T { return (t === 'A' ? 'B' : 'A') as T; }

/* ------------ styles ------------ */

const styles = StyleSheet.create({
  header: { color: '#EAF2F8', fontSize: 22, fontWeight: '900', alignSelf: 'center' },
  subtle: { color: '#9bb4c9', textAlign: 'center', marginTop: 6 },
  umpireNote: {
    textAlign: 'center',
    color: '#CFE3FF',
    marginTop: 6,
    fontWeight: '700',
  },

  teamsRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
  teamCard: {
    flex: 1,
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)',
    borderRadius: 14, padding: 12,
  },
  teamTitle: { color: '#EAF2F8', fontWeight: '900', marginBottom: 4, textAlign: 'center' },
  playerRowTxt: { color: '#EAF2F8', marginBottom: 2 },

  tossCard: {
    marginTop: 14,
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.85)',
    borderRadius: 16, padding: 14,
  },
  tossTitle: { color: '#EAF2F8', fontWeight: '900', marginBottom: 8, textAlign: 'center' },

  rowWrap: { marginTop: 4 },
  row: { marginTop: 6 },
  label: { color: '#CFE3FF', marginBottom: 6, fontSize: 12, letterSpacing: 0.6 },

  segment: { flexDirection: 'row', gap: 8 },
  segBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  segOn: { backgroundColor: 'rgba(42,115,214,0.22)', borderColor: '#2A73D6' },
  segOff: { backgroundColor: '#1b2430', borderColor: '#283445' },
  segText: { color: '#EAF2F8', fontWeight: '800' },

  coinShadowWrap: {
    width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.35, shadowOffset: { width: 0, height: 10 },
  },
  coin: {
    position: 'absolute',
    width: 140, height: 140,
    borderRadius: 70,
    alignItems: 'center', justifyContent: 'center',
    backfaceVisibility: 'hidden',
    borderWidth: 2, borderColor: '#BE9B22',
  },
  coinBack: {},
  face: {
    width: '96%', height: '96%',
    borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  headsFace: { backgroundColor: '#d4af37' }, // gold
  tailsFace: { backgroundColor: '#C0C7D1' }, // silver
  faceInnerRing: {
    position: 'absolute',
    left: 8, top: 8, right: 8, bottom: 8,
    borderWidth: 2,
    borderRadius: 999,
    opacity: 0.9,
  },
  // flip inner content on the back so text isn't mirrored while rotating
  faceContentFlip: {
    transform: [{ scaleX: -1 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  faceTextHeads: {
    color: '#7a5b10',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 24,
    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  faceTextTails: {
    color: '#2b3b4f',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 24,
    textShadowColor: 'rgba(255,255,255,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  flipHint: { color: '#A8C0D6', marginTop: 8 },

  resultBox: {
    marginTop: 12,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(14,19,27,0.7)',
  },
  resultText: { color: '#EAF2F8', marginTop: 2 },

  footer: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2A73D6', borderColor: '#2A73D6' },
  btnSecondary: { backgroundColor: '#1b2430', borderColor: '#283445' },
  btnDisabled: { backgroundColor: '#243142', borderColor: '#2a3a4f' },
  btnText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
});
