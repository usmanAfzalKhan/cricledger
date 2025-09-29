// app/match/summary.tsx
import { Link, useLocalSearchParams } from "expo-router";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";

export default function MatchSummary() {
  const {
    teamAName, teamAPlayers, teamBName, teamBPlayers, overs,
    result, superOver, aRuns, aWkts, bRuns, bWkts,
  } = useLocalSearchParams<{
    teamAName: string; teamAPlayers: string;
    teamBName: string; teamBPlayers: string;
    overs: string;
    result?: string;
    superOver?: string;
    aRuns?: string; aWkts?: string;
    bRuns?: string; bWkts?: string;
  }>();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 14 }}>
            <Text style={{ color: "#EDEFE6", fontSize: 22, fontWeight: "800" }}>
              Match Summary
            </Text>

            <Text style={{ color: "#EDEFE6" }}>
              {teamAName} ({teamAPlayers}) vs {teamBName} ({teamBPlayers})
            </Text>
            <Text style={{ color: "#EDEFE6" }}>Overs: {overs}</Text>

            {(aRuns != null || bRuns != null) && (
              <Text style={{ color: "#EDEFE6" }}>
                {teamAName}: {aRuns ?? "-"} / {aWkts ?? "-"}  •  {teamBName}: {bRuns ?? "-"} / {bWkts ?? "-"}
              </Text>
            )}

            {result ? (
              <Text style={{ color: "#EDEFE6", fontSize: 18, fontWeight: "800" }}>
                {result}
              </Text>
            ) : null}

            {superOver === "1" ? (
              <Text style={{ color: "#EDEFE6" }}>Went to Super Over</Text>
            ) : null}

            <Link href="/" asChild>
              <Pressable
                style={{
                  backgroundColor: "#68B984",
                  paddingVertical: 14,
                  borderRadius: 14,
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Text style={{ color: "#0B1220", fontWeight: "800" }}>Back to Home</Text>
              </Pressable>
            </Link>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
