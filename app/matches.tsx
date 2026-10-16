import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";

import { useCallback, useState } from "react";

import {
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../assets/bg/stadium.png";

import { Alert } from "../components/ui/AppAlert";

import {
    deleteMatch,
    listMatches,
    loadFullMeta,
    loadQuickProgress,
    setActiveMatch,
    type MatchRecord,
} from "../components/storage/progressStorage";

export default function Matches() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  const refresh = useCallback(async () => {
    const saved = await listMatches();

    setMatches(saved);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const active = matches.filter((match) => match.status === "in-progress");

  const completed = matches.filter((match) => match.status === "completed");

  async function resume(match: MatchRecord) {
    await setActiveMatch(match.mode, match.id);

    if (match.mode === "full") {
      const saved = await loadFullMeta(match.id);

      if (!saved) {
        Alert.alert(
          "Match unavailable",
          "This saved match could not be loaded.",
        );

        return;
      }

      router.push({
        pathname: "/match/scoring",

        params: {
          ...saved.params,
          resume: "1",
        },
      } as any);

      return;
    }

    const saved = await loadQuickProgress(match.id);

    if (!saved) {
      Alert.alert(
        "Match unavailable",
        "This saved Quick Match could not be loaded.",
      );

      return;
    }

    if (saved.stage === "break") {
      router.push({
        pathname: "/match/quick/innings-break",

        params: saved.params,
      } as any);

      return;
    }

    router.push({
      pathname: "/match/quick/scoring",

      params: {
        ...saved.params,

        savedScore: saved.score ? JSON.stringify(saved.score) : "",
      },
    } as any);
  }

  function viewCompleted(match: MatchRecord) {
    router.push({
      pathname: "/match/history-detail",

      params: {
        id: match.id,
      },
    } as any);
  }

  function remove(match: MatchRecord) {
    const teamA = match.params?.teamAName || "Team A";

    const teamB = match.params?.teamBName || "Team B";

    Alert.alert(
      "Delete match?",
      `${teamA} vs ${teamB} will be permanently removed.`,
      [
        {
          text: "Keep Match",
          style: "cancel",
        },

        {
          text: "Delete Match",
          style: "destructive",

          onPress: async () => {
            await deleteMatch(match.id);

            await refresh();
          },
        },
      ],
    );
  }

  return (
    <View style={s.root}>
      <ImageBackground source={bg} resizeMode="cover" style={s.root}>
        <View style={s.scrim} />

        <SafeAreaView style={s.safe}>
          <View style={s.header}>
            <Pressable style={s.back} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={s.eyebrow}>CRICLEDGER</Text>

              <Text style={s.title}>Match History</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
          >
            <Text style={s.sectionLabel}>ACTIVE MATCHES</Text>

            {active.length === 0 ? (
              <EmptyRow text="No paused matches" />
            ) : (
              active.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  completed={false}
                  onPress={() => void resume(match)}
                  onDelete={() => remove(match)}
                />
              ))
            )}

            <Text
              style={[
                s.sectionLabel,
                {
                  marginTop: 32,
                },
              ]}
            >
              COMPLETED MATCHES
            </Text>

            {completed.length === 0 ? (
              <EmptyRow text="No completed matches yet" />
            ) : (
              completed.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  completed
                  onPress={() => viewCompleted(match)}
                  onDelete={() => remove(match)}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

function MatchRow({
  match,
  completed,
  onPress,
  onDelete,
}: {
  match: MatchRecord;
  completed: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const teamA = match.params?.teamAName || "Team A";

  const teamB = match.params?.teamBName || "Team B";

  const label = match.mode === "full" ? "FULL MATCH" : "QUICK MATCH";

  return (
    <View style={s.row}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [s.rowMain, pressed && s.pressed]}
      >
        <View style={[s.modeLine, completed && s.modeLineDone]} />

        <View
          style={{
            flex: 1,
          }}
        >
          <View style={s.rowTop}>
            <Text style={s.mode}>{label}</Text>

            {completed ? <Text style={s.finished}>FINAL</Text> : null}
          </View>

          <Text style={s.matchName} numberOfLines={1}>
            {teamA} vs {teamB}
          </Text>

          {completed && match.result ? (
            <Text numberOfLines={1} style={s.result}>
              {match.result}
            </Text>
          ) : (
            <Text style={s.result}>Match in progress</Text>
          )}
        </View>

        <View style={s.action}>
          <Text style={s.actionText}>
            {completed ? (match.mode === "full" ? "STATS" : "SCORE") : "RESUME"}
          </Text>

          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(255,255,255,0.45)"
          />
        </View>
      </Pressable>

      <Pressable onPress={onDelete} style={s.delete}>
        <Ionicons
          name="trash-outline"
          size={17}
          color="rgba(255,110,110,0.72)"
        />
      </Pressable>
    </View>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyText}>{text}</Text>
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

    backgroundColor: "rgba(3,10,14,0.82)",
  },

  safe: {
    flex: 1,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 17,

    paddingTop: 9,

    paddingBottom: 18,

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

    letterSpacing: 2,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 28,

    fontWeight: "900",

    letterSpacing: -0.8,

    marginTop: 2,
  },

  content: {
    paddingHorizontal: 17,

    paddingBottom: 50,
  },

  sectionLabel: {
    color: "rgba(255,255,255,0.40)",

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1.5,

    marginBottom: 8,
  },

  row: {
    flexDirection: "row",

    alignItems: "center",

    minHeight: 82,

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.075)",
  },

  rowMain: {
    flex: 1,

    minHeight: 82,

    flexDirection: "row",

    alignItems: "center",
  },

  pressed: {
    opacity: 0.62,
  },

  modeLine: {
    width: 3,
    height: 42,

    borderRadius: 3,

    backgroundColor: "#79D99C",

    marginRight: 13,
  },

  modeLineDone: {
    backgroundColor: "rgba(255,255,255,0.28)",
  },

  rowTop: {
    flexDirection: "row",

    alignItems: "center",

    gap: 8,
  },

  mode: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1,
  },

  finished: {
    color: "rgba(255,255,255,0.36)",

    fontSize: 7,

    fontWeight: "900",

    letterSpacing: 1,
  },

  matchName: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "900",

    marginTop: 4,
  },

  result: {
    color: "rgba(255,255,255,0.37)",

    fontSize: 10,

    marginTop: 4,
  },

  action: {
    flexDirection: "row",

    alignItems: "center",

    gap: 3,

    marginLeft: 8,
  },

  actionText: {
    color: "rgba(255,255,255,0.47)",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1,
  },

  delete: {
    width: 42,
    height: 42,

    alignItems: "center",

    justifyContent: "center",
  },

  empty: {
    paddingVertical: 24,

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  emptyText: {
    color: "rgba(255,255,255,0.30)",

    fontSize: 12,
  },
});
