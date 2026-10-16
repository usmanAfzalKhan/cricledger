import MatchOverProgress from "../match-ui/MatchOverProgress";

export type Pip =
  | {
      t: "run";
      v:
        | 0
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
    }
  | {
      t: "wd";
      v: number;
    }
  | {
      t: "nb";
      v: number;
    }
  | {
      t: "b";
      v:
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
    }
  | {
      t: "lb";
      v:
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;
    }
  | {
      t: "wicket";
      how:
        | "Bowled"
        | "Caught"
        | "Run-out";
    };

function token(pip: Pip) {
  switch (pip.t) {
    case "run":
      return String(pip.v);

    case "wd":
      return pip.v > 1
        ? "Wd+" +
            (pip.v - 1)
        : "Wd";

    case "nb":
      return pip.v > 1
        ? "NB+" +
            (pip.v - 1)
        : "NB";

    case "b":
      return "B" + pip.v;

    case "lb":
      return "LB" + pip.v;

    case "wicket":
      return "W";

    default:
      return "?";
  }
}

export function OverProgress({
  pips,
}: {
  pips: Pip[];
}) {
  return (
    <MatchOverProgress
      deliveries={pips
        .slice(-12)
        .map((pip) => ({
          label: token(pip),

          wicket:
            pip.t === "wicket",

          extra:
            pip.t === "wd" ||
            pip.t === "nb",
        }))}
    />
  );
}
