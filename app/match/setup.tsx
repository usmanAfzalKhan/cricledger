import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

type Step = 1 | 2 | 3;

export default function MatchSetup() {
  const router = useRouter();

  // Step 1 — basics
  const [teamA, setTeamA] = useState('Team A');
  const [teamB, setTeamB] = useState('Team B');
  const [teamACount, setTeamACount] = useState('11'); // uneven allowed
  const [teamBCount, setTeamBCount] = useState('11');
  const [overs, setOvers] = useState('10');

  // Step 2 — rosters + captains
  const [playersA, setPlayersA] = useState<string[]>([]);
  const [playersB, setPlayersB] = useState<string[]>([]);
  const [captainAIndex, setCaptainAIndex] = useState<number | null>(null);
  const [captainBIndex, setCaptainBIndex] = useState<number | null>(null);

  // wizard
  const [step, setStep] = useState<Step>(1);

  // keep arrays in sync when counts change
  useEffect(() => {
    const nA = clampInt(teamACount, 1, 15);
    const nB = clampInt(teamBCount, 1, 15);
    setPlayersA(prev => resizeArray(prev, nA));
    setPlayersB(prev => resizeArray(prev, nB));
    // reset captain if out of bounds
    if (captainAIndex != null && captainAIndex >= nA) setCaptainAIndex(null);
    if (captainBIndex != null && captainBIndex >= nB) setCaptainBIndex(null);
  }, [teamACount, teamBCount]);

  // validation per step
  const stepValid = useMemo(() => {
    if (step === 1) {
      const o = clampInt(overs, 1, 50);
      const nA = clampInt(teamACount, 1, 15);
      const nB = clampInt(teamBCount, 1, 15);
      return !!teamA.trim() && !!teamB.trim() && o >= 1 && nA >= 1 && nB >= 1;
    }
    if (step === 2) {
      const filledA = playersA.filter(s => !!s.trim()).length;
      const filledB = playersB.filter(s => !!s.trim()).length;
      const captainOk = captainAIndex != null && captainBIndex != null;
      return filledA >= 2 && filledB >= 2 && captainOk;
    }
    return true;
  }, [step, teamA, teamB, overs, teamACount, teamBCount, playersA, playersB, captainAIndex, captainBIndex]);

  const goNext = () => {
    if (!stepValid) return;
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else startScoring();
  };

  const goBack = () => {
    if (step === 1) return;
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const startScoring = () => {
    const o = clampInt(overs, 1, 50).toString();
    const nA = clampInt(teamACount, 1, 15).toString();
    const nB = clampInt(teamBCount, 1, 15).toString();
    // safety: fallback captains if somehow missing
    const capA = (captainAIndex ?? Math.max(0, playersA.findIndex(p => !!p.trim()))) || 0;
    const capB = (captainBIndex ?? Math.max(0, playersB.findIndex(p => !!p.trim()))) || 0;

    router.push({
      pathname: '/match/scoring',
      params: {
        teamA: teamA.trim(),
        teamB: teamB.trim(),
        overs: o,
        countA: nA,
        countB: nB,
        playersA: JSON.stringify(playersA),
        playersB: JSON.stringify(playersB),
        captainAIndex: String(capA),
        captainBIndex: String(capB),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header / Stepper */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match Setup</Text>
        <View style={styles.stepper}>
          <Dot active={step >= 1} label="Basics" />
          <Line />
          <Dot active={step >= 2} label="Players" />
          <Line />
          <Dot active={step >= 3} label="Review" />
        </View>
      </View>

      {/* One scrollable area that adjusts automatically with the keyboard */}
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={28}
        enableAutomaticScroll
        contentContainerStyle={styles.inner}
      >
        {/* STEP 1 */}
        {step === 1 && (
          <View>
            <Text style={styles.title}>Basics</Text>

            <Card>
              <Field label="">
                <Text style={styles.label}>
                  Team A Name<Text style={styles.req}> *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={teamA}
                  onChangeText={setTeamA}
                  placeholder="Enter Team A"
                  placeholderTextColor="#A8C0D6"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </Field>

              <Field label="">
                <Text style={styles.label}>
                  Team B Name<Text style={styles.req}> *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={teamB}
                  onChangeText={setTeamB}
                  placeholder="Enter Team B"
                  placeholderTextColor="#A8C0D6"
                  returnKeyType="next"
                  blurOnSubmit={false}
                />
              </Field>

              <View style={styles.row2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>
                    # Players — {teamA || 'Team A'}
                    <Text style={styles.req}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={teamACount}
                    onChangeText={setTeamACount}
                    keyboardType="number-pad"
                    placeholder="e.g. 11"
                    placeholderTextColor="#A8C0D6"
                    maxLength={2}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  <Badge>Range 1–15</Badge>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>
                    # Players — {teamB || 'Team B'}
                    <Text style={styles.req}> *</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={teamBCount}
                    onChangeText={setTeamBCount}
                    keyboardType="number-pad"
                    placeholder="e.g. 8"
                    placeholderTextColor="#A8C0D6"
                    maxLength={2}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  <Badge>Range 1–15</Badge>
                </View>
              </View>

              <Field label="">
                <Text style={styles.label}>
                  # of Overs<Text style={styles.req}> *</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={overs}
                  onChangeText={setOvers}
                  keyboardType="number-pad"
                  placeholder="e.g. 10"
                  placeholderTextColor="#A8C0D6"
                  maxLength={2}
                  returnKeyType="done"
                />
                <Badge>Range 1–50</Badge>
              </Field>
            </Card>
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View>
            <Text style={styles.title}>
              Players & Captains<Text style={styles.req}> *</Text>
            </Text>

            {/* Team A */}
            <Card>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>
                  {teamA || 'Team A'} ({clampInt(teamACount, 1, 15)})
                </Text>
                <Text style={styles.req}> *</Text>
              </View>
              <Text style={styles.cardCaption}>
                Captain required; min 2 names<Text style={styles.req}> *</Text>
              </Text>

              {Array.from({ length: clampInt(teamACount, 1, 15) }).map((_, idx) => (
                <PlayerRow
                  key={`A-${idx}`}
                  value={playersA[idx] ?? ''}
                  onChange={(t) => setPlayersA(editAt(playersA, idx, t))}
                  isCaptain={captainAIndex === idx}
                  onPickCaptain={() => setCaptainAIndex(idx)}
                  placeholder={`Player ${idx + 1}`}
                />
              ))}
            </Card>

            {/* Team B */}
            <Card>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>
                  {teamB || 'Team B'} ({clampInt(teamBCount, 1, 15)})
                </Text>
                <Text style={styles.req}> *</Text>
              </View>
              <Text style={styles.cardCaption}>
                Captain required; min 2 names<Text style={styles.req}> *</Text>
              </Text>

              {Array.from({ length: clampInt(teamBCount, 1, 15) }).map((_, idx) => (
                <PlayerRow
                  key={`B-${idx}`}
                  value={playersB[idx] ?? ''}
                  onChange={(t) => setPlayersB(editAt(playersB, idx, t))}
                  isCaptain={captainBIndex === idx}
                  onPickCaptain={() => setCaptainBIndex(idx)}
                  placeholder={`Player ${idx + 1}`}
                />
              ))}
            </Card>

            <Text style={styles.tip}>
              Need at least 2 named players per team, and a captain selected for each.
            </Text>
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View>
            <Text style={styles.title}>Review & Confirm</Text>

            <ReviewCard
              title={`${teamA} — ${clampInt(teamACount,1,15)} players`}
              subtitle={`Overs: ${clampInt(overs,1,50)}`}
              list={playersA}
              captainIndex={captainAIndex ?? -1}
            />
            <ReviewCard
              title={`${teamB} — ${clampInt(teamBCount,1,15)} players`}
              subtitle={`Overs: ${clampInt(overs,1,50)}`}
              list={playersB}
              captainIndex={captainBIndex ?? -1}
            />
            <Text style={styles.tip}>Everything look good? Start the match when ready.</Text>
          </View>
        )}

        {/* footer buttons INSIDE the scroll so they can move with keyboard */}
        <View style={styles.footer}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={goBack} disabled={step === 1}>
            <Text style={[styles.btnText, step === 1 && { opacity: 0.35 }]}>BACK</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, stepValid ? styles.btnPrimary : styles.btnDisabled]}
            onPress={goNext}
            disabled={!stepValid}
          >
            <Text style={styles.btnText}>{step === 3 ? 'START MATCH' : 'NEXT'}</Text>
          </Pressable>
        </View>

        {/* HOME button */}
        <Pressable
          style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.btnText}>HOME</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

/* ---------------- small UI helpers ---------------- */

function Dot({ active, label }: { active: boolean; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={[styles.dot, active ? styles.dotOn : styles.dotOff]} />
      <Text style={styles.dotLabel}>{label}</Text>
    </View>
  );
}
function Line() { return <View style={styles.line} />; }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      {children}
    </View>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      {children}
    </View>
  );
}
function PlayerRow({
  value, onChange, isCaptain, onPickCaptain, placeholder,
}: {
  value: string; onChange: (t: string) => void; isCaptain: boolean; onPickCaptain: () => void; placeholder: string;
}) {
  return (
    <View style={styles.playerRow}>
      <TextInput
        style={[styles.input, { flex: 1, marginBottom: 0 }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#A8C0D6"
        returnKeyType="next"
        blurOnSubmit={false}
      />
      <Pressable
        onPress={onPickCaptain}
        style={[styles.cBadge, isCaptain && styles.cBadgeOn]}
        android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
      >
        <Text style={styles.cBadgeText}>C</Text>
      </Pressable>
    </View>
  );
}
function ReviewCard({
  title, subtitle, list, captainIndex,
}: { title: string; subtitle: string; list: string[]; captainIndex: number }) {
  const shown = list.map(s => s?.trim()).filter(Boolean);
  return (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewTitle}>{title}</Text>
      <Text style={styles.subtle}>{subtitle}</Text>
      {shown.length === 0 ? (
        <Text style={styles.subtle}>No names provided.</Text>
      ) : (
        <View style={{ marginTop: 8 }}>
          {list.map((p, i) => {
            const name = p?.trim();
            if (!name) return null;
            const isCap = i === captainIndex;
            return (
              <Text key={i} style={styles.playerItem}>
                • {name} {isCap ? <Text style={{ color: '#63E6BE' }}>(C)</Text> : null}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return <Text style={styles.badge}>{children}</Text>;
}

/* ---------------- pure helpers ---------------- */

function clampInt(v: string, min: number, max: number) {
  const n = Math.max(min, Math.min(max, Number(String(v).replace(/[^0-9]/g, '')) || min));
  return n;
}
function resizeArray(arr: string[], n: number) {
  const next = arr.slice(0, n);
  while (next.length < n) next.push('');
  return next;
}
function editAt(arr: string[], idx: number, value: string) {
  const next = [...arr]; next[idx] = value; return next;
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0f14' },

  header: {
    paddingTop: 6, paddingBottom: 12,
    backgroundColor: '#0b0f14',
    borderBottomWidth: 1, borderBottomColor: '#1e2a3a',
    alignItems: 'center',
  },
  headerTitle: { color: '#EAF2F8', fontWeight: '900', fontSize: 20, marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
  dotOn: { backgroundColor: '#2A73D6', borderColor: '#2A73D6' },
  dotOff: { backgroundColor: '#1b2430', borderColor: '#283445' },
  dotLabel: { color: '#BFD2E3', fontSize: 11, marginTop: 4 },
  line: { width: 30, height: 2, backgroundColor: '#2a3748', marginHorizontal: 4, borderRadius: 2 },

  inner: { padding: 16, paddingBottom: 36 },

  title: { color: '#EAF2F8', fontSize: 22, fontWeight: '900', alignSelf: 'center', marginVertical: 14 },

  field: { marginBottom: 14 },
  row2: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },

  label: { color: '#CFE3FF', marginBottom: 6, fontSize: 12, letterSpacing: 0.6 },
  req: { color: '#ff6b6b', fontWeight: '800' },

  input: {
    backgroundColor: '#121924',
    color: '#EAF2F8',
    borderWidth: 1,
    borderColor: '#2A3A50',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 9 }),
    marginBottom: 8,
  },

  badge: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    fontSize: 11,
    color: '#D8E9FF',
    backgroundColor: 'rgba(42,115,214,0.22)',
    overflow: 'hidden',
  },

  card: {
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.8)',
    borderRadius: 16, padding: 14, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    ...Platform.select({ android: { elevation: 3 } }),
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  cardTitle: { color: '#EAF2F8', fontWeight: '900' },
  cardCaption: { color: '#A8C0D6', marginBottom: 10 },

  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cBadge: {
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1, borderColor: '#283445',
    backgroundColor: '#1b2430',
  },
  cBadgeOn: { borderColor: '#2A73D6', backgroundColor: 'rgba(42,115,214,0.15)' },
  cBadgeText: { color: '#EAF2F8', fontWeight: '900', letterSpacing: 1 },

  reviewCard: {
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.85)',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  reviewTitle: { color: '#EAF2F8', fontWeight: '900', fontSize: 16, marginBottom: 6 },

  subtle: { color: '#A8C0D6' },
  playerItem: { color: '#EAF2F8', marginBottom: 2 },

  helpNote: { color: '#9bb4c9', fontSize: 12, marginTop: 4 },
  tip: { color: '#A8C0D6', textAlign: 'center', marginTop: 6 },

  footer: { flexDirection: 'row', gap: 10, marginTop: 18 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  btnPrimary: { backgroundColor: '#2A73D6', borderColor: '#2A73D6' },
  btnSecondary: { backgroundColor: '#1b2430', borderColor: '#283445' },
  btnDisabled: { backgroundColor: '#243142', borderColor: '#2a3a4f' },
  btnText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
});
