import { Text, View } from "react-native";
import { styles as s } from "../../app/styles/scoring";

export type Pip =
  | { t: "run"; v: 0 | 1 | 2 | 3 | 4 | 5 | 6 }
  | { t: "wd"; v: number } // total added (base 1 + overthrows)
  | { t: "nb"; v: number } // total added (base 1 + overthrows)
  | { t: "b"; v: 1 | 2 | 3 | 4 | 5 | 6 }
  | { t: "lb"; v: 1 | 2 | 3 | 4 | 5 | 6 }
  | { t: "wicket"; how: "Bowled" | "Caught" | "Run-out" };

const token = (p: Pip) => {
  switch (p.t) {
    case "run": return `${p.v}`;
    case "wd": return `Wd${p.v > 1 ? `+${p.v - 1}` : ""}`;
    case "nb": return `NB${p.v > 1 ? `+${p.v - 1}` : ""}`;
    case "b":  return `B${p.v}`;
    case "lb": return `LB${p.v}`;
    case "wicket": return "W";
    default: return "?";
  }
};

export function OverProgress({ pips }: { pips: Pip[] }) {
  const last12 = pips.slice(-12);
  const rows: Pip[][] = [];
  for (let i = 0; i < last12.length; i += 6) rows.push(last12.slice(i, i + 6));

  return (
    <View style={s.overCard}>
      <Text style={s.overTitle}>Over progress</Text>
      {rows.map((row, i) => (
        <View key={i} style={s.ballsRow}>
          {row.map((p, j) => (
            <View key={`${i}-${j}`} style={[s.ballPip, p.t === "wicket" && s.ballWicket]}>
              <Text style={s.ballText}>{token(p)}</Text>
            </View>
          ))}
        </View>
      ))}
      {last12.length === 0 && <Text style={s.overSubtle}>No deliveries yet.</Text>}
    </View>
  );
}
