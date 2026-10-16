import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import bg from "../assets/bg/stadium.png";

import AnimatedSection from "../components/ui/AnimatedSection";
import GameHeader from "../components/ui/GameHeader";
import GameScreen from "../components/ui/GameScreen";

const SECTIONS = [
  {
    icon: "🤝",
    title: "Respect",
    items: [
      "Respect umpires and accept decisions without abuse.",
      "Compete hard without personal insults or aggressive sledging.",
      "Celebrate wickets and boundaries without getting in another player's face.",
    ],
  },

  {
    icon: "🏏",
    title: "During Play",
    items: [
      "Stay quiet during the bowler's run-up and delivery.",
      "Fielders should avoid fake calls or deliberate distractions.",
      "Call clearly while running: Yes, No or Wait.",
      "Avoid running down the protected middle of the pitch.",
    ],
  },

  {
    icon: "⏱️",
    title: "Keep It Moving",
    items: [
      "Be ready between deliveries and avoid unnecessary delays.",
      "Return the ball safely to the bowler or wicketkeeper.",
      "Stop play immediately when there is an injury or safety concern.",
    ],
  },

  {
    icon: "🌿",
    title: "Look After the Ground",
    items: [
      "Keep the playing area clean and take your rubbish with you.",
      "Respect pitches, nets, sightscreens and other facilities.",
    ],
  },
];

export default function Ethics() {
  return (
    <GameScreen background={bg}>
      <GameHeader
        title="Spirit of Cricket"
        subtitle="Simple match-day etiquette that keeps the game competitive, safe and enjoyable."
        showBack
        onBack={() => router.back()}
      />

      {SECTIONS.map((section, sectionIndex) => (
        <AnimatedSection
          key={section.title}
          delay={70 + sectionIndex * 70}
          style={s.section}
        >
          <View style={s.sectionHeading}>
            <Text style={s.icon}>{section.icon}</Text>

            <Text style={s.sectionTitle}>{section.title}</Text>
          </View>

          {section.items.map((item, index) => (
            <View
              key={item}
              style={[s.item, index === section.items.length - 1 && s.lastItem]}
            >
              <Text style={s.itemNumber}>
                {String(index + 1).padStart(2, "0")}
              </Text>

              <Text style={s.itemText}>{item}</Text>
            </View>
          ))}
        </AnimatedSection>
      ))}

      <AnimatedSection delay={390} style={s.footer}>
        <Text style={s.quote}>Play hard. Play fair.</Text>

        <Text style={s.quoteSub}>
          The score matters. So does how the game is played.
        </Text>
      </AnimatedSection>
    </GameScreen>
  );
}

const s = StyleSheet.create({
  section: {
    marginBottom: 28,
  },

  sectionHeading: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 9,
  },

  icon: {
    fontSize: 18,

    marginRight: 9,
  },

  sectionTitle: {
    color: "#79D99C",

    fontSize: 15,

    fontWeight: "900",
  },

  item: {
    minHeight: 62,

    flexDirection: "row",

    alignItems: "flex-start",

    paddingVertical: 13,

    borderBottomWidth: 1,

    borderBottomColor: "rgba(255,255,255,0.07)",
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  itemNumber: {
    width: 34,

    color: "rgba(255,255,255,0.23)",

    fontSize: 10,

    fontWeight: "900",

    letterSpacing: 1,

    paddingTop: 3,
  },

  itemText: {
    flex: 1,

    color: "rgba(255,255,255,0.78)",

    fontSize: 13,

    lineHeight: 20,

    fontWeight: "600",
  },

  footer: {
    paddingTop: 14,

    paddingBottom: 30,

    alignItems: "center",
  },

  quote: {
    color: "#FFFFFF",

    fontSize: 20,

    fontWeight: "900",
  },

  quoteSub: {
    color: "rgba(255,255,255,0.36)",

    fontSize: 11,

    marginTop: 5,
  },
});
