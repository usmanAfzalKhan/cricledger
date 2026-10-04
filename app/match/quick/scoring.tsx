import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../../assets/bg/stadium.png";
import QuickOverProgress from "../../../components/quick-match/QuickOverProgress";
import QuickScorePad from "../../../components/quick-match/QuickScorePad";
import { styles as s } from "../../../components/quick-match/quickScoringStyles";
import { useQuickScoring } from "../../../components/quick-match/useQuickScoring";
import { styles as home } from "../../styles/home";

type TeamID = "A" | "B";

export default function QuickScoring() {
  const p = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamALogoUri?: string;
    teamBLogoUri?: string;
    overs?: string;
    chaseOvers?: string;
    battingFirst?: TeamID;
    innings?: string;
    target?: string;
    firstRuns?: string;
    firstWickets?: string;
    firstBalls?: string;
  }>();

  const teamAName = String(p.teamAName || "Team A");
  const teamBName = String(p.teamBName || "Team B");

  const firstBatting: TeamID =
    p.battingFirst === "B" ? "B" : "A";

  const secondInnings = p.innings === "2";

  const battingTeam: TeamID = secondInnings
    ? firstBatting === "A"
      ? "B"
      : "A"
    : firstBatting;

  const battingName =
    battingTeam === "A" ? teamAName : teamBName;

  const bowlingName =
    battingTeam === "A" ? teamBName : teamAName;

  const logo =
    battingTeam === "A"
      ? String(p.teamALogoUri || "")
      : String(p.teamBLogoUri || "");

  const limit = Math.max(
    1,
    Number(
      secondInnings
        ? p.chaseOvers || p.overs
        : p.overs
    ) || 1
  );

  const target = Number(p.target || 0);

  const scoring = useQuickScoring(limit);

  const [autoPrompted, setAutoPrompted] = useState(false);

  const targetReached =
    secondInnings && target > 0 && scoring.runs >= target;

  const scoringLocked =
    scoring.oversComplete || targetReached;

  const ballsLeft = Math.max(
    0,
    limit * 6 - scoring.legalBalls
  );

  const runsNeeded = Math.max(
    0,
    target - scoring.runs
  );

  function goToResult() {
    router.push({
      pathname: "/match/quick/result",
      params: {
        teamAName,
        teamBName,
        battingFirst: firstBatting,
        firstRuns: String(p.firstRuns || "0"),
        firstWickets: String(p.firstWickets || "0"),
        firstBalls: String(p.firstBalls || "0"),
        secondRuns: String(scoring.runs),
        secondWickets: String(scoring.wickets),
        secondBalls: String(scoring.legalBalls),
        target: String(target),
      },
    });
  }

  function confirmFinishMatch() {
    Alert.alert(
      "End Match?",
      "Check the score first. You can still go back and Undo if anything is wrong.",
      [
        {
          text: "Review / Undo",
          style: "cancel",
        },
        {
          text: "Continue",
          onPress: () => {
            Alert.alert(
              "Final Confirmation",
              "Are you sure the final score is correct?",
              [
                {
                  text: "Go Back",
                  style: "cancel",
                },
                {
                  text: "Finish Match",
                  style: "destructive",
                  onPress: goToResult,
                },
              ]
            );
          },
        },
      ]
    );
  }

  function endInnings() {
    if (secondInnings) {
      confirmFinishMatch();
      return;
    }

    Alert.alert(
      "End First Innings?",
      `${battingName} are ${scoring.runs}/${scoring.wickets}.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "End Innings",
          onPress: () => {
            router.push({
              pathname: "/match/quick/innings-break",
              params: {
                teamAName,
                teamBName,
                teamALogoUri: String(p.teamALogoUri || ""),
                teamBLogoUri: String(p.teamBLogoUri || ""),
                battingFirst: firstBatting,
                overs: String(limit),
                firstRuns: String(scoring.runs),
                firstWickets: String(scoring.wickets),
                firstBalls: String(scoring.legalBalls),
                target: String(scoring.runs + 1),
              },
            });
          },
        },
      ]
    );
  }

  useEffect(() => {
    if (!secondInnings) return;

    if (!targetReached && !scoring.oversComplete) {
      setAutoPrompted(false);
      return;
    }

    if (autoPrompted) return;

    setAutoPrompted(true);

    const timer = setTimeout(() => {
      confirmFinishMatch();
    }, 250);

    return () => clearTimeout(timer);
  }, [
    secondInnings,
    targetReached,
    scoring.oversComplete,
    autoPrompted,
  ]);

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
          <ScrollView
            contentContainerStyle={s.screenContent}
          >
            <View style={s.header}>
              <Pressable
                style={s.backButton}
                onPress={() => router.back()}
              >
                <Text style={s.backText}>‹ Back</Text>
              </Pressable>

              <View style={{ alignItems: "center" }}>
                <Text style={s.headerTitle}>
                  Quick Scoring
                </Text>
                <Text style={s.inningText}>
                  {secondInnings
                    ? "2nd Innings"
                    : "1st Innings"}
                </Text>
              </View>

              <View style={s.headerSpacer} />
            </View>

            <View style={s.scoreCard}>
              <View style={s.teamRow}>
                {logo ? (
                  <Image
                    source={{ uri: logo }}
                    style={s.logo}
                  />
                ) : null}

                <Text style={s.teamName}>
                  {battingName}
                </Text>

                <Text style={s.battingLabel}>
                  BATTING
                </Text>
              </View>

              <Text style={s.scoreMain}>
                {scoring.runs}/{scoring.wickets}
              </Text>

              <View style={s.scoreMetaRow}>
                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>OVERS</Text>
                  <Text style={s.metaValue}>
                    {scoring.oversText} / {limit}
                  </Text>
                </View>

                <View style={s.metaBox}>
                  <Text style={s.metaLabel}>
                    RUN RATE
                  </Text>
                  <Text style={s.metaValue}>
                    {scoring.runRate.toFixed(2)}
                  </Text>
                </View>
              </View>

              {secondInnings ? (
                <View style={s.chaseBox}>
                  <Text style={s.chaseText}>
                    Target {target} • Need {runsNeeded} from{" "}
                    {ballsLeft} balls
                  </Text>
                </View>
              ) : null}

              <Text
                style={[
                  s.muted,
                  {
                    textAlign: "center",
                    marginTop: 10,
                  },
                ]}
              >
                Bowling: {bowlingName}
              </Text>
            </View>

            {targetReached ? (
              <View style={s.statusBox}>
                <Text style={s.statusText}>
                  TARGET REACHED — review or finish match
                </Text>
              </View>
            ) : scoring.oversComplete ? (
              <View style={s.statusBox}>
                <Text style={s.statusText}>
                  OVERS COMPLETE — review or end innings
                </Text>
              </View>
            ) : null}

            <QuickOverProgress
              deliveries={scoring.currentOverDeliveries}
            />

            <QuickScorePad
              disabled={scoringLocked}
              canUndo={scoring.canUndo}
              endLabel={
                secondInnings
                  ? "Finish Match"
                  : "End Innings"
              }
              onRun={scoring.addRun}
              onWicket={scoring.addWicket}
              onExtra={scoring.addExtra}
              onUndo={scoring.undo}
              onEnd={endInnings}
            />
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}