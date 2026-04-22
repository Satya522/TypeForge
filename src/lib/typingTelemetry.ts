export type TypingTelemetryAction = "backspace" | "input";

export interface TypingTelemetryEvent {
  accuracy: number;
  action: TypingTelemetryAction;
  backspaceCount: number;
  correct: boolean;
  correctChars: number;
  correctStreak: number;
  elapsedMs: number;
  expectedKey: string | null;
  index: number;
  key: string;
  pauseMs: number;
  rawWpm: number;
  totalErrors: number;
  typedChars: number;
  wpm: number;
}

export interface TypingTelemetryKeyStat {
  avgPauseMs: number;
  backspaces: number;
  fingerZone: string;
  hits: number;
  maxPauseMs: number;
  misses: number;
}

export interface TypingTelemetrySegment {
  accuracy: number;
  backspaces: number;
  endMs: number;
  flowScore: number;
  focusScore: number;
  index: number;
  label: string;
  mistakeCount: number;
  pauseMs: number;
  rawWpm: number;
  startMs: number;
  wpm: number;
}

export interface TypingTelemetrySummary {
  burstSpeed: number;
  errorRate: number;
  focusDriftIndex: number;
  focusScore: number;
  pressureState: "collapse" | "recover-fast" | "stabilize";
  recoveryAfterMistakes: number;
  rhythmStability: number;
  sessionStamina: number;
  totalBackspaces: number;
  weakestZone: string;
}

export interface TypingTelemetryPayload {
  durationMs: number;
  eventCount: number;
  events: TypingTelemetryEvent[];
  keyStats: Record<string, TypingTelemetryKeyStat>;
  segments: TypingTelemetrySegment[];
  summary: TypingTelemetrySummary;
  version: 1;
}

const FINGER_ZONES = [
  { keys: ["`", "1", "q", "a", "z"], label: "Left pinky cluster" },
  { keys: ["2", "w", "s", "x"], label: "Left ring cluster" },
  { keys: ["3", "e", "d", "c"], label: "Left middle cluster" },
  { keys: ["4", "5", "r", "t", "f", "g", "v", "b"], label: "Left index lane" },
  { keys: ["6", "7", "y", "u", "h", "j", "n", "m"], label: "Right index lane" },
  { keys: ["8", "i", "k", ","], label: "Right middle cluster" },
  { keys: ["9", "o", "l", "."], label: "Right ring cluster" },
  { keys: ["0", "-", "=", "p", "[", "]", "\\", ";", "'", "/"], label: "Right pinky cluster" },
  { keys: [" "], label: "Spacebar lane" },
];

export function aggregateHeatmapFromTelemetry(payloads: Array<TypingTelemetryPayload | null | undefined>) {
  const raw: Record<string, number> = {};

  for (const payload of payloads) {
    if (!payload) {
      continue;
    }

    for (const [key, stat] of Object.entries(payload.keyStats)) {
      raw[key] = (raw[key] ?? 0) + stat.misses;
    }
  }

  const max = Math.max(0, ...Object.values(raw));
  if (max === 0) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      Math.max(1, Math.min(7, Math.round((value / max) * 7))),
    ]),
  );
}

