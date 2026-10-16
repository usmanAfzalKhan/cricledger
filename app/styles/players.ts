import { Platform, StyleSheet } from "react-native";
import { THEME } from "../styles/home";

export const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: "100%",
    gap: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: "rgba(7,18,25,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },

  backIcon: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  backText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
    fontWeight: "800",
  },

  title: {
    color: THEME.TEXT,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  skipBtn: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 13,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
  },

  skipText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 12,
    fontWeight: "800",
  },

  teamCard: {
    backgroundColor: "rgba(6,17,24,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 26,
    padding: 16,
    gap: 13,

    shadowColor: "#000",
    shadowOpacity: 0.26,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 6,
  },

  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 3,
  },

  teamNameWrap: {
    flexDirection: "column",
    gap: 3,
    flex: 1,
  },

  teamName: {
    color: THEME.TEXT,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  teamMeta: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 11,
    fontWeight: "700",
  },

  inputRow: {
    flexDirection: "row",
    gap: 8,
  },

  input: {
    minHeight: 51,
    color: THEME.TEXT,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    paddingVertical:
      Platform.OS === "ios" ? 13 : 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "700",
  },

  grow: {
    flex: 1,
  },

  list: {
    gap: 9,
  },

  itemRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "rgba(255,255,255,0.045)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.085)",

    borderRadius: 16,

    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  nameAndBadge: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  itemText: {
    color: THEME.TEXT,
    fontSize: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  itemActions: {
    flexDirection: "row",
    gap: 7,
    marginLeft: 9,
  },

  smallBtn: {
    minWidth: 38,
    height: 38,

    backgroundColor:
      "rgba(120,215,154,0.16)",

    borderColor:
      "rgba(120,215,154,0.38)",

    borderWidth: 1,
    borderRadius: 12,

    paddingHorizontal: 8,

    alignItems: "center",
    justifyContent: "center",
  },

  smallBtnGhost: {
    minWidth: 38,
    height: 38,

    backgroundColor:
      "rgba(255,255,255,0.045)",

    borderColor:
      "rgba(255,255,255,0.11)",

    borderWidth: 1,
    borderRadius: 12,

    paddingHorizontal: 8,

    alignItems: "center",
    justifyContent: "center",
  },

  smallIconText: {
    color: THEME.PRIMARY,
    fontSize: 13,
    fontWeight: "900",
  },

  smallGhostIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  captainBadge: {
    marginLeft: 8,

    color: "#07131A",

    fontSize: 10,
    fontWeight: "900",

    paddingVertical: 3,
    paddingHorizontal: 7,

    borderRadius: 999,

    backgroundColor: THEME.PRIMARY,

    overflow: "hidden",
  },

  nextBtn: {
    minHeight: 58,
    marginTop: 5,

    backgroundColor: THEME.PRIMARY,

    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",

    alignItems: "center",
    justifyContent: "center",

    flexDirection: "row",
    gap: 8,
  },

  nextBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderColor: "rgba(255,255,255,0.08)",
  },

  nextIcon: {
    color: "#07131A",
    fontSize: 17,
  },

  nextText: {
    color: "#07131A",
    fontSize: 16,
    fontWeight: "900",
  },
});

export default function __IGNORE_STYLES_ROUTE__() {
  return null;
}
