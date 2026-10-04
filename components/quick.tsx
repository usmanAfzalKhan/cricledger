import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ImageBackground,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../../assets/bg/stadium.png";
import TeamLogoPicker from "../../../components/quick-match/TeamLogoPicker";
import { styles as home } from "../../styles/home";
import { styles as s } from "../../styles/match";

export default function QuickMatchSetup() {
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [teamALogoUri, setTeamALogoUri] = useState("");
  const [teamBLogoUri, setTeamBLogoUri] = useState("");
  const [overs, setOvers] = useState("");

  const isValid = useMemo(() => {
    const oversNumber = Number(overs);

    return (
      teamAName.trim().length > 0 &&
      teamBName.trim().length > 0 &&
      /^\d+$/.test(overs) &&
      oversNumber > 0
    );
  }, [teamAName, teamBName, overs]);

  async function onNext() {
    if (!isValid) return;

    try {
      await Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Medium
      );
    } catch {}

    router.push({
      pathname: "/match/quick/toss",
      params: {
        teamAName: teamAName.trim(),
        teamBName: teamBName.trim(),
        overs,
        ...(teamALogoUri
          ? { teamALogoUri }
          : {}),
        ...(teamBLogoUri
          ? { teamBLogoUri }
          : {}),
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
            { backgroundColor: "transparent" },
          ]}
        >
          <KeyboardAvoidingView
            behavior={
              Platform.OS === "ios" ? "padding" : "height"
            }
            style={{ flex: 1 }}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={Keyboard.dismiss}
            >
              <ScrollView
                contentContainerStyle={s.formWrap}
                keyboardShouldPersistTaps="handled"
              >
                <View style={s.headerRow}>
                  <Pressable
                    style={s.backBtn}
                    onPress={() => router.back()}
                  >
                    <Text style={s.backIcon}>←</Text>
                    <Text style={s.backText}>Home</Text>
                  </Pressable>

                  <Text style={s.title}>Quick Match</Text>

                  <View style={{ width: 64 }} />
                </View>

                <View style={s.card}>
                  <Text style={s.label}>
                    Team A — Enter Team Name
                  </Text>

                  <TextInput
                    value={teamAName}
                    onChangeText={setTeamAName}
                    placeholder="e.g., Panthers"
                    placeholderTextColor="rgba(237,239,230,0.6)"
                    style={s.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />

                  <TeamLogoPicker
                    label="Team A Logo (optional)"
                    uri={teamALogoUri}
                    onChange={setTeamALogoUri}
                  />

                  <Text
                    style={[s.label, { marginTop: 14 }]}
                  >
                    Team B — Enter Team Name
                  </Text>

                  <TextInput
                    value={teamBName}
                    onChangeText={setTeamBName}
                    placeholder="e.g., Tigers"
                    placeholderTextColor="rgba(237,239,230,0.6)"
                    style={s.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />

                  <TeamLogoPicker
                    label="Team B Logo (optional)"
                    uri={teamBLogoUri}
                    onChange={setTeamBLogoUri}
                  />

                  <Text
                    style={[s.label, { marginTop: 14 }]}
                  >
                    Number of Overs
                  </Text>

                  <TextInput
                    value={overs}
                    onChangeText={(value) =>
                      setOvers(
                        value.replace(/[^0-9]/g, "")
                      )
                    }
                    placeholder="10"
                    placeholderTextColor="rgba(237,239,230,0.6)"
                    style={s.input}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />

                  <Pressable
                    onPress={onNext}
                    disabled={!isValid}
                    style={({ pressed }) => [
                      s.nextBtn,
                      !isValid && s.nextDisabled,
                      pressed &&
                        isValid && { opacity: 0.9 },
                    ]}
                  >
                    <Text style={s.nextIcon}>🪙</Text>
                    <Text style={s.nextText}>
                      Continue to Toss
                    </Text>
                  </Pressable>
                </View>
              </ScrollView>
            </Pressable>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}