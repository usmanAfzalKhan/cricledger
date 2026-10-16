import { Platform, StyleSheet } from "react-native";
import { THEME } from "./home";

export const styles = StyleSheet.create({
  formWrap: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: "100%",
    gap: 18,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },

  backBtn: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: "rgba(7,18,25,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.11)",
  },

  backIcon: {
    color: THEME.TEXT,
    fontSize: 17,
    fontWeight: "900",
  },

  backText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
  },

  title: {
    color: THEME.TEXT,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  card: {
    backgroundColor: "rgba(6,17,24,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 26,
    padding: 18,
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 8,
  },

  label: {
    color: "rgba(255,255,255,0.69)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 7,
    marginBottom: 7,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-end",
  },

  grow: {
    flex: 1,
  },

  playersBox: {
    width: 88,
    textAlign: "center",
  },

  input: {
    minHeight: 54,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.065)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    borderRadius: 16,
    paddingVertical:
      Platform.OS === "ios" ? 14 : 11,
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: "700",
  },

  nextBtn: {
    minHeight: 58,
    marginTop: 18,

    backgroundColor: THEME.PRIMARY,

    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",

    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,

    shadowColor: THEME.PRIMARY,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 6,
  },

  nextDisabled: {
    backgroundColor: "rgba(120,215,154,0.28)",
    borderColor: "rgba(120,215,154,0.16)",
    shadowOpacity: 0,
  },

  nextIcon: {
    color: "#07131A",
    fontSize: 17,
  },

  nextText: {
    color: "#07131A",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
});

export default function __IGNORE_STYLES_ROUTE__() {
  return null;
}
