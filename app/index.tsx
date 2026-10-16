import { Ionicons } from "@expo/vector-icons";

import { useFocusEffect } from "@react-navigation/native";

import { router } from "expo-router";

import { useCallback, useState } from "react";

import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import bg from "../assets/bg/stadium.png";

import founderPhoto from "../assets/founder/founder.jpeg";

import LogoMark from "../components/LogoMark";

import AnimatedSection from "../components/ui/AnimatedSection";

import GameButton from "../components/ui/GameButton";

import GameScreen from "../components/ui/GameScreen";

import { Alert } from "../components/ui/AppAlert";

import {
  beginNewMatch,
  deleteMatch,
  listMatches,
  loadFullMeta,
  loadQuickProgress,
  setActiveMatch,
  type MatchMode,
  type MatchRecord,
} from "../components/storage/progressStorage";

const YOUTUBE = "https://youtube.com/@beyond-de-boundary?si=D5gq0pTxOFfmzAKr";

export default function Home() {
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  const refresh = useCallback(async () => {
    setMatches(await listMatches());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const active = matches.filter((match) => match.status === "in-progress");

  const completed = matches.filter((match) => match.status === "completed");

  async function startNew(mode: MatchMode) {
    await beginNewMatch(mode);

    if (mode === "full") {
      router.push("/match/setup");

      return;
    }

    router.push("/match/quick/setup");
  }

  async function resume(match: MatchRecord) {
    await setActiveMatch(match.mode, match.id);

    if (match.mode === "full") {
      const saved = await loadFullMeta(match.id);

      if (!saved) return;

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

    if (!saved) return;

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

  function removeMatch(match: MatchRecord) {
    const name = `${match.params.teamAName || "Team A"} vs ${
      match.params.teamBName || "Team B"
    }`;

    Alert.alert("Delete match?", `${name} will be permanently removed.`, [
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
    ]);
  }

  return (
    <GameScreen background={bg}>
      <AnimatedSection delay={30} style={s.hero}>
        <LogoMark size={88} />

        <Text style={s.brandTop}>CRICKET SCORING</Text>

        <Text style={s.brand}>CricLedger</Text>

        <Text style={s.tagline}>Match day, simplified.</Text>
      </AnimatedSection>

      {active.length > 0 ? (
        <AnimatedSection delay={90} style={s.section}>
          <Text style={s.sectionEyebrow}>CONTINUE</Text>

          <Text style={s.sectionTitle}>Your matches</Text>

          <Text style={s.sectionSub}>Every paused match stays separate.</Text>

          <View style={s.savedList}>
            {active.slice(0, 3).map((match) => (
              <SavedMatch
                key={match.id}
                match={match}
                onPress={() => void resume(match)}
                onDelete={() => removeMatch(match)}
              />
            ))}
          </View>

          {active.length > 3 ? (
            <Pressable
              onPress={() => router.push("/matches" as any)}
              style={s.viewAll}
            >
              <Text style={s.viewAllText}>
                View all {active.length} active matches
              </Text>
            </Pressable>
          ) : null}
        </AnimatedSection>
      ) : null}

      <AnimatedSection delay={150} style={s.section}>
        <Text style={s.sectionEyebrow}>NEW MATCH</Text>

        <Text style={s.sectionTitle}>Choose your mode</Text>

        <Text style={s.sectionSub}>
          Full setup or jump straight into scoring.
        </Text>

        <View style={s.modeButtons}>
          <GameButton
            variant="primary"
            title="Start Match"
            subtitle="Players, lineups, toss and full scoring"
            rightText=""
            onPress={() => void startNew("full")}
          />

          <GameButton
            variant="secondary"
            title="Quick Match"
            subtitle="Teams, toss and score"
            rightText=""
            onPress={() => void startNew("quick")}
          />
        </View>
      </AnimatedSection>

      <AnimatedSection delay={210} style={[s.section, s.moreSection]}>
        <Text style={s.sectionEyebrow}>MORE</Text>

        <Text style={s.sectionTitle}>Explore CricLedger</Text>

        <View style={s.menu}>
          <Pressable
            style={({ pressed }) => [s.menuRow, pressed && s.menuPressed]}
            onPress={() => router.push("/matches" as any)}
          >
            <View style={s.iconWrap}>
              <Ionicons name="time-outline" size={22} color="#79D99C" />
            </View>

            <View style={s.menuText}>
              <Text style={s.menuTitle}>Match History</Text>

              <Text style={s.menuSubtitle}>
                {active.length} active · {completed.length} completed
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.menuRow, pressed && s.menuPressed]}
            onPress={() => router.push("/ethics")}
          >
            <View style={s.iconWrap}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#79D99C"
              />
            </View>

            <View style={s.menuText}>
              <Text style={s.menuTitle}>Cricket Etiquette</Text>

              <Text style={s.menuSubtitle}>
                Spirit, respect and match-day conduct
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.menuRow, pressed && s.menuPressed]}
            onPress={() => router.push("/about")}
          >
            <Image source={founderPhoto} style={s.founderPhoto} />

            <View style={s.menuText}>
              <Text style={s.smallLabel}>FOUNDER</Text>

              <Text style={s.menuTitle}>Taha Khan</Text>

              <Text style={s.menuSubtitle}>Founder of CricLedger</Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          onPress={() => void Linking.openURL(YOUTUBE)}
          style={({ pressed }) => [s.youtube, pressed && s.youtubePressed]}
        >
          <View style={s.youtubeIcon}>
            <Ionicons name="logo-youtube" size={29} color="#FF6363" />
          </View>

          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={s.youtubeLabel}>YOUTUBE</Text>

            <Text style={s.youtubeTitle}>Beyond The Boundary</Text>

            <Text style={s.youtubeSub}>Cricket content from Taha Khan</Text>
          </View>
        </Pressable>
      </AnimatedSection>
    </GameScreen>
  );
}

