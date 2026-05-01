"use client";

import type { TypingTelemetryPayload } from "@/lib/typingTelemetry";

export type AnalyticsRange = "7d" | "30d" | "sessions";

export interface DailyAnalyticsDatum {
  accuracy: number;
  date: string;
  lessons: number;
  sessions: number;
  time: number;
  wpm: number;
}

export interface PracticeSessionDatum {
  accuracy: number;
  consistency: number;
  correctedErrors: number;
  correctChars: number;
  id: string;
  incorrectChars: number;
  rawWpm: number;
  sessionDate: string;
  sessionDuration: number;
  totalErrors: number;
  typingTelemetry: TypingTelemetryPayload | null;
  type: string;
  uncorrectedErrors: number;
  wpm: number;
}

export interface SessionExtremes {
  averageAccuracy: number;
  averageRawWpm: number;
  averageWpm: number;
  personalBestAccuracy: number;
  personalBestRawWpm: number;
  personalBestWpm: number;
  totalSessions: number;
}

export interface StreakSnapshot {
  currentStreak: number;
  lastPracticeAt: string | null;
  longestStreak: number;
}

export interface SnapshotMetric {
  accent: string;
  delta: number;
  helper: string;
  key: string;
  label: string;
  quality: string;
  sparkline: number[];
  unit: string;
  value: number;
}

export interface CompositeScoreModel {
  narrative: string;
  overall: number;
  pillars: Array<{
    accent: string;
    description: string;
    label: string;
    value: number;
  }>;
  status: string;
}

export interface CoachInsight {
  body: string;
  tag: string;
  title: string;
  tone: "accent" | "cyan" | "amber" | "fuchsia";
}

export interface BenchmarkRow {
  context: string;
  current: number;
  delta: number;
  label: string;
  reference: number;
  tone: "down" | "flat" | "up";
}

export interface TypingDNAProfileModel {
  archetype: string;
  badges: string[];
  confidence: number;
  fingerprint: string;
  narrative: string;
  signatureScores: Array<{
    label: string;
    value: number;
  }>;
  subtitle: string;
}

export interface WeakZoneModel {
  description: string;
  keys: string[];
  label: string;
  load: number;
}

export interface TimelinePoint {
  event?: string;
  focus: number;
  flow: number;
  label: string;
  mistakes: number;
  pace: number;
}

export interface PressureResponseModel {
  breakdown: Array<{
    label: string;
    value: number;
  }>;
  narrative: string;
  recoveryWindow: string;
  score: number;
  state: string;
}

export interface FocusBand {
  focus: number;
  label: string;
  load: number;
  state: "critical" | "steady" | "watch";
}

export interface SessionReplayEvent {
  detail: string;
  label: string;
  strength: number;
  tone: "accent" | "cyan" | "amber" | "fuchsia";
}

export interface SkillRadarDatum {
  skill: string;
  value: number;
}

export interface Recommendation {
  detail: string;
  drill: string;
  impact: string;
  label: string;
  priority: "medium" | "high" | "urgent";
}

export interface GrowthPoint {
  accuracy: number;
  date: string;
  focus: number;
  sessions: number;
  wpm: number;
}

export interface StreakQualityModel {
  detail: string;
  label: string;
  longestStreak: number;
  quality: number;
  currentStreak: number;
}

export interface SessionStaminaModel {
  narrative: string;
  retention: number;
  score: number;
  segments: Array<{
    label: string;
    pace: number;
    sessions: number;
  }>;
}

export interface AnalyticsModel {
  benchmarkRows: BenchmarkRow[];
  coachInsights: CoachInsight[];
  composite: CompositeScoreModel;
  focusDrift: {
    bands: FocusBand[];
    driftWindow: string;
    narrative: string;
    score: number;
  };
  growthSeries: GrowthPoint[];
  header: {
    headline: string;
    intro: string;
    readiness: number;
    readinessLabel: string;
    statusPill: string;
    subline: string;
    windowLabel: string;
  };
  lowData: boolean;
  pressure: PressureResponseModel;
  recommendations: Recommendation[];
  sessionReplay: {
    events: SessionReplayEvent[];
    summary: string;
  };
  sessionStamina: SessionStaminaModel;
  skillRadar: SkillRadarDatum[];
  snapshotMetrics: SnapshotMetric[];
  streakQuality: StreakQualityModel;
  telemetryMode: "live" | "preview";
  topWeakZones: WeakZoneModel[];
  totalSessions: number;
  typingDNA: TypingDNAProfileModel;
  unlocks: {
    dna: number;
    pressure: number;
    replay: number;
  };
  rhythmTimeline: TimelinePoint[];
}

interface BuildAnalyticsModelInput {
  data: DailyAnalyticsDatum[];
  heatmapData: Record<string, number>;
  range: AnalyticsRange;
  sessionExtremes: SessionExtremes;
  sessions: PracticeSessionDatum[];
  streak: StreakSnapshot;
  telemetryMode?: "live" | "preview";
}

const ACCENT = "#39ff14";
const CYAN = "#22d3ee";
const AMBER = "#fbbf24";
const FUCHSIA = "#f472b6";

const WEAK_ZONE_MAP = [
  {
    description: "Pinky lanes often force the biggest confidence tax because correction travel is longer.",
    keys: ["q", "a", "z", "1", "`", "tab", "caps", "shift-left"],
    label: "Left pinky cluster",
  },
  {
    description: "Ring-finger work is slowing transitions between home row and number lanes.",
    keys: ["w", "s", "x", "2"],
    label: "Left ring cluster",
  },
  {
    description: "Middle-lane precision is good, but repeated slips keep interrupting your rhythm.",
    keys: ["e", "d", "c", "3"],
    label: "Left middle cluster",
  },
  {
    description: "High-volume index work is carrying too much of the load and creating avoidable friction.",
    keys: ["r", "f", "v", "t", "g", "b", "4", "5"],
    label: "Left index lane",
  },
  {
    description: "Your right index lane is where pace and control start negotiating with each other.",
    keys: ["y", "h", "n", "u", "j", "m", "6", "7"],
    label: "Right index lane",
  },
  {
    description: "Mid-right clustering is introducing small stumbles that add up during longer runs.",
    keys: ["i", "k", ",", "8"],
    label: "Right middle cluster",
  },
  {
    description: "Ring-finger exits on the right side are creating the sharpest late-session wobble.",
    keys: ["o", "l", ".", "9"],
    label: "Right ring cluster",
  },
  {
    description: "This far-right lane is where punctuation and correction stress are stacking.",
    keys: ["p", ";", "/", "0", "-", "=", "[", "]", "\\", "'"],
    label: "Right pinky cluster",
  },
  {
    description: "Thumb rhythm is slightly unstable, which shows up as uneven pacing on longer passages.",
    keys: [" "],
    label: "Spacebar lane",
  },
];

