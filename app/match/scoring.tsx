import { useRouter } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useMatch } from "../../store/MatchContext";

const RUNS = [0, 1, 2, 3, 4, 6];

export default function Scoring() {
  const router = useRouter();
  const { setup, innings, addBall, addExtra, wicket, declareInnings, matchOver } = useMatch();

  if (!setup || !innings) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.text}>No active match.</Text>
          <Pressable onPress={() => router.replace("/match/setup")} style={styles.btn}>
            <Text style={styles.btnText}>Start Setup</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const totalOvers = setup.overs;
  const legalBalls = innings.legalBalls;
  const over = Math.floor(legalBalls / 6);
  const ball = legalBalls % 6;

  const battingName = innings.battingTeam === "A" ? setup.teamAName : setup.teamBName;
  const bowlingName = innings.battingTeam === "A" ? setup.teamBName : setup.teamAName;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.team}>{battingName}</Text>
        <Text style={styles.score}>
          {innings.runs}/{innings.wickets}
        </Text>
        <Text style={styles.over}>
          Ov {over}.{ball} / {totalOvers}
        </Text>
        <Text style={styles.vs}>vs {bowlingName}</Text>
      </View>

      <View style={styles.pad}>
        <View style={styles.row}>
          {RUNS.map((r) => (
            <Pressable key={r} style={styles.key} onPress={() => addBall(r)}>
              <Text style={styles.keyText}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.row}>
          <Pressable style={[styles.key, styles.alt]} onPress={() => addExtra("WD")}>
            <Text style={styles.keyText}>WD</Text>
          </Pressable>
          <Pressable style={[styles.key, styles.alt]} onPress={() => addExtra("NB")}>
            <Text style={styles.keyText}>NB</Text>
          </Pressable>
          <Pressable style={[styles.key, styles.out]} onPress={() => wicket()}>
            <Text style={styles.keyText}>W</Text>
          </Pressable>
        </View>

        <View style={{ height: 16 }} />

        <Pressable
          style={[styles.declare, matchOver && { opacity: 0.5 }]}
          onPress={declareInnings}
          disabled={matchOver}
        >
          <Text style={styles.btnText}>
            {innings.currentInnings === 1 ? "Declare / All Out (End Innings 1)" : "Declare (End Match)"}
          </Text>
        </Pressable>

        <View style={{ height: 8 }} />
        <Pressable style={styles.summary} onPress={() => router.push("/match/summary")}>
          <Text style={styles.btnText}>View Summary</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  header: { padding: 16, alignItems: "center", gap: 4 },
  team: { color: "white", fontSize: 18, fontWeight: "800" },
  score: { color: "white", fontSize: 48, fontWeight: "900" },
  over: { color: "#93A3B5", fontSize: 14 },
  vs: { color: "#9CA3AF", marginTop: 4 },
  pad: { paddingHorizontal: 16, gap: 12 },
  row: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  key: {
    flex: 1,
    backgroundColor: "#1F2937",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  keyText: { color: "white", fontWeight: "800", fontSize: 18 },
  alt: { backgroundColor: "#374151" },
  out: { backgroundColor: "#B91C1C" },
  declare: { backgroundColor: "#EF4444", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  summary: { backgroundColor: "#4F46E5", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  btn: { backgroundColor: "#4F46E5", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16 },
  btnText: { color: "white", fontWeight: "800" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  text: { color: "white" },
});
