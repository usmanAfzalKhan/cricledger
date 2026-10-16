import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

import AnimatedSection from "../components/ui/AnimatedSection";
import GameHeader from "../components/ui/GameHeader";
import GameScreen from "../components/ui/GameScreen";

const YOUTUBE = "https://youtube.com/@beyond-de-boundary?si=D5gq0pTxOFfmzAKr";

export default function About() {
  return (
    <GameScreen background={bg}>
      <GameHeader
        title="About the Founder"
        subtitle="The story behind CricLedger."
        showBack
        onBack={() => router.back()}
      />

      <AnimatedSection delay={70} style={s.hero}>
        <Image source={founderPhoto} style={s.photo} />

        <View style={s.heroText}>
          <Text style={s.name}>Taha Khan</Text>

          <Text style={s.role}>Founder of CricLedger</Text>

          <View style={s.locationRow}>
            <Ionicons
              name="location-outline"
              size={13}
              color="rgba(255,255,255,0.42)"
            />

            <Text style={s.location}>Greater Toronto Area</Text>
          </View>
        </View>
      </AnimatedSection>

      <AnimatedSection delay={140} style={s.about}>
        <Text style={s.label}>ABOUT TAHA</Text>

        <Text style={s.heading}>Cricket built around community</Text>

        <Text style={s.body}>
          Taha Khan organizes cricket matches and brings players together across
          the Greater Toronto Area.
        </Text>

        <Text style={s.body}>
          CricLedger grew from real match-day experience and the need for a
          scorer that is fast, clear and easy to use without unnecessary setup.
        </Text>

        <Text style={s.body}>
          The goal is simple: spend less time fighting with the scoring app and
          more time enjoying the match.
        </Text>
      </AnimatedSection>

      <AnimatedSection delay={210} style={s.youtubeSection}>
        <Text style={s.label}>BEYOND DE BOUNDARY</Text>

        <Pressable
          style={s.youtubeCard}
          onPress={() => void Linking.openURL(YOUTUBE)}
        >
          <View style={s.channelTop}>
            <View style={s.youtubeIcon}>
              <Ionicons name="logo-youtube" size={31} color="#FF5A5A" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.youtubeName}>Beyond The Boundary</Text>

              <Text style={s.youtubeHandle}>@beyond-de-boundary</Text>
            </View>
          </View>

          <Text style={s.channelText}>
            Follow Taha's cricket content, matches and stories beyond the
            scorecard.
          </Text>

          <View style={s.channelAction}>
            <Text style={s.channelActionText}>Open YouTube channel</Text>

            <Ionicons
              name="open-outline"
              size={16}
              color="rgba(255,255,255,0.52)"
            />
          </View>
        </Pressable>
      </AnimatedSection>

      <AnimatedSection delay={280} style={s.credit}>
        <Text style={s.creditSmall}>CRICLEDGER</Text>

        <Text style={s.creditTitle}>Founded & created by Taha Khan</Text>

        <Text style={s.creditBody}>
          Built for players, scorers and organizers who want cricket scoring to
          stay simple.
        </Text>
      </AnimatedSection>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  hero: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  photo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    marginRight: 18,
    borderWidth: 2,
    borderColor: "rgba(121,217,156,0.40)",
  },

  heroText: {
    flex: 1,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  role: {
    color: "#79D99C",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  location: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 10,
    marginLeft: 5,
  },

  about: {
    paddingTop: 27,
    paddingBottom: 20,
  },

  label: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    marginBottom: 9,
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    marginBottom: 15,
  },

  body: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 13,
  },

  youtubeSection: {
    marginTop: 7,
    marginBottom: 30,
  },

  youtubeCard: {
    padding: 18,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  channelTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  youtubeIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(255,70,70,0.08)",
  },

  youtubeName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  youtubeHandle: {
    color: "rgba(255,255,255,0.34)",
    fontSize: 10,
    marginTop: 3,
  },

  channelText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 16,
  },

  channelAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },

  channelActionText: {
    color: "#FF7777",
    fontSize: 11,
    fontWeight: "900",
  },

  credit: {
    paddingTop: 20,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },

  creditSmall: {
    color: "#79D99C",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
  },

  creditTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 7,
  },

  creditBody: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
    maxWidth: 300,
  },
});