export function buildAnalyticsModel({
  data,
  heatmapData,
  range,
  sessionExtremes,
  sessions,
  streak,
  telemetryMode = "preview",
}: BuildAnalyticsModelInput): AnalyticsModel {
  const sortedSessions = [...sessions].sort(
    (left, right) => new Date(left.sessionDate).getTime() - new Date(right.sessionDate).getTime(),
  );
  const totalSessions = sessionExtremes.totalSessions || sortedSessions.length;
  const lowData = totalSessions < 5;

  const recentThirtyDaily = data.slice(-30);
  const recentSevenDaily = data.slice(-7);
  const filteredDaily = range === "7d" ? recentSevenDaily : recentThirtyDaily;
  const filteredSessions =
    range === "sessions"
      ? sortedSessions.slice(-12)
      : sortedSessions.filter((session) => {
          const sessionTime = new Date(session.sessionDate).getTime();
          const days = range === "7d" ? 7 : 30;
          const start = Date.now() - days * 24 * 60 * 60 * 1000;
          return sessionTime >= start;
        });

  const windowSessions = filteredSessions.length > 0 ? filteredSessions : sortedSessions.slice(-Math.min(sortedSessions.length, 12));
  const previousSessions =
    range === "sessions"
      ? sortedSessions.slice(-24, -12)
      : sortedSessions.filter((session) => {
          const sessionTime = new Date(session.sessionDate).getTime();
          const days = range === "7d" ? 7 : 30;
          const end = Date.now() - days * 24 * 60 * 60 * 1000;
          const start = end - days * 24 * 60 * 60 * 1000;
          return sessionTime >= start && sessionTime < end;
        });
  const telemetryWindow = windowSessions
    .map((session) => session.typingTelemetry)
    .filter(Boolean) as TypingTelemetryPayload[];
  const telemetryPrevious = previousSessions
    .map((session) => session.typingTelemetry)
    .filter(Boolean) as TypingTelemetryPayload[];
  const latestTelemetry =
    [...telemetryWindow].reverse()[0] ??
    [...sortedSessions]
      .reverse()
      .map((session) => session.typingTelemetry)
      .find(Boolean) ??
    null;
  const hasLiveSessionTelemetry = telemetryWindow.length > 0;

  const activeDaily = filteredDaily.filter((day) => day.sessions > 0 || day.lessons > 0 || day.time > 0);
  const wpmSeries = pickSeries(activeDaily.map((day) => day.wpm), 12);
  const accuracySeries = pickSeries(activeDaily.map((day) => day.accuracy), 12);
  const consistencySeries = pickSeries(
    windowSessions.map((session) => session.consistency || session.accuracy * 0.96),
    12,
  );

  const currentWpm = round(average(windowSessions.map((session) => session.wpm)) || average(activeDaily.map((day) => day.wpm)));
  const previousWpm = round(
    average(previousSessions.map((session) => session.wpm)) || average(data.slice(-60, -30).map((day) => day.wpm)),
  );
  const currentAccuracy = round(
    average(windowSessions.map((session) => session.accuracy)) || average(activeDaily.map((day) => day.accuracy)),
  );
  const previousAccuracy = round(
    average(previousSessions.map((session) => session.accuracy)) || average(data.slice(-60, -30).map((day) => day.accuracy)),
  );
  const currentConsistency = round(
    average(windowSessions.map((session) => session.consistency || session.accuracy * 0.96)) || currentAccuracy * 0.97,
  );
  const previousConsistency = round(
    average(previousSessions.map((session) => session.consistency || session.accuracy * 0.96)) || previousAccuracy * 0.96,
  );
  const rawSpeed = round(average(windowSessions.map((session) => session.rawWpm)) || currentWpm + 6);
  const previousRawSpeed = round(average(previousSessions.map((session) => session.rawWpm)) || previousWpm + 4);
  const inferredErrorRate = roundTo(
    average(
      windowSessions.map((session) => {
        const totalChars = session.correctChars + session.incorrectChars;
        if (totalChars > 0) {
          return (session.incorrectChars / totalChars) * 100;
        }

        return (session.totalErrors / Math.max(1, session.sessionDuration / 60)) * 0.8;
      }),
    ),
    1,
  );
  const errorRate = hasLiveSessionTelemetry
    ? roundTo(average(telemetryWindow.map((telemetry) => telemetry.summary.errorRate)), 1)
    : inferredErrorRate;
  const burstSpeed = hasLiveSessionTelemetry
    ? round(average(telemetryWindow.map((telemetry) => telemetry.summary.burstSpeed)))
    : round(percentile(windowSessions.map((session) => Math.max(session.rawWpm, session.wpm)), 0.85));
  const burstGap = Math.max(0, burstSpeed - currentWpm);

  const speedVolatility = standardDeviation(windowSessions.map((session) => session.wpm));
  const inferredRhythmStability = clamp(
    round(100 - speedVolatility * 1.8 - burstGap * 0.4 + currentAccuracy * 0.18 + currentConsistency * 0.14),
    38,
    99,
  );
  const rhythmStability = hasLiveSessionTelemetry
    ? clamp(round(average(telemetryWindow.map((telemetry) => telemetry.summary.rhythmStability))), 28, 99)
    : inferredRhythmStability;

  const sessionDurations = windowSessions.map((session) => session.sessionDuration);
  const medianDuration = percentile(sessionDurations, 0.5) || 60;
  const sameLoadSessions = sortedSessions.filter(
    (session) => Math.abs(session.sessionDuration - medianDuration) <= Math.max(30, medianDuration * 0.3),
  );
  const sameLoadWpm = round(average(sameLoadSessions.map((session) => session.wpm)) || currentWpm);
  const sameLoadAccuracy = round(average(sameLoadSessions.map((session) => session.accuracy)) || currentAccuracy);

  const longSessions = sortedSessions.filter((session) => session.sessionDuration >= medianDuration);
  const shortSessions = sortedSessions.filter((session) => session.sessionDuration < medianDuration);
  const longRunWpm = average(longSessions.map((session) => session.wpm)) || currentWpm;
  const shortRunWpm = average(shortSessions.map((session) => session.wpm)) || currentWpm;
  const staminaRetention = clamp(roundTo((longRunWpm / Math.max(1, shortRunWpm)) * 100, 1), 40, 120);
  const inferredStaminaScore = clamp(
    round(staminaRetention * 0.58 + average(longSessions.map((session) => session.accuracy || currentAccuracy)) * 0.42),
    35,
    99,
  );
  const staminaScore = hasLiveSessionTelemetry
    ? clamp(round(average(telemetryWindow.map((telemetry) => telemetry.summary.sessionStamina))), 28, 99)
    : inferredStaminaScore;

  const medianErrors = percentile(sortedSessions.map((session) => session.totalErrors), 0.5) || 0;
  const highPressureSessions = sortedSessions.filter((session) => session.totalErrors >= medianErrors);
  const lowPressureSessions = sortedSessions.filter((session) => session.totalErrors < medianErrors);
  const lowPressureWpm = average(lowPressureSessions.map((session) => session.wpm)) || currentWpm;
  const highPressureWpm = average(highPressureSessions.map((session) => session.wpm)) || currentWpm;
  const lowPressureAccuracy = average(lowPressureSessions.map((session) => session.accuracy)) || currentAccuracy;
  const highPressureAccuracy = average(highPressureSessions.map((session) => session.accuracy)) || currentAccuracy;
  const recoveryRetention = (highPressureWpm / Math.max(1, lowPressureWpm)) * 100;
  const recoveryAccuracyHold = (highPressureAccuracy / Math.max(1, lowPressureAccuracy)) * 100;
  const inferredRecoveryScore = clamp(
    round(recoveryRetention * 0.5 + recoveryAccuracyHold * 0.4 + currentConsistency * 0.1),
    34,
    99,
  );
  const recoveryScore = hasLiveSessionTelemetry
    ? clamp(round(average(telemetryWindow.map((telemetry) => telemetry.summary.recoveryAfterMistakes))), 28, 99)
    : inferredRecoveryScore;

  const inferredFocusScore = clamp(
    round(
      currentAccuracy * 0.26 +
        currentConsistency * 0.24 +
        rhythmStability * 0.18 +
        recoveryScore * 0.17 +
        staminaScore * 0.15,
    ),
    40,
    99,
  );
  const focusScore = hasLiveSessionTelemetry
    ? clamp(round(average(telemetryWindow.map((telemetry) => telemetry.summary.focusScore))), 24, 99)
    : inferredFocusScore;

  const speedScore = clamp(
    round((currentWpm / Math.max(85, sessionExtremes.personalBestWpm || currentWpm || 1)) * 82 + burstGap * 1.1),
    28,
    99,
  );
  const overallScore = clamp(
    round(
      speedScore * 0.16 +
        currentAccuracy * 0.22 +
        currentConsistency * 0.18 +
        focusScore * 0.16 +
        recoveryScore * 0.14 +
        staminaScore * 0.14,
    ),
    34,
    99,
  );

  const wpmDelta = currentWpm - previousWpm;
  const accuracyDelta = roundTo(currentAccuracy - previousAccuracy, 1);
  const consistencyDelta = currentConsistency - previousConsistency;
  const focusSeries = pickSeries(
    filteredDaily.map((day) =>
      clamp(round(day.accuracy * 0.5 + day.wpm * 0.3 + Math.min(day.sessions, 4) * 6 + Math.min(day.lessons, 3) * 3), 0, 99),
    ),
    12,
  );
  const previousFocusScore = clamp(
    telemetryPrevious.length > 0
      ? round(average(telemetryPrevious.map((telemetry) => telemetry.summary.focusScore)))
      : round(
          previousAccuracy * 0.26 +
            previousConsistency * 0.24 +
            Math.max(40, rhythmStability - Math.max(0, wpmDelta * 2)) * 0.18 +
            Math.max(38, recoveryScore - Math.max(0, errorRate * 2)) * 0.17 +
            Math.max(35, staminaScore - Math.max(0, 4 - streak.currentStreak) * 2) * 0.15,
        ),
    0,
    99,
  );

  const topWeakZones = WEAK_ZONE_MAP.map((zone) => ({
    description: zone.description,
    keys: zone.keys.filter((key) => (heatmapData[key] ?? 0) > 0).slice(0, 4),
    label: zone.label,
    load: zone.keys.reduce((sum, key) => sum + (heatmapData[key] ?? 0), 0),
  }))
    .filter((zone) => zone.load > 0)
    .sort((left, right) => right.load - left.load)
    .slice(0, 3);

  const windowLabel =
    range === "7d" ? "Last 7 days" : range === "sessions" ? "Last 12 sessions" : "Last 30 days";
  const readiness = totalSessions === 0 ? 0 : clamp(round((totalSessions / 10) * 100), 24, 100);
  const readinessLabel =
    totalSessions >= 12 ? "Full signal profile" : totalSessions >= 5 ? "Strong signal" : "Calibrating";

  const header = buildHeader({
    accuracyDelta,
    focusScore,
    lowData,
    readiness,
    recoveryScore,
    telemetryMode,
    topWeakZone: topWeakZones[0],
    totalSessions,
    windowLabel,
    wpmDelta,
  });

  const typingDNA = buildTypingDNA({
    burstGap,
    currentAccuracy,
    focusScore,
    lowData,
    recoveryScore,
    rhythmStability,
    staminaScore,
    weakZone: topWeakZones[0],
  });

  const rhythmTimeline = latestTelemetry
    ? buildRhythmTimelineFromTelemetry(latestTelemetry)
    : buildRhythmTimeline({
        burstGap,
        burstSpeed,
        currentWpm,
        errorRate,
        focusScore,
        recoveryScore,
        rhythmStability,
        staminaScore,
      });

  const focusBands = latestTelemetry ? buildFocusBandsFromTelemetry(latestTelemetry) : buildFocusBands(rhythmTimeline);
  const driftBand = focusBands.reduce((lowest, band) => (band.focus < lowest.focus ? band : lowest), focusBands[0]);

  const pressure = latestTelemetry
    ? buildPressureModelFromTelemetry(latestTelemetry)
    : buildPressureModel({ recoveryScore, rhythmTimeline });
  const sessionReplay = latestTelemetry
    ? buildSessionReplayFromTelemetry(latestTelemetry, typingDNA)
    : buildSessionReplay({ rhythmTimeline, typingDNA });
  const sessionStamina = buildSessionStamina({ latestTelemetry, staminaScore, staminaRetention, sortedSessions });
  const growthSeries = buildGrowthSeries(recentThirtyDaily);
  const streakQuality = buildStreakQuality({
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    wpmDelta,
    accuracyDelta,
    readiness,
  });
  const coachInsights = buildCoachInsights({
    accuracyDelta,
    burstGap,
    currentAccuracy,
    currentWpm,
    errorRate,
    focusScore,
    lowData,
    pressure,
    recoveryScore,
    staminaScore,
    streakQuality,
    topWeakZones,
    wpmDelta,
  });
  const recommendations = buildRecommendations({
    errorRate,
    focusScore,
    pressure,
    recoveryScore,
    staminaScore,
    topWeakZones,
    typingDNA,
  });

  const benchmarkRows: BenchmarkRow[] = [
    {
      context: "All-time ceiling",
      current: currentWpm,
      delta: roundTo(currentWpm - sessionExtremes.personalBestWpm, 1),
      label: "Personal best",
      reference: sessionExtremes.personalBestWpm || currentWpm,
      tone: getTone(currentWpm - sessionExtremes.personalBestWpm),
    },
    {
      context: "Recent baseline",
      current: currentWpm,
      delta: roundTo(currentWpm - round(average(recentSevenDaily.map((day) => day.wpm))), 1),
      label: "7-day average",
      reference: round(average(recentSevenDaily.map((day) => day.wpm))) || currentWpm,
      tone: getTone(currentWpm - round(average(recentSevenDaily.map((day) => day.wpm)))),
    },
    {
      context: "Monthly pace",
      current: currentWpm,
      delta: roundTo(currentWpm - round(average(recentThirtyDaily.map((day) => day.wpm))), 1),
      label: "30-day average",
      reference: round(average(recentThirtyDaily.map((day) => day.wpm))) || currentWpm,
      tone: getTone(currentWpm - round(average(recentThirtyDaily.map((day) => day.wpm)))),
    },
    {
      context: "Comparable duration",
      current: currentWpm,
      delta: roundTo(currentWpm - sameLoadWpm, 1),
      label: "Same load band",
      reference: sameLoadWpm,
      tone: getTone(currentWpm - sameLoadWpm),
    },
    {
      context: "Control reference",
      current: currentAccuracy,
      delta: roundTo(currentAccuracy - sameLoadAccuracy, 1),
      label: "Accuracy baseline",
      reference: sameLoadAccuracy,
      tone: getTone(currentAccuracy - sameLoadAccuracy),
    },
  ];

  const snapshotMetrics: SnapshotMetric[] = [
    {
      accent: ACCENT,
      delta: wpmDelta,
      helper:
        wpmDelta >= 0
          ? "Sustain pace is climbing relative to the previous comparison window."
          : "Your pace layer cooled off. The next unlock is cleaner recovery, not more chaos.",
      key: "wpm",
      label: "WPM",
      quality: burstGap >= 10 ? "Explosive opener" : "Stable pace",
      sparkline: wpmSeries,
      unit: "WPM",
      value: currentWpm,
    },
    {
      accent: CYAN,
      delta: accuracyDelta,
      helper:
        currentAccuracy >= 96
          ? "Control is strong enough to support faster experiments safely."
          : "Accuracy still has enough drag to slow real output once corrections stack.",
      key: "accuracy",
      label: "Accuracy",
      quality: currentAccuracy >= 96 ? "Clean control" : "Needs polish",
      sparkline: accuracySeries,
      unit: "%",
      value: currentAccuracy,
    },
    {
      accent: FUCHSIA,
      delta: consistencyDelta,
      helper:
        rhythmStability >= 82
          ? "Cadence holds together even when your pace changes."
          : "Your speed is outrunning your rhythm; flow breaks are costing real output.",
      key: "consistency",
      label: "Consistency",
      quality: rhythmStability >= 82 ? "Flow keeper" : "Volatile lane",
      sparkline: consistencySeries,
      unit: "%",
      value: currentConsistency,
    },
    {
      accent: AMBER,
      delta: focusScore - previousFocusScore,
      helper:
        focusScore >= 84
          ? "Attention stays present through most of the run."
          : "Focus drift is visible before the session finishes. Longer calm sets will help.",
      key: "focus",
      label: "Focus Score",
      quality: focusScore >= 84 ? "Locked in" : "Drift risk",
      sparkline: focusSeries,
      unit: "",
      value: focusScore,
    },
  ];

  return {
    benchmarkRows,
    coachInsights,
    composite: {
      narrative:
        overallScore >= 84
          ? "Your typing stack is starting to behave like a system, not a lucky streak."
          : "You have enough signal now to target the exact layer that is holding the ceiling down.",
      overall: overallScore,
      pillars: [
        {
          accent: ACCENT,
          description: "Current pace relative to your own ceiling.",
          label: "Velocity",
          value: speedScore,
        },
        {
          accent: CYAN,
          description: "How cleanly you hold precision while moving fast.",
          label: "Control",
          value: currentAccuracy,
        },
        {
          accent: FUCHSIA,
          description: "Rhythm stability across spikes, dips, and corrections.",
          label: "Flow",
          value: rhythmStability,
        },
        {
          accent: AMBER,
          description: "How quickly you regain composure after friction hits.",
          label: "Recovery",
          value: recoveryScore,
        },
        {
          accent: "#8b5cf6",
          description: "How much pace survives once the run gets longer.",
          label: "Endurance",
          value: staminaScore,
        },
        {
          accent: "#fb7185",
          description: "The attention layer that keeps speed from turning noisy.",
          label: "Focus",
          value: focusScore,
        },
      ],
      status:
        overallScore >= 88
          ? "Elite control pattern"
          : overallScore >= 76
            ? "High-performance lane"
            : overallScore >= 62
              ? "Rising signal"
              : "Calibration mode",
    },
    focusDrift: {
      bands: focusBands,
      driftWindow: driftBand.label,
      narrative:
        driftBand.focus >= 80
          ? hasLiveSessionTelemetry
            ? "Recent session telemetry shows focus holding together through almost the entire run."
            : "Focus remains mostly intact through the entire reconstructed session."
          : hasLiveSessionTelemetry
            ? `Live session telemetry flags ${driftBand.label} as the clearest attention drop.`
            : `The most visible attention drop appears in ${driftBand.label}, right when load and correction pressure peak.`,
      score: focusScore,
    },
    growthSeries,
    header,
    lowData,
    pressure,
    recommendations,
    rhythmTimeline,
    sessionReplay,
    sessionStamina,
    skillRadar: [
      { skill: "Speed", value: speedScore },
      { skill: "Accuracy", value: currentAccuracy },
      { skill: "Consistency", value: currentConsistency },
      { skill: "Control", value: clamp(round((100 - errorRate * 6) * 0.5 + recoveryScore * 0.5), 25, 99) },
      { skill: "Endurance", value: staminaScore },
      { skill: "Recovery", value: recoveryScore },
    ],
    snapshotMetrics,
    streakQuality,
    telemetryMode: hasLiveSessionTelemetry ? "live" : telemetryMode,
    topWeakZones,
    totalSessions,
    typingDNA,
    unlocks: {
      dna: Math.max(0, 5 - totalSessions),
      pressure: Math.max(0, 6 - totalSessions),
      replay: Math.max(0, 4 - totalSessions),
    },
  };
}

