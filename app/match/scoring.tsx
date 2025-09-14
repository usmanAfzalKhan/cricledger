// app/match/scoring.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Scoring() {
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

  // Ensure exactly one valid captain per team (if possible)
  const capA = useMemo(() => normalizeCaptainIndex(captainAIndex, parsed.A), [captainAIndex, parsed.A]);
  const capB = useMemo(() => normalizeCaptainIndex(captainBIndex, parsed.B), [captainBIndex, parsed.B]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b0f14' }} edges={['top', 'bottom']}>
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={16}
        enableAutomaticScroll
        contentContainerStyle={{ padding: 20, paddingBottom: 28 }}
      >
        <Text style={styles.header}>Live Scoring</Text>

        <View style={styles.scoreRow}>
          <Text style={styles.team}>{teamA}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.team}>{teamB}</Text>
        </View>

        <Text style={styles.subtle}>
          Overs: {overs} • {teamA}: {countA} players • {teamB}: {countB} players
        </Text>

        {(parsed.A.length > 0 || parsed.B.length > 0) && (
          <View style={styles.playersBox}>
            <Text style={styles.playersTitle}>Line-ups</Text>
            <View style={styles.lineupRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.lineupHeader}>{teamA}</Text>
                {parsed.A.map((p, i) => {
                  const name = p?.trim();
                  if (!name) return null;
                  const isCap = i === capA;
                  return (
                    <Text key={`A-${i}`} style={styles.playerItem}>
                      • {name} {isCap ? <Text style={{ color: '#63E6BE' }}>(C)</Text> : null}
                    </Text>
                  );
                })}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lineupHeader}>{teamB}</Text>
                {parsed.B.map((p, i) => {
                  const name = p?.trim();
                  if (!name) return null;
                  const isCap = i === capB;
                  return (
                    <Text key={`B-${i}`} style={styles.playerItem}>
                      • {name} {isCap ? <Text style={{ color: '#63E6BE' }}>(C)</Text> : null}
                    </Text>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        <View style={styles.scoreBox}>
          <Text style={styles.scoreMain}>0 / 0</Text>
          <Text style={styles.subtle}>Over 0.0</Text>
        </View>

        <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => router.back()}>
          <Text style={styles.btnText}>BACK</Text>
        </Pressable>

        {/* HOME button */}
        <Pressable style={[styles.btn, styles.btnPrimary, { marginTop: 12 }]} onPress={() => router.replace('/')}>
          <Text style={styles.btnText}>HOME</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

/* ---------- helpers ---------- */
function normalizeCaptainIndex(indexStr: string, list: string[]): number {
  const n = list.length;
  let idx = Number.parseInt(String(indexStr), 10);
  if (!Number.isFinite(idx) || idx < 0 || idx >= n) idx = -1;

  // If invalid or empty name at that index, pick first non-empty player
  if (idx === -1 || !(list[idx]?.trim())) {
    const firstNamed = list.findIndex((p) => p?.trim());
    return firstNamed >= 0 ? firstNamed : -1;
  }
  return idx;
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  header: { color: '#EAF2F8', fontSize: 24, fontWeight: '900', alignSelf: 'center', marginVertical: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'center', gap: 14, alignItems: 'center', marginTop: 6 },
  team: { color: '#EAF2F8', fontSize: 18, fontWeight: '800' },
  vs: { color: '#63E6BE', fontSize: 14, fontWeight: '800' },
  subtle: { color: '#9bb4c9', textAlign: 'center', marginTop: 6 },

  playersBox: {
    marginTop: 16,
    borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)',
    padding: 12, borderRadius: 14,
  },
  playersTitle: { color: '#EAF2F8', fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  lineupRow: { flexDirection: 'row', gap: 16 },
  lineupHeader: { color: '#63E6BE', fontWeight: '800', marginBottom: 4 },
  playerItem: { color: '#EAF2F8', opacity: 0.95, marginBottom: 2 },

  scoreBox: {
    marginTop: 24, alignSelf: 'center', borderWidth: 1, borderColor: '#1e2a3a',
    backgroundColor: 'rgba(16,22,30,0.75)', paddingVertical: 18, paddingHorizontal: 28, borderRadius: 16,
  },
  scoreMain: { color: '#EAF2F8', fontSize: 36, fontWeight: '900', textAlign: 'center' },

  btn: { marginTop: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  btnSecondary: { backgroundColor: '#1b2430', borderColor: '#283445' },
  btnPrimary: { backgroundColor: '#2A73D6', borderColor: '#2A73D6' },
  btnText: { color: '#fff', fontWeight: '800', letterSpacing: 1 },
});
