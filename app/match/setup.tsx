// app/match/setup.tsx
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
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
  // ✅ if returning from Players, restore fields from URL params
  const p = useLocalSearchParams<{
    teamAName?: string;
    teamBName?: string;
    teamAPlayers?: string;
    teamBPlayers?: string;
    overs?: string;
    // optional logos (preserve if returning back)
    teamALogoUri?: string;
    teamBLogoUri?: string;
  }>();

  const [teamAName, setTeamAName] = useState((p.teamAName as string) ?? "");
  const [teamAPlayers, setTeamAPlayers] = useState((p.teamAPlayers as string) ?? "");
  const [teamBName, setTeamBName] = useState((p.teamBName as string) ?? "");
  const [teamBPlayers, setTeamBPlayers] = useState((p.teamBPlayers as string) ?? "");
  const [overs, setOvers] = useState((p.overs as string) ?? "");

  // NEW: optional logos (restored from params if present)
  const [teamALogoUri, setTeamALogoUri] = useState<string>((p.teamALogoUri as string) ?? "");
  const [teamBLogoUri, setTeamBLogoUri] = useState<string>((p.teamBLogoUri as string) ?? "");

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

  async function pickLogo(setter: (uri: string) => void) {
    // request permission (gracefully handle denial)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      // soft fail: no alert spam — user can try again
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setter(res.assets[0].uri);
    }
  }

  async function onNext() {
    if (!isValid) return;

    // 🔹 MIN-2 GUARD (no UI rewrite): quietly block if either side < 2
    const aN = Number(teamAPlayers || "0");
    const bN = Number(teamBPlayers || "0");
    if (!Number.isFinite(aN) || !Number.isFinite(bN) || aN < 2 || bN < 2) {
      Alert.alert("Need at least 2 players", "Each team must have 2 or more players.");
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    // build params; include logos only if provided
    const params: Record<string, string> = {
      teamAName: teamAName.trim(),
      teamAPlayers,
      teamBName: teamBName.trim(),
      teamBPlayers,
      overs,
    };
    if (teamALogoUri) params.teamALogoUri = teamALogoUri;
    if (teamBLogoUri) params.teamBLogoUri = teamBLogoUri;

    router.push({
      pathname: "/match/players",
      params,
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

                  {/* NEW: Team A Logo (optional) */}
                  <Text style={[s.label, { marginTop: 10 }]}>Team A Logo (optional)</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.16)",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {teamALogoUri ? (
                        <Image
                          source={{ uri: teamALogoUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={{ color: "rgba(237,239,230,0.6)", fontSize: 10 }}>
                          no logo
                        </Text>
                      )}
                    </View>

                    <Pressable
                      onPress={() => pickLogo(setTeamALogoUri)}
                      style={({ pressed }) => [
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          backgroundColor: pressed
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.06)",
                          borderColor: "rgba(255,255,255,0.16)",
                        },
                      ]}
                    >
                      <Text style={{ color: "#EDEFE6", fontWeight: "800" }}>
                        {teamALogoUri ? "Change" : "Add Logo"}
                      </Text>
                    </Pressable>

                    {teamALogoUri ? (
                      <Pressable
                        onPress={() => setTeamALogoUri("")}
                        style={({ pressed }) => [
                          {
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1,
                            backgroundColor: pressed
                              ? "rgba(229,57,53,0.22)"
                              : "rgba(229,57,53,0.18)",
                            borderColor: "#E53935",
                          },
                        ]}
                      >
                        <Text style={{ color: "#fff", fontWeight: "900" }}>Remove</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {/* Team B row */}
                  <Text style={[s.label, { marginTop: 14 }]}>Team B — Enter Team Name</Text>
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

                  {/* NEW: Team B Logo (optional) */}
                  <Text style={[s.label, { marginTop: 10 }]}>Team B Logo (optional)</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.16)",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {teamBLogoUri ? (
                        <Image
                          source={{ uri: teamBLogoUri }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={{ color: "rgba(237,239,230,0.6)", fontSize: 10 }}>
                          no logo
                        </Text>
                      )}
                    </View>

                    <Pressable
                      onPress={() => pickLogo(setTeamBLogoUri)}
                      style={({ pressed }) => [
                        {
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1,
                          backgroundColor: pressed
                            ? "rgba(255,255,255,0.12)"
                            : "rgba(255,255,255,0.06)",
                          borderColor: "rgba(255,255,255,0.16)",
                        },
                      ]}
                    >
                      <Text style={{ color: "#EDEFE6", fontWeight: "800" }}>
                        {teamBLogoUri ? "Change" : "Add Logo"}
                      </Text>
                    </Pressable>

                    {teamBLogoUri ? (
                      <Pressable
                        onPress={() => setTeamBLogoUri("")}
                        style={({ pressed }) => [
                          {
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1,
                            backgroundColor: pressed
                              ? "rgba(229,57,53,0.22)"
                              : "rgba(229,57,53,0.18)",
                            borderColor: "#E53935",
                          },
                        ]}
                      >
                        <Text style={{ color: "#fff", fontWeight: "900" }}>Remove</Text>
                      </Pressable>
                    ) : null}
                  </View>

                  {/* Overs */}
                  <Text style={[s.label, { marginTop: 14 }]}>Number of Overs</Text>
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
