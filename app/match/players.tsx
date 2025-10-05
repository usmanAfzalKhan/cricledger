// app/match/players.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { THEME } from "../styles/home";
import { styles } from "../styles/players";

// ✅ same background + global overlays as Setup
import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";

type TeamKey = "A" | "B";

function toInt(v: any, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function parseNames(maybeJson: any): string[] | null {
  try {
    const parsed = JSON.parse(String(maybeJson ?? "null"));
    if (Array.isArray(parsed)) {
      return parsed.map((x) => (typeof x === "string" ? x : String(x ?? "")));
    }
    return null;
  } catch {
    return null;
  }
}

export default function PlayersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamAPlayers?: string;
    teamBPlayers?: string;
    overs?: string; // ✅ carry overs through
    teamA?: string;
    teamB?: string;
    captainA?: string;
    captainB?: string;
    teamALogoUri?: string;
    teamBLogoUri?: string;
  }>();

  const teamALabel = (params.teamAName as string)?.trim() || "Team A";
  const teamBLabel = (params.teamBName as string)?.trim() || "Team B";
  const overs = (params.overs as string) ?? ""; // ✅

  const teamALogoUri = params.teamALogoUri ? String(params.teamALogoUri) : undefined;
  const teamBLogoUri = params.teamBLogoUri ? String(params.teamBLogoUri) : undefined;

  const plannedA0 = toInt(params.teamAPlayers, 6);
  const plannedB0 = toInt(params.teamBPlayers, 6);

  const restoredA = parseNames(params.teamA);
  const restoredB = parseNames(params.teamB);

  const initialA: string[] =
    restoredA && restoredA.length > 0 ? restoredA : Array(Math.max(1, plannedA0)).fill("");
  const initialB: string[] =
    restoredB && restoredB.length > 0 ? restoredB : Array(Math.max(1, plannedB0)).fill("");

  const [plannedA, setPlannedA] = useState<number>(initialA.length);
  const [plannedB, setPlannedB] = useState<number>(initialB.length);

  const [teamA, setTeamA] = useState<string[]>(initialA);
  const [teamB, setTeamB] = useState<string[]>(initialB);

  const restoreCapIndex = (s: any, len: number) => {
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 && n < len ? n : null;
  };
  const [captainA, setCaptainA] = useState<number | null>(restoreCapIndex(params.captainA, initialA.length));
  const [captainB, setCaptainB] = useState<number | null>(restoreCapIndex(params.captainB, initialB.length));

  const aRefs = useRef<Array<TextInput | null>>([]);
  const bRefs = useRef<Array<TextInput | null>>([]);

  const aCount = useMemo(() => teamA.filter((n) => n.trim().length > 0).length, [teamA]);
  const bCount = useMemo(() => teamB.filter((n) => n.trim().length > 0).length, [teamB]);

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

  const switchTeam = (team: TeamKey, index: number) => {
    if (team === "A") {
      const name = teamA[index] ?? "";

      setTeamA((prev) => {
        const next = prev.slice();
        next.splice(index, 1);
        return next;
      });
      aRefs.current.splice(index, 1);
      setCaptainA((c) => {
        if (c == null) return null;
        if (c === index) return null;
        if (c > index) return c - 1;
        return c;
      });
      setPlannedA((p) => Math.max(0, p - 1));

      setTeamB((prev) => [...prev, name]);
      bRefs.current.push(null);
      setPlannedB((p) => p + 1);
    } else {
      const name = teamB[index] ?? "";

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

      setTeamA((prev) => [...prev, name]);
      aRefs.current.push(null);
      setPlannedA((p) => p + 1);
    }
  };

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

    // ✳️ ensure at least 2 named players per team
    if (aCount < 2) errors.push("Team A must have at least 2 players.");
    if (bCount < 2) errors.push("Team B must have at least 2 players.");

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
    const params: Record<string, string> = {
      teamA: JSON.stringify(teamA),
      teamB: JSON.stringify(teamB),
      captainA: captainA != null ? String(captainA) : "",
      captainB: captainB != null ? String(captainB) : "",
      teamAName: teamALabel,
      teamBName: teamBLabel,
      overs, // ✅ pass overs forward
    };
    if (teamALogoUri) params.teamALogoUri = teamALogoUri;
    if (teamBLogoUri) params.teamBLogoUri = teamBLogoUri;

    router.push({
      pathname: "/match/lineups",
      params,
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
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        {/* same ambient overlays */}
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          >
            {/* tap outside to dismiss keyboard */}
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
              <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.wrap}>
                {/* Header */}
                <View style={styles.headerRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/match/setup",
                        params: {
                          // names & overs
                          teamAName: teamALabel,
                          teamBName: teamBLabel,
                          overs,

                          // keep counts in sync with the current arrays
                          teamAPlayers: String(teamA.length),
                          teamBPlayers: String(teamB.length),

                          // 🔒 preserve the exact squads + captains
                          teamA: JSON.stringify(teamA),
                          teamB: JSON.stringify(teamB),
                          ...(captainA != null ? { captainA: String(captainA) } : {}),
                          ...(captainB != null ? { captainB: String(captainB) } : {}),

                          // logos too
                          ...(teamALogoUri ? { teamALogoUri } : {}),
                          ...(teamBLogoUri ? { teamBLogoUri } : {}),
                        },
                      })
                    }
                  >
                    <Text style={styles.backIcon}>‹</Text>
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>

                  <Text style={styles.title}>Players</Text>

                  <View style={{ width: 72 }} />
                </View>

                {/* Team A */}
                <View style={styles.teamCard}>
                  <View style={styles.teamHeader}>
                    <View style={[styles.teamNameWrap, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
                      {teamALogoUri ? (
                        <Image
                          source={{ uri: teamALogoUri }}
                          style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}
                        />
                      ) : null}
                      <View>
                        <Text style={styles.teamName}>{teamALabel}</Text>
                        <Text style={styles.teamMeta}>Players (from Setup): {plannedA}</Text>
                        <Text style={styles.teamMeta}>Enter player names below.</Text>
                        <Text style={styles.teamMeta}>Current entered: {aCount}</Text>
                      </View>
                    </View>
                    {captainA !== null && captainNameA ? (
                      <Text style={styles.teamMeta}>Captain: {captainNameA}</Text>
                    ) : (
                      <Text style={styles.teamMeta}>No Captain chosen</Text>
                    )}
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
                    <View style={[styles.teamNameWrap, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
                      {teamBLogoUri ? (
                        <Image
                          source={{ uri: teamBLogoUri }}
                          style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }}
                        />
                      ) : null}
                      <View>
                        <Text style={styles.teamName}>{teamBLabel}</Text>
                        <Text style={styles.teamMeta}>Players (from Setup): {plannedB}</Text>
                        <Text style={styles.teamMeta}>Enter player names below.</Text>
                        <Text style={styles.teamMeta}>Current entered: {bCount}</Text>
                      </View>
                    </View>
                    {captainB !== null && captainNameB ? (
                      <Text style={styles.teamMeta}>Captain: {captainNameB}</Text>
                    ) : (
                      <Text style={styles.teamMeta}>No Captain chosen</Text>
                    )}
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
                    (
                      teamA.some((n) => !n.trim()) ||
                      teamB.some((n) => !n.trim()) ||
                      captainA === null ||
                      captainB === null ||
                      aCount < 2 ||
                      bCount < 2
                    ) && styles.nextBtnDisabled,
                  ]}
                >
                  <Text style={styles.nextText}>Finalize Teams</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
