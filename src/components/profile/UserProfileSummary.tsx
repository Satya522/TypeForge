import {
  CalendarDays,
  Flame,
  Gauge,
  Medal,
  Radio,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type UserProfileSummaryProps = {
  achievementCount?: number
  archetype?: string | null
  avatarUrl: string | null
  averageAccuracy?: number | null
  averageWpm?: number | null
  bestAccuracy: number
  bestStreakDays?: number
  bestWpm: number
  bio?: string | null
  communityMessages?: number
  createdAt: Date
  displayName: string
  favoriteChannel?: string | null
  favoriteLanguage?: string | null
  favoriteLayout?: string | null
  handleLabel?: string | null
  lessonsCompleted: number
  momentumMeter?: number | null
  preferredGameMode?: string | null
  profileTitle?: string | null
  rankTier?: string | null
  signatureMode?: string | null
  streakDays: number
  totalSessions?: number
}

type Metric = {
  detail: string
  icon: LucideIcon
  label: string
  tone: string
  value: string
}

const RANK_TONES: Record<string, { aura: string; dot: string; text: string }> =
  {
    bronze: {
      aura: 'from-amber-400/20 via-orange-500/10 to-transparent',
      dot: 'bg-amber-400',
      text: 'text-[#d4a374]',
    },
    silver: {
      aura: 'from-zinc-300/18 via-slate-400/10 to-transparent',
      dot: 'bg-zinc-300',
      text: 'text-zinc-200',
    },
    gold: {
      aura: 'from-yellow-300/22 via-amber-400/10 to-transparent',
      dot: 'bg-amber-300',
      text: 'text-amber-200',
    },
    platinum: {
      aura: 'from-cyan-300/18 via-sky-400/10 to-transparent',
      dot: 'bg-cyan-300',
      text: 'text-cyan-200',
    },
    diamond: {
      aura: 'from-sky-300/20 via-cyan-400/10 to-transparent',
      dot: 'bg-cyan-300',
      text: 'text-sky-200',
    },
    master: {
      aura: 'from-fuchsia-300/18 via-violet-400/10 to-transparent',
      dot: 'bg-fuchsia-300',
      text: 'text-fuchsia-200',
    },
  }

function formatNumber(value?: number | null) {
  return Math.round(value ?? 0).toLocaleString('en-US')
}

function formatPercent(value?: number | null) {
  return `${Math.round(value ?? 0)}%`
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function formatChannelName(channel?: string | null) {
  if (!channel) return 'General'

  return channel
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

function plural(value: number, singular: string, pluralLabel = `${singular}s`) {
  return `${formatNumber(value)} ${value === 1 ? singular : pluralLabel}`
}

function getRankTone(rank?: string | null) {
  const normalized = (rank || 'Bronze').toLowerCase()
  return (
    Object.entries(RANK_TONES).find(([key]) => normalized.includes(key))?.[1] ||
    RANK_TONES.bronze
  )
}

function buildProfileTagline({
  averageAccuracy,
  averageWpm,
  bestWpm,
  bio,
  preferredGameMode,
  streakDays,
}: {
  averageAccuracy?: number | null
  averageWpm?: number | null
  bestWpm: number
  bio?: string | null
  preferredGameMode?: string | null
  streakDays: number
}) {
  if (bio?.trim()) return bio.trim()
  if (bestWpm >= 100)
    return 'Built for terminal velocity, calm hands, and clean execution.'
  if ((averageAccuracy ?? 0) >= 97)
    return 'Precision-first operator with a taste for clean, low-noise runs.'
  if (streakDays >= 7)
    return 'Momentum locked in. Showing up daily and sharpening the edge.'
  if ((averageWpm ?? 0) >= 60)
    return 'Fast enough to pressure the board, disciplined enough to keep improving.'
  if (preferredGameMode)
    return `Dialed into ${preferredGameMode.toLowerCase()} practice and building a sharper typing identity.`

  return 'Building a cleaner, faster typing identity one focused session at a time.'
}

export function UserProfileSummary({
  achievementCount = 0,
  archetype,
  avatarUrl,
  averageAccuracy,
  averageWpm,
  bestAccuracy,
  bestStreakDays = 0,
  bestWpm,
  bio,
  communityMessages = 0,
  createdAt,
  displayName,
  favoriteChannel,
  favoriteLanguage,
  favoriteLayout,
  handleLabel,
  lessonsCompleted,
  momentumMeter,
  preferredGameMode,
  profileTitle,
  rankTier = 'Bronze',
  signatureMode,
  streakDays,
  totalSessions = 0,
}: UserProfileSummaryProps) {
  const rankTone = getRankTone(rankTier)
  const rankLabel = rankTier || 'Bronze'
  const bestStreak = Math.max(bestStreakDays, streakDays)
  const identityTitle =
    profileTitle || archetype || signatureMode || `${rankLabel} Operator`
  const tagline = buildProfileTagline({
    averageAccuracy,
    averageWpm,
    bestWpm,
    bio,
    preferredGameMode,
    streakDays,
  })
  const momentum = Math.min(
    Math.max(momentumMeter ?? Math.min(100, streakDays * 8), 0),
    100
  )
  const favoriteChannelName = formatChannelName(favoriteChannel)
  const hasPerformanceData =
    bestWpm > 0 || bestAccuracy > 0 || totalSessions > 0
  const performanceNarrative = hasPerformanceData
    ? null
    : `${displayName} is in calibration mode. First timed sessions will unlock pace, accuracy, and a sharper rank story.`
  const showcaseMetrics: Metric[] = [
    {
      detail:
        bestWpm > 0 ? 'personal velocity ceiling' : 'first benchmark pending',
      icon: Gauge,
      label: 'Best WPM',
      tone: 'text-green-300',
      value: formatNumber(bestWpm),
    },
    {
      detail:
        bestAccuracy > 0
          ? 'cleanest verified line'
          : 'precision profile pending',
      icon: Target,
      label: 'Accuracy',
      tone: 'text-cyan-300',
      value: formatPercent(bestAccuracy),
    },
    {
      detail:
        streakDays > 0 ? 'current fire kept alive' : 'streak ready to ignite',
      icon: Flame,
      label: 'Streak',
      tone: 'text-orange-300',
      value: `${formatNumber(streakDays)}d`,
    },
    {
      detail:
        lessonsCompleted > 0
          ? 'completed training nodes'
          : 'lesson path waiting',
      icon: Trophy,
      label: 'Lessons',
      tone: 'text-amber-200',
      value: formatNumber(lessonsCompleted),
    },
  ]
  const storyItems = [
    {
      label: 'Favorite channel',
      value: favoriteChannelName,
      meta: communityMessages
        ? `${plural(communityMessages, 'post')} logged`
        : 'home base',
    },
    {
      label: 'Best streak',
      value: `${formatNumber(bestStreak)} days`,
      meta: bestStreak > streakDays ? 'all-time discipline' : 'active peak',
    },
    {
      label: 'Signature mode',
      value:
        signatureMode ||
        preferredGameMode ||
        favoriteLanguage ||
        'Sprint craft',
      meta: favoriteLayout ? `${favoriteLayout} layout` : 'preferred rhythm',
    },
    {
      label: 'Current badge',
      value: identityTitle,
      meta: achievementCount
        ? `${plural(achievementCount, 'badge')} earned`
        : rankLabel,
    },
  ]

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#070a08] px-5 py-6 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055),0_28px_80px_rgba(0,0,0,0.34)] sm:px-8 sm:py-8">
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--tw-gradient-stops))] blur-3xl',
          rankTone.aura
        )}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-transparent via-white/20 to-transparent"
      />

      <header className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <section className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <span className="relative mx-auto inline-flex sm:mx-0">
            <span
              aria-hidden="true"
              className="absolute -inset-3 rounded-full bg-white/[0.04] blur-md transition-opacity duration-300 group-hover:opacity-80"
            />
            <span
              aria-hidden="true"
              className={cn(
                'absolute -inset-2 rounded-full bg-gradient-to-br opacity-80 blur-sm',
                rankTone.aura
              )}
            />
            <Avatar
              src={avatarUrl}
              name={displayName}
              size={116}
              status="focus"
              className="relative ring-[3px]"
              ringOffsetClassName="ring-offset-[#070a08]"
            />
          </span>

          <section className="min-w-0 text-center sm:text-left">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/[0.045] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-zinc-400 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
              <span className={cn('h-1.5 w-1.5 rounded-full', rankTone.dot)} />
              Flagship profile
            </p>
            <h2 className="[text-wrap:balance] text-[clamp(2.4rem,7vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.08em] text-white">
              {displayName}
            </h2>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-zinc-500 sm:justify-start">
              {handleLabel ? <span>{handleLabel}</span> : null}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5',
                  rankTone.text
                )}
              >
                <span
                  className={cn('h-1.5 w-1.5 rounded-full', rankTone.dot)}
                />
                {rankLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                Joined {formatDate(createdAt)}
              </span>
            </p>
            <p className="mt-5 max-w-2xl [text-wrap:pretty] text-[15px] leading-7 text-zinc-400">
              {tagline}
            </p>
          </section>
        </section>

        <aside className="rounded-[1.5rem] bg-white/[0.035] p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)] transition-colors duration-200 ease-out hover:bg-white/[0.05]">
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            <Sparkles size={13} className="text-green-300" />
            Identity signal
          </p>
          <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
            {identityTitle}
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {preferredGameMode || favoriteLanguage || 'Focused typing craft'} ·{' '}
            {formatNumber(totalSessions)} sessions
          </p>
          <span className="mt-5 block h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-green-300 via-cyan-300 to-white transition-[width] duration-500 ease-out"
              style={{ width: `${momentum}%` }}
            />
          </span>
          <p className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Momentum</span>
            <span>{momentum}%</span>
          </p>
        </aside>
      </header>

      <ul className="relative mt-10 grid gap-px overflow-hidden rounded-[1.5rem] bg-white/[0.055] p-px sm:grid-cols-2 lg:grid-cols-4">
        {showcaseMetrics.map((metric) => {
          const Icon = metric.icon

          return (
            <li
              key={metric.label}
              className="group bg-[#0b0f0c]/95 p-5 transition-colors duration-200 ease-out hover:bg-[#101610]"
            >
              <p className="flex items-center justify-between gap-4 text-[12px] text-zinc-500">
                <span>{metric.label}</span>
                <Icon
                  size={16}
                  className={cn(
                    'transition-transform duration-200 ease-out group-hover:-translate-y-0.5',
                    metric.tone
                  )}
                />
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {metric.value}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-zinc-600">
                {metric.detail}
              </p>
            </li>
          )
        })}
      </ul>

      <section className="relative mt-9 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <article>
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            <Radio size={13} className="text-zinc-400" />
            Field notes
          </p>
          <ul className="mt-5 divide-y divide-white/[0.055]">
            {storyItems.map((item) => (
              <li
                key={item.label}
                className="grid gap-2 py-4 transition-colors duration-150 ease-out hover:text-white sm:grid-cols-[11rem_1fr] sm:items-center"
              >
                <span className="text-[12px] text-zinc-500">{item.label}</span>
                <span className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[15px] font-medium text-zinc-200">
                    {item.value}
                  </span>
                  <span className="text-[12px] text-zinc-600">{item.meta}</span>
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-[1.5rem] bg-gradient-to-br from-white/[0.055] via-white/[0.025] to-transparent p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
          <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            <Shield size={13} className={rankTone.text} />
            Beast mode profile
          </p>
          <p className="mt-4 text-[15px] leading-7 text-zinc-400">
            {hasPerformanceData ? (
              <>
                {displayName} is currently operating as a{' '}
                <span className={cn('font-medium', rankTone.text)}>
                  {rankLabel}
                </span>{' '}
                typist with {formatPercent(averageAccuracy ?? bestAccuracy)}{' '}
                average accuracy and a {formatNumber(bestWpm)} WPM ceiling.
              </>
            ) : (
              performanceNarrative
            )}
          </p>
          <ul className="mt-5 grid gap-3 text-sm text-zinc-400">
            <li className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2">
                <Zap size={14} className="text-green-300" />
                Average pace
              </span>
              <span className="font-medium text-zinc-200">
                {formatNumber(averageWpm)} WPM
              </span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2">
                <Medal size={14} className="text-amber-200" />
                Achievements
              </span>
              <span className="font-medium text-zinc-200">
                {formatNumber(achievementCount)}
              </span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2">
                <Flame size={14} className="text-orange-300" />
                Active streak
              </span>
              <span className="font-medium text-zinc-200">
                {formatNumber(streakDays)} days
              </span>
            </li>
          </ul>
        </article>
      </section>
    </section>
  )
}