export function buildTypingTelemetryPayload({
  durationMs,
  events,
}: {
  durationMs: number;
  events: TypingTelemetryEvent[];
}): TypingTelemetryPayload | null {
  if (events.length === 0 || durationMs <= 0) {
    return null;
  }

  const sortedEvents = [...events].sort((left, right) => left.elapsedMs - right.elapsedMs);
  const keyStats: Record<string, TypingTelemetryKeyStat> = {};

  for (const event of sortedEvents) {
    const attributionKey =
      event.action === "backspace"
        ? "backspace"
        : event.correct
          ? normalizeTelemetryKey(event.key)
          : normalizeTelemetryKey(event.expectedKey ?? event.key);

    if (!attributionKey) {
      continue;
    }

    if (!keyStats[attributionKey]) {
      keyStats[attributionKey] = {
        avgPauseMs: 0,
        backspaces: 0,
        fingerZone: getFingerZoneForKey(attributionKey),
        hits: 0,
        maxPauseMs: 0,
        misses: 0,
      };
    }

    const stat = keyStats[attributionKey];
    stat.maxPauseMs = Math.max(stat.maxPauseMs, event.pauseMs);

    if (event.action === "backspace") {
      stat.backspaces += 1;
      continue;
    }

    stat.hits += 1;
    if (!event.correct) {
      stat.misses += 1;
    }

    stat.avgPauseMs += event.pauseMs;
  }

  for (const stat of Object.values(keyStats)) {
    stat.avgPauseMs = stat.hits > 0 ? roundTo(stat.avgPauseMs / stat.hits, 1) : 0;
  }

  const segmentCount = clamp(Math.ceil(durationMs / 15000), 4, 8);
  const segmentDuration = durationMs / segmentCount;
  const segments: TypingTelemetrySegment[] = [];
  let previousEvent: TypingTelemetryEvent | null = null;

  for (let index = 0; index < segmentCount; index += 1) {
    const startMs = Math.round(index * segmentDuration);
    const endMs = index === segmentCount - 1 ? durationMs : Math.round((index + 1) * segmentDuration);
    const segmentEvents = sortedEvents.filter((event) => event.elapsedMs >= startMs && event.elapsedMs <= endMs);
    const lastEvent: TypingTelemetryEvent = segmentEvents[segmentEvents.length - 1] ?? previousEvent ?? sortedEvents[0];
    const firstSnapshot: TypingTelemetryEvent = previousEvent ?? {
      ...sortedEvents[0],
      accuracy: 100,
      correctStreak: 0,
      backspaceCount: 0,
      correctChars: 0,
      pauseMs: 0,
      rawWpm: 0,
      totalErrors: 0,
      typedChars: 0,
      wpm: 0,
    };

    const correctDelta = Math.max(0, lastEvent.correctChars - firstSnapshot.correctChars);
    const typedDelta = Math.max(0, lastEvent.typedChars - firstSnapshot.typedChars);
    const errorDelta = Math.max(0, lastEvent.totalErrors - firstSnapshot.totalErrors);
    const backspaceDelta = Math.max(0, lastEvent.backspaceCount - firstSnapshot.backspaceCount);
    const pace = computeRate(correctDelta, Math.max(1, endMs - startMs));
    const rawWpm = computeRate(typedDelta, Math.max(1, endMs - startMs));
    const accuracy = typedDelta > 0 ? round((correctDelta / typedDelta) * 100) : lastEvent.accuracy;
    const pauseValues = segmentEvents.map((event) => event.pauseMs);
    const avgPause = round(average(pauseValues));
    const pauseVariance = standardDeviation(pauseValues);
    const flowScore = clamp(
      round(accuracy * 0.36 + Math.min(rawWpm, 140) * 0.3 - errorDelta * 4 - backspaceDelta * 3 - pauseVariance / 14),
      18,
      99,
    );
    const focusScore = clamp(
      round(accuracy * 0.5 + flowScore * 0.32 - avgPause / 16 - backspaceDelta * 2.2),
      16,
      99,
    );

    segments.push({
      accuracy,
      backspaces: backspaceDelta,
      endMs,
      flowScore,
      focusScore,
      index,
      label: buildSegmentLabel(index, segmentCount, startMs, endMs),
      mistakeCount: errorDelta,
      pauseMs: avgPause,
      rawWpm,
      startMs,
      wpm: pace,
    });

    previousEvent = lastEvent;
  }

  const inputEvents = sortedEvents.filter((event) => event.action === "input");
  const pauseSeries = inputEvents.map((event) => event.pauseMs);
  const rhythmStability = clamp(
    round(100 - standardDeviation(pauseSeries) / 5 - average(segments.map((segment) => segment.backspaces)) * 3),
    24,
    99,
  );
  const burstSpeed = round(percentile(segments.map((segment) => segment.wpm), 0.85));
  const firstErrorIndex = inputEvents.findIndex((event) => !event.correct);
  const recoveryAfterMistakes = firstErrorIndex === -1
    ? 100
    : clamp(
        round(
          (average(inputEvents.slice(firstErrorIndex + 2, firstErrorIndex + 8).map((event) => event.wpm)) /
            Math.max(1, average(inputEvents.slice(Math.max(0, firstErrorIndex - 4), firstErrorIndex).map((event) => event.wpm)) || average(segments.slice(0, 2).map((segment) => segment.wpm)))) *
            100,
        ),
        30,
        120,
      );
  const pressureState: TypingTelemetrySummary["pressureState"] =
    recoveryAfterMistakes >= 92 ? "recover-fast" : recoveryAfterMistakes >= 76 ? "stabilize" : "collapse";
  const focusDriftIndex = segments.reduce(
    (lowest, segment, index) => (segment.focusScore < segments[lowest].focusScore ? index : lowest),
    0,
  );
  const focusScore = clamp(round(average(segments.map((segment) => segment.focusScore))), 18, 99);
  const sessionStamina = clamp(
    round(
      (average(segments.slice(Math.max(0, segmentCount - 2)).map((segment) => segment.wpm)) /
        Math.max(1, average(segments.slice(0, 2).map((segment) => segment.wpm)))) *
        100,
    ),
    25,
    120,
  );
  const totalBackspaces = sortedEvents[sortedEvents.length - 1]?.backspaceCount ?? 0;
  const totalErrors = sortedEvents[sortedEvents.length - 1]?.totalErrors ?? 0;
  const totalTyped = sortedEvents[sortedEvents.length - 1]?.typedChars ?? inputEvents.length;
  const errorRate = totalTyped > 0 ? roundTo((totalErrors / totalTyped) * 100, 1) : 0;
  const weakestZone = getWeakestZone(keyStats);

  return {
    durationMs,
    eventCount: sortedEvents.length,
    events: sortedEvents,
    keyStats,
    segments,
    summary: {
      burstSpeed,
      errorRate,
      focusDriftIndex,
      focusScore,
      pressureState,
      recoveryAfterMistakes,
      rhythmStability,
      sessionStamina,
      totalBackspaces,
      weakestZone,
    },
    version: 1,
  };
}

