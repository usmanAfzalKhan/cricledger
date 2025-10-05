// app/match/lineups.tsx
import { Link, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../styles/lineups";

// ✅ background + global overlays (same as setup/players)
import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";

type Params = {
  teamA?: string;           // JSON string of string[]
  teamB?: string;           // JSON string of string[]
  captainA?: string;        // index string
  captainB?: string;        // index string
  teamAName?: string;       // optional
  teamBName?: string;       // optional
  overs?: string;           // ✅ carry overs forward
  // ✅ optional logo URIs (support both keys)
  teamALogo?: string;
  teamBLogo?: string;
  teamALogoUri?: string;
  teamBLogoUri?: string;
};

export default function Lineups() {
  const p = useLocalSearchParams<Params>();

  const teamAName = (p.teamAName ?? "Team A") as string;
  const teamBName = (p.teamBName ?? "Team B") as string;
  const overs = (p.overs as string) ?? ""; // ✅

  // ✅ sanitize incoming URIs (avoid literal "undefined"/"null")
  const sanitize = (u?: string) =>
    u && u !== "undefined" && u !== "null" ? u : "";

  // ✅ read logos (support both param names)
  const teamALogo = sanitize((p.teamALogo as string) || (p.teamALogoUri as string));
  const teamBLogo = sanitize((p.teamBLogo as string) || (p.teamBLogoUri as string));

  const teamA: string[] = useMemo(() => {
    try { return JSON.parse((p.teamA as string) ?? "[]"); } catch { return []; }
  }, [p.teamA]);

  const teamB: string[] = useMemo(() => {
    try { return JSON.parse((p.teamB as string) ?? "[]"); } catch { return []; }
  }, [p.teamB]);

  const capA = Number.isFinite(Number(p.captainA)) ? Number(p.captainA) : -1;
  const capB = Number.isFinite(Number(p.captainB)) ? Number(p.captainB) : -1;

  const renderList = (players: string[], captainIndex: number) => {
    return players.map((name, i) => {
      const n = name?.trim() || `Player ${i + 1}`;
      const isCap = i === captainIndex;
      return (
        <View key={`${n}-${i}`} style={styles.row}>
          <Text style={styles.num}>{i + 1}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {n} {isCap ? <Text style={styles.capBadge}> (C)</Text> : null}
          </Text>
        </View>
      );
    });
  };

  // ✅ logo helper
  const Logo = ({ uri, size = 22 }: { uri?: string; size?: number }) =>
    !!uri ? (
      <Image
        source={{ uri }}
        resizeMode="cover"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: 8,              // after the name → left margin
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
          flexShrink: 0,
        }}
      />
    ) : null;

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Stadium background + overlays */}
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <ScrollView contentContainerStyle={styles.wrap}>
            {/* Header */}
            <View style={styles.headerRow}>
              <Link
                href={{
                  pathname: "/match/players",
                  params: {
                    // send everything back so Players screen is pre-filled
                    teamA: JSON.stringify(teamA),
                    teamB: JSON.stringify(teamB),
                    captainA: capA >= 0 ? String(capA) : "",
                    captainB: capB >= 0 ? String(capB) : "",
                    teamAName,
                    teamBName,
                    teamAPlayers: String(teamA.length),
                    teamBPlayers: String(teamB.length),
                    overs, // ✅ keep overs when going back
                    // ✅ forward both keys so whichever the screen expects will work
                    teamALogo,
                    teamBLogo,
                    teamALogoUri: teamALogo,
                    teamBLogoUri: teamBLogo,
                  },
                }}
                asChild
              >
                <Text style={styles.backLink}>‹ Edit</Text>
              </Link>
              <Text style={styles.title}>Line-ups</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Versus banner — name first, logo AFTER the name.
                Also: left side cluster is right-aligned so it sits near the VS pill. */}
            <View style={styles.vsCard}>
              {/* LEFT half */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end", // 🔧 pull cluster toward VS
                  minWidth: 0,
                }}
              >
                <Text
                  style={[styles.teamTitleLeft, { flexGrow: 0, flexShrink: 1, textAlign: "right" }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {teamAName}
                </Text>
                <Logo uri={teamALogo} size={24} />
              </View>

              <View style={styles.vsPill}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* RIGHT half */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start", // 🔧 pull cluster toward VS
                  minWidth: 0,
                }}
              >
                <Text
                  style={[styles.teamTitleRight, { flexGrow: 0, flexShrink: 1, textAlign: "left" }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {teamBName}
                </Text>
                <Logo uri={teamBLogo} size={24} />
              </View>
            </View>

            {/* Squads (also name first, then logo) */}
            <View style={styles.squadsCard}>
              <View style={styles.squadCol}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.squadHead}>{teamAName}</Text>
                  <Logo uri={teamALogo} />
                </View>
                <View style={styles.list}>{renderList(teamA, capA)}</View>
              </View>

              <View style={styles.divider} />

              <View style={styles.squadCol}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.squadHead}>{teamBName}</Text>
                  <Logo uri={teamBLogo} />
                </View>
                <View style={styles.list}>{renderList(teamB, capB)}</View>
              </View>
            </View>

            {/* Footer hint */}
            <Text style={styles.hint}>
              Confirm your lineups below, then proceed to the toss.
            </Text>

            {/* ✅ Toss button (forward overs + logos) */}
            <Link
              href={{
                pathname: "/match/toss",
                params: {
                  teamA: JSON.stringify(teamA),
                  teamB: JSON.stringify(teamB),
                  captainA: capA >= 0 ? String(capA) : "",
                  captainB: capB >= 0 ? String(capB) : "",
                  teamAName,
                  teamBName,
                  overs, // ✅ forward overs to toss
                  teamALogo,
                  teamBLogo,
                  teamALogoUri: teamALogo,
                  teamBLogoUri: teamBLogo,
                },
              }}
              asChild
            >
              <Pressable style={styles.tossBtn} android_ripple={{ color: "rgba(255,255,255,0.12)" }}>
                <Text style={styles.tossText}>Toss</Text>
              </Pressable>
            </Link>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
