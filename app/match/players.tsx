import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../styles/home";
import { styles } from "../styles/players";

type TeamKey = "A" | "B";

function toInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default function PlayersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamAPlayers?: string;
    teamBPlayers?: string;
    overs?: string;
  }>();

  // pull counts from Setup (fallback to 6)
  const plannedA0 = toInt(params.teamAPlayers, 6);
  const plannedB0 = toInt(params.teamBPlayers, 6);

  const [plannedA, setPlannedA] = useState<number>(plannedA0);
  const [plannedB, setPlannedB] = useState<number>(plannedB0);

  // size arrays by the planned counts from Setup
  const [teamA, setTeamA] = useState<string[]>(Array(Math.max(1, plannedA0)).fill(""));
  const [teamB, setTeamB] = useState<string[]>(Array(Math.max(1, plannedB0)).fill(""));

  const [captainA, setCaptainA] = useState<number | null>(null);
  const [captainB, setCaptainB] = useState<number | null>(null);

  const aRefs = useRef<Array<TextInput | null>>([]);
  const bRefs = useRef<Array<TextInput | null>>([]);

  const aCount = useMemo(() => teamA.filter((n) => n.trim().length > 0).length, [teamA]);
  const bCount = useMemo(() => teamB.filter((n) => n.trim().length > 0).length, [teamB]);

  const teamALabel = (params.teamAName as string)?.trim() || "Team A";
  const teamBLabel = (params.teamBName as string)?.trim() || "Team B";

  const setName =
    (team: TeamKey, index: number) =>
    (text: string) => {
      if (team === "A") {
        const next = [...teamA];
        next[index] = text;
        setTeamA(next);
      } else {
        const next = [...teamB];
        next[index] = text;
        setTeamB(next);
      }
    };

  // MOVE between teams:
  // - remove the row from SOURCE (splice)
  // - decrement planned count of SOURCE
  // - insert into TARGET (fill an empty slot if any, else push)
  // - increment planned count of TARGET
