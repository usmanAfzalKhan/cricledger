// app/match/toss.tsx
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
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

  const preservedParams = useMemo(
    () => ({
      teamAName,
      teamBName,
      teamA: JSON.stringify(teamA),
      teamB: JSON.stringify(teamB),
      captainA,
      captainB,
    }),
    [teamAName, teamBName, teamA, teamB, captainA, captainB]
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

  // Animate angle (0..360)
  const angle = Animated.modulo(
    Animated.add(fromDeg, Animated.multiply(progress, deltaDeg)),
    360
  );

  const rotateY = angle.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Cross-fade faces so Android never shows mirrored text
  const frontOpacity = angle.interpolate({
    inputRange: [0, 90, 180, 270, 360],
    outputRange: [1, 0, 0, 0, 1],
    extrapolate: "clamp",
  });
  const backOpacity = angle.interpolate({
    inputRange: [0, 90, 180, 270, 360],
    outputRange: [0, 0, 1, 0, 0],
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

    const deg = side === "HEADS" ? 0 : 180; // <-- orient to the chosen face
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

    Animated.timing(progress, {
      toValue: 1,
      duration: 1700 + Math.floor(Math.random() * 400),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Park the coin explicitly on the OUTCOME face so UI always matches result.
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

  function onChoose(decision: Decision) {
    if (!winner || !resultFace || !call) return;
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
    Alert.alert("Toss Decision", `${winner === "A" ? teamAName : teamBName} chose to ${decision} first.`);
  }

  const winnerName = winner === "A" ? teamAName : winner === "B" ? teamBName : "";
  const callerName = caller === "A" ? teamAName : teamBName;

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
                <View style={s.headerSpacer} />
              </View>

              {/* Caller + Call */}
              <View style={s.card}>
                <Text style={s.sectionTitle}>Caller</Text>
                <View style={s.pillsRow}>
                  <Pressable
                    onPress={() => !isTossing && !hasTossed && setCaller("A")}
                    style={[s.pill, caller === "A" && s.pillActive]}
                  >
                    <Text style={[s.pillText, caller === "A" && s.pillTextActive]}>{teamAName}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => !isTossing && !hasTossed && setCaller("B")}
                    style={[s.pill, caller === "B" && s.pillActive]}
                  >
                    <Text style={[s.pillText, caller === "B" && s.pillTextActive]}>{teamBName}</Text>
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
                    <Pressable onPress={() => onChoose("Bat")} style={[s.actionBtn, s.actionBtnPrimary]}>
                      <Text style={s.actionTextPrimary}>Bat first</Text>
                    </Pressable>
                    <Pressable onPress={() => onChoose("Bowl")} style={[s.actionBtn, s.actionBtnGhost]}>
                      <Text style={s.actionTextGhost}>Bowl first</Text>
                    </Pressable>
                  </View>
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
const COIN_R = COIN_W / 2;

function CoinPlate({
  label,
  children,
}: {
  label: "HEADS" | "TAILS";
  children: React.ReactNode;
}) {
  const cx = COIN_R;
  const cy = COIN_R;
  const R = COIN_R - 10;

  return (
    <Svg width={COIN_W} height={COIN_W} viewBox={`0 0 ${COIN_W} ${COIN_W}`}>
    <Defs>
      <RadialGradient id={`${label}-base`} cx="48%" cy="44%" r="70%">
        <Stop offset="0%" stopColor="#FFF6D2" />
        <Stop offset="55%" stopColor="#DCC877" />
        <Stop offset="100%" stopColor="#9A8441" />
      </RadialGradient>
      <LinearGradient id={`${label}-wash`} x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#fff8d9" stopOpacity={0.35} />
        <Stop offset="50%" stopColor="#c5ad63" stopOpacity={0.15} />
        <Stop offset="100%" stopColor="#6f5e2b" stopOpacity={0.35} />
      </LinearGradient>
      <LinearGradient id={`${label}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFF0BE" />
        <Stop offset="50%" stopColor="#CDB571" />
        <Stop offset="100%" stopColor="#6C5A28" />
      </LinearGradient>
      <LinearGradient id={`${label}-emb`} x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#000" stopOpacity={0.22} />
        <Stop offset="48%" stopColor="#000" stopOpacity={0.06} />
        <Stop offset="52%" stopColor="#fff" stopOpacity={0.22} />
        <Stop offset="100%" stopColor="#fff" stopOpacity={0.12} />
      </LinearGradient>
    </Defs>

    <Circle cx={cx} cy={cy} r={R} fill={`url(#${label}-base)`} />
    <Path d={`M 0 0 H ${COIN_W} V ${COIN_W} H 0 Z`} fill={`url(#${label}-wash)`} opacity={0.7} />

    <Circle cx={cx} cy={cy} r={R - 8} stroke={`url(#${label}-rim)`} strokeWidth={3} fill="none" />
    <Circle cx={cx} cy={cy} r={R + 6} stroke={`url(#${label}-rim)`} strokeWidth={4} fill="none" />

    {Array.from({ length: 72 }).map((_, i) => {
      const a = (i * Math.PI * 2) / 72;
      const r1 = R + 2;
      const r2 = R + 6;
      const x1 = cx + r1 * Math.cos(a);
      const y1 = cy + r1 * Math.sin(a);
      const x2 = cx + r2 * Math.cos(a);
      const y2 = cy + r2 * Math.sin(a);
      return (
        <Path
          key={i}
          d={`M ${x1} ${y1} L ${x2} ${y2}`}
          stroke="#6C5B28"
          strokeOpacity={0.35}
          strokeWidth={1}
        />
      );
    })}

    <SvgText
      x={cx}
      y={cy - R * 0.46}
      fontSize={R * 0.28}
      fontWeight="800"
      fill="#4D3F18"
      opacity={0.92}
      textAnchor="middle"
      letterSpacing="2"
    >
      {label}
    </SvgText>

    <G>{children}</G>

    <Path
      d={`M ${cx - R * 0.78} ${cy - R * 0.24} A ${R * 0.95} ${R * 0.95} 0 0 1 ${cx + R * 0.78} ${cy - R * 0.38}`}
      stroke="#FFF7D6"
      strokeOpacity={0.5}
      strokeWidth={2}
      fill="none"
    />
    <Circle cx={cx} cy={cy} r={R - 12} stroke="#000" strokeOpacity={0.08} strokeWidth={4} fill="none" />
  </Svg>
  );
}

function CoinHeads() {
  const cx = COIN_R;
  const cy = COIN_R;
  return (
    <CoinPlate label="HEADS">
      {/* Helmet + bat (embossed) */}
      <Path
        d={`M ${cx - 42} ${cy - 16}
           c 16 -24, 52 -24, 72 -6
           c 12 12, 2 22, -12 22
           c -8 0, -16 -4, -24 -8
           c -16 -8, -32 -8, -46 0
           c -6 3, -10 2, -12 -2 z`}
        fill="url(#HEADS-emb)"
      />
      <Path d={`M ${cx - 26} ${cy + 2} H ${cx + 44}`} stroke="#2A2412" strokeOpacity={0.28} strokeWidth={3} />
      <Path d={`M ${cx - 22} ${cy + 10} H ${cx + 50}`} stroke="#2A2412" strokeOpacity={0.22} strokeWidth={3} />
      <Path
        d={`M ${cx + 44} ${cy + 24} l 14 -20 c 2 -3 6 -3 8 0 l 2 3
            c 1 2 1 5 -1 7 l -17 18 c -2 2 -5 3 -8 2 l -2 -1 c -3 -1 -4 -4 -2 -6 z`}
        fill="url(#HEADS-emb)"
      />
    </CoinPlate>
  );
}

function CoinTails() {
  const cx = COIN_R;
  const cy = COIN_R;
  return (
    <CoinPlate label="TAILS">
      {/* Ball + wickets (embossed) */}
      <Circle cx={cx - 34} cy={cy + 2} r={12} fill="url(#TAILS-emb)" />
      <Path
        d={`M ${cx - 44} ${cy + 2} a 12 12 0 0 1 20 0`}
        stroke="#2A2412"
        strokeOpacity={0.22}
        strokeWidth={3}
        fill="none"
      />
      <Path d={`M ${cx + 6} ${cy - 26} v 58`} stroke="url(#TAILS-emb)" strokeWidth={7} />
      <Path d={`M ${cx + 26} ${cy - 24} v 58`} stroke="url(#TAILS-emb)" strokeWidth={7} />
      <Path d={`M ${cx + 46} ${cy - 26} v 58`} stroke="url(#TAILS-emb)" strokeWidth={7} />
      <Path d={`M ${cx + 2} ${cy - 26} h 18`} stroke="#2A2412" strokeOpacity={0.22} strokeWidth={4} />
      <Path d={`M ${cx + 22} ${cy - 26} h 18`} stroke="#2A2412" strokeOpacity={0.22} strokeWidth={4} />
    </CoinPlate>
  );
}