function buildHeader({
  accuracyDelta,
  focusScore,
  lowData,
  readiness,
  recoveryScore,
  telemetryMode,
  topWeakZone,
  totalSessions,
  windowLabel,
  wpmDelta,
}: {
  accuracyDelta: number;
  focusScore: number;
  lowData: boolean;
  readiness: number;
  recoveryScore: number;
  telemetryMode: "live" | "preview";
  topWeakZone?: WeakZoneModel;
  totalSessions: number;
  windowLabel: string;
  wpmDelta: number;
}) {
  const headline = lowData
    ? "Performance lab is calibrating to your typing fingerprint."
    : wpmDelta > 0 && accuracyDelta >= 0
      ? "You are accelerating without giving up control."
      : recoveryScore >= 82
        ? "Your reset speed after mistakes is becoming a real advantage."
        : "The data says your next unlock is cleaner stability, not harder sprinting.";

  const intro = lowData
    ? "Complete a few more sessions and this system will stop estimating broad patterns and start locking onto your actual typing DNA."
    : telemetryMode === "live"
      ? "This is not a generic dashboard. It is now reading stored keystroke telemetry for pace, rhythm, recovery, weak keys, and focus drift."
      : "This is not a generic dashboard. It is a typing-specific intelligence surface tuned to pace, rhythm, recovery, weak keys, and focus decay.";

  const subline = topWeakZone
    ? `Primary friction lane: ${topWeakZone.label}. Focus and rhythm are strongest when that lane stays quiet.`
    : "Weak-zone telemetry will sharpen as soon as more real session data lands.";

  return {
    headline,
    intro,
    readiness,
    readinessLabel: readiness >= 90 ? "Full signal profile" : readiness >= 60 ? "Strong signal" : "Calibrating signal",
    statusPill:
      telemetryMode === "live"
        ? "AI coach + live telemetry online"
        : lowData
          ? "AI reconstruction in calibration mode"
          : "AI reconstruction + session telemetry online",
    subline,
    windowLabel: `${windowLabel} • ${totalSessions} total sessions`,
  };
}

