import { router, useLocalSearchParams } from "expo-router";
import {
    ImageBackground,
    Pressable,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../../assets/bg/stadium.png";
import { styles as s } from "../../../components/quick-match/quickScoringStyles";
import { styles as home } from "../../styles/home";

function oversFromBalls(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

export default function QuickResult() {
  const p = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    battingFirst?: "A" | "B";
    firstRuns?: string;
    firstWickets?: string;
    firstBalls?: string;
    secondRuns?: string;
    secondWickets?: string;
    secondBalls?: string;
    target?: string;
  }>();

  const battingFirst =
    p.battingFirst === "B" ? "B" : "A";

  const firstName =
    battingFirst === "A"
      ? String(p.teamAName || "Team A")
      : String(p.teamBName || "Team B");

  const secondName =
    battingFirst === "A"
      ? String(p.teamBName || "Team B")
      : String(p.teamAName || "Team A");

  const firstRuns = Number(p.firstRuns || 0);
  const firstWickets = Number(p.firstWickets || 0);
  const firstBalls = Number(p.firstBalls || 0);

  const secondRuns = Number(p.secondRuns || 0);
  const secondWickets = Number(p.secondWickets || 0);
  const secondBalls = Number(p.secondBalls || 0);

  let result = "";

  if (secondRuns > firstRuns) {
    const wicketsRemaining = Math.max(
      0,
      10 - secondWickets
    );

    result =
      wicketsRemaining > 0
        ? `${secondName} won by ${wicketsRemaining} wicket${
            wicketsRemaining === 1 ? "" : "s"
          }`
        : `${secondName} won`;
  } else if (secondRuns === firstRuns) {
    result = "Match tied";
  } else {
    const margin = firstRuns - secondRuns;

    result = `${firstName} won by ${margin} run${
      margin === 1 ? "" : "s"
    }`;
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
            <Text style={s.resultTitle}>
              {result}
            </Text>

            <Text style={s.centeredText}>
              {firstName}
            </Text>

            <Text style={s.resultScore}>
              {firstRuns}/{firstWickets}
            </Text>

            <Text
              style={[
                s.muted,
                { textAlign: "center" },
              ]}
            >
              {oversFromBalls(firstBalls)} overs
            </Text>

            <View style={{ height: 22 }} />

            <Text style={s.centeredText}>
              {secondName}
            </Text>

            <Text style={s.resultScore}>
              {secondRuns}/{secondWickets}
            </Text>

            <Text
              style={[
                s.muted,
                { textAlign: "center" },
              ]}
            >
              {oversFromBalls(secondBalls)} overs
            </Text>

            <Pressable
              style={s.primaryButton}
              onPress={() => router.replace("/")}
            >
              <Text style={s.primaryButtonText}>
                Back Home
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.replace("/match/quick/setup")
              }
              style={{ padding: 14 }}
            >
              <Text
                style={[
                  s.muted,
                  { textAlign: "center" },
                ]}
              >
                Start another Quick Match
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}