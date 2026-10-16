import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import bg from "../../../assets/bg/stadium.png";

import AnimatedSection from "../../../components/ui/AnimatedSection";
import GameButton from "../../../components/ui/GameButton";
import GameHeader from "../../../components/ui/GameHeader";
import GameScreen from "../../../components/ui/GameScreen";
import TeamEntry from "../../../components/ui/TeamEntry";

export default function QuickMatchSetup() {

  const [teamAName, setTeamAName] = useState("");

  const [teamBName, setTeamBName] = useState("");

  const [teamALogoUri, setTeamALogoUri] = useState("");

  const [teamBLogoUri, setTeamBLogoUri] = useState("");

  const [overs, setOvers] = useState("");

  const isValid = useMemo(() => {
    const value = Number(overs);

    return (
      teamAName.trim().length > 0 &&
      teamBName.trim().length > 0 &&
      Number.isInteger(value) &&
      value > 0
    );
  }, [teamAName, teamBName, overs]);

  async function onNext() {
    Keyboard.dismiss();

    if (!isValid) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    router.push({
      pathname: "/match/quick/toss",

      params: {
        teamAName: teamAName.trim(),

        teamBName: teamBName.trim(),

        overs,

        ...(teamALogoUri ? { teamALogoUri } : {}),

        ...(teamBLogoUri ? { teamBLogoUri } : {}),
      },
    });
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <GameScreen background={bg}>
        <GameHeader
          title="Quick Match"
          subtitle="Just the essentials. Pick the teams, overs, then toss."
          step="1 / 2"
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
          />
        </AnimatedSection>

        <AnimatedSection delay={210} style={s.overs}>
          <View>
            <Text style={s.oversTitle}>MATCH LENGTH</Text>

            <Text style={s.oversHint}>Number of overs</Text>
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

        <AnimatedSection delay={270} style={s.footer}>
          <GameButton
            variant="primary"
            title="Continue to Toss"
            subtitle="Flip the coin"
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

  overs: {
    minHeight: 90,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  oversTitle: {
    color: "#FFFFFF",

    fontSize: 14,

    fontWeight: "900",

    letterSpacing: 0.8,
  },

  oversHint: {
    color: "rgba(255,255,255,0.34)",

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

  footer: {
    marginTop: 25,

    paddingBottom: 28,
  },
});
