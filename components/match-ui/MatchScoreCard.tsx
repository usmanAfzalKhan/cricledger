import {
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { styles as s } from "../quick-match/quickScoringStyles";

export type ScoreDetail = {
  label: string;
  value: string;
  accent?: boolean;
};

type Props = {
  teamName: string;
  logoUri?: string;

  runs: number;
  wickets: number;

  oversText: string;
  oversLimit: number | string;

  runRate: number | string;

  bowlingText?: string;
  targetText?: string;

  details?: ScoreDetail[];
  statusChips?: string[];
};

export default function MatchScoreCard({
  teamName,
  logoUri = "",
  runs,
  wickets,
  oversText,
  oversLimit,
  runRate,
  bowlingText,
  targetText,
  details = [],
  statusChips = [],
}: Props) {
  return (
    <View style={s.scoreCard}>
      <View style={s.teamRow}>
        {logoUri ? (
          <Image
            source={{ uri: logoUri }}
            style={s.logo}
          />
        ) : null}

        <Text
          style={s.teamName}
          numberOfLines={1}
        >
          {teamName}
        </Text>

        <Text style={s.battingLabel}>
          BATTING
        </Text>
      </View>

      <Text style={s.scoreMain}>
        {runs}/{wickets}
      </Text>

      <View style={s.scoreMetaRow}>
        <View style={s.metaBox}>
          <Text style={s.metaLabel}>
            OVERS
          </Text>

          <Text style={s.metaValue}>
            {oversText} / {oversLimit}
          </Text>
        </View>

        <View style={s.metaBox}>
          <Text style={s.metaLabel}>
            RUN RATE
          </Text>

          <Text style={s.metaValue}>
            {runRate}
          </Text>
        </View>
      </View>

      {details.length > 0 ? (
        <View style={local.details}>
          {details.map((item) => (
            <View
              key={item.label}
              style={local.detail}
            >
              <Text style={local.detailLabel}>
                {item.label}
              </Text>

              <Text
                style={[
                  local.detailValue,
                  item.accent &&
                    local.detailAccent,
                ]}
                numberOfLines={1}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {targetText ? (
        <View style={s.chaseBox}>
          <Text style={s.chaseText}>
            {targetText}
          </Text>
        </View>
      ) : null}

      {statusChips.length > 0 ? (
        <View style={local.chips}>
          {statusChips.map((chip) => (
            <View
              key={chip}
              style={local.chip}
            >
              <Text style={local.chipText}>
                {chip}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {bowlingText ? (
        <Text
          style={[
            s.muted,
            local.bowling,
          ]}
        >
          {bowlingText}
        </Text>
      ) : null}
    </View>
  );
}

const local = StyleSheet.create({
  details: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  detail: {
    flex: 1,
    minWidth: 0,

    paddingHorizontal: 10,
    paddingVertical: 9,

    borderRadius: 13,

    backgroundColor:
      "rgba(255,255,255,0.035)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.07)",
  },

  detailLabel: {
    color:
      "rgba(255,255,255,0.38)",

    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.7,

    marginBottom: 3,
  },

  detailValue: {
    color: "#FFFFFF",

    fontSize: 11,
    fontWeight: "800",
  },

  detailAccent: {
    color: "#78D79A",
  },

  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor:
      "rgba(120,215,154,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.28)",
  },

  chipText: {
    color: "#78D79A",

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 0.5,
  },

  bowling: {
    textAlign: "center",
    marginTop: 11,
  },
});
