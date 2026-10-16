import { Alert } from "../../components/ui/AppAlert";
// app/match/toss.tsx
import {
  Link,
  router,
  useLocalSearchParams } from "expo-router";
import React,
  { useMemo,
  useRef,
  useState } from "react";
import {  Animated,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";
import { styles as s } from "../styles/toss";

type Face = "HEADS" | "TAILS";
type Decision = "Bat" | "Bowl";

type Params = {
  teamAName?: string;
  teamBName?: string;
  teamA?: string;
  teamB?: string;
  captainA?: string;
  captainB?: string;
  overs?: string; // ✅ carry overs
  // ✅ optional logos (support both keys)
  teamALogo?: string;
  teamBLogo?: string;
  teamALogoUri?: string;
  teamBLogoUri?: string;
};

function safeJSON<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function TossScreen() {
  const p = useLocalSearchParams<Params>();

  const teamAName = (p.teamAName && String(p.teamAName).trim()) || "Team A";
  const teamBName = (p.teamBName && String(p.teamBName).trim()) || "Team B";
  const teamA = safeJSON<string[]>(p.teamA, []);
  const teamB = safeJSON<string[]>(p.teamB, []);
  const captainA = (p.captainA && String(p.captainA)) || "";
  const captainB = (p.captainB && String(p.captainB)) || "";
  const overs = (p.overs && String(p.overs)) || ""; // ✅

  // ✅ sanitize & read logos (works with both param names)
  const sanitize = (u?: string) => (u && u !== "undefined" && u !== "null" ? u : "");
  const teamALogo = sanitize((p.teamALogo as string) || (p.teamALogoUri as string));
  const teamBLogo = sanitize((p.teamBLogo as string) || (p.teamBLogoUri as string));

  const preservedParams = useMemo(
    () => ({
      teamAName,
      teamBName,
      teamA: JSON.stringify(teamA),
      teamB: JSON.stringify(teamB),
      captainA,
      captainB,
      overs, // ✅ pass to scoring
      // ✅ keep logos flowing both ways
      teamALogo,
      teamBLogo,
      teamALogoUri: teamALogo,
      teamBLogoUri: teamBLogo,
    }),
    [teamAName, teamBName, teamA, teamB, captainA, captainB, overs, teamALogo, teamBLogo]
  );

  const [caller, setCaller] = useState<"A" | "B">("A");
  const [call, setCall] = useState<Face | null>(null);

  // Animation driver: progress 0→1, absolute angle = fromDeg + progress * deltaDeg
  const progress = useRef(new Animated.Value(0)).current;
  const fromDeg = useRef(new Animated.Value(0)).current;
  const deltaDeg = useRef(new Animated.Value(0)).current;
  const [baseDeg, setBaseDeg] = useState<number>(0);

  const [isTossing, setIsTossing] = useState(false);
  const [hasTossed, setHasTossed] = useState(false);
  const [resultFace, setResultFace] = useState<Face | null>(null);
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);

  // Animate angle (0..360)
  const angle = Animated.modulo(
    Animated.add(fromDeg, Animated.multiply(progress, deltaDeg)),
    360
  );

  const rotateY = angle.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Forgiving cross-fade ranges so TAILS never looks empty
  const frontOpacity = angle.interpolate({
    inputRange: [0, 60, 120, 180, 240, 300, 360],
    outputRange: [1, 1, 0, 0, 0, 1, 1],
    extrapolate: "clamp",
  });
  const backOpacity = angle.interpolate({
    inputRange: [0, 60, 120, 180, 240, 300, 360],
    outputRange: [0, 0, 1, 1, 1, 0, 0],
    extrapolate: "clamp",
  });

  const lift = progress.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, -26, -26, 0],
  });
  const wobble = progress.interpolate({
    inputRange: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
    outputRange: ["0deg", "-6deg", "4deg", "-3deg", "2deg", "-1.5deg", "1deg", "0deg"],
  });
  const scale = progress.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [1, 1.06, 1.06, 1],
  });

  // When user picks a side, immediately show that face on top.
  function onPick(side: Face) {
    if (isTossing || hasTossed) return;
    setCall(side);
    setResultFace(null);
    setWinner(null);
    setDecision(null);

    const deg = side === "HEADS" ? 0 : 180; // orient to the chosen face
    setBaseDeg(deg);
    fromDeg.setValue(deg);
    deltaDeg.setValue(0);
    progress.setValue(0);
  }

  function toss() {
    if (!call || isTossing || hasTossed) return;

    // Fair 50/50 outcome — independent of the user’s call
    const outcome: Face = Math.random() < 0.5 ? "HEADS" : "TAILS";

    // Spin 5..7 times and end on the outcome face relative to current base
    const spins = 5 + Math.floor(Math.random() * 3);
    const endDeg = baseDeg + spins * 360 + (outcome === "HEADS" ? 0 : 180);

    fromDeg.setValue(baseDeg);
    deltaDeg.setValue(endDeg - baseDeg);
    progress.setValue(0);

    setIsTossing(true);
    setResultFace(null);
    setWinner(null);
    setDecision(null);

    Animated.timing(progress, {
      toValue: 1,
      duration: 1700 + Math.floor(Math.random() * 400),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const nextBase = outcome === "HEADS" ? 0 : 180;
      setBaseDeg(nextBase);
      fromDeg.setValue(nextBase);
      deltaDeg.setValue(0);
      progress.setValue(0);

      setResultFace(outcome);

      // Winner = whoever called the outcome face
      const didCallerWin = call === outcome;
      setWinner(didCallerWin ? caller : caller === "A" ? "B" : "A");

      setIsTossing(false);
      setHasTossed(true); // only one toss allowed
    });
  }

  function onChoose(dec: Decision) {
    if (!winner) return;
    setDecision(dec);
  }

  function onStartGame() {
    if (!winner || !resultFace || !call || !decision) return;
    router.push({
      pathname: "/match/scoring",
      params: {
        ...preservedParams,
        tossWinner: winner,
        tossCall: call,
        tossResult: resultFace,
        decision,
      } as Record<string, string>,
    });
    Alert.alert(
      "Starting Match",
      `${winner === "A" ? teamAName : teamBName} will ${decision.toLowerCase()} first.`
    );
  }

  const winnerName = winner === "A" ? teamAName : winner === "B" ? teamBName : "";
  const callerName = caller === "A" ? teamAName : teamBName;

  // ✅ tiny logo component (after name)
  const Logo = ({ uri, size = 18 }: { uri?: string; size?: number }) =>
    !!uri ? (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          marginLeft: 8, // after the name
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.16)",
        }}
        resizeMode="cover"
      />
    ) : null;

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <KeyboardAvoidingView
            behavior={Platform.select({ ios: "padding", android: undefined })}
            style={{ flex: 1 }}
          >
            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
              {/* Header */}
              <View style={s.header}>
                <Link
                  href={{ pathname: "/match/lineups", params: preservedParams }}
                  style={s.backLink}
                >
                  ‹ Back
                </Link>
                <Text style={s.title}>Toss</Text>
                <View className="headerSpacer" style={s.headerSpacer} />
              </View>

              {/* Caller + Call */}
              <View style={s.card}>
                <Text style={s.sectionTitle}>Caller</Text>
                <View style={s.pillsRow}>
                  <Pressable
                    onPress={() => !isTossing && !hasTossed && setCaller("A")}
                    style={[s.pill, caller === "A" && s.pillActive]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", maxWidth: "100%" }}>
                      <Text
                        style={[s.pillText, caller === "A" && s.pillTextActive]}
                        numberOfLines={1}
                      >
                        {teamAName}
                      </Text>
                      <Logo uri={teamALogo} />
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => !isTossing && !hasTossed && setCaller("B")}
                    style={[s.pill, caller === "B" && s.pillActive]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", maxWidth: "100%" }}>
                      <Text
                        style={[s.pillText, caller === "B" && s.pillTextActive]}
                        numberOfLines={1}
                      >
                        {teamBName}
                      </Text>
                      <Logo uri={teamBLogo} />
                    </View>
                  </Pressable>
                </View>

                <Text style={[s.sectionTitle, { marginTop: 10 }]}>Call</Text>
                <View style={s.pillsRow}>
                  <Pressable
                    onPress={() => onPick("HEADS")}
                    disabled={hasTossed}
                    style={[s.pill, call === "HEADS" && s.pillActive]}
                  >
                    <Text style={[s.pillText, call === "HEADS" && s.pillTextActive]}>Heads</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onPick("TAILS")}
                    disabled={hasTossed}
                    style={[s.pill, call === "TAILS" && s.pillActive]}
                  >
                    <Text style={[s.pillText, call === "TAILS" && s.pillTextActive]}>Tails</Text>
                  </Pressable>
                </View>

                {call && (
                  <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 8 }}>
                    {callerName} called{" "}
                    <Text style={{ fontWeight: "800", color: "#fff" }}>
                      {call === "HEADS" ? "Heads" : "Tails"}
                    </Text>
                  </Text>
                )}
              </View>

              {/* Coin */}
              {call && (
                <View style={s.coinCard}>
                  <Pressable
                    onPress={toss}
                    disabled={isTossing || hasTossed}
                    style={({ pressed }) => [s.coinPress, (pressed || isTossing || hasTossed) && s.coinPressPressed]}
                  >
                    <Animated.View
                      style={[
                        s.coinWrap,
                        {
                          transform: [
                            { perspective: 1000 },
                            { translateY: lift },
                            { rotateY },
                            { rotateZ: wobble },
                            { scale },
                          ],
                        },
                      ]}
                      accessibilityRole="image"
                      accessibilityLabel={`Coin showing ${baseDeg === 0 ? "HEADS" : "TAILS"}`}
                    >
                      {/* HEADS */}
                      <Animated.View style={[s.face, { opacity: frontOpacity }]}>
                        <CoinHeads />
                      </Animated.View>
                      {/* TAILS */}
                      <Animated.View style={[s.face, s.faceBack, { opacity: backOpacity }]}>
                        <CoinTails />
                      </Animated.View>
                    </Animated.View>
                  </Pressable>

                  <Text style={s.hint}>
                    {isTossing ? "Tossing…" : hasTossed ? "Toss locked" : "Tap the coin to toss"}
                  </Text>

                  {!hasTossed && (
                    <Pressable onPress={toss} disabled={isTossing} style={[s.tossBtn, isTossing && s.tossBtnDisabled]}>
                      <Text style={s.tossBtnText}>Toss Coin</Text>
                    </Pressable>
                  )}

                  {resultFace && (
                    <View style={s.resultChip}>
                      <Text style={s.resultText}>
                        {resultFace} — {call === resultFace ? callerName : caller === "A" ? teamBName : teamAName} wins & decides
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Winner chooses */}
              {winner && (
                <View style={s.card}>
                  <Text style={s.sectionTitle}>{winnerName} chooses</Text>
                  <View style={s.actionsRow}>
                    <Pressable
                      onPress={() => onChoose("Bat")}
                      style={[s.actionBtn, decision === "Bat" ? s.actionBtnPrimary : s.actionBtnGhost]}
                    >
                      <Text style={decision === "Bat" ? s.actionTextPrimary : s.actionTextGhost}>
                        Bat first
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => onChoose("Bowl")}
                      style={[s.actionBtn, decision === "Bowl" ? s.actionBtnPrimary : s.actionBtnGhost]}
                    >
                      <Text style={decision === "Bowl" ? s.actionTextPrimary : s.actionTextGhost}>
                        Bowl first
                      </Text>
                    </Pressable>
                  </View>

                  {decision && (
                    <Text style={s.smallNote}>
                      {winnerName} chooses to {decision.toLowerCase()} first.
                    </Text>
                  )}

                  {decision && (
                    <Pressable
                      onPress={onStartGame}
                      style={[
                        s.tossBtn,
                        {
                          marginTop: 12,
                          alignSelf: "center",
                          backgroundColor: "#E53935",
                        },
                      ]}
                    >
                      <Text style={[s.tossBtnText, { color: "#fff" }]}>Start Game</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <View style={s.bottomSpace} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

/* ===========================
   SVG COIN (distinct faces)
   =========================== */

const COIN_W = 220;

function CoinFace({
  label,
}: {
  label: "HEADS" | "TAILS";
}) {
  return (
    <Svg
      width={COIN_W}
      height={COIN_W}
      viewBox="0 0 220 220"
    >
      <Circle
        cx={110}
        cy={110}
        r={101}
        fill="#E2C95F"
        stroke="#F5E59A"
        strokeWidth={8}
      />

      <Circle
        cx={110}
        cy={110}
        r={91}
        fill="none"
        stroke="rgba(80,65,20,0.16)"
        strokeWidth={2}
      />

      <SvgText
        x={110}
        y={121}
        textAnchor="middle"
        fontSize={34}
        fontWeight="900"
        fill="#493E17"
      >
        {label}
      </SvgText>
    </Svg>
  );
}

function CoinHeads() {
  return (
    <CoinFace label="HEADS" />
  );
}

function CoinTails() {
  return (
    <CoinFace label="TAILS" />
  );
}
