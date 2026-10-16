import { StyleSheet } from "react-native";
import { THEME } from "./home";

export const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
    minHeight: "100%",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backLink: {
    minWidth: 64,
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: "900",
    paddingVertical: 10,
  },

  title: {
    color: THEME.TEXT,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  vsCard: {
    minHeight: 82,

    backgroundColor:
      "rgba(7,19,26,0.93)",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.22)",

    borderRadius: 24,

    paddingHorizontal: 16,
    paddingVertical: 17,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 11,

    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 5,
  },

  teamTitleLeft: {
    flex: 1,
    color: THEME.TEXT,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },

  teamTitleRight: {
    flex: 1,
    color: THEME.TEXT,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "left",
  },

  teamTitle: {
    flex: 1,
    color: THEME.TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  vsPill: {
    width: 46,
    height: 46,
    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.35)",

    backgroundColor:
      "rgba(120,215,154,0.12)",
  },

  vsText: {
    color: THEME.PRIMARY,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  squadsCard: {
    backgroundColor:
      "rgba(6,17,24,0.92)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",

    borderRadius: 25,

    padding: 14,

    flexDirection: "row",
    gap: 10,
  },

  squadCol: {
    flex: 1,
    gap: 9,
  },

  squadHead: {
    color: THEME.TEXT,
    fontSize: 14,
    fontWeight: "900",
  },

  list: {
    gap: 7,
  },

  row: {
    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    paddingVertical: 8,
    paddingHorizontal: 9,

    borderRadius: 14,

    backgroundColor:
      "rgba(255,255,255,0.045)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.075)",
  },

  num: {
    width: 23,
    textAlign: "center",

    color:
      "rgba(255,255,255,0.42)",

    fontSize: 11,
    fontWeight: "900",
  },

  name: {
    flex: 1,

    color: THEME.TEXT,

    fontSize: 13,
    fontWeight: "700",
  },

  capBadge: {
    color: THEME.PRIMARY,
    fontWeight: "900",
  },

  divider: {
    width: 1,
    backgroundColor:
      "rgba(255,255,255,0.08)",
    borderRadius: 1,
  },

  hint: {
    textAlign: "center",

    color:
      "rgba(255,255,255,0.47)",

    fontSize: 11,
    fontWeight: "700",
  },

  tossBtn: {
    minHeight: 58,
    marginTop: 5,

    backgroundColor: THEME.PRIMARY,

    borderColor:
      "rgba(255,255,255,0.14)",

    borderWidth: 1,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
    gap: 8,
  },

  tossText: {
    color: "#07131A",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
});

export default function __IGNORE_STYLES_ROUTE__() {
  return null;
}