function SavedMatch({
  match,
  onPress,
  onDelete,
}: {
  match: MatchRecord;

  onPress: () => void;

  onDelete: () => void;
}) {
  const teamA = match.params.teamAName || "Team A";

  const teamB = match.params.teamBName || "Team B";

  return (
    <View style={s.savedRow}>
      <Pressable onPress={onPress} style={s.savedMain}>
        <View style={s.savedMarker} />

        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={s.savedType}>
            {match.mode === "full" ? "FULL MATCH" : "QUICK MATCH"}
          </Text>

          <Text style={s.savedMatch} numberOfLines={1}>
            {teamA} vs {teamB}
          </Text>
        </View>

        <Text style={s.resume}>RESUME</Text>
      </Pressable>

      <Pressable style={s.delete} onPress={onDelete}>
        <Ionicons name="close" size={18} color="rgba(255,120,120,0.65)" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  hero: {
    alignItems: "center",

    paddingTop: 10,
    paddingBottom: 32,
  },

  brandTop: {
    color: "#79D99C",

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 2.2,

    marginTop: 9,
  },

  brand: {
    color: "#FFFFFF",

    fontSize: 42,

    fontWeight: "900",

    letterSpacing: -1.4,

    marginTop: 3,
  },

  tagline: {
    color: "rgba(255,255,255,0.42)",

    fontSize: 11,

    marginTop: 4,
  },

  section: {
    marginBottom: 32,
  },

  sectionEyebrow: {
    color: "#79D99C",

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1.8,
  },

  sectionTitle: {
    color: "#FFFFFF",

    fontSize: 24,

    fontWeight: "900",

    letterSpacing: -0.5,

    marginTop: 4,
  },

  sectionSub: {
    color: "rgba(255,255,255,0.39)",

    fontSize: 11,

    lineHeight: 16,

    marginTop: 4,

    marginBottom: 15,
  },

  modeButtons: {
    gap: 10,
  },

  savedList: {
    marginTop: 2,

    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.07)",
  },

  savedRow: {
    minHeight: 64,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  savedMain: {
    flex: 1,

    minHeight: 64,

    flexDirection: "row",

    alignItems: "center",
  },

  savedMarker: {
    width: 3,
    height: 31,

    borderRadius: 3,

    backgroundColor: "#79D99C",

    marginRight: 12,
  },

  savedType: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1,
  },

  savedMatch: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "800",

    marginTop: 3,
  },

  resume: {
    color: "rgba(255,255,255,0.40)",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.1,

    marginRight: 8,
  },

  delete: {
    width: 38,
    height: 38,

    alignItems: "center",

    justifyContent: "center",
  },

  viewAll: {
    alignSelf: "flex-start",

    paddingVertical: 12,
  },

  viewAllText: {
    color: "#79D99C",

    fontSize: 10,

    fontWeight: "900",
  },

  moreSection: {
    paddingBottom: 30,
  },

  menu: {
    marginTop: 12,

    borderTopWidth: 1,

    borderTopColor: "rgba(255,255,255,0.07)",
  },

  menuRow: {
    minHeight: 74,

    flexDirection: "row",

    alignItems: "center",

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  menuPressed: {
    opacity: 0.65,
  },

  iconWrap: {
    width: 48,
    height: 48,

    borderRadius: 24,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 13,

    backgroundColor: "rgba(121,217,156,0.08)",
  },

  founderPhoto: {
    width: 48,
    height: 48,

    borderRadius: 24,

    marginRight: 13,

    borderWidth: 1,

    borderColor: "rgba(121,217,156,0.26)",
  },

  menuText: {
    flex: 1,
  },

  smallLabel: {
    color: "#79D99C",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.1,

    marginBottom: 2,
  },

  menuTitle: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "900",
  },

  menuSubtitle: {
    color: "rgba(255,255,255,0.35)",

    fontSize: 10,

    marginTop: 3,
  },

  youtube: {
    minHeight: 88,

    flexDirection: "row",

    alignItems: "center",

    marginTop: 17,

    paddingHorizontal: 15,

    paddingVertical: 14,

    borderRadius: 19,

    backgroundColor: "rgba(255,255,255,0.035)",

    borderWidth: 1,

    borderColor: "rgba(255,255,255,0.075)",
  },

  youtubePressed: {
    opacity: 0.68,
  },

  youtubeIcon: {
    width: 51,
    height: 51,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",

    marginRight: 14,

    backgroundColor: "rgba(255,75,75,0.08)",
  },

  youtubeLabel: {
    color: "#FF7373",

    fontSize: 8,

    fontWeight: "900",

    letterSpacing: 1.5,
  },

  youtubeTitle: {
    color: "#FFFFFF",

    fontSize: 17,

    fontWeight: "900",

    marginTop: 2,
  },

  youtubeSub: {
    color: "rgba(255,255,255,0.36)",

    fontSize: 10,

    marginTop: 3,
  },
});