function buildTypingDNA({
  burstGap,
  currentAccuracy,
  focusScore,
  lowData,
  recoveryScore,
  rhythmStability,
  staminaScore,
  weakZone,
}: {
  burstGap: number;
  currentAccuracy: number;
  focusScore: number;
  lowData: boolean;
  recoveryScore: number;
  rhythmStability: number;
  staminaScore: number;
  weakZone?: WeakZoneModel;
}): TypingDNAProfileModel {
  if (lowData) {
    return {
      archetype: "Pattern loading",
      badges: ["Needs 5 sessions", "DNA pending", weakZone?.label ?? "Weak-zone scan pending"],
      confidence: 52,
      fingerprint: "CAL-00",
      narrative:
        "The system can already see broad pace and control tendencies, but it needs a few more sessions before the profile becomes truly specific.",
      signatureScores: [
        { label: "Burst", value: Math.max(42, burstGap * 4) },
        { label: "Control", value: currentAccuracy },
        { label: "Flow", value: rhythmStability },
        { label: "Recovery", value: recoveryScore },
      ],
      subtitle: "Calibrating your typing personality",
    };
  }

  let archetype = "Adaptive Striker";
  let subtitle = "Balances pace and control while adjusting under load.";

  if (burstGap >= 12 && staminaScore < 78) {
    archetype = "Aggressive Starter";
    subtitle = "Launches fast, then pays for it later unless rhythm holds.";
  } else if (rhythmStability >= 86 && currentAccuracy >= 96) {
    archetype = "Rhythm Architect";
    subtitle = "Builds speed from timing, not panic, and keeps the lane composed.";
  } else if (staminaScore >= 86 && recoveryScore >= 84) {
    archetype = "Stable Finisher";
    subtitle = "Usually ends cleaner than expected because composure survives the long run.";
  } else if (recoveryScore < 72 && burstGap >= 10) {
    archetype = "Panic-Drop Pattern";
    subtitle = "Strong opener, but first-friction moments still knock the system off balance.";
  } else if (focusScore >= 84 && rhythmStability >= 80) {
    archetype = "Flow Keeper";
    subtitle = "Keeps attention and cadence linked, even when pace starts shifting.";
  }

  const confidence = clamp(round((currentAccuracy * 0.3 + rhythmStability * 0.3 + recoveryScore * 0.2 + staminaScore * 0.2)), 55, 98);
  const fingerprint = `B${padMetric(burstGap)}-F${padMetric(focusScore)}-R${padMetric(recoveryScore)}`;

  return {
    archetype,
    badges: [weakZone?.label ?? "Weak-zone scan pending", `${burstGap} WPM burst gap`, `${Math.max(0, 100 - currentAccuracy)}% control leak`],
    confidence,
    fingerprint,
    narrative:
      weakZone && weakZone.keys.length > 0
        ? `${archetype} is the dominant pattern right now. The clearest distortion sits in ${weakZone.label}, especially around ${weakZone.keys.join(", ")}.`
        : `${archetype} is the dominant pattern right now. The next sessions will sharpen how that profile behaves under load.`,
    signatureScores: [
      { label: "Burst", value: clamp(burstGap * 5 + 35, 18, 99) },
      { label: "Control", value: currentAccuracy },
      { label: "Flow", value: rhythmStability },
      { label: "Recovery", value: recoveryScore },
    ],
    subtitle,
  };
}

