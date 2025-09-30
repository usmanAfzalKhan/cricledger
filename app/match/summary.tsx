// app/match/summary.tsx
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { Link, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import bg from "../../assets/bg/stadium.png";
import { styles as home, THEME } from "../styles/home";

import {
  LineChartCard,
  niceTicks,
  Pip,
  seriesCumulativeRR,
  seriesCumulativeSR,
  seriesOverEconomy,
} from "./graphs";

// --- Types mirrored from scoring snapshot ---
type Dismissal = "Bowled" | "Caught" | "Run-out";
type Batter = {
  name: string;
  runs: number;
  balls: number;
  out?: { how: Dismissal | "Declared"; by?: string; catcher?: string; runOutBy?: string };
};
type Bowler = { name: string; conceded: number; legalBalls: number };

type InningsSnap = {
  battingTeamName: string;
  bowlingTeamName: string;
  runs: number;
  wickets: number;
  completedOvers: number;
  legalBalls: number;
  pips: Pip[];
  batters: Batter[];
  bowlers: Bowler[];
};

type SummaryPayload = {
  oversLimit: number;
  result: string;
  innings: [InningsSnap, InningsSnap] | InningsSnap[];
};

// ---- chart helper type (fixes the TS union errors) ----
type XY = { x: number; y: number };
type ChartPack = {
  xMax: number;
  s1: XY[];
  s2: XY[];
  yTicks: number[];
};

// --- helpers ---
const toTwo = (n: number) => n.toFixed(2);
function oversFromBalls(legalBalls: number) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}
function sr(r: number, b: number) {
  return b > 0 ? (r / b) * 100 : 0;
}
function econFrom(balls: number, runs: number) {
  return balls > 0 ? runs / (balls / 6) : 0;
}
function safeJSON<T>(raw: unknown, fallback: T): T {
  if (typeof raw !== "string") return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

// Ensure chart looks like a continuous line: start at x=0 and end exactly at xMax
function withLineEdges(data: XY[], xMax: number, startY = 0): XY[] {
  const arr = [...data].sort((a, b) => a.x - b.x);
  if (!arr.length) return [{ x: 0, y: startY }, { x: xMax, y: startY }];
  if (arr[0].x > 0) arr.unshift({ x: 0, y: startY });
  const last = arr[arr.length - 1];
  if (last.x < xMax) arr.push({ x: xMax, y: last.y });
  return arr;
}

// Build a neat ASCII table for Share()
function pad(s: string, w: number, right = false) {
  if (s.length >= w) return s;
  const spaces = " ".repeat(w - s.length);
  return right ? spaces + s : s + spaces;
}
function makeTable(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] ?? "").length))
  );
  const head = headers.map((h, i) => pad(h, widths[i], i > 0)).join(" | ");
  const sep = widths.map(w => "-".repeat(w)).join("-+-");
  const body = rows
    .map(r => r.map((c, i) => pad(c ?? "", widths[i], i > 0)).join(" | "))
    .join("\n");
  return `${head}\n${sep}\n${body}`;
}

// For safe filenames when sharing
const fileSafe = (s: string) => s.replace(/[^a-z0-9-_]+/gi, "_");

// HTML helpers for PDF
const esc = (s: string) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function tableHTML(headers: string[], rows: string[][]) {
  return `
  <table class="tbl">
    <thead>
      <tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr>
    </thead>
    <tbody>
      ${rows.map(r => `<tr>${r.map((c,i) => `<td class="${i===0?"left":""}">${esc(c ?? "")}</td>`).join("")}</tr>`).join("")}
    </tbody>
  </table>`;
}

