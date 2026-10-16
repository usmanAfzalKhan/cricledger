import { StyleSheet } from "react-native";
import { THEME } from "./home";

export const styles = StyleSheet.create({
  strip: {
    marginHorizontal: 14,
    marginTop: 12,

    paddingHorizontal: 15,
    paddingVertical: 13,

    backgroundColor:
      "rgba(6,17,24,0.94)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",

    borderRadius: 18,
  },

  stripLine: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  stripSub: {
    color:
      "rgba(255,255,255,0.48)",

    marginTop: 4,

    fontSize: 11,
    fontWeight: "700",
  },

  stripRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,

    borderRadius: 999,

    backgroundColor:
      "rgba(120,215,154,0.12)",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.22)",
  },

  chipText: {
    color: THEME.PRIMARY,
    fontSize: 10,
    fontWeight: "900",
  },

  name: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  sep: {
    color:
      "rgba(255,255,255,0.28)",
  },

  overCard: {
    marginHorizontal: 14,
    marginTop: 13,

    padding: 15,

    borderRadius: 22,

    backgroundColor:
      "rgba(6,17,24,0.94)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",
  },

  overTitle: {
    color:
      "rgba(255,255,255,0.70)",

    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,

    marginBottom: 11,
  },

  ballsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },

  ballPip: {
    minWidth: 42,
    height: 42,

    borderRadius: 21,

    backgroundColor:
      "rgba(255,255,255,0.065)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.11)",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 9,
  },

  ballWicket: {
    backgroundColor:
      "rgba(238,74,74,0.16)",

    borderColor:
      "rgba(238,74,74,0.50)",
  },

  ballText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  overSubtle: {
    color:
      "rgba(255,255,255,0.42)",

    fontSize: 11,
    fontWeight: "700",
  },

  padCard: {
    marginHorizontal: 14,
    marginTop: 13,
    marginBottom: 16,

    padding: 14,

    borderRadius: 22,

    backgroundColor:
      "rgba(6,17,24,0.94)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",
  },

  padRow: {
    flexDirection: "row",
    gap: 9,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  padBtn: {
    flexGrow: 1,
    minWidth: 66,

    minHeight: 52,

    paddingHorizontal: 12,

    borderRadius: 15,

    backgroundColor: THEME.PRIMARY,

    alignItems: "center",
    justifyContent: "center",
  },

  padBtnText: {
    color: "#07131A",
    fontSize: 16,
    fontWeight: "900",
  },

  btn: {
    backgroundColor: THEME.PRIMARY,
  },

  btnDanger: {
    backgroundColor: "#D94D55",
  },

  btnGhost: {
    backgroundColor:
      "rgba(255,255,255,0.065)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.10)",
  },

  btnDisabled: {
    opacity: 0.35,
  },

  toast: {
    position: "absolute",

    top: 80,
    left: 16,
    right: 16,

    paddingVertical: 13,
    paddingHorizontal: 16,

    borderRadius: 17,

    backgroundColor:
      "rgba(6,17,24,0.97)",

    borderWidth: 1,
    borderColor:
      "rgba(120,215,154,0.20)",
  },

  toastText: {
    color: THEME.PRIMARY,

    textAlign: "center",

    fontSize: 17,
    fontWeight: "900",
  },

  modalBackdrop: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.72)",

    alignItems: "center",
    justifyContent: "center",

    padding: 17,
  },

  modalCard: {
    width: "100%",
    maxWidth: 430,

    backgroundColor: "#081820",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.11)",

    borderRadius: 24,

    padding: 18,
  },

  modalTitle: {
    color: "#FFFFFF",

    fontWeight: "900",
    fontSize: 20,

    marginBottom: 14,
  },

  modalOption: {
    minHeight: 50,

    justifyContent: "center",

    paddingHorizontal: 14,

    borderRadius: 15,

    backgroundColor:
      "rgba(255,255,255,0.055)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",

    marginBottom: 8,
  },

  modalOptionText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  btnText: {
    color: "#07131A",
    fontWeight: "900",
  },

  sheetBackdrop: {
    position: "absolute",
    inset: 0,

    backgroundColor:
      "rgba(0,0,0,0.78)",
  },

  sheetCard: {
    position: "absolute",

    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: "#07131A",

    paddingTop: 12,
  },

  sheetHeader: {
    paddingHorizontal: 17,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  sheetTabs: {
    flexDirection: "row",
    gap: 8,

    paddingHorizontal: 16,

    marginBottom: 10,
  },

  sheetTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 999,

    backgroundColor:
      "rgba(255,255,255,0.06)",

    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",
  },

  sheetTabActive: {
    backgroundColor:
      "rgba(120,215,154,0.15)",

    borderColor:
      "rgba(120,215,154,0.40)",
  },

  sheetTabText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 11,
  },

  sheetBody: {
    flex: 1,
    padding: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  colH: {
    color:
      "rgba(255,255,255,0.47)",

    fontWeight: "900",
  },

  col: {
    color: "#FFFFFF",
  },

  flexRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  mr8: {
    marginRight: 8,
  },
});


export default function __IGNORE_STYLES_ROUTE__() { return null; }