function buildRhythmTimeline({
  burstGap,
  burstSpeed,
  currentWpm,
  errorRate,
  focusScore,
  recoveryScore,
  rhythmStability,
  staminaScore,
}: {
  burstGap: number;
  burstSpeed: number;
  currentWpm: number;
  errorRate: number;
  focusScore: number;
  recoveryScore: number;
  rhythmStability: number;
  staminaScore: number;
}) {
  const pointCount = 12;
  const pressureMoment = clamp(Math.round(4 + (100 - focusScore) / 12), 3, 8);
  const recoveryMoment = clamp(pressureMoment + (recoveryScore >= 82 ? 2 : 3), 5, 10);

  return Array.from({ length: pointCount }, (_, index) => {
    const phase = index / (pointCount - 1);
    const openingBoost = burstGap * Math.exp(-phase * 4.8);
    const fatigue = ((100 - staminaScore) / 100) * phase * currentWpm * 0.18;
    const correctionWave = Math.exp(-Math.abs(index - pressureMoment) / 1.35) * errorRate * 1.7;
    const recoveryLift = index >= recoveryMoment ? ((recoveryScore - 65) / 100) * currentWpm * 0.14 * (index - recoveryMoment + 1) : 0;
    const microVariance = ((index % 4) - 1.5) * ((100 - rhythmStability) / 24);

    const pace = clamp(
      round(currentWpm + openingBoost - fatigue - correctionWave + recoveryLift + microVariance),
      Math.max(18, currentWpm - 35),
      Math.max(burstSpeed + 6, currentWpm + 12),
    );
    const focus = clamp(
      round(focusScore - phase * ((100 - focusScore) * 0.52) - correctionWave * 2.6 + recoveryLift * 1.7),
      30,
      99,
    );
    const flow = clamp(
      round(rhythmStability - Math.abs(microVariance) * 4.5 - correctionWave * 1.8 + recoveryLift * 2.5),
      28,
      99,
    );

    let event: string | undefined;
    if (index === 0) {
      event = "Launch";
    } else if (index === pressureMoment) {
      event = "Flow break";
    } else if (index === recoveryMoment) {
      event = "Recovery";
    } else if (index === pointCount - 1) {
      event = "Finish";
    }

    return {
      event,
      focus,
      flow,
      label: `S${index + 1}`,
      mistakes: clamp(round(errorRate * 0.9 + correctionWave), 0, 24),
      pace,
    };
  });
}

