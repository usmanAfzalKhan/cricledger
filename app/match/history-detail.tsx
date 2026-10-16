import { Ionicons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { useEffect, useState } from "react";

import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../assets/bg/stadium.png";

import { getMatch } from "../../components/storage/progressStorage";

import type {
    Batter,
    Bowler,
    InningsState,
    MatchState,
} from "../../components/scoring/matchModel";

type AnyRecord = Record<string, any>;

type QuickFinal = {
  firstRuns: number;
  firstWickets: number;
  firstBalls: number;

  secondRuns: number;
  secondWickets: number;
  secondBalls: number;
};

function findObject(root: any, test: (value: any) => boolean) {
  if (!root) {
    return null;
  }

  const stack = [root];

  const seen = new Set<any>();

  while (stack.length > 0) {
    const value = stack.pop();

    if (!value || typeof value !== "object" || seen.has(value)) {
      continue;
    }

    seen.add(value);

    if (test(value)) {
      return value;
    }

    for (const child of Object.values(value)) {
      if (child && typeof child === "object") {
        stack.push(child);
      }
    }
  }

  return null;
}

function findFullState(match: AnyRecord): MatchState | null {
  return findObject(
    match,

    (value) =>
      Array.isArray(value?.innings) &&
      value.innings.length >= 2 &&
      typeof value?.matchOver === "boolean",
  ) as MatchState | null;
}

function findQuickFinal(match: AnyRecord): QuickFinal | null {
  return findObject(
    match,

    (value) =>
      typeof value?.firstRuns === "number" &&
      typeof value?.firstWickets === "number" &&
      typeof value?.firstBalls === "number" &&
      typeof value?.secondRuns === "number" &&
      typeof value?.secondWickets === "number" &&
      typeof value?.secondBalls === "number",
  ) as QuickFinal | null;
}

function oversFromBalls(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`;
}

function fullOvers(innings: InningsState) {
  return `${innings.completedOvers}.${innings.legalBalls}`;
}

function fullBalls(innings: InningsState) {
  return innings.completedOvers * 6 + innings.legalBalls;
}

function runRate(runs: number, balls: number) {
  if (balls <= 0) {
    return "0.00";
  }

  return (runs / (balls / 6)).toFixed(2);
}

function strikeRate(batter: Batter) {
  if (batter.balls <= 0) {
    return "0.00";
  }

  return ((batter.runs / batter.balls) * 100).toFixed(1);
}

function economy(bowler: Bowler) {
  if (bowler.legalBalls <= 0) {
    return "0.00";
  }

  return (bowler.conceded / (bowler.legalBalls / 6)).toFixed(2);
}

function dismissal(batter: Batter) {
  if (!batter.out) {
    return "not out";
  }

  if (batter.out.how === "Bowled") {
    return batter.out.by ? `b ${batter.out.by}` : "bowled";
  }

  if (batter.out.how === "Caught") {
    const catcher = batter.out.catcher ? `c ${batter.out.catcher}` : "caught";

    return batter.out.by ? `${catcher} b ${batter.out.by}` : catcher;
  }

  if (batter.out.how === "Run-out") {
    return batter.out.runOutBy ? `run out (${batter.out.runOutBy})` : "run out";
  }

  return "retired";
}

function bowlerWickets(innings: InningsState, bowlerName: string) {
  return innings.batters.filter(
    (batter) => batter.out?.by === bowlerName && batter.out?.how !== "Run-out",
  ).length;
}

export default function HistoryDetail() {
  const p = useLocalSearchParams<{
    id?: string;
  }>();

  const [match, setMatch] = useState<AnyRecord | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    void (async () => {
      try {
        const saved = p.id ? await getMatch(String(p.id)) : null;

        if (alive) {
          setMatch(saved as AnyRecord | null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [p.id]);

  if (loading) {
    return (
      <ScreenShell>
        <Text style={s.loading}>Loading scorecard...</Text>
      </ScreenShell>
    );
  }

  if (!match) {
    return (
      <ScreenShell>
        <View style={s.centerMessage}>
          <Text style={s.bigMessage}>Match unavailable</Text>

          <Text style={s.muted}>This saved match could not be loaded.</Text>
        </View>
      </ScreenShell>
    );
  }

  const teamA = match.params?.teamAName || "Team A";

  const teamB = match.params?.teamBName || "Team B";

  const result = match.result || "";

  if (match.mode === "quick") {
    const final = findQuickFinal(match);

    return (
      <ScreenShell>
        <Header eyebrow="QUICK MATCH" title={`${teamA} vs ${teamB}`} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scroll}
        >
          <ResultCard result={result || "Match Complete"} />

          {final ? (
            <QuickScoreboard match={match} final={final} />
          ) : (
            <Unavailable />
          )}
        </ScrollView>
      </ScreenShell>
    );
  }

  const state = findFullState(match);

  return (
    <ScreenShell>
      <Header eyebrow="FULL MATCH" title={`${teamA} vs ${teamB}`} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <ResultCard result={result || state?.result || "Match Complete"} />

        {state ? (
          <>
            <InningsCard label="1ST INNINGS" innings={state.innings[0]} />

            <InningsCard label="2ND INNINGS" innings={state.innings[1]} />

            {state.superOvers ? (
              <>
                <Text style={s.sectionHeading}>SUPER OVER</Text>

                <InningsCard
                  label="SUPER OVER 1"
                  innings={state.superOvers.innings[0]}
                />

                <InningsCard
                  label="SUPER OVER 2"
                  innings={state.superOvers.innings[1]}
                />
              </>
            ) : null}
          </>
        ) : (
          <Unavailable />
        )}
      </ScrollView>
    </ScreenShell>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.root}>
      <ImageBackground source={bg} resizeMode="cover" style={s.root}>
        <View style={s.scrim} />

        <SafeAreaView style={s.safe}>{children}</SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={s.header}>
      <Pressable style={s.back} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={s.eyebrow}>{eyebrow}</Text>

        <Text numberOfLines={1} style={s.title}>
          {title}
        </Text>
      </View>
    </View>
  );
}

function ResultCard({ result }: { result: string }) {
  return (
    <View style={s.resultCard}>
      <Text style={s.resultLabel}>FINAL RESULT</Text>

      <Text style={s.resultText}>{result}</Text>
    </View>
  );
}

function QuickScoreboard({
  match,
  final,
}: {
  match: AnyRecord;

  final: QuickFinal;
}) {
  const battingFirst = match.params?.battingFirst === "B" ? "B" : "A";

  const teamA = match.params?.teamAName || "Team A";

  const teamB = match.params?.teamBName || "Team B";

  const firstName = battingFirst === "A" ? teamA : teamB;

  const secondName = battingFirst === "A" ? teamB : teamA;

  return (
    <View style={s.scoreCard}>
      <ScoreLine
        team={firstName}
        runs={final.firstRuns}
        wickets={final.firstWickets}
        balls={final.firstBalls}
      />

      <View style={s.divider} />

      <ScoreLine
        team={secondName}
        runs={final.secondRuns}
        wickets={final.secondWickets}
        balls={final.secondBalls}
      />
    </View>
  );
}

function ScoreLine({
  team,
  runs,
  wickets,
  balls,
}: {
  team: string;
  runs: number;
  wickets: number;
  balls: number;
}) {
  return (
    <View style={s.scoreLine}>
      <View style={{ flex: 1 }}>
        <Text style={s.teamName}>{team}</Text>

        <Text style={s.overs}>{oversFromBalls(balls)} overs</Text>
      </View>

      <Text style={s.bigScore}>
        {runs}/{wickets}
      </Text>
    </View>
  );
}

function InningsCard({
  label,
  innings,
}: {
  label: string;
  innings: InningsState;
}) {
  const balls = fullBalls(innings);

  return (
    <View style={s.inningsWrap}>
      <Text style={s.inningsLabel}>{label}</Text>

      <View style={s.inningsTop}>
        <View style={{ flex: 1 }}>
          <Text style={s.teamName}>{innings.battingTeamName}</Text>

          <Text style={s.overs}>
            {fullOvers(innings)} overs · RR {runRate(innings.runs, balls)}
          </Text>
        </View>

        <Text style={s.bigScore}>
          {innings.runs}/{innings.wickets}
        </Text>
      </View>

      <Text style={s.tableTitle}>BATTING</Text>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, s.nameColumn]}>BATTER</Text>

        <Text style={s.statHeader}>R</Text>

        <Text style={s.statHeader}>B</Text>

        <Text style={[s.statHeader, s.srColumn]}>SR</Text>
      </View>

      {innings.batters.map((batter, index) => (
        <View key={`${batter.name}-${index}`} style={s.playerRow}>
          <View style={s.nameColumn}>
            <Text style={s.playerName} numberOfLines={1}>
              {batter.name}
            </Text>

            <Text style={s.dismissal} numberOfLines={1}>
              {dismissal(batter)}
            </Text>
          </View>

          <Text style={s.statValue}>{batter.runs}</Text>

          <Text style={s.statValue}>{batter.balls}</Text>

          <Text style={[s.statValue, s.srColumn]}>{strikeRate(batter)}</Text>
        </View>
      ))}

      <Text
        style={[
          s.tableTitle,
          {
            marginTop: 25,
          },
        ]}
      >
        BOWLING
      </Text>

      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, s.nameColumn]}>BOWLER</Text>

        <Text style={s.statHeader}>O</Text>

        <Text style={s.statHeader}>R</Text>

        <Text style={s.statHeader}>W</Text>

        <Text style={[s.statHeader, s.srColumn]}>ECO</Text>
      </View>

      {innings.bowlers
        .filter((bowler) => bowler.legalBalls > 0 || bowler.conceded > 0)
        .map((bowler, index) => (
          <View key={`${bowler.name}-${index}`} style={s.playerRow}>
            <Text style={[s.playerName, s.nameColumn]} numberOfLines={1}>
              {bowler.name}
            </Text>

            <Text style={s.statValue}>{oversFromBalls(bowler.legalBalls)}</Text>

            <Text style={s.statValue}>{bowler.conceded}</Text>

            <Text style={s.statValue}>
              {bowlerWickets(innings, bowler.name)}
            </Text>

            <Text style={[s.statValue, s.srColumn]}>{economy(bowler)}</Text>
          </View>
        ))}

      {innings.bowlers.every(
        (bowler) => bowler.legalBalls === 0 && bowler.conceded === 0,
      ) ? (
        <Text style={s.noStats}>No bowling figures recorded.</Text>
      ) : null}
    </View>
  );
}

function Unavailable() {
  return (
    <View style={s.unavailable}>
      <Text style={s.bigMessage}>Scorecard unavailable</Text>

      <Text style={s.muted}>
        This older saved match does not contain the detailed data required for a
        scorecard.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,

    backgroundColor: "#071117",
  },

  scrim: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(3,10,14,0.84)",
  },

  safe: {
    flex: 1,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 17,

    paddingTop: 9,

    paddingBottom: 14,

    gap: 13,
  },

  back: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.055)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.08)",
  },

  eyebrow: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.8,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 21,

    fontWeight: "900",

    letterSpacing: -0.4,

    marginTop: 2,
  },

  scroll: {
    paddingHorizontal: 17,

    paddingBottom: 60,
  },

  loading: {
    color: "#FFFFFF",

    textAlign: "center",

    marginTop: 80,

    fontSize: 14,
  },

  centerMessage: {
    paddingHorizontal: 30,

    alignItems: "center",

    marginTop: 100,
  },

  resultCard: {
    paddingVertical: 18,

    paddingHorizontal: 17,

    borderRadius: 18,

    marginBottom: 20,

    backgroundColor: "rgba(121,217,156,0.07)",

    borderWidth: 1,

    borderColor: "rgba(121,217,156,0.20)",
  },

  resultLabel: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.5,
  },

  resultText: {
    color: "#FFFFFF",

    fontSize: 19,

    fontWeight: "900",

    marginTop: 5,
  },

  scoreCard: {
    borderTopWidth: 1,

    borderBottomWidth: 1,

    borderColor: "rgba(255,255,255,0.09)",
  },

  scoreLine: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 22,
  },

  divider: {
    height: 1,

    backgroundColor: "rgba(255,255,255,0.08)",
  },

  teamName: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "900",
  },

  overs: {
    color: "rgba(255,255,255,0.40)",

    fontSize: 10,

    marginTop: 4,
  },

  bigScore: {
    color: "#FFFFFF",

    fontSize: 31,

    fontWeight: "900",

    letterSpacing: -1,
  },

  sectionHeading: {
    color: "#79D99C",

    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1.4,

    marginTop: 15,

    marginBottom: 8,
  },

  inningsWrap: {
    marginBottom: 30,

    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.10)",
  },

  inningsLabel: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.5,

    paddingTop: 15,
  },

  inningsTop: {
    flexDirection: "row",

    alignItems: "center",

    paddingVertical: 15,
  },

  tableTitle: {
    color: "rgba(255,255,255,0.47)",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.4,

    marginBottom: 7,
  },

  tableHeader: {
    minHeight: 30,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.10)",
  },

  tableHeaderText: {
    color: "rgba(255,255,255,0.32)",

    fontSize: 8,

    fontWeight: "900",
  },

  statHeader: {
    width: 42,

    color: "rgba(255,255,255,0.32)",

    fontSize: 8,

    fontWeight: "900",

    textAlign: "right",
  },

  playerRow: {
    minHeight: 49,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.055)",
  },

  nameColumn: {
    flex: 1,

    paddingRight: 8,
  },

  srColumn: {
    width: 54,
  },

  playerName: {
    color: "#FFFFFF",

    fontSize: 11,

    fontWeight: "800",
  },

  dismissal: {
    color: "rgba(255,255,255,0.30)",

    fontSize: 8,

    marginTop: 2,
  },

  statValue: {
    width: 42,

    color: "rgba(255,255,255,0.76)",

    fontSize: 10,

    fontWeight: "800",

    textAlign: "right",
  },

  noStats: {
    color: "rgba(255,255,255,0.27)",

    fontSize: 10,

    paddingVertical: 16,
  },

  unavailable: {
    paddingVertical: 45,

    alignItems: "center",

    paddingHorizontal: 25,
  },

  bigMessage: {
    color: "#FFFFFF",

    fontSize: 18,

    fontWeight: "900",

    textAlign: "center",
  },

  muted: {
    color: "rgba(255,255,255,0.37)",

    fontSize: 11,

    lineHeight: 17,

    textAlign: "center",

    marginTop: 6,
  },
});