function buildPdfHtml(params: {
  title: string;
  subtitleLines: string[];
  i1?: InningsSnap;
  i2?: InningsSnap;
}) {
  const { title, subtitleLines, i1, i2 } = params;

  const s1Bat = i1 ? i1.batters.map(b => [
    b.name + (!b.out ? "*" : ""),
    `${b.runs} (${b.balls})`,
    toTwo(sr(b.runs, b.balls)),
  ]) : [];

  const s1Bowl = i1 ? i1.bowlers.map(w => [
    w.name, oversFromBalls(w.legalBalls), String(w.conceded), toTwo(econFrom(w.legalBalls, w.conceded)),
  ]) : [];

  const s2Bat = i2 ? i2.batters.map(b => [
    b.name + (!b.out ? "*" : ""),
    `${b.runs} (${b.balls})`,
    toTwo(sr(b.runs, b.balls)),
  ]) : [];

  const s2Bowl = i2 ? i2.bowlers.map(w => [
    w.name, oversFromBalls(w.legalBalls), String(w.conceded), toTwo(econFrom(w.legalBalls, w.conceded)),
  ]) : [];

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        html, body { margin:0; padding:0; background:#fff; color:#111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, "Helvetica Neue", sans-serif; }
        .wrap { padding: 20px 18px 28px 18px; }
        .title { font-weight: 900; font-size: 20px; margin: 0 0 4px 0; }
        .sub { color:#333; margin: 2px 0; }
        .card { border:1px solid #ddd; border-radius:12px; padding:14px; margin:10px 0; }
        h3 { margin:0 0 8px 0; font-size: 14px; }
        .tbl { width:100%; border-collapse: collapse; table-layout: fixed; }
        .tbl th, .tbl td { border-bottom: 1px solid #e5e5e5; padding: 6px 8px; font-size: 12px; vertical-align: top; }
        .tbl th { text-align:left; color:#555; font-weight:800; }
        .tbl td { text-align:right; font-variant-numeric: tabular-nums; }
        .tbl td.left { text-align:left; }
        .grid { display:grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width:640px){ .grid { grid-template-columns: 1fr 1fr; } }
        .footer { margin-top: 12px; font-size: 12px; color:#444; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="card">
          <div class="title">${esc(title)}</div>
          ${subtitleLines.map(l => `<div class="sub">${esc(l)}</div>`).join("")}
        </div>

        ${i1 && i2 ? `
          <div class="grid">
            <div class="card">
              <h3>${esc(i1.battingTeamName)} — Batting</h3>
              ${tableHTML(["Batter","R(B)","SR"], s1Bat)}
              <h3 style="margin-top:12px">${esc(i1.bowlingTeamName)} — Bowling</h3>
              ${tableHTML(["Bowler","O","R","Econ"], s1Bowl)}
            </div>

            <div class="card">
              <h3>${esc(i2.battingTeamName)} — Batting</h3>
              ${tableHTML(["Batter","R(B)","SR"], s2Bat)}
              <h3 style="margin-top:12px">${esc(i2.bowlingTeamName)} — Bowling</h3>
              ${tableHTML(["Bowler","O","R","Econ"], s2Bowl)}
            </div>
          </div>

          <div class="card">
            <div class="sub">
              ${esc(i1.battingTeamName)} ${i1.runs}/${i1.wickets} (${esc(oversFromBalls(i1.legalBalls))})
              vs
              ${esc(i2.battingTeamName)} ${i2.runs}/${i2.wickets} (${esc(oversFromBalls(i2.legalBalls))})
            </div>
            <div class="footer">Generated by CricLedger</div>
          </div>
        ` : `
          <div class="card"><div class="sub">Scorecard unavailable.</div></div>
        `}
      </div>
    </body>
  </html>`;
}

// =========================================

export default function MatchSummary() {
  const p = useLocalSearchParams<{
    teamAName: string;
    teamBName: string;
    overs: string;
    result?: string;
    aRuns?: string;
    aWkts?: string;
    bRuns?: string;
    bWkts?: string;
    summary?: string; // detailed payload
  }>();

  const teamAName = p.teamAName ?? "Team A";
  const teamBName = p.teamBName ?? "Team B";
  const oversCap = p.overs ?? "-";
  const result = p.result ?? "";

  const payload = safeJSON<SummaryPayload | null>(p.summary, null);
  const i1 = payload?.innings?.[0] as InningsSnap | undefined;
  const i2 = payload?.innings?.[1] as InningsSnap | undefined;

  const aRuns = p.aRuns ?? (i1 ? String(i1.runs) : "-");
  const aWkts = p.aWkts ?? (i1 ? String(i1.wickets) : "-");
  const bRuns = p.bRuns ?? (i2 ? String(i2.runs) : "-");
  const bWkts = p.bWkts ?? (i2 ? String(i2.wickets) : "-");

  const showDetail = !!(i1 && i2);

  // Tabs (players removed)
  const [tab, setTab] = useState<"scorecard" | "graphs">("scorecard");
  const [showEco, setShowEco] = useState(false);

  // Title prompt modal
  const defaultTitle = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${teamAName} vs ${teamBName} — ${y}-${m}-${day}`;
    };
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [shareTitle, setShareTitle] = useState(defaultTitle());

  // Series for charts (typed as ChartPack | null)
  const rrSeries = useMemo<ChartPack | null>(() => {
    if (!showDetail || !i1 || !i2) return null;
    const s1Raw = seriesCumulativeRR(i1.pips).map(p => ({ x: p.x, y: p.y }));
    const s2Raw = seriesCumulativeRR(i2.pips).map(p => ({ x: p.x, y: p.y }));
    const lastX1 = s1Raw.length ? s1Raw[s1Raw.length - 1].x : 1;
    const lastX2 = s2Raw.length ? s2Raw[s2Raw.length - 1].x : 1;
    const xMax = Math.max(lastX1, lastX2, 1);
    const s1 = withLineEdges(s1Raw, xMax, 0);
    const s2 = withLineEdges(s2Raw, xMax, 0);
    const yMax = Math.max(
      s1.reduce((m,p)=>Math.max(m,p.y),0),
      s2.reduce((m,p)=>Math.max(m,p.y),0),
      1
    );
    return { xMax, s1, s2, yTicks: niceTicks(yMax, 5) };
  }, [showDetail, i1, i2]);

  const srSeries = useMemo<ChartPack | null>(() => {
    if (!showDetail || !i1 || !i2) return null;
    const s1Raw = seriesCumulativeSR(i1.pips).map(p => ({ x: p.x, y: p.y }));
    const s2Raw = seriesCumulativeSR(i2.pips).map(p => ({ x: p.x, y: p.y }));
    const lastX1 = s1Raw.length ? s1Raw[s1Raw.length - 1].x : 1;
    const lastX2 = s2Raw.length ? s2Raw[s2Raw.length - 1].x : 1;
    const xMax = Math.max(lastX1, lastX2, 1);
    const s1 = withLineEdges(s1Raw, xMax, 0);
    const s2 = withLineEdges(s2Raw, xMax, 0);
    const yMax = Math.max(
      s1.reduce((m,p)=>Math.max(m,p.y),0),
      s2.reduce((m,p)=>Math.max(m,p.y),0),
      1
    );
    const ticks = niceTicks(Math.max(100, yMax), 4);
    return { xMax, s1, s2, yTicks: ticks };
  }, [showDetail, i1, i2]);

  // Over-by-over economy: start from (0,0) and extend to xMax for both innings
  const ecoSeries = useMemo<ChartPack | null>(() => {
    if (!showDetail || !i1 || !i2) return null;
    const e1Raw = seriesOverEconomy(i1.pips).map(p => ({ x: p.x, y: p.y }));
    const e2Raw = seriesOverEconomy(i2.pips).map(p => ({ x: p.x, y: p.y }));
    const xMax = Math.max(e1Raw.at(-1)?.x ?? 1, e2Raw.at(-1)?.x ?? 1, 1);
    const s1 = withLineEdges(e1Raw, xMax, 0);
    const s2 = withLineEdges(e2Raw, xMax, 0);
    const maxY = Math.max(...s1.map(d=>d.y), ...s2.map(d=>d.y), 6);
    return { xMax, s1, s2, yTicks: niceTicks(maxY, 5) };
  }, [showDetail, i1, i2]);

  // === Share flow ===
  function onShare() {
    setShareTitle(defaultTitle());
    setShowTitleModal(true);
  }

  async function doShare(finalTitle: string) {
    const subtitleLines = [
      result ? result : "",
      `${teamAName} vs ${teamBName}`,
      `Overs cap: ${oversCap}`,
      `${teamAName}: ${aRuns}/${aWkts}  •  ${teamBName}: ${bRuns}/${bWkts}`,
    ].filter(Boolean);

    // 1) PDF
    try {
      const html = buildPdfHtml({
        title: finalTitle,
        subtitleLines,
        i1: i1,
        i2: i2,
      });

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          UTI: "com.adobe.pdf",
          dialogTitle: "Share match summary (PDF)",
        });
        return;
      } else if (Platform.OS === "ios") {
        await Share.share({ url: uri });
        return;
      }
    } catch (e: any) {
      Alert.alert("PDF share failed", String(e?.message ?? e));
      // fall through
    }

    // 2) TXT file (aligned columns)
    const parts: string[] = [];
    parts.push(finalTitle);
    subtitleLines.forEach(l => parts.push(l));

    if (i1 && i2) {
      const i1Bat = makeTable(
        ["Batter", "R(B)", "SR"],
        i1.batters.map(b => [
          b.name + (!b.out ? "*" : ""),
          `${b.runs} (${b.balls})`,
          toTwo(sr(b.runs, b.balls)),
        ])
      );
      const i1Bowl = makeTable(
        ["Bowler", "O", "R", "Econ"],
        i1.bowlers.map(w => [
          w.name,
          oversFromBalls(w.legalBalls),
          String(w.conceded),
          toTwo(econFrom(w.legalBalls, w.conceded)),
        ])
      );
      const i2Bat = makeTable(
        ["Batter", "R(B)", "SR"],
        i2.batters.map(b => [
          b.name + (!b.out ? "*" : ""),
          `${b.runs} (${b.balls})`,
          toTwo(sr(b.runs, b.balls)),
        ])
      );
      const i2Bowl = makeTable(
        ["Bowler", "O", "R", "Econ"],
        i2.bowlers.map(w => [
          w.name,
          oversFromBalls(w.legalBalls),
          String(w.conceded),
          toTwo(econFrom(w.legalBalls, w.conceded)),
        ])
      );

      parts.push("");
      parts.push(`${i1.battingTeamName} — Batting`);
      parts.push(i1Bat);
      parts.push("");
      parts.push(`${i1.bowlingTeamName} — Bowling`);
      parts.push(i1Bowl);
      parts.push("");
      parts.push(`${i2.battingTeamName} — Batting`);
      parts.push(i2Bat);
      parts.push("");
      parts.push(`${i2.bowlingTeamName} — Bowling`);
      parts.push(i2Bowl);
      parts.push("");
      parts.push(
        `${i1.battingTeamName} ${i1.runs}/${i1.wickets} (${oversFromBalls(i1.legalBalls)}) ` +
        `vs ${i2.battingTeamName} ${i2.runs}/${i2.wickets} (${oversFromBalls(i2.legalBalls)})`
      );
    }

    const msg = parts.join("\n");

    try {
      const canShareFile = await Sharing.isAvailableAsync();
      const FS: any = FileSystem as any;
      const baseDir: string | null = FS.cacheDirectory || FS.documentDirectory || null;

      if (canShareFile && baseDir) {
        const fileName = `${fileSafe(finalTitle)}.txt`;
        const uri = `${baseDir}${fileName}`;
        await FileSystem.writeAsStringAsync(uri, msg);
        await Sharing.shareAsync(uri, {
          mimeType: "text/plain",
          dialogTitle: "Share match summary (TXT)",
        });
        return;
      }
    } catch (e: any) {
      Alert.alert("TXT share failed", String(e?.message ?? e));
      // fall through
    }

    // 3) Plain text share
    Share.share({ message: msg }).catch(() => {});
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={bg} resizeMode="cover" style={{ flex: 1 }}>
        <View style={home.scrim} />
        <View style={home.bgGlow} />
        <View style={home.bgCorner} />

        <SafeAreaView style={[home.safe, { backgroundColor: "transparent" }]}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 28 }}>
            <Text style={st.title}>Match Summary</Text>

            {/* Header card */}
            <View style={st.card}>
              {!!result && <Text style={st.result}>{result}</Text>}
              <Text style={st.subtle}>
                {teamAName} vs {teamBName}  •  Overs: {oversCap}
              </Text>

              <View style={st.badgesRow}>
                <View style={st.badge}><Text style={st.badgeTxt}>{teamAName}: {aRuns} / {aWkts}</Text></View>
                <View style={st.badge}><Text style={st.badgeTxt}>{teamBName}: {bRuns} / {bWkts}</Text></View>
              </View>
            </View>

            {/* Tabs */}
            <View style={st.tabs}>
              <Chip active={tab === "scorecard"} label="SCORECARD" onPress={() => setTab("scorecard")} />
              <Chip active={tab === "graphs"} label="GRAPHS" onPress={() => setTab("graphs")} />
            </View>

            {/* Content */}
            <View style={{ marginTop: 12, gap: 12 }}>
              {tab === "scorecard" && (
                <View style={{ gap: 14 }}>
                  {showDetail ? (
                    <>
                      {/* Innings 1 Batting */}
                      <ScoreTable
                        title={`${i1!.battingTeamName} — Batting`}
                        headers={["Batter", "R(B)", "SR"]}
                        rows={i1!.batters.map(b => [
                          b.name + (!b.out ? "*" : ""),
                          `${b.runs} (${b.balls})`,
                          toTwo(sr(b.runs, b.balls)),
                        ])}
                      />
                      {/* Innings 1 Bowling */}
                      <ScoreTable
                        title={`${i1!.bowlingTeamName} — Bowling`}
                        headers={["Bowler", "O", "R", "Econ"]}
                        rows={i1!.bowlers.map(w => [
                          w.name,
                          oversFromBalls(w.legalBalls),
                          String(w.conceded),
                          toTwo(econFrom(w.legalBalls, w.conceded)),
                        ])}
                      />

                      {/* Innings 2 Batting */}
                      <ScoreTable
                        title={`${i2!.battingTeamName} — Batting`}
                        headers={["Batter", "R(B)", "SR"]}
                        rows={i2!.batters.map(b => [
                          b.name + (!b.out ? "*" : ""),
                          `${b.runs} (${b.balls})`,
                          toTwo(sr(b.runs, b.balls)),
                        ])}
                      />
                      {/* Innings 2 Bowling */}
                      <ScoreTable
                        title={`${i2!.bowlingTeamName} — Bowling`}
                        headers={["Bowler", "O", "R", "Econ"]}
                        rows={i2!.bowlers.map(w => [
                          w.name,
                          oversFromBalls(w.legalBalls),
                          String(w.conceded),
                          toTwo(econFrom(w.legalBalls, w.conceded)),
                        ])}
                      />
                    </>
                  ) : (
                    <CardNote text="Scorecard unavailable. Finish a match from the scoring screen to see the full breakdown." />
                  )}
                </View>
              )}

              {tab === "graphs" && (
                <View style={{ gap: 12 }}>
                  {showDetail ? (
                    <>
                      {/* Graphs header + description */}
                      <View style={st.card}>
                        <Text style={st.sectionTitle}>Performance Graphs</Text>
                        <Text style={st.graphDesc}>
                          These charts compare both innings over time. Run Rate shows cumulative runs per over; Strike Rate shows cumulative batting strike rate.
                          Toggle to view over-by-over Economy for each innings.
                        </Text>
                      </View>

                      <LineChartCard
                        title="Team Run Rate (Cumulative)"
                        subtitle="Runs per over as the innings progressed (higher is faster scoring)"
                        xMax={rrSeries?.xMax ?? 1}
                        yTicks={rrSeries?.yTicks ?? [0, 1]}
                        series={[
                          { label: i1!.battingTeamName, color: "#6CCB8E", data: rrSeries?.s1 ?? [] },
                          { label: i2!.battingTeamName, color: "#7FA7FF", data: rrSeries?.s2 ?? [] },
                        ]}
                      />
                      <AxisLegend x="Overs" y="Runs per over (cumulative)" />

                      <LineChartCard
                        title="Team Strike Rate (Cumulative)"
                        subtitle="(runs ÷ balls) × 100, accumulated through the innings"
                        xMax={srSeries?.xMax ?? 1}
                        yTicks={srSeries?.yTicks ?? [0, 1]}
                        series={[
                          { label: i1!.battingTeamName, color: "#6CCB8E", data: srSeries?.s1 ?? [] },
                          { label: i2!.battingTeamName, color: "#7FA7FF", data: srSeries?.s2 ?? [] },
                        ]}
                      />
                      <AxisLegend x="Overs" y="Strike rate (cumulative)" />

                      <Pressable onPress={() => setShowEco(v => !v)} style={st.toggleBtn}>
                        <Text style={st.toggleTxt}>{showEco ? "Hide" : "View"} over-by-over economy</Text>
                      </Pressable>

                      {showEco && (
                        <>
                          <LineChartCard
                            title={`${i1!.battingTeamName} — Over-by-over economy`}
                            subtitle="Economy = runs conceded in each over (fielding side)"
                            xMax={ecoSeries?.xMax ?? 1}
                            yTicks={ecoSeries?.yTicks ?? [0, 1]}
                            series={[
                              { label: i1!.battingTeamName, color: "#6CCB8E", data: ecoSeries?.s1 ?? [] },
                            ]}
                          />
                          <AxisLegend x="Over number" y="Runs in the over (economy)" />

                          <LineChartCard
                            title={`${i2!.battingTeamName} — Over-by-over economy`}
                            subtitle="Economy = runs conceded in each over (fielding side)"
                            xMax={ecoSeries?.xMax ?? 1}
                            yTicks={ecoSeries?.yTicks ?? [0, 1]}
                            series={[
                              { label: i2!.battingTeamName, color: "#7FA7FF", data: ecoSeries?.s2 ?? [] },
                            ]}
                          />
                          <AxisLegend x="Over number" y="Runs in the over (economy)" />
                        </>
                      )}
                    </>
                  ) : (
                    <CardNote text="Graphs unavailable. Finish a match to see run rate, strike rate, and economy charts." />
                  )}
                </View>
              )}
            </View>

            {/* Bottom actions */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
              <Link href="/" asChild>
                <Pressable style={st.primaryBtn}>
                  <Text style={st.primaryBtnTxt}>Back to Home</Text>
                </Pressable>
              </Link>

              <Pressable onPress={onShare} style={st.ghostBtn}>
                <Text style={st.ghostBtnTxt}>Share</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* Title prompt modal */}
      <Modal
        visible={showTitleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTitleModal(false)}
      >
        <View style={st.modalOverlay}>
          <View style={st.modalCard}>
            <Text style={st.modalTitle}>Title this match</Text>
            <TextInput
              value={shareTitle}
              onChangeText={setShareTitle}
              placeholder="Match title"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={st.modalInput}
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <Pressable
                onPress={() => setShowTitleModal(false)}
                style={[st.modalBtn, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.16)" }]}
              >
                <Text style={st.modalBtnTxt}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={async () => {
                  const t = shareTitle.trim() || defaultTitle();
                  setShowTitleModal(false);
                  await doShare(t);
                }}
                style={[st.modalBtn, { backgroundColor: "#68B984", borderColor: "#68B984" }]}
              >
                <Text style={[st.modalBtnTxt, { color: "#0B1220" }]}>Share</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ========= little building blocks =========

function Chip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      st.chip,
      { backgroundColor: active ? "#6CCB8E" : pressed ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)",
        borderColor: active ? "#6CCB8E" : "rgba(255,255,255,0.16)" },
    ]}>
      <Text style={{ color: active ? "#07121C" : "#EDEFE6", fontWeight: "900", letterSpacing: 0.2 }}>
        {label}
      </Text>
    </Pressable>
  );
}