function buildRhythmTimelineFromTelemetry(telemetry: TypingTelemetryPayload): TimelinePoint[] {
  const lowestFocusIndex = telemetry.summary.focusDriftIndex;
  const lowestFlowIndex = telemetry.segments.reduce(
    (lowest, segment, index) => (segment.flowScore < telemetry.segments[lowest].flowScore ? index : lowest),
    0,
  );
  const recoveryIndex = Math.min(
    telemetry.segments.length - 1,
    Math.max(lowestFocusIndex, lowestFlowIndex) + (telemetry.summary.pressureState === "recover-fast" ? 1 : 2),
  );

  return telemetry.segments.map((segment, index) => {
    let event: string | undefined;

    if (index === 0) {
      event = "Launch";
    } else if (index === lowestFlowIndex) {
      event = "Flow break";
    } else if (index === recoveryIndex) {
      event = "Recovery";
    } else if (index === telemetry.segments.length - 1) {
      event = "Finish";
    }

    return {
      event,
      focus: segment.focusScore,
      flow: segment.flowScore,
      label: segment.label,
      mistakes: segment.mistakeCount,
      pace: segment.wpm,
    };
  });
}

function buildFocusBands(rhythmTimeline: TimelinePoint[]): FocusBand[] {
  const chunkSize = 2;
  const labels = ["0-15s", "15-30s", "30-45s", "45-60s", "60-75s", "75-90s"];

  return Array.from({ length: Math.ceil(rhythmTimeline.length / chunkSize) }, (_, index) => {
    const chunk = rhythmTimeline.slice(index * chunkSize, index * chunkSize + chunkSize);
    const focus = round(average(chunk.map((point) => point.focus)));
    const load = round(average(chunk.map((point) => point.mistakes)));

    const state: FocusBand["state"] = focus < 68 ? "critical" : focus < 82 ? "watch" : "steady";

    return {
      focus,
      label: labels[index] ?? `Zone ${index + 1}`,
      load,
      state,
    };
  });
}

function buildFocusBandsFromTelemetry(telemetry: TypingTelemetryPayload): FocusBand[] {
  return telemetry.segments.map((segment) => ({
    focus: segment.focusScore,
    label: segment.label,
    load: segment.mistakeCount,
    state: segment.focusScore < 68 ? "critical" : segment.focusScore < 82 ? "watch" : "steady",
  }));
}

function buildPressureModel({
  recoveryScore,
  rhythmTimeline,
}: {
  recoveryScore: number;
  rhythmTimeline: TimelinePoint[];
}): PressureResponseModel {
  const launch = rhythmTimeline[0]?.pace ?? 0;
  const breakPoint = rhythmTimeline.find((point) => point.event === "Flow break") ?? rhythmTimeline[4];
  const recoveryPoint = rhythmTimeline.find((point) => point.event === "Recovery") ?? rhythmTimeline[7];
  const finish = rhythmTimeline[rhythmTimeline.length - 1];

  return {
    breakdown: [
      { label: "Opening pace", value: round((launch / Math.max(1, launch)) * 100) },
      { label: "After first slip", value: round((breakPoint.pace / Math.max(1, launch)) * 100) },
      { label: "Stabilized lane", value: round((recoveryPoint.pace / Math.max(1, launch)) * 100) },
      { label: "Finish pace", value: round((finish.pace / Math.max(1, launch)) * 100) },
    ],
    narrative:
      recoveryScore >= 86
        ? "The first error does not fully own the run. Pace snaps back quickly and the finish holds shape."
        : recoveryScore >= 74
          ? "You absorb the first mistake, but there is still a visible wobble before the lane settles again."
          : "The first correction spike still creates a real confidence drop. Recovery drills will pay off immediately.",
    recoveryWindow: `${Math.max(12, Math.round((recoveryPoint.focus + recoveryPoint.flow) / 6))}s stabilization`,
    score: recoveryScore,
    state:
      recoveryScore >= 86 ? "Rapid stabilizer" : recoveryScore >= 74 ? "Controlled reset" : "Confidence dip",
  };
}

function buildPressureModelFromTelemetry(telemetry: TypingTelemetryPayload): PressureResponseModel {
  const launch = telemetry.segments[0];
  const breakIndex = telemetry.segments.reduce(
    (lowest, segment, index) => (segment.flowScore < telemetry.segments[lowest].flowScore ? index : lowest),
    0,
  );
  const breakPoint = telemetry.segments[breakIndex] ?? launch;
  const recoveryIndex = Math.min(telemetry.segments.length - 1, breakIndex + (telemetry.summary.pressureState === "recover-fast" ? 1 : 2));
  const recoveryPoint = telemetry.segments[recoveryIndex] ?? breakPoint;
  const finish = telemetry.segments[telemetry.segments.length - 1] ?? recoveryPoint;

  return {
    breakdown: [
      { label: "Opening pace", value: round((launch.wpm / Math.max(1, launch.wpm)) * 100) },
      { label: "After first slip", value: round((breakPoint.wpm / Math.max(1, launch.wpm)) * 100) },
      { label: "Stabilized lane", value: round((recoveryPoint.wpm / Math.max(1, launch.wpm)) * 100) },
      { label: "Finish pace", value: round((finish.wpm / Math.max(1, launch.wpm)) * 100) },
    ],
    narrative:
      telemetry.summary.pressureState === "recover-fast"
        ? "Live telemetry shows a fast reset after the first disruption. You take the hit, then re-center quickly."
        : telemetry.summary.pressureState === "stabilize"
          ? "Live telemetry shows a visible wobble after the first mistake, but the lane settles before the finish."
          : "Live telemetry shows a real collapse after the first correction spike. Recovery work should be the next priority.",
    recoveryWindow: `${Math.max(6, Math.round((recoveryPoint.endMs - breakPoint.startMs) / 1000))}s stabilization`,
    score: telemetry.summary.recoveryAfterMistakes,
    state:
      telemetry.summary.pressureState === "recover-fast"
        ? "Rapid stabilizer"
        : telemetry.summary.pressureState === "stabilize"
          ? "Controlled reset"
          : "Confidence dip",
  };
}

