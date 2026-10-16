import {
  StyleSheet,
} from "react-native";

const GREEN = "#78D79A";

const card = {
  padding: 18,

  borderRadius: 24,

  backgroundColor:
    "rgba(6,17,24,0.92)",

  borderWidth: 1,

  borderColor:
    "rgba(255,255,255,0.10)",
};

const choice = {
  flex: 1,

  minHeight: 54,

  borderRadius: 16,

  alignItems:
    "center" as const,

  justifyContent:
    "center" as const,

  borderWidth: 1,

  borderColor:
    "rgba(255,255,255,0.13)",

  backgroundColor:
    "rgba(255,255,255,0.045)",
};

const choiceActive = {
  backgroundColor:
    "rgba(120,215,154,0.13)",

  borderColor:
    "rgba(120,215,154,0.55)",
};

const choiceText = {
  color: "#EDEFE6",

  fontSize: 16,

  fontWeight:
    "800" as const,
};

const activeText = {
  color: GREEN,
};

export const styles =
  StyleSheet.create({
    content: {
      width: "100%",

      maxWidth: 500,

      alignSelf: "center",

      paddingHorizontal: 20,

      paddingTop: 16,

      paddingBottom: 50,

      gap: 16,
    },

    header: {
      flexDirection: "row",

      alignItems: "center",

      justifyContent:
        "space-between",

      marginBottom: 2,
    },

    backBtn: {
      minHeight: 44,

      paddingHorizontal: 14,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.12)",

      borderRadius: 15,

      backgroundColor:
        "rgba(6,17,24,0.88)",
    },

    backText: {
      color:
        "rgba(255,255,255,0.75)",

      fontWeight: "800",
    },

    backLink: {
      color:
        "rgba(255,255,255,0.75)",

      fontSize: 14,

      fontWeight: "800",

      minHeight: 44,

      paddingVertical: 12,

      paddingHorizontal: 14,

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.12)",

      borderRadius: 15,

      backgroundColor:
        "rgba(6,17,24,0.88)",
    },

    title: {
      color: "#FFFFFF",

      fontSize: 28,

      fontWeight: "900",
    },

    spacer: {
      width: 70,
    },

    headerSpacer: {
      width: 70,
    },

    card,

    sectionTitle: {
      color:
        "rgba(255,255,255,0.67)",

      fontSize: 12,

      fontWeight: "900",

      letterSpacing: 1,

      marginBottom: 10,
    },

    row: {
      flexDirection: "row",
      gap: 10,
    },

    pillsRow: {
      flexDirection: "row",
      gap: 10,
    },

    choice,

    pill: choice,

    choiceActive,

    pillActive: choiceActive,

    choiceText,

    pillText: choiceText,

    choiceTextActive:
      activeText,

    pillTextActive:
      activeText,

    note: {
      color:
        "rgba(255,255,255,0.48)",

      marginTop: 10,

      fontSize: 13,
    },

    coinCard: {
      alignItems: "center",

      paddingVertical: 24,

      paddingHorizontal: 18,

      borderRadius: 28,

      backgroundColor:
        "rgba(6,17,24,0.94)",

      borderWidth: 1,

      borderColor:
        "rgba(255,255,255,0.10)",
    },

    coin: {
      width: 200,

      height: 200,

      borderRadius: 100,

      alignItems: "center",

      justifyContent:
        "center",

      backgroundColor:
        "#E2C95F",

      borderWidth: 8,

      borderColor:
        "#F5E59A",
    },

    coinText: {
      color: "#493E17",

      fontSize: 28,

      fontWeight: "900",
    },

    coinPress: {
      borderRadius: 999,

      padding: 5,
    },

    coinPressPressed: {
      opacity: 0.9,
    },

    coinWrap: {
      width: 220,

      height: 220,

      alignItems: "center",

      justifyContent:
        "center",
    },

    face: {
      position: "absolute",

      width: 220,

      height: 220,

      alignItems: "center",

      justifyContent:
        "center",
    },

    faceBack: {
      transform: [
        {
          rotateY: "180deg",
        },
      ],
    },

    hint: {
      marginTop: 13,

      color:
        "rgba(255,255,255,0.48)",

      fontSize: 12,

      textAlign: "center",
    },

    tossBtn: {
      marginTop: 16,

      width: "100%",

      minHeight: 56,

      paddingHorizontal: 16,

      borderRadius: 17,

      backgroundColor: GREEN,

      alignItems: "center",

      justifyContent:
        "center",

      alignSelf: "stretch",
    },

    tossBtnDisabled: {
      opacity: 0.38,
    },

    tossText: {
      color: "#07131A",

      fontSize: 16,

      fontWeight: "900",
    },

    tossBtnText: {
      color: "#07131A",

      fontSize: 16,

      fontWeight: "900",
    },

    result: {
      marginTop: 16,

      color: GREEN,

      fontSize: 16,

      fontWeight: "900",

      textAlign: "center",
    },

    resultChip: {
      marginTop: 16,

      paddingVertical: 10,

      paddingHorizontal: 14,

      borderRadius: 999,

      backgroundColor:
        "rgba(120,215,154,0.10)",

      borderWidth: 1,

      borderColor:
        "rgba(120,215,154,0.24)",
    },

    resultText: {
      color: GREEN,

      fontSize: 13,

      fontWeight: "900",

      textAlign: "center",
    },

    actionsRow: {
      flexDirection: "row",

      gap: 10,

      marginTop: 8,
    },

    actionBtn: {
      flex: 1,

      minHeight: 54,

      borderRadius: 16,

      alignItems: "center",

      justifyContent:
        "center",

      borderWidth: 1,
    },

    actionBtnPrimary: {
      backgroundColor:
        "rgba(120,215,154,0.14)",

      borderColor:
        "rgba(120,215,154,0.55)",
    },

    actionBtnGhost: {
      backgroundColor:
        "rgba(255,255,255,0.045)",

      borderColor:
        "rgba(255,255,255,0.12)",
    },

    actionTextPrimary: {
      color: GREEN,

      fontWeight: "900",
    },

    actionTextGhost: {
      color: "#FFFFFF",

      fontWeight: "900",
    },

    smallNote: {
      marginTop: 9,

      color:
        "rgba(255,255,255,0.48)",

      fontSize: 12,
    },

    startBtn: {
      marginTop: 16,

      minHeight: 56,

      alignItems: "center",

      justifyContent:
        "center",

      borderRadius: 17,

      backgroundColor: GREEN,
    },

    startText: {
      color: "#07131A",

      fontSize: 16,

      fontWeight: "900",
    },

    bottomSpace: {
      height: 28,
    },
  });
