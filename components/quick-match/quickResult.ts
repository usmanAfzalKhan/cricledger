type ResultInput = {
  firstName: string;
  secondName: string;
  firstRuns: number;
  secondRuns: number;
};

export function getQuickMatchResult({
  firstName,
  secondName,
  firstRuns,
  secondRuns,
}: ResultInput) {
  if (secondRuns > firstRuns) {
    return `${secondName} won the chase`;
  }

  if (secondRuns === firstRuns) {
    return "Match tied";
  }

  const margin = firstRuns - secondRuns;

  return `${firstName} won by ${margin} run${margin === 1 ? "" : "s"}`;
}