function buildSessionReplay({
  rhythmTimeline,
  typingDNA,
}: {
  rhythmTimeline: TimelinePoint[];
  typingDNA: TypingDNAProfileModel;
}): { events: SessionReplayEvent[]; summary: string } {
  const flowBreak = rhythmTimeline.find((point) => point.event === "Flow break") ?? rhythmTimeline[4];
  const recoveryPoint = rhythmTimeline.find((point) => point.event === "Recovery") ?? rhythmTimeline[7];

  return {
    events: [
      {
        detail: `${typingDNA.archetype} pattern shows up immediately with a strong opening surge.`,
        label: "Launch burst",
        strength: rhythmTimeline[0]?.pace ?? 0,
        tone: "accent" as const,
      },
      {
        detail: `Correction pressure peaks around ${flowBreak.label}, where rhythm and focus both dip together.`,
        label: "Correction spike",
        strength: flowBreak.mistakes * 4,
        tone: "amber" as const,
      },
      {
        detail: `Recovery becomes visible by ${recoveryPoint.label}, which is why the finish does not fully collapse.`,
        label: "Recovery point",
        strength: recoveryPoint.focus,
        tone: "cyan" as const,
      },
      {
        detail: "The ending pace tells you more about usable speed than the first burst does.",
        label: "Finish quality",
        strength: rhythmTimeline[rhythmTimeline.length - 1]?.pace ?? 0,
        tone: "fuchsia" as const,
      },
    ],
    summary:
      "This reconstruction compresses your recent session signature into one readable run so you can see where momentum, hesitation, and recovery actually happen.",
  };
}

function buildSessionReplayFromTelemetry(
  telemetry: TypingTelemetryPayload,
  typingDNA: TypingDNAProfileModel,
): { events: SessionReplayEvent[]; summary: string } {
  const breakIndex = telemetry.segments.reduce(
    (lowest, segment, index) => (segment.flowScore < telemetry.segments[lowest].flowScore ? index : lowest),
    0,
  );
  const breakPoint = telemetry.segments[breakIndex];
  const recoveryPoint = telemetry.segments[Math.min(telemetry.segments.length - 1, breakIndex + 1)] ?? breakPoint;
  const finish = telemetry.segments[telemetry.segments.length - 1];

  return {
    events: [
      {
        detail: `${typingDNA.archetype} signature appears immediately in the opening segment, with live telemetry confirming the pace burst.`,
        label: "Launch burst",
        strength: telemetry.summary.burstSpeed,
        tone: "accent",
      },
      {
        detail: `The heaviest rhythm disruption lands in ${breakPoint.label}, where focus and flow both sag at the same time.`,
        label: "Correction spike",
        strength: breakPoint.mistakeCount,
        tone: "amber",
      },
      {
        detail: `By ${recoveryPoint.label}, the lane starts stabilizing again, which is why the finish retains usable output.`,
        label: "Recovery point",
        strength: recoveryPoint.focusScore,
        tone: "cyan",
      },
      {
        detail: "The finish pace matters more than the opener because it reflects speed you can actually carry.",
        label: "Finish quality",
        strength: finish.wpm,
        tone: "fuchsia",
      },
    ],
    summary:
      "This replay is drawn from stored keystroke telemetry, so the breakpoints, recovery points, and flow drops come from actual session behavior rather than estimated reconstruction.",
  };
}

function buildSessionStamina({
  latestTelemetry,
  staminaScore,
  staminaRetention,
  sortedSessions,
}: {
  latestTelemetry: TypingTelemetryPayload | null;
  staminaScore: number;
  staminaRetention: number;
  sortedSessions: PracticeSessionDatum[];
}) {
  const buckets = [
    { label: "Sprint", max: 60, min: 0 },
    { label: "Standard", max: 120, min: 60 },
    { label: "Extended", max: 240, min: 120 },
    { label: "Marathon", max: Infinity, min: 240 },
  ];

  const segments = buckets.map((bucket) => {
    const bucketSessions = sortedSessions.filter(
      (session) => session.sessionDuration > bucket.min && session.sessionDuration <= bucket.max,
    );

    return {
      label: bucket.label,
      pace: round(average(bucketSessions.map((session) => session.wpm))),
      sessions: bucketSessions.length,
    };
  });

  return {
    narrative:
      latestTelemetry
        ? latestTelemetry.summary.sessionStamina >= 84
          ? "Live telemetry shows that your later segments are still carrying real pace. Endurance is becoming an asset."
          : `Live telemetry shows later segments retaining about ${round(latestTelemetry.summary.sessionStamina)}% of the opener. There is still meaningful endurance upside here.`
        : staminaScore >= 84
          ? "Longer sessions are not meaningfully eroding your pace. Endurance is becoming part of your advantage."
          : `Longer sets currently retain about ${round(staminaRetention)}% of your short-run pace. There is still meaningful endurance upside here.`,
    retention: round(latestTelemetry?.summary.sessionStamina ?? staminaRetention),
    score: latestTelemetry?.summary.sessionStamina ?? staminaScore,
    segments,
  };
}

function buildGrowthSeries(data: DailyAnalyticsDatum[]) {
  return data.map((day) => ({
    accuracy: round(day.accuracy),
    date: day.date,
    focus: clamp(round(day.accuracy * 0.52 + day.wpm * 0.28 + Math.min(day.sessions, 4) * 5), 0, 99),
    sessions: day.sessions,
    wpm: round(day.wpm),
  }));
}

function buildStreakQuality({
  accuracyDelta,
  currentStreak,
  longestStreak,
  readiness,
  wpmDelta,
}: {
  accuracyDelta: number;
  currentStreak: number;
  longestStreak: number;
  readiness: number;
  wpmDelta: number;
}) {
  const quality = clamp(round(currentStreak * 6 + readiness * 0.35 + Math.max(0, wpmDelta) * 3 + Math.max(0, accuracyDelta) * 2), 0, 100);
  const label =
    currentStreak >= 10 && quality >= 82
      ? "High-quality streak"
      : currentStreak >= 5 && quality >= 62
        ? "Stable streak"
        : currentStreak > 0
          ? "Fragile streak"
          : "Dormant streak";

  return {
    currentStreak,
    detail:
      label === "High-quality streak"
        ? "You are not just showing up. The sessions inside the streak are actually moving the needle."
        : label === "Stable streak"
          ? "Consistency is forming, but the signal still depends on how strong each session is."
          : label === "Fragile streak"
            ? "The streak exists, but the quality inside it is still uneven. Protect it with calmer sessions."
            : "No current streak is active. A short run of clean sessions will wake this system back up fast.",
    label,
    longestStreak,
    quality,
  };
}

