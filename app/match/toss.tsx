import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useMatch } from "../../store/MatchContext";

export default function Toss() {
  const router = useRouter();
  const { setup, setTossAndStart } = useMatch();

  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [chooses, setChooses] = useState<"bat" | "bowl" | null>(null);

  if (!setup) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.text}>Please complete setup first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ready = winner !== null && chooses !== null;

  const start = () => {
    if (!ready || !winner || !chooses) return;
    setTossAndStart(winner, chooses);
    router.replace("/match/scoring");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.card}>
        <Text style={styles.h1}>Toss</Text>
        <Text style={styles.sub}>Who won the toss?</Text>

        <View style={styles.row}>
          <Pressable style={[styles.opt, winner === "A" && styles.optOn]} onPress={() => setWinner("A")}>
            <Text style={styles.optText}>{setup.teamAName}</Text>
          </Pressable>
          <Pressable style={[styles.opt, winner === "B" && styles.optOn]} onPress={() => setWinner("B")}>
            <Text style={styles.optText}>{setup.teamBName}</Text>
          </Pressable>
        </View>

        <Text style={[styles.sub, { marginTop: 14 }]}>They choose to…</Text>
        <View style={styles.row}>
          <Pressable style={[styles.opt, chooses === "bat" && styles.optOn]} onPress={() => setChooses("bat")}>
            <Text style={styles.optText}>Bat</Text>
          </Pressable>
          <Pressable style={[styles.opt, chooses === "bowl" && styles.optOn]} onPress={() => setChooses("bowl")}>
            <Text style={styles.optText}>Bowl</Text>
          </Pressable>
        </View>

        <Pressable style={[styles.cta, !ready && { opacity: 0.55 }]} onPress={start} disabled={!ready}>
          <Text style={styles.ctaText}>Start Scoring</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220", padding: 16 },
  card: { gap: 10 },
  h1: { color: "#fff", fontSize: 22, fontWeight: "900" },
  sub: { color: "#cbd5e1", fontSize: 12, letterSpacing: 0.3 },
  row: { flexDirection: "row", gap: 10 },
  opt: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  optOn: { backgroundColor: "#374151", borderColor: "#374151" },
  optText: { color: "#fff", fontWeight: "700" },
  cta: { marginTop: 18, backgroundColor: "#4F46E5", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#fff" },
});