const switchTeam = (team: TeamKey, index: number) => {
  if (team === "A") {
    const name = teamA[index] ?? "";

    // 1) remove from A (and fix captain/indexes)
    setTeamA((prev) => {
      const next = prev.slice();
      next.splice(index, 1);
      return next;
    });
    aRefs.current.splice(index, 1);
    setCaptainA((c) => {
      if (c == null) return null;
      if (c === index) return null;   // moved the captain away
      if (c > index) return c - 1;    // shift left after splice
      return c;
    });
    setPlannedA((p) => Math.max(0, p - 1));

    // 2) append to B so it visibly shows at the bottom
    setTeamB((prev) => [...prev, name]);
    bRefs.current.push(null);
    setPlannedB((p) => p + 1);

  } else {
    const name = teamB[index] ?? "";

    // 1) remove from B (and fix captain/indexes)
    setTeamB((prev) => {
      const next = prev.slice();
      next.splice(index, 1);
      return next;
    });
    bRefs.current.splice(index, 1);
    setCaptainB((c) => {
      if (c == null) return null;
      if (c === index) return null;
      if (c > index) return c - 1;
      return c;
    });
    setPlannedB((p) => Math.max(0, p - 1));

    // 2) append to A so it visibly shows at the bottom
    setTeamA((prev) => [...prev, name]);
    aRefs.current.push(null);
    setPlannedA((p) => p + 1);
  }
};


  // DELETE row completely + update planned count
  const deletePlayer = (team: TeamKey, index: number) => {
    if (team === "A") {
      setTeamA((prev) => {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      });
      aRefs.current.splice(index, 1);
      setCaptainA((c) => {
        if (c === null) return null;
        if (c === index) return null;
        if (c > index) return c - 1;
        return c;
      });
      setPlannedA((p) => Math.max(0, p - 1));
    } else {
      setTeamB((prev) => {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      });
      bRefs.current.splice(index, 1);
      setCaptainB((c) => {
        if (c === null) return null;
        if (c === index) return null;
        if (c > index) return c - 1;
        return c;
      });
      setPlannedB((p) => Math.max(0, p - 1));
    }
  };

  const setCaptain = (team: TeamKey, index: number) => {
    const name = team === "A" ? teamA[index].trim() : teamB[index].trim();
    if (!name) {
      Alert.alert("Captain needs a name", "Enter the player's name first.");
      return;
    }
    if (team === "A") setCaptainA(index);
    else setCaptainB(index);
  };

  const validate = (): true | string[] => {
    const errors: string[] = [];
    if (teamA.some((n) => !n.trim())) errors.push("Team A has empty player fields.");
    if (teamB.some((n) => !n.trim())) errors.push("Team B has empty player fields.");
    if (captainA === null) errors.push("Select a captain for Team A.");
    if (captainB === null) errors.push("Select a captain for Team B.");
    return errors.length ? errors : true;
  };

  const onFinalize = () => {
    const ok = validate();
    if (ok !== true) {
      Alert.alert("Can't finalize yet", ok.join("\n"));
      return;
    }
    router.push({
      pathname: "/match/summary",
      params: {
        teamA: JSON.stringify(teamA),
        teamB: JSON.stringify(teamB),
        captainA: String(captainA),
        captainB: String(captainB),
      },
    });
  };

  const renderRow = (team: TeamKey, index: number) => {
    const isA = team === "A";
    const value = isA ? teamA[index] : teamB[index];
    const capIndex = isA ? captainA : captainB;
    const isCaptain = capIndex === index;

    return (
      <View key={`${team}-${index}`} style={styles.itemRow}>
        <View style={styles.nameAndBadge}>
          <TextInput
            ref={(r) => {
              if (isA) aRefs.current[index] = r;
              else bRefs.current[index] = r;
            }}
            style={[styles.input, styles.grow]}
            placeholder={`Player ${index + 1}`}
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={value}
            onChangeText={setName(team, index)}
            returnKeyType="next"
            onSubmitEditing={() => {
              const nextIndex = index + 1;
              const arr = isA ? aRefs.current : bRefs.current;
              arr[nextIndex]?.focus?.();
            }}
          />
          {isCaptain ? <Text style={styles.captainBadge}>C</Text> : null}
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity onPress={() => setCaptain(team, index)} style={styles.smallBtn}>
            <Text style={styles.smallIconText}>C</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => switchTeam(team, index)} style={styles.smallBtnGhost}>
            <Text style={styles.smallGhostIconText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => deletePlayer(team, index)} style={styles.smallBtnGhost}>
            <Text style={styles.smallGhostIconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const captainNameA = captainA != null ? teamA[captainA]?.trim() || "" : "";
  const captainNameB = captainB != null ? teamB[captainB]?.trim() || "" : "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.BG }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.wrap}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backIcon}>‹</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Players</Text>

            <View style={{ width: 72 }} />
          </View>

          {/* Team A */}
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamNameWrap}>
                <Text style={styles.teamName}>{teamALabel}</Text>
                <Text style={styles.teamMeta}>Players (from Setup): {plannedA}</Text>
                <Text style={styles.teamMeta}>Enter player names below.</Text>
                <Text style={styles.teamMeta}>Current entered: {aCount}</Text>
              </View>
              {captainA !== null && captainNameA
                ? <Text style={styles.teamMeta}>Captain: {captainNameA}</Text>
                : <Text style={styles.teamMeta}>No Captain chosen</Text>}
            </View>

            <View style={styles.list}>{teamA.map((_, i) => renderRow("A", i))}</View>

            <TouchableOpacity
              onPress={() => {
                setTeamA((prev) => {
                  const next = [...prev, ""];
                  aRefs.current.push(null);
                  return next;
                });
                setPlannedA((p) => p + 1);
              }}
              style={[
                styles.nextBtn,
                { marginTop: 10, backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.18)" },
              ]}
            >
              <Text style={[styles.nextText, { color: THEME.TEXT }]}>+ Add Player</Text>
            </TouchableOpacity>
          </View>

          {/* Team B */}
          <View style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <View style={styles.teamNameWrap}>
                <Text style={styles.teamName}>{teamBLabel}</Text>
                <Text style={styles.teamMeta}>Players (from Setup): {plannedB}</Text>
                <Text style={styles.teamMeta}>Enter player names below.</Text>
                <Text style={styles.teamMeta}>Current entered: {bCount}</Text>
              </View>
              {captainB !== null && captainNameB
                ? <Text style={styles.teamMeta}>Captain: {captainNameB}</Text>
                : <Text style={styles.teamMeta}>No Captain chosen</Text>}
            </View>

            <View style={styles.list}>{teamB.map((_, i) => renderRow("B", i))}</View>

            <TouchableOpacity
              onPress={() => {
                setTeamB((prev) => {
                  const next = [...prev, ""];
                  bRefs.current.push(null);
                  return next;
                });
                setPlannedB((p) => p + 1);
              }}
              style={[
                styles.nextBtn,
                { marginTop: 10, backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.18)" },
              ]}
            >
              <Text style={[styles.nextText, { color: THEME.TEXT }]}>+ Add Player</Text>
            </TouchableOpacity>
          </View>

          {/* Finalize */}
          <TouchableOpacity
            onPress={onFinalize}
            style={[
              styles.nextBtn,
              (teamA.some((n) => !n.trim()) ||
                teamB.some((n) => !n.trim()) ||
                captainA === null ||
                captainB === null) && styles.nextBtnDisabled,
            ]}
          >
            <Text style={styles.nextText}>Finalize Teams</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