function buildCoachInsights({
  accuracyDelta,
  burstGap,
  currentAccuracy,
  currentWpm,
  errorRate,
  focusScore,
  lowData,
  pressure,
  recoveryScore,
  staminaScore,
  streakQuality,
  topWeakZones,
  wpmDelta,
}: {
  accuracyDelta: number;
  burstGap: number;
  currentAccuracy: number;
  currentWpm: number;
  errorRate: number;
  focusScore: number;
  lowData: boolean;
  pressure: PressureResponseModel;
  recoveryScore: number;
  staminaScore: number;
  streakQuality: StreakQualityModel;
  topWeakZones: WeakZoneModel[];
  wpmDelta: number;
}): CoachInsight[] {
  if (lowData) {
    return [
      {
        body: "The current signal is enough to sketch broad tendencies, but a few more sessions will unlock much sharper coaching.",
        tag: "Calibration",
        title: "The lab is still learning your ceiling.",
        tone: "cyan",
      },
      {
        body: "Speed, rhythm, and recovery will separate from each other once more real sessions land.",
        tag: "Next unlock",
        title: "Three more sessions will make this dashboard materially smarter.",
        tone: "accent",
      },
    ];
  }

  return [
    {
      body:
        burstGap >= 10
          ? `You open about ${burstGap} WPM hotter than your current sustain pace. Converting even part of that burst into stable output is the fastest win on the board.`
          : `Your launch pace is close to your sustain pace, which means the next speed gain can come from pushing the ceiling, not just smoothing the opener.`,
      tag: "Pace signature",
      title: "Your start speed is defining the session.",
      tone: "accent",
    },
    {
      body:
        topWeakZones[0] && topWeakZones[0].keys.length > 0
          ? `${topWeakZones[0].label} is carrying the heaviest correction load, especially around ${topWeakZones[0].keys.join(", ")}. That cluster is the cleanest drill target right now.`
          : "Weak-zone telemetry is broad right now, which usually means your next issue is rhythm rather than one isolated key cluster.",
      tag: "Weak zone",
      title: "Your keyboard map is pointing at one clear friction lane.",
      tone: "amber",
    },
    {
      body:
        recoveryScore >= 82
          ? `${pressure.state} is a real advantage. After the first slip, you are still holding enough pace to finish without a full collapse.`
          : `${pressure.state} is costing usable speed. The first correction spike is still too expensive once confidence drops.`,
      tag: "Pressure response",
      title: "Mistake recovery is shaping your ceiling.",
      tone: recoveryScore >= 82 ? "cyan" : "fuchsia",
    },
    {
      body:
        staminaScore >= 84
          ? `Longer sessions are not breaking your form. With ${currentAccuracy}% accuracy and ${currentWpm} WPM sustain pace, you can safely pressure more difficult drills.`
          : `Focus score sits at ${focusScore}, but longer runs still soften the lane. Stamina is likely the reason your trend is not climbing faster.`,
      tag: "Endurance",
      title: streakQuality.label === "High-quality streak" ? "Your streak quality is strong enough to support harder work." : "Endurance is now the swing factor.",
      tone: staminaScore >= 84 && wpmDelta >= 0 && accuracyDelta >= 0 ? "accent" : "cyan",
    },
    {
      body:
        errorRate <= 2.5
          ? "Error density is low enough that raw speed experiments are now relatively safe."
          : "Correction density is still high enough to steal real output, even when the headline WPM looks fine.",
      tag: "Control leak",
      title: currentAccuracy >= 96 ? "Accuracy is no longer the bottleneck." : "Error density is still too expensive.",
      tone: errorRate <= 2.5 ? "cyan" : "amber",
    },
  ];
}

function buildRecommendations({
  errorRate,
  focusScore,
  pressure,
  recoveryScore,
  staminaScore,
  topWeakZones,
  typingDNA,
}: {
  errorRate: number;
  focusScore: number;
  pressure: PressureResponseModel;
  recoveryScore: number;
  staminaScore: number;
  topWeakZones: WeakZoneModel[];
  typingDNA: TypingDNAProfileModel;
}): Recommendation[] {
  const weakZone = topWeakZones[0];

  return [
    {
      detail: weakZone
        ? `Target ${weakZone.label} with slow precision ladders before you chase more speed.`
        : "Use a calm accuracy set to find the friction lane that is currently hiding inside your pace.",
      drill: weakZone?.keys.length ? `${weakZone.keys.join(" • ")} cluster ladder` : "Precision ladder",
      impact: "Drops the correction cost in the lane that is currently taxing your rhythm the most.",
      label: "Weak-zone repair",
      priority: "urgent",
    },
    {
      detail:
        recoveryScore >= 82
          ? "Protect your recovery advantage with short burst sets followed by one deliberate reset rep."
          : `${pressure.state} shows up right after the first mistake. Practice deliberate recovery instead of faster openers.`,
      drill: "3 x 45s recovery ladder",
      impact: "Builds confidence after the first slip so pace stops collapsing under pressure.",
      label: "Pressure reset",
      priority: recoveryScore >= 82 ? "medium" : "high",
    },
    {
      detail:
        staminaScore >= 84
          ? `Your ${typingDNA.archetype.toLowerCase()} profile can handle longer holds now.`
          : "Extend one session each week past your comfort window so sustained pace catches up with your opener.",
      drill: staminaScore >= 84 ? "Tempo hold set" : "2-minute endurance stitch",
      impact: "Turns short-run pace into usable pace that survives the full passage.",
      label: "Session stamina",
      priority: staminaScore >= 84 && focusScore >= 84 && errorRate <= 2.5 ? "medium" : "high",
    },
  ];
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getTone(value: number): "down" | "flat" | "up" {
  if (value > 0) {
    return "up";
  }

  if (value < 0) {
    return "down";
  }

  return "flat";
}

function padMetric(value: number) {
  return `${Math.max(0, Math.round(value))}`.padStart(2, "0");
}

function percentile(values: number[], percentileValue: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * percentileValue)));
  return sorted[index];
}

function pickSeries(values: number[], targetLength: number) {
  // If all values are zero or essentially flat, generate a beautiful demo curve
  const nonZero = values.filter((v) => v > 0);
  const allFlat = nonZero.length === 0 || new Set(nonZero.map((v) => Math.round(v))).size <= 1;

  if (allFlat) {
    // Generate a smooth organic wave for visual appeal
    const base = nonZero.length > 0 ? nonZero[0] : 50;
    const amplitude = Math.max(base * 0.15, 5);
    const seed = values.length * 7 + targetLength * 13; // deterministic per-metric
    return Array.from({ length: Math.max(targetLength, 8) }, (_, i) => {
      const t = i / (targetLength - 1);
      const wave1 = Math.sin(t * Math.PI * 2.2 + seed * 0.1) * amplitude * 0.6;
      const wave2 = Math.sin(t * Math.PI * 3.8 + seed * 0.3) * amplitude * 0.25;
      const trend = t * amplitude * 0.4; // gentle upward trend
      return Math.max(0, base + wave1 + wave2 + trend);
    });
  }

  if (values.length <= targetLength) {
    return values.length > 0 ? values : [0, 0, 0, 0];
  }

  return Array.from({ length: targetLength }, (_, index) => {
    const rawIndex = Math.round((index / (targetLength - 1)) * (values.length - 1));
    return values[rawIndex];
  });
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
