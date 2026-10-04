import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ImageBackground,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../../assets/bg/stadium.png";
import { styles as s } from "../../../components/quick-match/quickScoringStyles";
import { styles as home } from "../../styles/home";

export default function QuickInningsBreak() {
  const p = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamALogoUri?: string;
    teamBLogoUri?: string;
    battingFirst?: "A" | "B";
    overs?: string;
    firstRuns?: string;
    firstWickets?: string;
    firstBalls?: string;
    target?: string;
  }>();

  const [chaseOvers, setChaseOvers] = useState(
    String(p.overs || "1")
  );

  const battingFirst =
    p.battingFirst === "B" ? "B" : "A";

  const firstName =
    battingFirst === "A"
      ? String(p.teamAName || "Team A")
      : String(p.teamBName || "Team B");

  const chasingName =
    battingFirst === "A"
      ? String(p.teamBName || "Team B")
      : String(p.teamAName || "Team A");

  const target = Number(p.target || 1);

  const validOvers =
    Number(chaseOvers) > 0 &&
    Number.isInteger(Number(chaseOvers));

  function startChase() {
    if (!validOvers) return;

    router.push({
      pathname: "/match/quick/scoring",
      params: {
        teamAName: String(p.teamAName || ""),
        teamBName: String(p.teamBName || ""),
        teamALogoUri: String(p.teamALogoUri || ""),
        teamBLogoUri: String(p.teamBLogoUri || ""),
        battingFirst,
        overs: String(p.overs || "1"),
        innings: "2",
        target: String(target),
        chaseOvers,
        firstRuns: String(p.firstRuns || "0"),
        firstWickets: String(p.firstWickets || "0"),
        firstBalls: String(p.firstBalls || "0"),
      },
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={bg}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView
          style={[
            home.safe,
            {
              padding: 18,
              justifyContent: "center",
            },
          ]}
        >
          <View style={s.breakCard}>
            <Text style={s.headerTitle}>
              Innings Break
            </Text>

            <Text
              style={[
                s.centeredText,
                { marginTop: 18 },
              ]}
            >
              {firstName}
            </Text>

            <Text
              style={[
                s.resultScore,
                { marginTop: 5 },
              ]}
            >
              {p.firstRuns}/{p.firstWickets}
            </Text>

            <Text
              style={[
                s.centeredText,
                { marginTop: 22 },
              ]}
            >
              {chasingName} needs
            </Text>

            <Text style={s.bigTarget}>
              {target}
            </Text>

            <Text style={s.centeredText}>
              runs to win
            </Text>

            <Text style={s.inputLabel}>
              Overs for the chase
            </Text>

            <TextInput
              value={chaseOvers}
              onChangeText={(value) =>
                setChaseOvers(
                  value.replace(/[^0-9]/g, "")
                )
              }
              style={s.input}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor="rgba(237,239,230,0.5)"
            />

            <Pressable
              disabled={!validOvers}
              style={[
                s.primaryButton,
                !validOvers && s.disabledButton,
              ]}
              onPress={startChase}
            >
              <Text style={s.primaryButtonText}>
                Start Chase
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={{ padding: 14 }}
            >
              <Text
                style={[
                  s.muted,
                  { textAlign: "center" },
                ]}
              >
                ← Back to scoring / Undo
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}