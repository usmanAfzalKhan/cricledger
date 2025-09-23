// app/match/lineups.tsx
import { Link, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
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
};

export default function Lineups() {
  const p = useLocalSearchParams<Params>();

  const teamAName = (p.teamAName ?? "Team A") as string;
  const teamBName = (p.teamBName ?? "Team B") as string;

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
                  },
                }}
                asChild
              >
                <Text style={styles.backLink}>‹ Edit</Text>
              </Link>
              <Text style={styles.title}>Line-ups</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Versus banner */}
{/* Versus banner (perfectly centered) */}
<View style={styles.vsCard}>
  <Text style={styles.teamTitleLeft} numberOfLines={1}>{teamAName}</Text>
  <View style={styles.vsPill}>
    <Text style={styles.vsText}>VS</Text>
  </View>
  <Text style={styles.teamTitleRight} numberOfLines={1}>{teamBName}</Text>
</View>


            {/* Squads */}
            <View style={styles.squadsCard}>
              <View style={styles.squadCol}>
                <Text style={styles.squadHead}>{teamAName}</Text>
                <View style={styles.list}>{renderList(teamA, capA)}</View>
              </View>

              <View style={styles.divider} />

              <View style={styles.squadCol}>
                <Text style={styles.squadHead}>{teamBName}</Text>
                <View style={styles.list}>{renderList(teamB, capB)}</View>
              </View>
            </View>

            {/* Footer hint */}
            <Text style={styles.hint}>
              Confirm your lineups below, then proceed to the toss.
            </Text>

            {/* ✅ Toss button (styled via styles/lineups.ts) */}
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
