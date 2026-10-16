import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import bg from "../../assets/bg/stadium.png";

import AnimatedSection from "../../components/ui/AnimatedSection";
import GameButton from "../../components/ui/GameButton";
import GameHeader from "../../components/ui/GameHeader";
import GameScreen from "../../components/ui/GameScreen";
import TeamEntry from "../../components/ui/TeamEntry";

export default function MatchSetup() {

  const p = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;

    teamAPlayers?: string;
    teamBPlayers?: string;

    overs?: string;

    teamALogoUri?: string;
    teamBLogoUri?: string;
  }>();

  const [teamAName, setTeamAName] = useState(String(p.teamAName || ""));

  const [teamBName, setTeamBName] = useState(String(p.teamBName || ""));

  const [teamAPlayers, setTeamAPlayers] = useState(
    String(p.teamAPlayers || ""),
  );

  const [teamBPlayers, setTeamBPlayers] = useState(
    String(p.teamBPlayers || ""),
  );

  const [overs, setOvers] = useState(String(p.overs || ""));

  const [teamALogoUri, setTeamALogoUri] = useState(
    String(p.teamALogoUri || ""),
  );

  const [teamBLogoUri, setTeamBLogoUri] = useState(
    String(p.teamBLogoUri || ""),
  );

  const isValid = useMemo(() => {
    const a = Number(teamAPlayers);

    const b = Number(teamBPlayers);

    const o = Number(overs);

    return (
      teamAName.trim().length > 0 &&
      teamBName.trim().length > 0 &&
      Number.isInteger(a) &&
      Number.isInteger(b) &&
      a >= 2 &&
      b >= 2 &&
      Number.isInteger(o) &&
      o > 0
    );
  }, [teamAName, teamBName, teamAPlayers, teamBPlayers, overs]);

  async function onNext() {
    Keyboard.dismiss();

    if (!isValid) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const params: Record<string, string> = {
      teamAName: teamAName.trim(),

      teamBName: teamBName.trim(),

      teamAPlayers,
      teamBPlayers,
      overs,
    };

    if (teamALogoUri) {
      params.teamALogoUri = teamALogoUri;
    }

    if (teamBLogoUri) {
      params.teamBLogoUri = teamBLogoUri;
    }

    router.push({
      pathname: "/match/players",

      params,
    });
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <GameScreen background={bg}>
        <GameHeader
          title="Match Setup"
          subtitle="Set the teams and match length. You can add player names next."
          step="1 / 4"
          showBack
          onBack={() => router.back()}
        />

        <AnimatedSection delay={70}>
          <TeamEntry
            label="TEAM A"
            teamName={teamAName}
            onTeamNameChange={setTeamAName}
            logoUri={teamALogoUri}
            onLogoChange={setTeamALogoUri}
            playerCount={teamAPlayers}
            onPlayerCountChange={setTeamAPlayers}
            showPlayerCount
          />
        </AnimatedSection>

        <AnimatedSection delay={140}>
          <View style={s.versus}>
            <View style={s.versusLine} />

            <Text style={s.versusText}>VS</Text>

            <View style={s.versusLine} />
          </View>

          <TeamEntry
            label="TEAM B"
            teamName={teamBName}
            onTeamNameChange={setTeamBName}
            logoUri={teamBLogoUri}
            onLogoChange={setTeamBLogoUri}
            playerCount={teamBPlayers}
            onPlayerCountChange={setTeamBPlayers}
            showPlayerCount
          />
        </AnimatedSection>

        <AnimatedSection delay={210} style={s.oversSection}>
          <View>
            <Text style={s.oversLabel}>OVERS</Text>

            <Text style={s.oversHint}>Match length</Text>
          </View>

          <TextInput
            value={overs}
            onChangeText={(value) => setOvers(value.replace(/[^0-9]/g, ""))}
            placeholder="10"
            placeholderTextColor="rgba(255,255,255,0.24)"
            keyboardType="number-pad"
            style={s.oversInput}
          />
        </AnimatedSection>

        <AnimatedSection delay={280} style={s.continueWrap}>
          {!isValid ? (
            <Text style={s.help}>
              Enter both team names, at least 2 players per team, and the number
              of overs.
            </Text>
          ) : (
            <Text style={s.ready}>Ready to continue</Text>
          )}

          <GameButton
            variant="primary"
            title="Continue"
            subtitle="Add players"
            rightText="→"
            disabled={!isValid}
            onPress={onNext}
          />
        </AnimatedSection>
      </GameScreen>
    </Pressable>
  );
}

const s = StyleSheet.create({
  versus: {
    flexDirection: "row",

    alignItems: "center",

    paddingTop: 8,
  },

  versusLine: {
    flex: 1,

    height: 1,

    backgroundColor: "rgba(255,255,255,0.07)",
  },

  versusText: {
    color: "rgba(255,255,255,0.30)",

    fontSize: 9,

    fontWeight: "900",

    letterSpacing: 1.5,

    marginHorizontal: 12,
  },

  oversSection: {
    minHeight: 90,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  oversLabel: {
    color: "#FFFFFF",

    fontSize: 15,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  oversHint: {
    color: "rgba(255,255,255,0.33)",

    fontSize: 10,

    marginTop: 4,
  },

  oversInput: {
    width: 74,

    color: "#79D99C",

    fontSize: 32,

    fontWeight: "900",

    textAlign: "center",

    paddingVertical: 4,

    borderBottomWidth: 2,

    borderBottomColor: "rgba(121,217,156,0.50)",
  },

  continueWrap: {
    marginTop: 24,

    paddingBottom: 28,
  },

  help: {
    color: "rgba(255,255,255,0.36)",

    fontSize: 10,

    lineHeight: 15,

    marginBottom: 10,

    textAlign: "center",
  },

  ready: {
    color: "#79D99C",

    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1,

    marginBottom: 10,

    textAlign: "center",
  },
});
