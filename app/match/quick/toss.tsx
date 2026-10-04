import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
    Animated,
    ImageBackground,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../../assets/bg/stadium.png";
import { styles as s } from "../../../components/quick-match/quickTossStyles";
import { styles as home } from "../../styles/home";

type Face = "HEADS" | "TAILS";
type Team = "A" | "B";
type Decision = "Bat" | "Bowl";

export default function QuickToss() {
  const params = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamALogoUri?: string;
    teamBLogoUri?: string;
    overs?: string;
  }>();

  const teamAName = String(params.teamAName || "Team A");
  const teamBName = String(params.teamBName || "Team B");
  const teamALogoUri = String(params.teamALogoUri || "");
  const teamBLogoUri = String(params.teamBLogoUri || "");
  const overs = String(params.overs || "1");

  const [caller, setCaller] = useState<Team>("A");
  const [call, setCall] = useState<Face | null>(null);
  const [result, setResult] = useState<Face | null>(null);
  const [winner, setWinner] = useState<Team | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [tossing, setTossing] = useState(false);

  const spin = useRef(new Animated.Value(0)).current;

  const rotateY = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "1440deg"],
  });

  const callerName = caller === "A" ? teamAName : teamBName;

  const winnerName =
    winner === "A"
      ? teamAName
      : winner === "B"
      ? teamBName
      : "";

  function tossCoin() {
    if (!call || tossing || result) return;

    setTossing(true);

    const outcome: Face =
      Math.random() < 0.5 ? "HEADS" : "TAILS";

    spin.setValue(0);

    Animated.timing(spin, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: true,
    }).start(() => {
      const callerWon = call === outcome;

      setResult(outcome);

      setWinner(
        callerWon
          ? caller
          : caller === "A"
          ? "B"
          : "A"
      );

      setTossing(false);
    });
  }

  function startMatch() {
    if (!winner || !decision) return;

    let battingFirst: Team;

    if (decision === "Bat") {
      battingFirst = winner;
    } else {
      battingFirst = winner === "A" ? "B" : "A";
    }

    router.push({
      pathname: "/match/quick/scoring",
      params: {
        teamAName,
        teamBName,
        teamALogoUri,
        teamBLogoUri,
        overs,
        battingFirst,
        tossWinner: winner,
        decision,
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

        <SafeAreaView style={home.safe}>
          <ScrollView contentContainerStyle={s.content}>
            <View style={s.header}>
              <Pressable
                style={s.backBtn}
                onPress={() => router.back()}
              >
                <Text style={s.backText}>‹ Back</Text>
              </Pressable>

              <Text style={s.title}>Toss</Text>

              <View style={s.spacer} />
            </View>

            <View style={s.card}>
              <Text style={s.sectionTitle}>Caller</Text>

              <View style={s.row}>
                <Pressable
                  disabled={!!result}
                  onPress={() => setCaller("A")}
                  style={[
                    s.choice,
                    caller === "A" && s.choiceActive,
                  ]}
                >
                  <Text
                    style={[
                      s.choiceText,
                      caller === "A" &&
                        s.choiceTextActive,
                    ]}
                  >
                    {teamAName}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!!result}
                  onPress={() => setCaller("B")}
                  style={[
                    s.choice,
                    caller === "B" && s.choiceActive,
                  ]}
                >
                  <Text
                    style={[
                      s.choiceText,
                      caller === "B" &&
                        s.choiceTextActive,
                    ]}
                  >
                    {teamBName}
                  </Text>
                </Pressable>
              </View>

              <Text
                style={[
                  s.sectionTitle,
                  { marginTop: 18 },
                ]}
              >
                Call
              </Text>

              <View style={s.row}>
                <Pressable
                  disabled={!!result}
                  onPress={() => setCall("HEADS")}
                  style={[
                    s.choice,
                    call === "HEADS" && s.choiceActive,
                  ]}
                >
                  <Text
                    style={[
                      s.choiceText,
                      call === "HEADS" &&
                        s.choiceTextActive,
                    ]}
                  >
                    Heads
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!!result}
                  onPress={() => setCall("TAILS")}
                  style={[
                    s.choice,
                    call === "TAILS" && s.choiceActive,
                  ]}
                >
                  <Text
                    style={[
                      s.choiceText,
                      call === "TAILS" &&
                        s.choiceTextActive,
                    ]}
                  >
                    Tails
                  </Text>
                </Pressable>
              </View>

              {call ? (
                <Text style={s.note}>
                  {callerName} called{" "}
                  {call === "HEADS" ? "Heads" : "Tails"}
                </Text>
              ) : null}
            </View>

            {call ? (
              <View style={s.coinCard}>
                <Animated.View
                  style={[
                    s.coin,
                    {
                      transform: [
                        { perspective: 900 },
                        { rotateY },
                      ],
                    },
                  ]}
                >
                  <Text style={s.coinText}>
                    {result || call}
                  </Text>
                </Animated.View>

                <Text style={s.hint}>
                  {tossing
                    ? "Tossing..."
                    : result
                    ? `${result}`
                    : "Tap Toss Coin"}
                </Text>

                {!result ? (
                  <Pressable
                    disabled={tossing}
                    onPress={tossCoin}
                    style={[
                      s.tossBtn,
                      tossing && s.tossBtnDisabled,
                    ]}
                  >
                    <Text style={s.tossText}>
                      Toss Coin
                    </Text>
                  </Pressable>
                ) : null}

                {winner ? (
                  <Text style={s.result}>
                    {winnerName} won the toss
                  </Text>
                ) : null}
              </View>
            ) : null}

            {winner ? (
              <View style={s.card}>
                <Text style={s.sectionTitle}>
                  {winnerName} chooses
                </Text>

                <View style={s.row}>
                  <Pressable
                    onPress={() => setDecision("Bat")}
                    style={[
                      s.choice,
                      decision === "Bat" &&
                        s.choiceActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.choiceText,
                        decision === "Bat" &&
                          s.choiceTextActive,
                      ]}
                    >
                      Bat first
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setDecision("Bowl")}
                    style={[
                      s.choice,
                      decision === "Bowl" &&
                        s.choiceActive,
                    ]}
                  >
                    <Text
                      style={[
                        s.choiceText,
                        decision === "Bowl" &&
                          s.choiceTextActive,
                      ]}
                    >
                      Bowl first
                    </Text>
                  </Pressable>
                </View>

                {decision ? (
                  <Pressable
                    style={s.startBtn}
                    onPress={startMatch}
                  >
                    <Text style={s.startText}>
                      Start Quick Match
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}