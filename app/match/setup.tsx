import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useMatch } from "../../store/MatchContext";

export default function Setup() {
  const router = useRouter();
  const { setSetup, resetAll } = useMatch();

  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [overs, setOvers] = useState("6");
  const [playersA, setPlayersA] = useState("11");
  const [playersB, setPlayersB] = useState("11");

  const onContinue = () => {
    const o = Math.max(1, parseInt(overs || "1", 10));
    const pa = Math.max(1, parseInt(playersA || "1", 10));
    const pb = Math.max(1, parseInt(playersB || "1", 10));

    setSetup({
      teamAName: teamAName.trim() || "Team A",
      teamBName: teamBName.trim() || "Team B",
      overs: o,
      playersA: pa,
      playersB: pb,
      // names are optional; omit so typing stays happy
    });

    router.push("/match/toss");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.select({ ios: "padding", android: undefined })}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <Text style={styles.h1}>New Match</Text>
          <Text style={styles.label}>Team A name</Text>
          <TextInput style={styles.input} value={teamAName} onChangeText={setTeamAName} placeholder="Team A" placeholderTextColor="#94a3b8" />

          <Text style={styles.label}>Team B name</Text>
          <TextInput style={styles.input} value={teamBName} onChangeText={setTeamBName} placeholder="Team B" placeholderTextColor="#94a3b8" />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Overs</Text>
              <TextInput
                style={styles.input}
                value={overs}
                onChangeText={setOvers}
                keyboardType="number-pad"
                placeholder="6"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Players in Team A</Text>
              <TextInput
                style={styles.input}
                value={playersA}
                onChangeText={setPlayersA}
                keyboardType="number-pad"
                placeholder="11"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Players in Team B</Text>
              <TextInput
                style={styles.input}
                value={playersB}
                onChangeText={setPlayersB}
                keyboardType="number-pad"
                placeholder="11"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <Text style={styles.tip}>Player names optional (you can add later).</Text>
            </View>
          </View>

          <Pressable style={[styles.btn, styles.primary]} onPress={onContinue}>
            <Text style={styles.btnText}>Continue to Toss</Text>
          </Pressable>

          <View style={{ height: 8 }} />
          <Link href="/" asChild>
            <Pressable style={[styles.btn, styles.ghost]} onPress={resetAll}>
              <Text style={styles.btnText}>Cancel</Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  wrap: { padding: 16, gap: 10 },
  h1: { color: "#fff", fontSize: 22, fontWeight: "900", marginBottom: 8 },
  label: { color: "#cbd5e1", marginBottom: 6, fontSize: 12, letterSpacing: 0.3 },
  input: {
    color: "#fff",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(16,23,42,0.85)",
  },
  row: { flexDirection: "row", gap: 12 },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  primary: { backgroundColor: "#4F46E5", borderColor: "#4F46E5" },
  ghost: { backgroundColor: "#111827" },
  btnText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },
  tip: { color: "#64748b", fontSize: 12, marginTop: 26 },
});
