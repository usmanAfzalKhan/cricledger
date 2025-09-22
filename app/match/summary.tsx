// app/match/summary.tsx
import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { ImageBackground, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../assets/bg/stadium.png";
import { styles as home } from "../styles/home";

export default function MatchSummary() {
  const { teamAName, teamAPlayers, teamBName, teamBPlayers, overs } =
    useLocalSearchParams<{
      teamAName: string;
      teamAPlayers: string;
      teamBName: string;
      teamBPlayers: string;
      overs: string;
    }>();

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 18 }}>
            <Text style={{ color: "#EDEFE6", fontSize: 22, fontWeight: "800" }}>
              Match Summary
            </Text>

            <Text style={{ color: "#EDEFE6" }}>
              {teamAName} ({teamAPlayers}) vs {teamBName} ({teamBPlayers})
            </Text>
            <Text style={{ color: "#EDEFE6" }}>Overs: {overs}</Text>

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
