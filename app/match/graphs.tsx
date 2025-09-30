import { Dimensions, Text, View } from "react-native";
import Svg, {
  Circle,
  G,
  Polyline,
  Line as SvgLine,
  Text as SvgText,
} from "react-native-svg";
import { THEME } from "../styles/home";

/** --------- Types to keep this file standalone ---------- */
export type Dismissal = "Bowled" | "Caught" | "Run-out";
export type Pip =
  | { t: "run"; v: number }
  | { t: "wicket"; how: Dismissal }
  | { t: "nb"; v: number }
  | { t: "wd"; v: number }
  | { t: "b"; v: number }
  | { t: "lb"; v: number };

export type OverStat = {
  overIndex: number; // 1-based
  runs: number; // in this over
  legalBalls: number; // 0..6 in this over
  cRuns: number;
  cLegal: number;
  cRR: number; // cumulative run rate (per over)
  cSR: number; // cumulative strike rate (per 100 balls)
  overRR: number; // per-over economy (runs)
};

const BALLS_PER_OVER = 6;

/** Compute per-over and cumulative stats from pips */
export function computeOverStats(pips: Pip[]): OverStat[] {
  const stats: OverStat[] = [];
  let overRuns = 0;
  let overLegal = 0;
  let totalRuns = 0;
  let totalLegal = 0;
  let overIndex = 1;

  const flush = () => {
    totalRuns += overRuns;
    totalLegal += overLegal;
    const cOvers = totalLegal / BALLS_PER_OVER;
    const cRR = cOvers > 0 ? totalRuns / cOvers : 0;
    const cSR = totalLegal > 0 ? (totalRuns / totalLegal) * 100 : 0;
    stats.push({
      overIndex,
      runs: overRuns,
      legalBalls: overLegal,
      cRuns: totalRuns,
      cLegal: totalLegal,
      cRR,
      cSR,
      overRR: overRuns,
    });
    overRuns = 0;
    overLegal = 0;
    overIndex += 1;
  };

  for (const p of pips) {
    switch (p.t) {
      case "run":
        overRuns += p.v;
        overLegal += 1;
        break;
      case "wicket":
        overLegal += 1; // legal ball, no runs
        break;
      case "b":
      case "lb":
        overRuns += p.v;
        overLegal += 1;
        break;
      case "nb":
      case "wd":
        overRuns += p.v; // not a legal ball
        break;
    }
    if (overLegal === BALLS_PER_OVER) flush();
  }

  if (overLegal > 0 || overRuns > 0) flush();
  return stats;
}

/** --------- Series helpers (x = over number) ---------- */
export function seriesCumulativeRR(pips: Pip[]) {
  return computeOverStats(pips).map((o) => ({ x: o.overIndex, y: o.cRR }));
}
export function seriesCumulativeSR(pips: Pip[]) {
  return computeOverStats(pips).map((o) => ({ x: o.overIndex, y: o.cSR }));
}
export function seriesOverEconomy(pips: Pip[]) {
  return computeOverStats(pips).map((o) => ({ x: o.overIndex, y: o.overRR }));
}

/** Nice tick generator for Y axis */
export function niceTicks(max: number, approxCount = 5): number[] {
  if (!(max > 0)) return [0, 1, 2, 3, 4];
  const niceSteps = [1, 2, 2.5, 5, 10];
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const target = max / approxCount;
  let step = niceSteps[0] * magnitude;
  for (const s of niceSteps) {
    const c = s * magnitude;
    if (Math.abs(c - target) < Math.abs(step - target)) step = c;
  }
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) out.push(Number(v.toFixed(5)));
  return out;
}

/** --------- Presentational line chart card ---------- */
type Point = { x: number; y: number };
type Series = { label: string; color: string; data: Point[] };

export function LineChartCard({
  title,
  subtitle,
  series,
  xMax,
  yTicks,
}: {
  title: string;
  subtitle?: string;
  series: Series[];
  xMax: number; // max over on X axis
  yTicks: number[]; // explicit Y ticks (top tick defines visible max)
}) {
  const { width } = Dimensions.get("window");
  const cardPad = 14;
  const W = Math.max(320, width - 40 - cardPad * 2);
  const H = 220;
  const PAD = 28;

  const topY = yTicks.length ? yTicks[yTicks.length - 1] : 1;
  const xDen = Math.max(1, xMax);
  const yDen = Math.max(1, topY);

  const xScale = (x: number) =>
    PAD + (x / xDen) * (W - PAD * 2);
  const yScale = (y: number) =>
    H - PAD - (y / yDen) * (H - PAD * 2);

  const toPoints = (s: Series) =>
    s.data.map((p) => `${xScale(p.x)},${yScale(p.y)}`).join(" ");

  return (
    <View
      style={{
        backgroundColor: "rgba(12,18,24,0.85)",
        borderWidth: 1,
        borderColor: THEME.BORDER,
        borderRadius: 16,
        padding: cardPad,
      }}
    >
      {/* Titles as RN Text (not SVG) to avoid nesting issues */}
      <Text style={{ color: "#EDEFE6", fontSize: 18, fontWeight: "900", marginBottom: 4 }}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginBottom: 6 }}>
          {subtitle}
        </Text>
      )}

      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {/* Axes */}
        <SvgLine
          x1={PAD}
          y1={H - PAD}
          x2={W - PAD}
          y2={H - PAD}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
        />
        <SvgLine
          x1={PAD}
          y1={PAD}
          x2={PAD}
          y2={H - PAD}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
        />

        {/* Y grid + labels */}
        {yTicks.map((t, i) => (
          <G key={`yt-${i}`}>
            <SvgLine
              x1={PAD}
              y1={yScale(t)}
              x2={W - PAD}
              y2={yScale(t)}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
            />
            <SvgText
              x={PAD - 8}
              y={yScale(t) + 4}
              fill="rgba(255,255,255,0.6)"
              fontSize={10}
              textAnchor="end"
            >
              {Math.round(t)}
            </SvgText>
          </G>
        ))}

        {/* X ticks: 1..xMax */}
        {Array.from({ length: Math.max(1, Math.floor(xMax)) }).map((_, i) => {
          const x = i + 1;
          return (
            <G key={`xt-${x}`}>
              <SvgLine
                x1={xScale(x)}
                y1={H - PAD}
                x2={xScale(x)}
                y2={H - PAD + 5}
                stroke="rgba(255,255,255,0.45)"
                strokeWidth={1}
              />
              <SvgText
                x={xScale(x)}
                y={H - PAD + 16}
                fill="rgba(255,255,255,0.7)"
                fontSize={10}
                textAnchor="middle"
              >
                {x}
              </SvgText>
            </G>
          );
        })}

        {/* Series lines */}
        {series.map((s, i) => (
          <G key={`s-${i}`}>
            <Polyline
              points={toPoints(s)}
              fill="none"
              stroke={s.color}
              strokeWidth={3}
            />
            {/* end dot */}
            {s.data.length > 0 && (
              <Circle
                cx={xScale(s.data[s.data.length - 1].x)}
                cy={yScale(s.data[s.data.length - 1].y)}
                r={3}
                fill={s.color}
              />
            )}
          </G>
        ))}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
        {series.map((s, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", marginRight: 12 }}>
            <View style={{ width: 14, height: 3, backgroundColor: s.color, borderRadius: 3, marginRight: 6 }} />
            <Text style={{ color: "#EDEFE6", fontSize: 12 }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
