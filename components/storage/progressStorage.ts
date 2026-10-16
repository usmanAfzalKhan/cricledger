import AsyncStorage from "@react-native-async-storage/async-storage";

import type { QuickScoreState } from "../quick-match/useQuickScoring";

const LIBRARY_KEY = "cricledger_match_library_v2";

const ACTIVE_FULL_KEY = "cricledger_active_full_v2";

const ACTIVE_QUICK_KEY = "cricledger_active_quick_v2";

const MIGRATION_KEY = "cricledger_match_library_migrated_v2";

/*
 * Old single-slot keys.
 * Used only once to migrate existing saves.
 */
const LEGACY_FULL_STATE_KEY = "cricledger_match_v1";

const LEGACY_FULL_META_KEY = "cricledger_full_meta_v1";

const LEGACY_QUICK_KEY = "cricledger_quick_match_v1";

export type SavedParams = Record<string, string>;

export type MatchMode = "full" | "quick";

export type MatchStatus = "in-progress" | "completed";

export type QuickProgress = {
  stage: "scoring" | "break";
  params: SavedParams;
  score?: QuickScoreState;
  updatedAt: number;
};

export type MatchFinalScore = {
  firstRuns?: number;
  firstWickets?: number;
  firstBalls?: number;

  secondRuns?: number;
  secondWickets?: number;
  secondBalls?: number;
};

export type MatchRecord = {
  id: string;

  mode: MatchMode;
  status: MatchStatus;

  createdAt: number;
  updatedAt: number;

  params: SavedParams;

  /*
   * Full Match state is intentionally stored
   * as unknown here so this storage module
   * does not depend on matchModel.ts.
   */
  fullState?: unknown;

  quick?: {
    stage: "scoring" | "break";
    score?: QuickScoreState;
  };

  result?: string;

  final?: MatchFinalScore;
};

type FullMeta = {
  params: SavedParams;
  updatedAt: number;
};

let mutationQueue: Promise<void> = Promise.resolve();

let migrationPromise: Promise<void> | null = null;

function createMatchId(mode: MatchMode) {
  return [mode, Date.now(), Math.random().toString(36).slice(2, 9)].join("-");
}

function activeKey(mode: MatchMode) {
  return mode === "full" ? ACTIVE_FULL_KEY : ACTIVE_QUICK_KEY;
}

async function readLibraryDirect(): Promise<MatchRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(LIBRARY_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as MatchRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeLibraryDirect(matches: MatchRecord[]) {
  await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(matches));
}

async function ensureMigrated() {
  if (migrationPromise) {
    return migrationPromise;
  }

  migrationPromise = (async () => {
    const alreadyDone = await AsyncStorage.getItem(MIGRATION_KEY);

    if (alreadyDone === "1") {
      return;
    }

    const current = await readLibraryDirect();

    /*
     * Only import legacy saves if the
     * new library does not already
     * contain anything.
     */
    if (current.length === 0) {
      const [fullStateRaw, fullMetaRaw, quickRaw] = await Promise.all([
        AsyncStorage.getItem(LEGACY_FULL_STATE_KEY),

        AsyncStorage.getItem(LEGACY_FULL_META_KEY),

        AsyncStorage.getItem(LEGACY_QUICK_KEY),
      ]);

      const migrated: MatchRecord[] = [];

      if (fullStateRaw && fullMetaRaw) {
        try {
          const fullState = JSON.parse(fullStateRaw);

          const fullMeta = JSON.parse(fullMetaRaw) as FullMeta;

          const id = createMatchId("full");

          const completed = !!fullState?.matchOver;

          migrated.push({
            id,

            mode: "full",

            status: completed ? "completed" : "in-progress",

            createdAt: fullMeta.updatedAt ?? Date.now(),

            updatedAt: fullMeta.updatedAt ?? Date.now(),

            params: fullMeta.params ?? {},

            fullState,

            result: fullState?.result,
          });

          if (!completed) {
            await AsyncStorage.setItem(ACTIVE_FULL_KEY, id);
          }
        } catch {}
      }

      if (quickRaw) {
        try {
          const quick = JSON.parse(quickRaw) as QuickProgress;

          const id = createMatchId("quick");

          migrated.push({
            id,

            mode: "quick",

            status: "in-progress",

            createdAt: quick.updatedAt ?? Date.now(),

            updatedAt: quick.updatedAt ?? Date.now(),

            params: quick.params ?? {},

            quick: {
              stage: quick.stage,

              score: quick.score,
            },
          });

          await AsyncStorage.setItem(ACTIVE_QUICK_KEY, id);
        } catch {}
      }

      if (migrated.length > 0) {
        await writeLibraryDirect(migrated);
      }
    }

    await AsyncStorage.setItem(MIGRATION_KEY, "1");

    /*
     * Legacy keys are no longer used
     * after migration.
     */
    await AsyncStorage.multiRemove([
      LEGACY_FULL_STATE_KEY,
      LEGACY_FULL_META_KEY,
      LEGACY_QUICK_KEY,
    ]);
  })();

  return migrationPromise;
}

async function mutateLibrary<T>(
  mutation: (matches: MatchRecord[]) => T | Promise<T>,
): Promise<T> {
  await ensureMigrated();

  let output!: T;

  const run = mutationQueue.then(async () => {
    const matches = await readLibraryDirect();

    output = await mutation(matches);

    await writeLibraryDirect(matches);
  });

  mutationQueue = run.then(
    () => undefined,
    () => undefined,
  );

  await run;

  return output;
}

async function readLibrary() {
  await ensureMigrated();
  await mutationQueue;

  return readLibraryDirect();
}

