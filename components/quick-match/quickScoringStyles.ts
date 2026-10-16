import { StyleSheet } from "react-native";

const GREEN = "#78D79A";
const CARD = "rgba(6,17,24,0.94)";
const BORDER = "rgba(255,255,255,0.09)";

export const styles = StyleSheet.create<any>({
  screenContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",

    paddingHorizontal: 15,
    paddingTop: 14,
    paddingBottom: 44,

    gap: 13,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    color: "#FFFFFF",

    fontSize: 21,
    fontWeight: "900",

    letterSpacing: -0.2,
  },

  inningText: {
    color:
      "rgba(255,255,255,0.46)",

    fontSize: 10,
    fontWeight: "900",

    letterSpacing: 1.0,

    marginTop: 3,
  },

  backButton: {
    minHeight: 43,

    justifyContent: "center",

    paddingHorizontal: 13,

    borderRadius: 14,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",

    backgroundColor:
      "rgba(6,17,24,0.88)",
  },

  backText: {
    color:
      "rgba(255,255,255,0.72)",

    fontSize: 12,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 66,
  },

  scoreCard: {
    borderRadius: 28,

    padding: 19,

    backgroundColor: CARD,

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.16)",

    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 7,
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 11,
  },

  logo: {
    width: 46,
    height: 46,

    borderRadius: 15,

    backgroundColor:
      "rgba(255,255,255,0.07)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",
  },

  teamName: {
    color: "#FFFFFF",

    fontSize: 20,
    fontWeight: "900",

    flex: 1,
  },

  battingLabel: {
    color: GREEN,

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.1,
  },

  scoreMain: {
    color: "#FFFFFF",

    fontSize: 64,
    lineHeight: 72,

    fontWeight: "900",
    letterSpacing: -2,

    marginTop: 14,
  },

  scoreMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    gap: 9,

    marginTop: 10,
  },

  metaBox: {
    flex: 1,

    backgroundColor:
      "rgba(255,255,255,0.045)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.07)",

    borderRadius: 15,

    padding: 12,
  },

  metaLabel: {
    color:
      "rgba(255,255,255,0.42)",

    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 0.8,
  },

  metaValue: {
    color: "#FFFFFF",

    fontSize: 19,
    fontWeight: "900",

    marginTop: 4,
  },

  chaseBox: {
    marginTop: 12,

    padding: 12,

    borderRadius: 14,

    backgroundColor:
      "rgba(120,215,154,0.10)",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.23)",
  },

  chaseText: {
    color: GREEN,

    fontSize: 12,
    fontWeight: "900",

    textAlign: "center",
  },

  statusBox: {
    borderRadius: 16,

    padding: 12,

    backgroundColor:
      "rgba(236,187,76,0.11)",

    borderWidth: 1,
    borderColor:
      "rgba(236,187,76,0.27)",
  },

  statusText: {
    color: "#F6D47B",

    textAlign: "center",

    fontWeight: "900",
  },

  overCard: {
    borderRadius: 22,

    padding: 16,

    backgroundColor: CARD,

    borderWidth: 1,
    borderColor: BORDER,
  },

  sectionTitle: {
    color:
      "rgba(255,255,255,0.70)",

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 1.0,

    marginBottom: 11,
  },

  muted: {
    color:
      "rgba(255,255,255,0.48)",
  },

  pipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 8,
  },

  pip: {
    minWidth: 42,
    height: 42,

    paddingHorizontal: 9,

    borderRadius: 21,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.055)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",
  },

  wicketPip: {
    backgroundColor:
      "rgba(233,74,79,0.15)",

    borderColor:
      "rgba(233,74,79,0.54)",
  },

  extraPip: {
    backgroundColor:
      "rgba(120,215,154,0.12)",

    borderColor:
      "rgba(120,215,154,0.40)",
  },

  pipText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  padCard: {
    padding: 14,

    borderRadius: 23,

    backgroundColor: CARD,

    borderWidth: 1,
    borderColor: BORDER,

    gap: 10,
  },

  wicketButton: {
    height: 58,

    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#D94D55",
  },

  wicketButtonText: {
    color: "#FFFFFF",

    fontSize: 17,
    fontWeight: "900",

    letterSpacing: 0.4,
  },

  runGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    gap: 8,
  },

  runButton: {
    width: "22.5%",

    minWidth: 65,
    height: 54,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",
  },

  runButtonText: {
    color: "#FFFFFF",

    fontSize: 19,
    fontWeight: "900",
  },

  extraRow: {
    flexDirection: "row",
    gap: 8,
  },

  extraButton: {
    flex: 1,

    height: 49,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.31)",

    backgroundColor:
      "rgba(120,215,154,0.07)",
  },

  extraButtonActive: {
    backgroundColor:
      "rgba(120,215,154,0.18)",

    borderColor:
      "rgba(120,215,154,0.58)",
  },

  extraButtonText: {
    color: GREEN,
    fontWeight: "900",
  },

  extraPicker: {
    padding: 13,

    borderRadius: 15,

    backgroundColor:
      "rgba(255,255,255,0.045)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.08)",
  },

  extraPickerTitle: {
    color:
      "rgba(255,255,255,0.72)",

    fontSize: 12,
    fontWeight: "900",

    marginBottom: 10,
  },

  extraPickerRow: {
    flexDirection: "row",
    gap: 7,
  },

  extraAmountButton: {
    flex: 1,

    height: 43,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: GREEN,
  },

  extraAmountText: {
    color: "#07131A",
    fontWeight: "900",
  },

  cancelExtra: {
    alignSelf: "center",

    padding: 8,
    marginTop: 5,
  },

  cancelExtraText: {
    color:
      "rgba(255,255,255,0.49)",

    fontWeight: "800",
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
  },

  undoButton: {
    flex: 1,

    height: 51,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 15,

    backgroundColor:
      "rgba(255,255,255,0.055)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",
  },

  endButton: {
    flex: 1.4,

    height: 51,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 15,

    backgroundColor: GREEN,
  },

  actionText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.34,
  },

  breakCard: {
    width: "100%",
    maxWidth: 480,

    alignSelf: "center",

    padding: 22,

    borderRadius: 28,

    backgroundColor: CARD,

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.15)",

    shadowColor: "#000",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 9,
    },

    elevation: 7,
  },

  bigTarget: {
    color: GREEN,

    fontSize: 58,
    fontWeight: "900",

    textAlign: "center",

    letterSpacing: -1.8,
  },

  centeredText: {
    color: "#FFFFFF",

    textAlign: "center",

    fontSize: 15,
    fontWeight: "750",
  },

  inputLabel: {
    color:
      "rgba(255,255,255,0.66)",

    fontSize: 11,
    fontWeight: "900",

    letterSpacing: 0.7,

    marginTop: 18,
    marginBottom: 8,
  },

  input: {
    color: "#FFFFFF",

    minHeight: 54,

    borderRadius: 16,

    paddingHorizontal: 15,

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.12)",

    backgroundColor:
      "rgba(255,255,255,0.055)",

    fontSize: 18,
    fontWeight: "850",
  },

  primaryButton: {
    minHeight: 56,

    marginTop: 18,

    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: GREEN,
  },

  primaryButtonText: {
    color: "#07131A",

    fontSize: 16,
    fontWeight: "900",
  },

  resultTitle: {
    color: GREEN,

    fontSize: 29,
    lineHeight: 37,

    fontWeight: "900",

    textAlign: "center",

    marginBottom: 22,
  },

  resultScore: {
    color: "#FFFFFF",

    fontSize: 34,
    fontWeight: "900",

    textAlign: "center",

    letterSpacing: -0.8,
  },
});
