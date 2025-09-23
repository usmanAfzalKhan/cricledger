import * as Haptics from "expo-haptics";
import { Link, router } from "expo-router";
import React, { useMemo, useState } from "react";
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

// same background + global overlays
import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";

// form styles for this screen
import { styles as s } from "../styles/match";

export default function MatchSetup() {
  const [teamAName, setTeamAName] = useState("");
  const [teamAPlayers, setTeamAPlayers] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [teamBPlayers, setTeamBPlayers] = useState("");
  const [overs, setOvers] = useState("");

  const isDigits = (v: string) => /^\d+$/.test(v);

  const isValid = useMemo(() => {
    return (
      teamAName.trim().length > 0 &&
      teamBName.trim().length > 0 &&
      isDigits(teamAPlayers) &&
      isDigits(teamBPlayers) &&
      isDigits(overs)
    );
  }, [teamAName, teamBName, teamAPlayers, teamBPlayers, overs]);

  async function onNext() {
    if (!isValid) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    router.push({
      pathname: "/match/players",
      params: {
        teamAName: teamAName.trim(),
        teamAPlayers,
        teamBName: teamBName.trim(),
        teamBPlayers,
        overs,
      },
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
              <ScrollView
                contentContainerStyle={s.formWrap}
                keyboardShouldPersistTaps="handled"
              >
                {/* Header: Back + Title */}
                <View style={s.headerRow}>
                  <Link href="/" asChild>
                    <Pressable style={s.backBtn}>
                      <Text style={s.backIcon}>←</Text>
                      <Text style={s.backText}>Home</Text>
                    </Pressable>
                  </Link>
                  <Text style={s.title}>Start Match</Text>
                  <View style={{ width: 64 }} />
                </View>

                {/* Card */}
                <View style={s.card}>
                  {/* Team A row */}
                  <Text style={s.label}>Team A — Enter Team Name</Text>
                  <View style={s.row}>
                    <TextInput
                      value={teamAName}
                      onChangeText={setTeamAName}
                      placeholder="e.g., Panthers"
                      placeholderTextColor="rgba(237,239,230,0.6)"
                      style={[s.input, s.grow]}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                    <View style={{ width: 10 }} />
                    <View style={{ flexShrink: 0, minWidth: 84 }}>
                      <Text style={[s.label, { marginBottom: 6 }]}># of players</Text>
                      <TextInput
                        value={teamAPlayers}
                        onChangeText={(v) => setTeamAPlayers(v.replace(/[^0-9]/g, ""))}
                        placeholder="11"
                        placeholderTextColor="rgba(237,239,230,0.6)"
                        style={[s.input, s.playersBox]}
                        keyboardType="number-pad"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Team B row */}
                  <Text style={s.label}>Team B — Enter Team Name</Text>
                  <View style={s.row}>
                    <TextInput
                      value={teamBName}
                      onChangeText={setTeamBName}
                      placeholder="e.g., Tigers"
                      placeholderTextColor="rgba(237,239,230,0.6)"
                      style={[s.input, s.grow]}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                    <View style={{ width: 10 }} />
                    <View style={{ flexShrink: 0, minWidth: 84 }}>
                      <Text style={[s.label, { marginBottom: 6 }]}># of players</Text>
                      <TextInput
                        value={teamBPlayers}
                        onChangeText={(v) => setTeamBPlayers(v.replace(/[^0-9]/g, ""))}
                        placeholder="11"
                        placeholderTextColor="rgba(237,239,230,0.6)"
                        style={[s.input, s.playersBox]}
                        keyboardType="number-pad"
                        returnKeyType="next"
                      />
                    </View>
                  </View>

                  {/* Overs */}
                  <Text style={s.label}>Number of Overs</Text>
                  <TextInput
                    value={overs}
                    onChangeText={(v) => setOvers(v.replace(/[^0-9]/g, ""))}
                    placeholder="10"
                    placeholderTextColor="rgba(237,239,230,0.6)"
                    style={s.input}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />

                  {/* Next */}
                  <Pressable
                    onPress={onNext}
                    disabled={!isValid}
                    style={({ pressed }) => [
                      s.nextBtn,
                      !isValid && s.nextDisabled,
                      pressed && isValid && { opacity: 0.9 },
                    ]}
                  >
                    <Text style={s.nextIcon}>➡️</Text>
                    <Text style={s.nextText}>Next</Text>
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