function ensureRecord(matches: MatchRecord[], id: string, mode: MatchMode) {
  let match = matches.find((item) => item.id === id);

  if (!match) {
    const now = Date.now();

    match = {
      id,
      mode,

      status: "in-progress",

      createdAt: now,
      updatedAt: now,

      params: {},
    };

    matches.push(match);
  }

  return match;
}

export async function beginNewMatch(mode: MatchMode) {
  await ensureMigrated();

  const id = createMatchId(mode);

  await AsyncStorage.setItem(activeKey(mode), id);

  return id;
}

export async function setActiveMatch(mode: MatchMode, matchId: string) {
  await ensureMigrated();

  await AsyncStorage.setItem(activeKey(mode), matchId);
}

export async function getActiveMatchId(mode: MatchMode) {
  await ensureMigrated();

  return AsyncStorage.getItem(activeKey(mode));
}

async function ensureActiveMatchId(mode: MatchMode) {
  const existing = await getActiveMatchId(mode);

  if (existing) {
    return existing;
  }

  return beginNewMatch(mode);
}

export async function listMatches() {
  const matches = await readLibrary();

  return [...matches].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getMatch(matchId: string) {
  const matches = await readLibrary();

  return matches.find((match) => match.id === matchId) ?? null;
}

export async function deleteMatch(matchId: string) {
  await mutateLibrary((matches) => {
    const index = matches.findIndex((match) => match.id === matchId);

    if (index >= 0) {
      matches.splice(index, 1);
    }
  });

  const [activeFull, activeQuick] = await Promise.all([
    AsyncStorage.getItem(ACTIVE_FULL_KEY),

    AsyncStorage.getItem(ACTIVE_QUICK_KEY),
  ]);

  if (activeFull === matchId) {
    await AsyncStorage.removeItem(ACTIVE_FULL_KEY);
  }

  if (activeQuick === matchId) {
    await AsyncStorage.removeItem(ACTIVE_QUICK_KEY);
  }
}

/* =========================================================
   FULL MATCH
========================================================= */

export async function saveFullMeta(params: SavedParams) {
  const id = await ensureActiveMatchId("full");

  await mutateLibrary((matches) => {
    const match = ensureRecord(matches, id, "full");

    match.params = {
      ...match.params,
      ...params,
    };

    match.updatedAt = Date.now();
  });

  return id;
}

export async function loadFullMeta(matchId?: string) {
  const id = matchId ?? (await getActiveMatchId("full"));

  if (!id) {
    return null;
  }

  const match = await getMatch(id);

  if (!match || match.mode !== "full") {
    return null;
  }

  return {
    params: match.params,

    updatedAt: match.updatedAt,
  };
}

export async function saveFullState(state: unknown) {
  const id = await ensureActiveMatchId("full");

  await mutateLibrary((matches) => {
    const match = ensureRecord(matches, id, "full");

    match.fullState = state;

    const data = state as {
      matchOver?: boolean;
      result?: string;
    };

    if (data?.matchOver) {
      match.status = "completed";

      match.result = data.result || match.result;
    } else {
      match.status = "in-progress";
    }

    match.updatedAt = Date.now();
  });

  return id;
}

export async function loadFullState<T>(matchId?: string): Promise<T | null> {
  const id = matchId ?? (await getActiveMatchId("full"));

  if (!id) {
    return null;
  }

  const match = await getMatch(id);

  if (!match || match.mode !== "full" || !match.fullState) {
    return null;
  }

  return match.fullState as T;
}

export async function hasFullProgress() {
  const matches = await listMatches();

  return matches.some(
    (match) => match.mode === "full" && match.status === "in-progress",
  );
}

export async function clearFullProgress(matchId?: string) {
  const id = matchId ?? (await getActiveMatchId("full"));

  if (!id) return;

  await deleteMatch(id);
}

/* =========================================================
   QUICK MATCH
========================================================= */

export async function saveQuickProgress(
  value: Omit<QuickProgress, "updatedAt">,
) {
  const id = await ensureActiveMatchId("quick");

  const updatedAt = Date.now();

  await mutateLibrary((matches) => {
    const match = ensureRecord(matches, id, "quick");

    match.params = {
      ...match.params,
      ...value.params,
    };

    match.quick = {
      stage: value.stage,

      score: value.score,
    };

    match.status = "in-progress";

    match.updatedAt = updatedAt;
  });

  return id;
}

export async function loadQuickProgress(
  matchId?: string,
): Promise<QuickProgress | null> {
  const id = matchId ?? (await getActiveMatchId("quick"));

  if (!id) {
    return null;
  }

  const match = await getMatch(id);

  if (!match || match.mode !== "quick" || !match.quick) {
    return null;
  }

  return {
    stage: match.quick.stage,

    params: match.params,

    score: match.quick.score,

    updatedAt: match.updatedAt,
  };
}

export async function completeQuickMatch(value: {
  result: string;

  final: MatchFinalScore;
}) {
  const id = await ensureActiveMatchId("quick");

  await mutateLibrary((matches) => {
    const match = ensureRecord(matches, id, "quick");

    match.status = "completed";

    match.result = value.result;

    match.final = value.final;

    match.updatedAt = Date.now();
  });
}

export async function hasQuickProgress() {
  const matches = await listMatches();

  return matches.some(
    (match) => match.mode === "quick" && match.status === "in-progress",
  );
}

export async function clearQuickProgress(matchId?: string) {
  const id = matchId ?? (await getActiveMatchId("quick"));

  if (!id) return;

  await deleteMatch(id);
}
