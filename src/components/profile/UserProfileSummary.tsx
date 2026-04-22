import { Avatar } from '@/components/ui/avatar'

type UserProfileSummaryProps = {
  avatarUrl: string | null
  bestAccuracy: number
  bestWpm: number
  bio?: string | null
  createdAt: Date
  displayName: string
  handleLabel?: string | null
  lessonsCompleted: number
  streakDays: number
}

export function UserProfileSummary({
  avatarUrl,
  bestAccuracy,
  bestWpm,
  bio,
  createdAt,
  displayName,
  handleLabel,
  lessonsCompleted,
  streakDays,
}: UserProfileSummaryProps) {
  return (
    <>
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-shrink-0">
          <Avatar src={avatarUrl} name={displayName} size={96} className="ring-1 ring-white/10" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gray-100">{displayName}</h2>
          {handleLabel ? <p className="text-sm text-gray-400">{handleLabel}</p> : null}
          {bio ? <p className="mt-2 text-gray-400">{bio}</p> : null}
          <p className="mt-2 text-xs text-gray-500">Joined {createdAt.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="text-xs uppercase text-gray-400">Lessons Completed</p>
          <p className="text-2xl font-bold text-accent-200">{lessonsCompleted}</p>
        </div>
        <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="text-xs uppercase text-gray-400">Best WPM</p>
          <p className="text-2xl font-bold text-accent-200">{bestWpm}</p>
        </div>
        <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="text-xs uppercase text-gray-400">Best Accuracy</p>
          <p className="text-2xl font-bold text-accent-200">{bestAccuracy}%</p>
        </div>
        <div className="rounded-lg border border-surface-300 bg-surface-200 p-4">
          <p className="text-xs uppercase text-gray-400">Current Streak</p>
          <p className="text-2xl font-bold text-accent-200">{streakDays} days</p>
        </div>
      </div>
    </>
  )
}
