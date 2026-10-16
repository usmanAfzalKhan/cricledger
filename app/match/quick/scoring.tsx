import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "../../../components/ui/AppAlert";

import bg from "../../../assets/bg/stadium.png";
import QuickOverProgress from "../../../components/quick-match/QuickOverProgress";
import QuickScorePad from "../../../components/quick-match/QuickScorePad";
import MatchScoringHeader from "../../../components/match-ui/MatchScoringHeader";
import MatchScoreCard from "../../../components/match-ui/MatchScoreCard";
import { styles as s } from "../../../components/quick-match/quickScoringStyles";
import {
  type QuickScoreState,
  useQuickScoring,
} from "../../../components/quick-match/useQuickScoring";
import { saveQuickProgress } from "../../../components/storage/progressStorage";
import { styles as home } from "../../styles/home";
import { useCricAudio } from "../../../components/audio/AudioProvider";
import MatchSfxToggle from "../../../components/audio/MatchSfxToggle";

type TeamID = "A" | "B";

export default function QuickScoring() {
  const {
    playBoundary,
    playWicket,
  } = useCricAudio();
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
    savedScore?: string;
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

  const restoredScore =
    useMemo<QuickScoreState | undefined>(() => {
      if (!p.savedScore) return undefined;

      try {
        return JSON.parse(
          String(p.savedScore)
        ) as QuickScoreState;
      } catch {
        return undefined;
      }
    }, [p.savedScore]);

  const scoring = useQuickScoring(
    limit,
    restoredScore
  );

  const [autoPrompted, setAutoPrompted] = useState(false);

  useEffect(() => {
    void saveQuickProgress({
      stage: "scoring",
      params: {
        teamAName,
        teamBName,
        teamALogoUri: String(
          p.teamALogoUri || ""
        ),
        teamBLogoUri: String(
          p.teamBLogoUri || ""
        ),
        overs: String(p.overs || limit),
        chaseOvers: String(
          p.chaseOvers || ""
        ),
        battingFirst: firstBatting,
        innings: secondInnings
          ? "2"
          : "1",
        target: String(target),
        firstRuns: String(
          p.firstRuns || "0"
        ),
        firstWickets: String(
          p.firstWickets || "0"
        ),
        firstBalls: String(
          p.firstBalls || "0"
        ),
      },
      score: scoring.score,
    });
  }, [scoring.score]);

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


  function handleQuickRun(
    run: number
  ) {
    if (
      run === 4 ||
      run === 6
    ) {
      playBoundary();
    }

    scoring.addRun(run);
  }

  function handleQuickWicket() {
    playWicket();

    scoring.addWicket();
  }

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

        <MatchSfxToggle />

        <SafeAreaView style={home.safe}>
          <ScrollView
            contentContainerStyle={s.screenContent}
          >
            <MatchScoringHeader
              title="Quick Scoring"
              inningsLabel={
                secondInnings
                  ? "2nd Innings"
                  : "1st Innings"
              }
              onBack={() =>
                router.back()
              }
            />

            <MatchScoreCard
              teamName={battingName}
              logoUri={logo}
              runs={scoring.runs}
              wickets={
                scoring.wickets
              }
              oversText={
                scoring.oversText
              }
              oversLimit={limit}
              runRate={
                scoring.runRate.toFixed(
                  2
                )
              }
              bowlingText={
                "Bowling: " +
                bowlingName
              }
              targetText={
                secondInnings
                  ? "Target " +
                    target +
                    " • Need " +
                    runsNeeded +
                    " from " +
                    ballsLeft +
                    " balls"
                  : undefined
              }
            />

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
              onRun={handleQuickRun}
              onWicket={handleQuickWicket}
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