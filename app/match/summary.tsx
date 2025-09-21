// app/match/summary.tsx
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useMatch } from "../../store/MatchContext";

export default function Summary() {
  const { setup, innings, matchOver, resetAll } = useMatch();

  const teamALabel = setup?.teamAName ?? "Team A";
  const teamBLabel = setup?.teamBName ?? "Team B";
  const totalOvers = setup?.overs ?? 0;

  const legalBalls = innings?.legalBalls ?? 0;
  const over = Math.floor(legalBalls / 6);
  const ball = legalBalls % 6;

  const runs = innings?.runs ?? 0;
  const wkts = innings?.wickets ?? 0;

  const resultText = matchOver ? "Match complete" : "—";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.h1}>Match Summary</Text>

        <Text style={styles.line}>
          {teamALabel} vs {teamBLabel}
        </Text>
        <Text style={styles.line}>Overs: {totalOvers}</Text>

        <Text style={styles.line}>
          Score: {runs}/{wkts} in {over}.{ball}
        </Text>

        <Text style={styles.line}>Result: {resultText}</Text>

        <Pressable onPress={resetAll} style={[styles.btn, styles.primary]}>
          <Text style={styles.btnText}>Start New Match</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1220", padding: 16 },
  card: {
    backgroundColor: "rgba(16,24,40,0.9)",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  h1: { color: "#E3E7FF", fontSize: 22, fontWeight: "800", letterSpacing: 0.5, marginBottom: 6 },
  line: { color: "#CFE3FF", fontSize: 14 },
  btn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  primary: { backgroundColor: "#2A73D6", borderColor: "#2A73D6" },
  btnText: { color: "#fff", fontWeight: "700", letterSpacing: 0.3 },
});