function CardNote({ text }: { text: string }) {
  return (
    <View style={st.card}>
      <Text style={{ color: "#EDEFE6" }}>{text}</Text>
    </View>
  );
}

function ScoreTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <View style={st.card}>
      <Text style={st.sectionTitle}>{title}</Text>
      <View style={[st.tableRow, { marginTop: 8 }]}>
        {headers.map((h, i) => (
          <Text key={i} style={[st.th, i === 0 ? { flex: 2 } : { width: 70, textAlign: "right" as const }]}>{h}</Text>
        ))}
      </View>
      {rows.map((r, ri) => (
        <View key={ri} style={st.tableRow}>
          <Text style={[st.td, { flex: 2 }]} numberOfLines={1} ellipsizeMode="tail">{r[0]}</Text>
          {r.slice(1).map((c, ci) => (
            <Text key={ci} style={[st.td, { width: 70, textAlign: "right" as const }]}>{c}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function AxisLegend({ x, y }: { x: string; y: string }) {
  return (
    <Text style={st.axisLegend}>X: {x}   •   Y: {y}</Text>
  );
}

// ========= styles =========
const st = StyleSheet.create({
  title: { color: "#EDEFE6", fontSize: 28, fontWeight: "900" },
  result: { color: "#FFEB99", fontWeight: "900", fontSize: 18 },
  subtle: { color: "#EDEFE6", marginTop: 8 },
  badgesRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  badge: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeTxt: { color: "#EDEFE6", fontWeight: "800" },
  card: {
    backgroundColor: "rgba(12,18,24,0.85)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 16,
    padding: 14,
  },
  tabs: { flexDirection: "row", marginTop: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 10,
  },
  sectionTitle: { color: "#EDEFE6", fontWeight: "900" },
  graphDesc: { color: "rgba(237,239,230,0.85)", marginTop: 6, lineHeight: 20 },
  tableRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
  th: { color: "rgba(255,255,255,0.75)", fontWeight: "800" },
  td: { color: "#EDEFE6" },

  primaryBtn: {
    backgroundColor: "#68B984",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    flex: 1,
  },
  primaryBtnTxt: { color: "#0B1220", fontWeight: "800" },
  ghostBtn: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    flex: 1,
  },
  ghostBtnTxt: { color: "#EDEFE6", fontWeight: "800" },

  toggleBtn: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  toggleTxt: { color: "#EDEFE6", fontWeight: "800" },

  axisLegend: {
    color: "rgba(237,239,230,0.65)",
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
  },

  // modal bits
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "rgba(12,18,24,0.95)",
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    color: "#EDEFE6",
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#EDEFE6",
  },
  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  modalBtnTxt: {
    color: "#EDEFE6",
    fontWeight: "800",
  },
});
