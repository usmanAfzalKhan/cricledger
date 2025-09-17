// Shared maths & helpers for scoring. Keep framework-free.
export const overText = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
export const runRate  = (runs: number, legalBalls: number) => (legalBalls ? runs / (legalBalls / 6) : 0);
export const econRate = (runs: number, balls: number) => (balls ? (runs * 6) / balls : 0);
export const strikeRate = (runs: number, balls: number) => (balls ? (runs * 100) / balls : 0);
export const deepClone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

/** Stub so Expo Router doesn't warn about "missing default export" for files under /app. */
export default function _LibRouteStub() { return null as any; }
