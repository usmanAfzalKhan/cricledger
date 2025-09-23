// app/styles/lineups.ts
import { StyleSheet } from "react-native";
import { THEME } from "./home";

export const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    gap: 16,
    minHeight: "100%",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backLink: {
    color: THEME.TEXT_MUTED,
    fontSize: 14,
    fontWeight: "800",
  },
  title: {
    color: THEME.TEXT,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.3,
  },

  // VS banner container
  vsCard: {
    backgroundColor: THEME.CARD,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // centered row
    gap: 12,
  },

  // NEW: split titles so text aligns cleanly around the center
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

  // (keep for other uses if needed)
  teamTitle: {
    flex: 1,
    color: THEME.TEXT,
    fontSize: 18,
    fontWeight: "900",
  },

  vsPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  vsText: {
    color: THEME.TEXT,
    fontWeight: "900",
    letterSpacing: 1,
  },

  squadsCard: {
    backgroundColor: "rgba(12,18,24,0.65)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 12,
  },
  squadCol: {
    flex: 1,
    gap: 8,
  },
  squadHead: {
    color: THEME.TEXT,
    fontSize: 14,
    fontWeight: "800",
    opacity: 0.9,
  },
  list: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  num: {
    width: 22,
    textAlign: "center",
    color: THEME.TEXT_MUTED,
    fontWeight: "900",
  },
  name: {
    flex: 1,
    color: THEME.TEXT,
    fontSize: 15,
    fontWeight: "700",
  },
  capBadge: {
    color: THEME.ACCENT,
    fontWeight: "900",
  },
  divider: {
    width: 1,
    backgroundColor: THEME.BORDER,
    opacity: 0.5,
    borderRadius: 1,
  },

  hint: {
    textAlign: "center",
    color: THEME.TEXT_MUTED,
    fontSize: 12,
  },

  // Toss button styles
  tossBtn: {
    marginTop: 10,
    backgroundColor: THEME.ACCENT,
    borderColor: THEME.ACCENT,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  tossText: {
    color: "#0B1220",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