export function getFingerZoneForKey(key: string) {
  const normalized = normalizeTelemetryKey(key) ?? key.toLowerCase();
  const zone = FINGER_ZONES.find((entry) => entry.keys.includes(normalized));
  return zone?.label ?? "Unmapped lane";
}

export function mergeTypingTelemetryPayloads(payloads: Array<TypingTelemetryPayload | null | undefined>) {
  const validPayloads = payloads.filter(Boolean) as TypingTelemetryPayload[];
  if (validPayloads.length === 0) {
    return null;
  }

  let elapsedOffset = 0;
  let correctOffset = 0;
  let typedOffset = 0;
  let errorOffset = 0;
  let backspaceOffset = 0;
  let correctStreak = 0;

  const mergedEvents: TypingTelemetryEvent[] = [];

  for (const payload of validPayloads) {
    for (const event of payload.events) {
      const adjustedCorrectStreak =
        event.action === "input" && event.correct ? correctStreak + 1 : event.action === "backspace" ? correctStreak : 0;
      if (event.action === "input") {
        correctStreak = event.correct ? adjustedCorrectStreak : 0;
      }

      mergedEvents.push({
        ...event,
        backspaceCount: event.backspaceCount + backspaceOffset,
        correctChars: event.correctChars + correctOffset,
        correctStreak: adjustedCorrectStreak,
        elapsedMs: event.elapsedMs + elapsedOffset,
        totalErrors: event.totalErrors + errorOffset,
        typedChars: event.typedChars + typedOffset,
      });
    }

    const lastEvent = payload.events[payload.events.length - 1];
    elapsedOffset += payload.durationMs;
    correctOffset += lastEvent?.correctChars ?? 0;
    typedOffset += lastEvent?.typedChars ?? 0;
    errorOffset += lastEvent?.totalErrors ?? 0;
    backspaceOffset += lastEvent?.backspaceCount ?? 0;
  }

  return buildTypingTelemetryPayload({
    durationMs: validPayloads.reduce((sum, payload) => sum + payload.durationMs, 0),
    events: mergedEvents,
  });
}

export function parseTypingTelemetry(input: unknown): TypingTelemetryPayload | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const candidate = input as Partial<TypingTelemetryPayload>;
  if (!Array.isArray(candidate.events) || !Array.isArray(candidate.segments) || !candidate.summary) {
    return null;
  }

  return candidate as TypingTelemetryPayload;
}

export function normalizeTelemetryKey(key: string | null | undefined) {
  if (!key) {
    return null;
  }

  if (key === " ") {
    return " ";
  }

  if (key.length === 1) {
    return key.toLowerCase();
  }

  if (key === "Spacebar") {
    return " ";
  }

  return key.toLowerCase();
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildSegmentLabel(index: number, totalSegments: number, startMs: number, endMs: number) {
  if (totalSegments <= 6) {
    return `${Math.round(startMs / 1000)}-${Math.round(endMs / 1000)}s`;
  }

  return `S${index + 1}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function computeRate(chars: number, elapsedMs: number) {
  if (elapsedMs <= 0) {
    return 0;
  }

  return round((chars / 5 / elapsedMs) * 60000);
}

function getWeakestZone(keyStats: Record<string, TypingTelemetryKeyStat>) {
  const zoneTotals = Object.values(keyStats).reduce<Record<string, number>>((accumulator, stat) => {
    accumulator[stat.fingerZone] = (accumulator[stat.fingerZone] ?? 0) + stat.misses;
    return accumulator;
  }, {});

  return Object.entries(zoneTotals).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "No weak zone";
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * percentileValue)));
  return sorted[index];
}

function round(value: number) {
  return Math.round(value);
}

function roundTo(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function standardDeviation(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}
