'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { Socket } from 'socket.io-client'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  BellRing,
  Bold,
  Code2,
  Command,
  Flame,
  Loader2,
  Italic,
  Paperclip,
  Pin,
  Search,
  Send,
  SmilePlus,
  Swords,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { useStreak } from '@/hooks/useStreak'
import { getCommunitySocket, resetCommunitySocket } from '@/lib/socket'
import { cn } from '@/lib/utils'
import { MessageBubble } from '@/components/community/MessageBubble'
import { LiveRaceOverlay } from '@/components/community/LiveRaceOverlay'
import { EmojiPicker } from '@/components/community/EmojiPicker'
import { UserIdentityCard } from '@/components/community/UserIdentityCard'
import { ChannelList } from '@/components/community/ChannelList'
import { LiveRaceTicker } from '@/components/community/LiveRaceTicker'
import { EmptyState } from '@/components/community/EmptyState'
import { WPMFlexCard } from '@/components/community/WPMFlexCard'
import { StreakFlexBanner } from '@/components/community/StreakFlexBanner'
import { DailyPulse } from '@/components/community/DailyPulse'
import { CommandPalette } from '@/components/community/CommandPalette'
import { NotificationCenter } from '@/components/community/NotificationCenter'
import { ProfileHoverCard } from '@/components/profile'
import { Avatar } from '@/components/ui/avatar'
import { getDisplayName, getResolvedAvatarUrl, isProfileComplete } from '@/lib/profile'

type ChannelGroup = 'GENERAL' | 'COMPETE' | 'LEARN' | 'CHILL'
type ChannelType = 'text' | 'race' | 'event' | 'drills'
type Presence = 'online' | 'focus' | 'racing' | 'away'
type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Master'

const COMPOSER_MAX_HEIGHT = 120

type Channel = {
  id: string
  name: string
  icon: string
  description: string
  memberCount: number
  type: ChannelType
  group: ChannelGroup
}

type CommunityProfile = {
  id: string
  name: string
  avatar?: string | null
  handle?: string | null
  color: string
  gradient?: string
  status?: 'online' | 'idle' | 'dnd' | 'invisible'
  wpm: number
  accuracy: number
  level?: number
  rankTier?: string
  isPremium?: boolean
  currentChannel?: string
}

type CommunityMessage = {
  id: string
  channelId: string
  type: string
  subtype?: string
  userId?: string
  userName: string
  avatarUrl?: string | null
  userColor?: string
  userGradient?: string
  userLevel?: number
  content: string
  timestamp: number
  reactions?: Record<string, string[]>
  replyTo?: { id: string; userName: string; content: string } | null
  pinned?: boolean
  edited?: boolean
  editedAt?: number
}

type TypingUser = {
  name: string
  color: string
}

type RacePlayer = {
  id: string
  name: string
  color: string
  wpm: number
  accuracy?: number
  progress: number
  finished: boolean
}

type RaceState = {
  id: string
  channelId: string
  creatorId?: string
  creatorName?: string
  sentence?: string
  status: 'waiting' | 'countdown' | 'racing' | 'finished'
  players: RacePlayer[]
}

type LiveRaceSummary = {
  id: string
  channelId: string
  channelName: string
  participantCount: number
  status: 'waiting' | 'countdown' | 'racing' | 'finished'
  players: RacePlayer[]
}

type LiveRaidSummary = {
  id: string
  channelId: string
  bossName: string
  participantCount: number
  status: 'waiting' | 'active' | 'defeated'
  players: Array<{ name: string; color: string }>
}

type CommunityMeta = {
  typingByChannel: Record<string, TypingUser[]>
  activeRaces: LiveRaceSummary[]
  activeRaids: LiveRaidSummary[]
}

type InlineCommand = {
  command: '/race' | '/raid' | '/join' | '/wpm' | '/challenge'
  label: string
  description: string
}

type NotificationItem = {
  id: string
  type: 'race_invite' | 'mention' | 'streak' | 'event' | 'wpm_beat'
  title: string
  description: string
  timestamp: Date
  unread: boolean
  action?: () => void
}

type SpecialMessage =
  | {
      kind: 'wpm'
      payload: {
        userName: string
        wpm: number
        accuracy: number
        rank: Rank
        date: string
      }
    }
  | {
      kind: 'streak'
      payload: {
        userName: string
        streakCount: number
      }
    }
  | null

type TextSelection = {
  start: number
  end: number
}

export type CommunityBootstrap = {
  streak: number
  totalSessions: number
  bestWpm: number
  favoriteChannel: string | null
  rank: string | null
}

const WPM_CARD_PREFIX = '[typeforge:wpm]'
const STREAK_CARD_PREFIX = '[typeforge:streak]'

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'General',
    icon: 'chat',
    description: 'Squad chat, check-ins and daily pulse.',
    memberCount: 0,
    type: 'text',
    group: 'GENERAL',
  },
  {
    id: 'speed-runs',
    name: 'Speed Runs',
    icon: 'race',
    description: 'Sprint cards, ghost challenges and live races.',
    memberCount: 0,
    type: 'race',
    group: 'COMPETE',
  },
  {
    id: 'challenges',
    name: 'Challenges',
    icon: 'event',
    description: 'Head-to-head calls, raid summons and invites.',
    memberCount: 0,
    type: 'event',
    group: 'COMPETE',
  },
  {
    id: 'tips-tricks',
    name: 'Tips & Tricks',
    icon: 'chat',
    description: 'Layouts, drills and technique swaps.',
    memberCount: 0,
    type: 'text',
    group: 'LEARN',
  },
  {
    id: 'code-typing',
    name: 'Code Typing',
    icon: 'drills',
    description: 'Syntax pace, bracket flow and coding drills.',
    memberCount: 0,
    type: 'drills',
    group: 'LEARN',
  },
  {
    id: 'show-off',
    name: 'Show Off',
    icon: 'chat',
    description: 'Streak flexes, PB drops and achievement posts.',
    memberCount: 0,
    type: 'text',
    group: 'CHILL',
  },
  {
    id: 'off-topic',
    name: 'Off Topic',
    icon: 'chat',
    description: 'Setups, side quests and late-night chaos.',
    memberCount: 0,
    type: 'text',
    group: 'CHILL',
  },
]

const INLINE_COMMANDS: InlineCommand[] = [
  { command: '/race', label: 'Start a typing race', description: 'Spin up a live race lobby for this channel.' },
  { command: '/raid', label: 'Summon a boss fight', description: 'Call the squad into a co-op typing raid.' },
  { command: '/join', label: 'Join a lobby code', description: 'Use /join [code] to jump into a queued race.' },
  { command: '/wpm', label: 'Post your WPM card', description: 'Share a rich flex card with speed and accuracy.' },
  { command: '/challenge', label: 'Challenge a member', description: 'Use /challenge @user to call someone out.' },
]

const STATUS_OPTIONS: Array<{ value: Exclude<Presence, 'racing'>; label: string }> = [
  { value: 'online', label: 'Online' },
  { value: 'focus', label: 'Focus' },
  { value: 'away', label: 'Away' },
]

function withMessage(list: CommunityMessage[], message: CommunityMessage) {
  const existingIndex = list.findIndex((entry) => entry.id === message.id)
  if (existingIndex === -1) {
    return [...list, message].sort((left, right) => left.timestamp - right.timestamp)
  }

  const next = [...list]
  next[existingIndex] = message
  return next
}

function getChannelMeta(id: string) {
  return DEFAULT_CHANNELS.find((channel) => channel.id === id)
}

function enrichChannels(incoming: Array<Partial<Channel> & Pick<Channel, 'id' | 'name' | 'description' | 'memberCount'>>) {
  return incoming.map((channel) => {
    const fallback = getChannelMeta(channel.id) || DEFAULT_CHANNELS[0]

    return {
      ...fallback,
      ...channel,
      type: fallback.type,
      group: fallback.group,
      icon: fallback.icon,
    }
  })
}

function normalizeRank(rank: string | null | undefined, wpm: number): Rank {
  const value = (rank || '').toLowerCase()

  if (value.includes('vantablack') || value.includes('master')) return 'Master'
  if (value.includes('diamond') || value.includes('neon') || value.includes('platinum')) return 'Diamond'
  if (value.includes('gold')) return 'Gold'
  if (value.includes('silver')) return 'Silver'
  if (wpm >= 150) return 'Master'
  if (wpm >= 120) return 'Diamond'
  if (wpm >= 100) return 'Gold'
  if (wpm >= 80) return 'Silver'
  return 'Bronze'
}

function getRankTextClass(rank: Rank) {
  if (rank === 'Gold') return 'text-amber-300'
  if (rank === 'Silver') return 'text-slate-300'
  if (rank === 'Diamond') return 'text-sky-300'
  if (rank === 'Master') return 'text-fuchsia-300'
  return 'text-[#d4a374]'
}

function encodeWpmCard(payload: {
  userName: string
  wpm: number
  accuracy: number
  rank: Rank
  date: string
}) {
  return `${WPM_CARD_PREFIX}${JSON.stringify(payload)}`
}

function encodeStreakCard(payload: { userName: string; streakCount: number }) {
  return `${STREAK_CARD_PREFIX}${JSON.stringify(payload)}`
}

function parseSpecialMessage(content: string): SpecialMessage {
  if (content.startsWith(WPM_CARD_PREFIX)) {
    try {
      const payload = JSON.parse(content.slice(WPM_CARD_PREFIX.length)) as {
        userName: string
        wpm: number
        accuracy: number
        rank: Rank
        date: string
      }
      return { kind: 'wpm', payload }
    } catch {
      return null
    }
  }

  if (content.startsWith(STREAK_CARD_PREFIX)) {
    try {
      const payload = JSON.parse(content.slice(STREAK_CARD_PREFIX.length)) as {
        userName: string
        streakCount: number
      }
      return { kind: 'streak', payload }
    } catch {
      return null
    }
  }

  return null
}

function isWpmSpecial(
  entry: { message: CommunityMessage; special: SpecialMessage }
): entry is {
  message: CommunityMessage
  special: Extract<SpecialMessage, { kind: 'wpm' }>
} {
  return entry.special?.kind === 'wpm'
}

function formatChannelName(channelId: string) {
  return getChannelMeta(channelId)?.name || channelId
}

function CommunityClientPremium({
  initialStats,
}: {
  initialStats?: CommunityBootstrap | null
}) {
  const router = useRouter()
  const { data: session, status: sessionStatus, update: updateSession } = useSession()
  const prefersReducedMotion = useReducedMotion()
  const { streak, pb } = useStreak()

  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const liveRaceSeenRef = useRef<Set<string>>(new Set())
  const liveRaidSeenRef = useRef<Set<string>>(new Set())
  const notificationSeenRef = useRef<Set<string>>(new Set())
  const activeChannelRef = useRef('general')
  const currentUserNameRef = useRef('Typist')
  const personalBestWpmRef = useRef(0)

  const [hydrated, setHydrated] = useState(false)
  const [socketStatus, setSocketStatus] = useState<'idle' | 'connecting' | 'connected' | 'offline'>('idle')
  const [baseChannels, setBaseChannels] = useState<Channel[]>(DEFAULT_CHANNELS)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [activeChannelId, setActiveChannelId] = useState('general')
  const [profile, setProfile] = useState<CommunityProfile | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<CommunityProfile[]>([])
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, CommunityMessage[]>>({})
  const [typingByChannel, setTypingByChannel] = useState<Record<string, TypingUser[]>>({})
  const [liveRaces, setLiveRaces] = useState<LiveRaceSummary[]>([])
  const [liveRaids, setLiveRaids] = useState<LiveRaidSummary[]>([])
  const [draft, setDraft] = useState('')
  const [attachments, setAttachments] = useState<Array<{ file: File; preview?: string }>>([])
  const [replyTarget, setReplyTarget] = useState<CommunityMessage | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [presence, setPresence] = useState<Exclude<Presence, 'racing'>>('online')
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [dismissedTickerRaceIds, setDismissedTickerRaceIds] = useState<string[]>([])
  const [selection, setSelection] = useState<TextSelection | null>(null)
  const [composerFocused, setComposerFocused] = useState(false)
  const [sendPulse, setSendPulse] = useState(false)
  const [memberDetailId, setMemberDetailId] = useState<string | null>(null)
  const [activeRace, setActiveRace] = useState<RaceState | null>(null)
  const [dismissedProfileNudge, setDismissedProfileNudge] = useState(Boolean(session?.user?.profileNudgeDismissed))

  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    setDismissedProfileNudge(Boolean(session?.user?.profileNudgeDismissed))
  }, [session?.user?.profileNudgeDismissed])

  useEffect(() => {
    const element = composerRef.current
    if (!element) return

    element.style.height = 'auto'
    element.style.height = `${Math.min(element.scrollHeight, COMPOSER_MAX_HEIGHT)}px`
  }, [draft])

  const currentUserName = profile?.name || getDisplayName(session?.user, 'Typist')
  const currentAvatarUrl = profile?.avatar || getResolvedAvatarUrl(session?.user)
  const currentWpm = profile?.wpm || initialStats?.bestWpm || pb.wpm || 0
  const currentAccuracy = profile?.accuracy || pb.accuracy || 0
  const currentRank = normalizeRank(initialStats?.rank || profile?.rankTier, Math.round(currentWpm))
  const currentStreak = Math.max(initialStats?.streak || 0, streak.currentStreak)
  const totalSessions = Math.max(initialStats?.totalSessions || 0, 0)
  const shouldShowProfileNudge =
    !dismissedProfileNudge &&
    !isProfileComplete({
      avatarUrl: currentAvatarUrl,
      handle: session?.user?.handle,
      nickname: session?.user?.nickname,
    })

  activeChannelRef.current = activeChannelId
  currentUserNameRef.current = currentUserName
  personalBestWpmRef.current = Math.max(initialStats?.bestWpm || 0, pb.wpm || 0)

  const favoriteChannel =
    initialStats?.favoriteChannel ||
    Object.entries(messagesByChannel)
      .map(([channelId, list]) => ({
        channelId,
        count: list.filter((message) => message.userName === currentUserName).length,
      }))
      .sort((left, right) => right.count - left.count)[0]?.channelId ||
    'general'

  const derivedPresence: Presence = activeRace?.players.some((player) => player.name === currentUserName)
    ? 'racing'
    : presence

  const channels = baseChannels.map((channel) => {
    const raceInChannel = liveRaces.find((race) => race.channelId === channel.id && race.status !== 'finished')
    return {
      ...channel,
      unreadCount: unreadCounts[channel.id] || 0,
      typingUsers: typingByChannel[channel.id]?.length || 0,
      hasRaceActive: Boolean(raceInChannel),
    }
  })

  const filteredChannels = channels.filter((channel) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return true
    return (
      channel.name.toLowerCase().includes(query) ||
      channel.description.toLowerCase().includes(query)
    )
  })

  const activeChannel =
    channels.find((channel) => channel.id === activeChannelId) ||
    DEFAULT_CHANNELS.find((channel) => channel.id === activeChannelId) ||
    DEFAULT_CHANNELS[0]

  const activeMessages = messagesByChannel[activeChannelId] || []
  const activeTypingUsers = typingByChannel[activeChannelId] || []
  const activePinnedMessages = activeMessages.filter((message) => message.pinned)
  const activeChannelRace = liveRaces.find(
    (race) => race.channelId === activeChannelId && race.status !== 'finished'
  )
  const globalTickerRace = liveRaces.find(
    (race) => race.status !== 'finished' && !dismissedTickerRaceIds.includes(race.id)
  )
  const unreadNotificationCount = notifications.filter((notification) => notification.unread).length

  const todayMessages = Object.values(messagesByChannel)
    .flat()
    .filter((message) => new Date(message.timestamp).toDateString() === new Date().toDateString())

  const wpmCardsThisWeek = Object.values(messagesByChannel)
    .flat()
    .map((message) => ({ message, special: parseSpecialMessage(message.content) }))
    .filter(isWpmSpecial)
    .filter((entry) => new Date(entry.message.timestamp).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000)

  const activityCounts = todayMessages.reduce<Record<string, number>>((accumulator, message) => {
    const key = message.userName || 'Unknown'
    accumulator[key] = (accumulator[key] || 0) + 1
    return accumulator
  }, {})

  const dailyPulseMostActive =
    Object.entries(activityCounts).sort((left, right) => right[1] - left[1])[0] ||
    [currentUserName, 0]

  const fastestToday =
    todayMessages
      .map((message) => ({ message, special: parseSpecialMessage(message.content) }))
      .filter(isWpmSpecial)
      .sort((left, right) => right.special.payload.wpm - left.special.payload.wpm)[0] ||
    null

  const mostImprovedMember =
    (() => {
      const progressMap = new Map<string, { min: number; max: number }>()

      for (const entry of wpmCardsThisWeek) {
        if (entry.special?.kind !== 'wpm') continue

        const existing = progressMap.get(entry.special.payload.userName)
        if (!existing) {
          progressMap.set(entry.special.payload.userName, {
            min: entry.special.payload.wpm,
            max: entry.special.payload.wpm,
          })
          continue
        }

        existing.min = Math.min(existing.min, entry.special.payload.wpm)
        existing.max = Math.max(existing.max, entry.special.payload.wpm)
      }

      return Array.from(progressMap.entries())
        .map(([name, values]) => ({ name, gain: values.max - values.min }))
        .sort((left, right) => right.gain - left.gain)[0]?.name || currentUserName
    })()

  const sortedMembers = [...onlineUsers].sort((left, right) => right.wpm - left.wpm)

  function resetComposerState() {
    attachments.forEach((attachment) => {
      if (attachment.preview) {
        URL.revokeObjectURL(attachment.preview)
      }
    })

    setAttachments([])
    setDraft('')
    setReplyTarget(null)
    setShowEmojiPicker(false)
    setSelection(null)
  }

  function pushNotification(notification: NotificationItem) {
    if (notificationSeenRef.current.has(notification.id)) {
      return
    }

    notificationSeenRef.current.add(notification.id)
    setNotifications((previous) => [notification, ...previous].slice(0, 24))
  }

  function markNotificationAsRead(id: string) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    )
  }

  function removeNotification(id: string) {
    setNotifications((previous) => previous.filter((notification) => notification.id !== id))
  }

  function postSystemDraft(message: string) {
    setDraft(message)
    composerRef.current?.focus()
  }

  async function dismissProfileNudge() {
    setDismissedProfileNudge(true)

    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileNudgeDismissed: true }),
      })
      await updateSession({ profileNudgeDismissed: true })
    } catch (error) {
      console.error('[Community] Failed to dismiss profile nudge', error)
    }
  }

  function updateUnread(channelId: string, shouldIncrement: boolean) {
    if (!shouldIncrement) return
    if (channelId === activeChannelRef.current) return

    setUnreadCounts((previous) => ({
      ...previous,
      [channelId]: (previous[channelId] || 0) + 1,
    }))
  }

  function focusComposer() {
    composerRef.current?.focus()
  }

  function closeRaceOverlay() {
    setActiveRace(null)
  }

  function openRaceOverlay(race: RaceState) {
    setActiveRace(race)
  }

  function handleIncomingMessage(message: CommunityMessage) {
    setMessagesByChannel((previous) => {
      const existed = (previous[message.channelId] || []).some((entry) => entry.id === message.id)
      const next = {
        ...previous,
        [message.channelId]: withMessage(previous[message.channelId] || [], message),
      }

      if (!existed) {
        updateUnread(
          message.channelId,
          message.type !== 'system' && message.userName !== currentUserNameRef.current
        )
      }

      return next
    })

    const loweredContent = message.content.toLowerCase()

    if (
      message.type !== 'system' &&
      message.userName !== currentUserNameRef.current &&
      loweredContent.includes(`@${currentUserNameRef.current.toLowerCase()}`)
    ) {
      pushNotification({
        id: `mention-${message.id}`,
        type: 'mention',
        title: `${message.userName} mentioned you`,
        description: formatChannelName(message.channelId),
        timestamp: new Date(message.timestamp),
        unread: true,
        action: () => {
          setActiveChannelId(message.channelId)
          markNotificationAsRead(`mention-${message.id}`)
        },
      })
    }

    const parsed = parseSpecialMessage(message.content)
    if (
      parsed?.kind === 'wpm' &&
      parsed.payload.userName !== currentUserNameRef.current &&
      personalBestWpmRef.current > 0 &&
      parsed.payload.wpm > personalBestWpmRef.current
    ) {
      pushNotification({
        id: `wpm-${message.id}`,
        type: 'wpm_beat',
        title: `${parsed.payload.userName} beat your pace`,
        description: `${parsed.payload.wpm} WPM posted in ${formatChannelName(message.channelId)}`,
        timestamp: new Date(message.timestamp),
        unread: true,
        action: () => {
          setActiveChannelId(message.channelId)
          markNotificationAsRead(`wpm-${message.id}`)
        },
      })
    }
  }

  function syncSelection() {
    const element = composerRef.current
    if (!element) return

    const nextSelection =
      element.selectionStart === element.selectionEnd
        ? null
        : {
            start: element.selectionStart,
            end: element.selectionEnd,
          }

    setSelection(nextSelection)
  }

  function applyFormat(format: 'bold' | 'italic' | 'code') {
    const element = composerRef.current
    if (!element) return

    const start = element.selectionStart
    const end = element.selectionEnd
    if (start === end) return

    const token = format === 'bold' ? '**' : format === 'italic' ? '*' : '`'
    const selectedText = draft.slice(start, end)
    const nextValue = `${draft.slice(0, start)}${token}${selectedText}${token}${draft.slice(end)}`
    setDraft(nextValue)

    window.requestAnimationFrame(() => {
      element.focus()
      const offset = token.length
      element.setSelectionRange(start + offset, end + offset)
      syncSelection()
    })
  }

  function triggerSendPulse() {
    if (prefersReducedMotion) return
    setSendPulse(true)
    window.setTimeout(() => setSendPulse(false), 260)
  }

  function postWpmCard(channelId = activeChannelId) {
    const payload = {
      userName: currentUserName,
      wpm: Math.round(Math.max(currentWpm, initialStats?.bestWpm || 0)),
      accuracy: Number(Math.max(currentAccuracy, pb.accuracy || 0).toFixed(1)),
      rank: currentRank,
      date: new Date().toISOString(),
    }

    socketRef.current?.emit('message:send', {
      channelId,
      content: encodeWpmCard(payload),
      replyTo: replyTarget
        ? { id: replyTarget.id, userName: replyTarget.userName, content: replyTarget.content }
        : null,
    })

    resetComposerState()
  }

  function postStreakBanner() {
    const storageKey = 'typeforge:community:last-streak-flex'
    if (typeof window !== 'undefined') {
      const previous = window.localStorage.getItem(storageKey)
      if (previous === String(currentStreak)) {
        return
      }
      window.localStorage.setItem(storageKey, String(currentStreak))
    }

    if (socketStatus === 'connected') {
      socketRef.current?.emit('message:send', {
        channelId: 'show-off',
        content: encodeStreakCard({ userName: currentUserName, streakCount: currentStreak }),
      })
    } else {
      const messageId = `local-streak-${currentStreak}`
      setMessagesByChannel((previous) => {
        const existing = previous['show-off'] || []
        if (existing.some((message) => message.id === messageId)) {
          return previous
        }

        const nextMessage: CommunityMessage = {
          id: messageId,
          channelId: 'show-off',
          type: 'user',
          subtype: 'streak',
          userName: currentUserName,
          userColor: profile?.color || '#f97316',
          content: encodeStreakCard({ userName: currentUserName, streakCount: currentStreak }),
          timestamp: Date.now(),
          reactions: { '🔥': [] },
        }

        return {
          ...previous,
          'show-off': withMessage(existing, nextMessage),
        }
      })
    }

    pushNotification({
      id: `streak-${currentStreak}`,
      type: 'streak',
      title: `${currentStreak}-day streak ready to flex`,
      description: 'Your banner just landed in Show Off.',
      timestamp: new Date(),
      unread: true,
      action: () => {
        setActiveChannelId('show-off')
        markNotificationAsRead(`streak-${currentStreak}`)
      },
    })
  }

  function createGhostChallenge(targetUser: string, targetWpm: number) {
    const ghostRace: RaceState = {
      id: `ghost-${Date.now()}`,
      channelId: 'speed-runs',
      creatorName: currentUserName,
      status: 'waiting',
      sentence: `Ghost target locked at ${targetWpm} WPM. Beat the replay pace.`,
      players: [
        {
          id: 'ghost-run',
          name: `${targetUser}'s Ghost`,
          color: '#60a5fa',
          wpm: targetWpm,
          accuracy: 100,
          progress: 100,
          finished: true,
        },
        {
          id: profile?.id || 'you',
          name: currentUserName,
          color: profile?.color || '#39ff14',
          wpm: 0,
          accuracy: currentAccuracy,
          progress: 0,
          finished: false,
        },
      ],
    }

    openRaceOverlay(ghostRace)
    setActiveChannelId('speed-runs')
    toast.success(`Ghost challenge loaded against ${targetUser}`)
  }

  function createChallengeDraft(target?: string) {
    const targetHandle = target ? `@${target}` : '@user'
    postSystemDraft(`/challenge ${targetHandle} `)
  }

  function startRace(channelId = activeChannelId) {
    socketRef.current?.emit('race:create', { channelId })
    toast.success(`Race lobby opening in ${formatChannelName(channelId)}`)
  }

  function joinRace(raceId: string, channelId?: string) {
    socketRef.current?.emit('race:join', raceId)
    if (channelId) {
      setActiveChannelId(channelId)
    }
  }

  function handleCommandSubmit(input: string) {
    const trimmed = input.trim()
    if (!trimmed.startsWith('/')) return false

    if (trimmed === '/race') {
      startRace()
      resetComposerState()
      return true
    }

    if (trimmed === '/raid') {
      socketRef.current?.emit('raid:create', { channelId: activeChannelId })
      toast.success('Boss raid summon dropped into the channel')
      resetComposerState()
      return true
    }

    if (trimmed === '/wpm') {
      postWpmCard()
      return true
    }

    if (trimmed.startsWith('/join')) {
      const code = trimmed.split(/\s+/)[1]
      const match = liveRaces.find(
        (race) => race.id === code || race.id.slice(0, 6).toLowerCase() === (code || '').toLowerCase()
      )

      if (!match) {
        toast.error('That lobby code is not live right now')
        return true
      }

      joinRace(match.id, match.channelId)
      resetComposerState()
      return true
    }

    if (trimmed.startsWith('/challenge')) {
      const target = trimmed.replace('/challenge', '').trim() || '@the-lobby'
      socketRef.current?.emit('message:send', {
        channelId: activeChannelId,
        content: `⚔️ ${currentUserName} challenged ${target} to beat ${Math.round(currentWpm)} WPM. Who is answering?`,
        replyTo: replyTarget
          ? { id: replyTarget.id, userName: replyTarget.userName, content: replyTarget.content }
          : null,
      })
      resetComposerState()
      return true
    }

    return false
  }

  function handleDraftChange(value: string) {
    setDraft(value)

    if (socketRef.current && socketStatus === 'connected') {
      if (value.trim()) {
        socketRef.current.emit('typing:start', activeChannelId)
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = window.setTimeout(() => {
        socketRef.current?.emit('typing:stop', activeChannelId)
      }, 900)
    }
  }

  const handleInput = (event: React.FormEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget
    target.style.height = 'auto'
    target.style.height = `${Math.min(target.scrollHeight, COMPOSER_MAX_HEIGHT)}px`
  }

  function handleSendMessage() {
    if (handleCommandSubmit(draft)) {
      triggerSendPulse()
      return
    }

    const content = draft.trim()
    const attachmentLabel = attachments.length
      ? `\n\nAttached: ${attachments.map((attachment) => attachment.file.name).join(', ')}`
      : ''
    const finalContent = `${content}${attachmentLabel}`.trim()
    if (!finalContent) return

    socketRef.current?.emit('message:send', {
      channelId: activeChannelId,
      content: finalContent,
      replyTo: replyTarget
        ? { id: replyTarget.id, userName: replyTarget.userName, content: replyTarget.content }
        : null,
    })

    resetComposerState()
    socketRef.current?.emit('typing:stop', activeChannelId)
    triggerSendPulse()
  }

  function handleFileSelect(files: FileList | null) {
    if (!files) return

    const MAX_FILE_SIZE = 10 * 1024 * 1024
    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large`)
        return
      }

      const preview =
        file.type.startsWith('image/') || file.type.startsWith('video/')
          ? URL.createObjectURL(file)
          : undefined

      setAttachments((previous) => [...previous, { file, preview }])
    })
  }

  function removeAttachment(index: number) {
    setAttachments((previous) => {
      const next = [...previous]
      const removed = next[index]
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      next.splice(index, 1)
      return next
    })
  }

  function getMemberActivity(member: CommunityProfile) {
    const inRaid = liveRaids.some((raid) =>
      raid.status !== 'defeated' && raid.players.some((player) => player.name === member.name)
    )
    if (inRaid) return 'in boss fight'

    const inRace = liveRaces.some((race) =>
      race.status !== 'finished' && race.players.some((player) => player.name === member.name)
    )
    if (inRace) return 'in race'

    const isTyping = Object.values(typingByChannel).some((users) =>
      users.some((user) => user.name === member.name)
    )
    if (isTyping) return 'typing'

    return 'idle'
  }

  function getMemberPresence(member: CommunityProfile): Presence {
    const activity = getMemberActivity(member)
    if (activity === 'in boss fight' || activity === 'in race') return 'racing'
    if (member.status === 'dnd') return 'focus'
    if (member.status === 'idle' || member.status === 'invisible') return 'away'
    return 'online'
  }

  function getPresenceRingClass(nextPresence: Presence) {
    if (nextPresence === 'online') return 'ring-green-500'
    if (nextPresence === 'focus') return 'ring-blue-500'
    if (nextPresence === 'racing') return 'ring-amber-500'
    return 'ring-zinc-500'
  }

  function getHeaderAction() {
    if (activeChannelId === 'speed-runs') {
      return {
        label: 'Post Score',
        icon: Trophy,
        onClick: () => postWpmCard('speed-runs'),
      }
    }

    if (activeChannelId === 'challenges') {
      return {
        label: 'Join Challenge',
        icon: Swords,
        onClick: () => {
          if (activeChannelRace) {
            joinRace(activeChannelRace.id, activeChannelRace.channelId)
            return
          }

          createChallengeDraft()
        },
      }
    }

    if (activeChannelId === 'show-off') {
      return {
        label: 'Share Achievement',
        icon: BellRing,
        onClick: () => {
          if (currentStreak >= 7) {
            postStreakBanner()
            return
          }

          postWpmCard('show-off')
        },
      }
    }

    return null
  }

  const headerAction = getHeaderAction()

  useEffect(() => {
    if (!hydrated || sessionStatus === 'loading') return

    const socket = getCommunitySocket()
    if (!socket) return

    socketRef.current = socket

    async function handleConnect() {
      setSocketStatus('connected')

      let token: string | undefined
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/auth/socket-token', { cache: 'no-store' })
          if (response.ok) {
            const data = (await response.json()) as { token?: string }
            token = data.token
          }
        } catch (error) {
          console.error('[Community] Failed to fetch socket token', error)
        }
      }

      const activeSocket = socketRef.current
      if (!activeSocket) return

      activeSocket.emit('user:join', {
        name: session?.user?.name || 'Typist',
        avatar: session?.user?.image,
        color: '#39ff14',
        token,
      })
    }

    function handleDisconnect() {
      setSocketStatus('offline')
    }

    function handleChannels(incomingChannels: Array<Partial<Channel> & Pick<Channel, 'id' | 'name' | 'description' | 'memberCount'>>) {
      setBaseChannels(enrichChannels(incomingChannels))
    }

    function handleProfile(incomingProfile: CommunityProfile) {
      setProfile(incomingProfile)
      if (incomingProfile.status === 'dnd') setPresence('focus')
      if (incomingProfile.status === 'idle' || incomingProfile.status === 'invisible') setPresence('away')
      if (incomingProfile.status === 'online') setPresence('online')
    }

    function handleHistory(payload: { channelId: string; messages: CommunityMessage[] }) {
      setMessagesByChannel((previous) => ({
        ...previous,
        [payload.channelId]: payload.messages.sort((left, right) => left.timestamp - right.timestamp),
      }))
    }

    function handleRoomMessage(message: CommunityMessage) {
      handleIncomingMessage(message)
    }

    function handleGlobalMessage(message: CommunityMessage) {
      handleIncomingMessage(message)
    }

    function handleTypingUpdate(payload: { channelId: string; users: TypingUser[] }) {
      setTypingByChannel((previous) => ({
        ...previous,
        [payload.channelId]: payload.users,
      }))
    }

    function handleUsersOnline(users: CommunityProfile[]) {
      setOnlineUsers(users)
    }

    function handleMeta(meta: CommunityMeta) {
      setTypingByChannel(meta.typingByChannel)
      setLiveRaces(meta.activeRaces)
      setLiveRaids(meta.activeRaids)

      for (const race of meta.activeRaces) {
        if (liveRaceSeenRef.current.has(race.id)) continue
        liveRaceSeenRef.current.add(race.id)

        pushNotification({
          id: `race-${race.id}`,
          type: 'race_invite',
          title: `${race.participantCount} members racing in ${race.channelName}`,
          description: 'Tap in and join the live lobby.',
          timestamp: new Date(),
          unread: true,
          action: () => {
            setActiveChannelId(race.channelId)
            joinRace(race.id, race.channelId)
            markNotificationAsRead(`race-${race.id}`)
          },
        })
      }

      for (const raid of meta.activeRaids) {
        if (liveRaidSeenRef.current.has(raid.id)) continue
        liveRaidSeenRef.current.add(raid.id)

        pushNotification({
          id: `raid-${raid.id}`,
          type: 'event',
          title: `${raid.bossName} is live`,
          description: `${raid.participantCount} members are in the boss fight.`,
          timestamp: new Date(),
          unread: true,
          action: () => {
            setActiveChannelId(raid.channelId)
            markNotificationAsRead(`raid-${raid.id}`)
          },
        })
      }
    }

    function handleRaceSnapshot(race: RaceState) {
      if (
        race.channelId === activeChannelRef.current ||
        race.players.some((player) => player.name === currentUserNameRef.current)
      ) {
        openRaceOverlay(race)
      }
    }

    function handleRaceProgress(payload: { raceId: string; players: RacePlayer[] }) {
      setActiveRace((previous) =>
        previous?.id === payload.raceId
          ? {
              ...previous,
              status: 'racing',
              players: payload.players,
            }
          : previous
      )
    }

    function handleRaceFinished(payload: { raceId: string; results: RacePlayer[] }) {
      setActiveRace((previous) =>
        previous?.id === payload.raceId
          ? {
              ...previous,
              status: 'finished',
              players: payload.results,
            }
          : previous
      )
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('channels:list', handleChannels)
    socket.on('user:profile', handleProfile)
    socket.on('channel:history', handleHistory)
    socket.on('message:new', handleRoomMessage)
    socket.on('community:message', handleGlobalMessage)
    socket.on('typing:update', handleTypingUpdate)
    socket.on('users:online', handleUsersOnline)
    socket.on('community:meta', handleMeta)
    socket.on('race:created', handleRaceSnapshot)
    socket.on('race:updated', handleRaceSnapshot)
    socket.on('race:started', handleRaceSnapshot)
    socket.on('race:progress', handleRaceProgress)
    socket.on('race:finished', handleRaceFinished)

    if (socket.connected) {
      void handleConnect()
    } else {
      setSocketStatus('connecting')
      socket.connect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('channels:list', handleChannels)
      socket.off('user:profile', handleProfile)
      socket.off('channel:history', handleHistory)
      socket.off('message:new', handleRoomMessage)
      socket.off('community:message', handleGlobalMessage)
      socket.off('typing:update', handleTypingUpdate)
      socket.off('users:online', handleUsersOnline)
      socket.off('community:meta', handleMeta)
      socket.off('race:created', handleRaceSnapshot)
      socket.off('race:updated', handleRaceSnapshot)
      socket.off('race:started', handleRaceSnapshot)
      socket.off('race:progress', handleRaceProgress)
      socket.off('race:finished', handleRaceFinished)
      resetCommunitySocket()
    }
  }, [hydrated, session?.user?.id, session?.user?.image, session?.user?.name, sessionStatus])

  useEffect(() => {
    if (socketStatus !== 'connected') return
    socketRef.current?.emit('channel:join', activeChannelId)
    setUnreadCounts((previous) => ({
      ...previous,
      [activeChannelId]: 0,
    }))
  }, [activeChannelId, socketStatus])

  useEffect(() => {
    if (!hydrated || currentStreak < 7 || currentStreak % 7 !== 0) return
    postStreakBanner()
  }, [currentStreak, hydrated])

  useEffect(() => {
    if (!hydrated) return

    messagesEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [activeChannelId, activeMessages.length, prefersReducedMotion])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const shortcutPressed =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'

      if (!shortcutPressed) return
      event.preventDefault()
      setShowCommandPalette(true)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const mappedStatus = presence === 'online' ? 'online' : presence === 'focus' ? 'dnd' : 'idle'
    socketRef.current?.emit('user:status', mappedStatus)
  }, [presence])

  if (!hydrated || sessionStatus === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading community...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#08090b] text-white">
        <aside className="flex w-72 flex-col overflow-hidden border-r border-white/5 bg-[#111317]">
          <div className="border-b border-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <UserIdentityCard
                name={currentUserName}
                avatarUrl={currentAvatarUrl}
                handle={session?.user?.handle}
                wpm={Math.round(currentWpm)}
                accuracy={currentAccuracy}
                status={derivedPresence}
                rank={currentRank}
                streak={currentStreak}
                totalSessions={totalSessions}
                bestWpm={Math.round(Math.max(initialStats?.bestWpm || 0, pb.wpm || 0, currentWpm))}
                favoriteChannel={formatChannelName(favoriteChannel)}
                showProfileNudge={shouldShowProfileNudge}
                onDismissProfileNudge={dismissProfileNudge}
              />
              <NotificationCenter
                unreadCount={unreadNotificationCount}
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onDismiss={removeNotification}
              />
            </div>

            <button
              type="button"
              onClick={() => setActiveChannelId('show-off')}
              className="mt-3 inline-flex w-full items-center justify-between px-1 text-left text-[12px] text-slate-400 transition-colors duration-150 ease-out hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Flame size={15} className="text-orange-300" />
                {currentStreak}-day streak
              </span>
              <span className="text-[11px] font-normal text-[#22c55e]">Show off</span>
            </button>

            <div className="mt-3 inline-flex rounded-xl bg-white/[0.04] p-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPresence(option.value)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors duration-150 ease-out',
                    presence === option.value
                      ? 'bg-[#22c55e] text-white'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-white/5 px-3 py-3">
            <label className="relative block">
              <Search size={14} className="pointer-events-none absolute left-3 top-2.5 text-slate-500" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search channels"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-accent-300/30"
              />
            </label>
          </div>

          <ChannelList
            channels={filteredChannels}
            activeChannelId={activeChannelId}
            onSelectChannel={(channelId) => {
              setActiveChannelId(channelId)
              setReplyTarget(null)
              setSearchQuery('')
            }}
          />

          <div className="border-t border-white/5 p-3">
            <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    socketStatus === 'connected' ? 'bg-emerald-400' : 'bg-slate-500'
                  )}
                />
                {socketStatus === 'connected' ? 'Live relay online' : 'Socket offline'}
              </span>
              <button
                type="button"
                onClick={() => setSoundEnabled((previous) => !previous)}
                className="rounded-lg px-2.5 py-1 text-[11px] text-slate-400 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
              >
                {soundEnabled ? 'Sound on' : 'Sound off'}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="border-b border-white/5 bg-[#0b0d10]/90 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h1 className="truncate text-[16px] font-semibold text-white">{activeChannel.name}</h1>
                <p className="truncate text-[13px] text-slate-500">{activeChannel.description}</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {onlineUsers.length} live
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {headerAction ? (
                  <button
                    type="button"
                    onClick={headerAction.onClick}
                    className="inline-flex h-8 items-center gap-2 rounded-xl bg-white/[0.05] px-3 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-white/[0.08]"
                  >
                    <headerAction.icon size={15} />
                    {headerAction.label}
                  </button>
                ) : null}

                <motion.button
                  type="button"
                  onClick={() => startRace()}
                  className="inline-flex h-8 items-center gap-2 rounded-xl bg-[#22c55e] px-3.5 text-[13px] font-medium text-[#04120a] transition-colors duration-150 ease-out hover:bg-[#34d399]"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                >
                  <Zap size={15} />
                  Start Race
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    if (!activePinnedMessages.length) {
                      toast.message('No pinned messages in this channel yet')
                      return
                    }
                    setReplyTarget(activePinnedMessages[activePinnedMessages.length - 1])
                  }}
                  className="rounded-lg p-2 text-slate-500 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
                  aria-label="Open pinned messages"
                >
                  <Pin size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowCommandPalette(true)}
                  className="rounded-lg p-2 text-slate-500 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
                  aria-label="Search channels and members"
                >
                  <Search size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowMembers((previous) => !previous)}
                  className={cn(
                    'rounded-lg p-2 transition-colors duration-150 ease-out',
                    showMembers ? 'bg-white/[0.07] text-white' : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
                  )}
                  aria-label="Toggle members panel"
                >
                  <Users size={16} />
                </button>
              </div>
            </div>
          </header>

          {activeChannelRace ? (
            <div className="border-b border-white/5 bg-white/[0.025] px-6 py-2">
              <div className="flex items-center gap-2 text-[12px] text-slate-400">
                <motion.span
                  animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                  transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 1.2 }}
                  className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"
                />
                <span>
                  {activeChannelRace.participantCount} members are racing in {activeChannel.name} right now.
                </span>
              </div>
            </div>
          ) : null}

          <LiveRaceTicker
            isOpen={Boolean(globalTickerRace)}
            raceChannelName={globalTickerRace?.channelName || activeChannel.name}
            participantCount={globalTickerRace?.participantCount || 0}
            onJoin={() => {
              if (!globalTickerRace) return
              setActiveChannelId(globalTickerRace.channelId)
              joinRace(globalTickerRace.id, globalTickerRace.channelId)
            }}
            onClose={() => {
              if (!globalTickerRace) return
              setDismissedTickerRaceIds((previous) => [...previous, globalTickerRace.id])
            }}
          />

          <div className="flex min-h-0 flex-1">
            <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                {activeChannelId === 'general' ? (
                  <DailyPulse
                    mostActiveUser={dailyPulseMostActive[0]}
                    mostActiveWpm={dailyPulseMostActive[1]}
                    fastestWpm={fastestToday?.special.kind === 'wpm' ? fastestToday.special.payload.userName : currentUserName}
                    fastestWpmValue={
                      fastestToday?.special.kind === 'wpm'
                        ? fastestToday.special.payload.wpm
                        : Math.round(Math.max(currentWpm, initialStats?.bestWpm || 0))
                    }
                    mostImprovedUser={mostImprovedMember}
                    activeChallengeCount={liveRaces.length + liveRaids.length}
                  />
                ) : null}

                {activeMessages.length === 0 ? (
                  <EmptyState
                    channelId={activeChannelId}
                    onSendMessage={() => focusComposer()}
                    onStartRace={() => startRace()}
                  />
                ) : null}

                {activeMessages.map((message) => {
                  const parsed = parseSpecialMessage(message.content)

                  if (parsed?.kind === 'wpm') {
                    return (
                      <div key={message.id} className="flex gap-3">
                        <ProfileHoverCard
                          userId={message.userId}
                          fallbackAvatarUrl={message.avatarUrl}
                          fallbackName={message.userName || parsed.payload.userName}
                        >
                          <Avatar
                            src={message.avatarUrl}
                            name={message.userName || parsed.payload.userName}
                            size={36}
                            className="ring-1 ring-white/10"
                            fallbackClassName="text-xs"
                          />
                        </ProfileHoverCard>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                            <ProfileHoverCard
                              userId={message.userId}
                              fallbackAvatarUrl={message.avatarUrl}
                              fallbackName={message.userName || parsed.payload.userName}
                            >
                              <span className="font-semibold text-slate-200">{message.userName || parsed.payload.userName}</span>
                            </ProfileHoverCard>
                            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <WPMFlexCard
                            wpm={parsed.payload.wpm}
                            accuracy={parsed.payload.accuracy}
                            date={new Date(parsed.payload.date)}
                            rank={parsed.payload.rank}
                            userName={parsed.payload.userName}
                            onChallenge={() => createChallengeDraft(parsed.payload.userName)}
                            onGhostRace={
                              activeChannelId === 'speed-runs'
                                ? () => createGhostChallenge(parsed.payload.userName, parsed.payload.wpm)
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    )
                  }

                  if (parsed?.kind === 'streak') {
                    return (
                      <StreakFlexBanner
                        key={message.id}
                        userName={parsed.payload.userName}
                        streakCount={parsed.payload.streakCount}
                        isCurrentUser={parsed.payload.userName === currentUserName}
                        onReact={() => {
                          socketRef.current?.emit('message:react', {
                            channelId: message.channelId,
                            messageId: message.id,
                            emoji: '🔥',
                          })
                        }}
                      />
                    )
                  }

                  if (message.type === 'system') {
                    return (
                      <p key={message.id} className="py-1 text-center text-[11px] text-slate-500/70">
                        — {message.content} —
                      </p>
                    )
                  }

                  return (
                    <MessageBubble
                      key={message.id}
                      message={{
                        id: message.id,
                        userId: message.userId,
                        userName: message.userName || 'Unknown',
                        avatarUrl: message.avatarUrl,
                        userColor: message.userColor || '#39ff14',
                        content: message.content,
                        timestamp: message.timestamp,
                        messageType: 'text',
                        reactions: message.reactions,
                        isPinned: message.pinned,
                        replyTo: message.replyTo
                          ? {
                              userName: message.replyTo.userName,
                              content: message.replyTo.content,
                            }
                          : undefined,
                      }}
                      onReply={() => setReplyTarget(message)}
                      onReact={(emoji) =>
                        socketRef.current?.emit('message:react', {
                          channelId: activeChannelId,
                          messageId: message.id,
                          emoji,
                        })
                      }
                      onCopy={() => navigator.clipboard.writeText(message.content)}
                    />
                  )
                })}

                {activeTypingUsers.length > 0 ? (
                  <p className="text-center text-[12px] text-slate-500">
                    <span className="text-slate-300">{activeTypingUsers.map((user) => user.name).join(', ')}</span> typing...
                  </p>
                ) : null}

                <div ref={messagesEndRef} />
              </div>

              {replyTarget ? (
                <div className="border-t border-white/5 bg-white/[0.02] px-6 py-3">
                  <div className="flex items-center justify-between gap-3 rounded-[18px] bg-black/25 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-300">
                        Replying to <span className="font-semibold text-white">{replyTarget.userName}</span>
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">{replyTarget.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTarget(null)}
                      className="rounded-lg px-2.5 py-1 text-xs text-slate-400 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-white/5 bg-[#0b0d10]/92 px-6 py-4 backdrop-blur-xl">
                <div
                  className={cn(
                    'relative rounded-2xl border px-4 py-3 transition-[border-color,box-shadow,background-color] duration-200 ease-out',
                    composerFocused
                      ? 'border-white/[0.12] bg-white/[0.045] shadow-[0_0_0_1px_rgba(34,197,94,0.10),0_12px_32px_rgba(0,0,0,0.22)]'
                      : 'border-white/[0.06] bg-white/[0.03]'
                  )}
                >
                  <AnimatePresence>
                    {selection ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute -top-11 left-4 z-20 flex items-center gap-1 rounded-xl bg-[#111317] p-1 shadow-[0_12px_30px_rgba(0,0,0,0.28)]"
                      >
                        <button
                          type="button"
                          onClick={() => applyFormat('bold')}
                          className="rounded-lg p-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white"
                          aria-label="Bold selected text"
                        >
                          <Bold size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat('italic')}
                          className="rounded-lg p-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white"
                          aria-label="Italic selected text"
                        >
                          <Italic size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => applyFormat('code')}
                          className="rounded-lg p-2 text-slate-300 transition-colors duration-150 ease-out hover:bg-white/[0.06] hover:text-white"
                          aria-label="Format selected text as code"
                        >
                          <Code2 size={14} />
                        </button>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <AnimatePresence>
                    {draft.trim().startsWith('/') ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-full left-0 right-0 mb-3 overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111317]/98 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
                      >
                        {INLINE_COMMANDS.filter((entry) =>
                          entry.command.includes(draft.trim().toLowerCase().split(/\s+/)[0] || '/')
                        ).map((entry) => (
                          <button
                            key={entry.command}
                            type="button"
                            onClick={() => {
                              if (entry.command === '/join') {
                                setDraft('/join ')
                              } else if (entry.command === '/challenge') {
                                setDraft('/challenge @')
                              } else {
                                setDraft(entry.command)
                              }
                              focusComposer()
                            }}
                            className="flex w-full items-start gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-white/[0.04]"
                          >
                            <Command size={15} className="mt-0.5 text-[#22c55e]" />
                            <div>
                              <p className="text-sm font-semibold text-white">{entry.command}</p>
                              <p className="mt-1 text-xs text-slate-400">{entry.label}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{entry.description}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {attachments.length > 0 ? (
                    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                      {attachments.map((attachment, index) => (
                        <div
                          key={`${attachment.file.name}-${index}`}
                          className="min-w-0 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">{attachment.file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="rounded-md px-1.5 py-0.5 text-[10px] text-slate-400 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
                            >
                              x
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <textarea
                        ref={composerRef}
                        value={draft}
                        onChange={(event) => handleDraftChange(event.target.value)}
                        onInput={handleInput}
                        onSelect={syncSelection}
                        onKeyUp={syncSelection}
                        onMouseUp={syncSelection}
                        onFocus={() => setComposerFocused(true)}
                        onBlur={() => {
                          setComposerFocused(false)
                          window.setTimeout(() => syncSelection(), 0)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        rows={1}
                        placeholder="Type something fast… or / for commands"
                        className="w-full [min-height:unset] h-auto resize-none overflow-y-auto bg-transparent pr-14 text-sm leading-[1.6] text-white outline-none placeholder:text-slate-600"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <label className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white">
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(event) => handleFileSelect(event.target.files)}
                          />
                          <Paperclip size={16} />
                        </label>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker((previous) => !previous)}
                            className="rounded-lg p-1.5 text-slate-500 transition-colors duration-150 ease-out hover:bg-white/[0.05] hover:text-white"
                            aria-label="Open emoji picker"
                          >
                            <SmilePlus size={16} />
                          </button>
                          <EmojiPicker
                            isOpen={showEmojiPicker}
                            onSelectEmoji={(emoji) => {
                              setDraft((previous) => `${previous}${emoji}`)
                              setShowEmojiPicker(false)
                              focusComposer()
                            }}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.button
                          type="button"
                          onClick={handleSendMessage}
                          animate={sendPulse ? { scale: [1, 0.95, 1.05, 1] } : undefined}
                          whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
                          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                          className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#22c55e] px-3.5 text-sm font-medium text-[#04120a] transition-colors duration-150 ease-out hover:bg-[#34d399]"
                          aria-label="Send message"
                        >
                          <Send size={15} />
                          Send
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <AnimatePresence initial={false}>
              {showMembers ? (
                <motion.aside
                  initial={{ x: 280 }}
                  animate={{ x: 0 }}
                  exit={{ x: 280 }}
                  transition={prefersReducedMotion ? { duration: 0.12 } : undefined}
                  className="flex w-80 flex-col overflow-hidden border-l border-white/5 bg-[#111317]"
                >
                  <div className="border-b border-white/5 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-600">ONLINE MEMBERS</p>
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-slate-300">
                        {onlineUsers.length} live
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-3 py-3">
                    {sortedMembers.length === 0 ? (
                      <div className="flex min-h-[16rem] flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm text-slate-400">No one here yet</p>
                        <button
                          type="button"
                          onClick={() => setShowCommandPalette(true)}
                          className="mt-4 text-[12px] text-[#22c55e] transition-colors duration-150 ease-out hover:text-[#34d399]"
                        >
                          invite someone
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {sortedMembers.map((member) => {
                          const memberActivity = getMemberActivity(member)
                          const memberPresence = getMemberPresence(member)
                          const memberRank = normalizeRank(member.rankTier, member.wpm)
                          const isExpanded = memberDetailId === member.id

                          return (
                            <div
                              key={member.id}
                              className="group rounded-xl px-3 py-2 transition-colors duration-150 ease-out hover:bg-white/[0.04]"
                            >
                              <div className="flex items-start gap-3">
                                <ProfileHoverCard
                                  userId={member.id}
                                  fallbackAvatarUrl={member.avatar}
                                  fallbackName={member.name}
                                  status={memberPresence}
                                  onChallenge={() => createChallengeDraft(member.name)}
                                  className="flex min-w-0 flex-1 items-start gap-3"
                                >
                                  <Avatar
                                    src={member.avatar}
                                    name={member.name}
                                    size={28}
                                    status={memberPresence}
                                    ringOffsetClassName="ring-offset-[#111317]"
                                    className="text-[11px]"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="truncate text-[13px] font-medium text-white">{member.name}</p>
                                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-slate-300">
                                        {Math.round(member.wpm)} WPM
                                      </span>
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-1.5">
                                      <span className="text-[11px] capitalize text-slate-500">{memberActivity}</span>
                                      <span aria-hidden="true" className="text-slate-600">
                                        ·
                                      </span>
                                      <span className={cn('text-[11px]', getRankTextClass(memberRank))}>{memberRank}</span>
                                    </div>
                                  </div>
                                </ProfileHoverCard>
                              </div>

                              <div className="mt-2 flex gap-2 opacity-100 transition-opacity duration-150 ease-out md:opacity-0 md:group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => createChallengeDraft(member.name)}
                                  className="flex-1 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 ease-out hover:bg-white/[0.08]"
                                >
                                  Challenge
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMemberDetailId((previous) => (previous === member.id ? null : member.id))
                                  }
                                  className="flex-1 rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors duration-150 ease-out hover:bg-white/[0.08]"
                                >
                                  View Profile
                                </button>
                              </div>

                              <AnimatePresence initial={false}>
                                {isExpanded ? (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                    <div className="mt-2 rounded-[16px] bg-black/20 px-3 py-2.5 text-xs text-slate-400">
                                      <p>{Math.round(member.accuracy)}% accuracy snapshot</p>
                                      <p className="mt-1">
                                        Current channel: {formatChannelName(member.currentChannel || activeChannelId)}
                                      </p>
                                    </div>
                                  </motion.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.aside>
              ) : null}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <LiveRaceOverlay
        isOpen={Boolean(activeRace)}
        raceId={activeRace?.id}
        players={(activeRace?.players || []).map((player) => ({
          ...player,
          accuracy: player.accuracy ?? 0,
        }))}
        status={activeRace?.status || 'waiting'}
        isCreator={Boolean(activeRace?.creatorId && activeRace.creatorId === socketRef.current?.id)}
        currentUserId={socketRef.current?.id}
        onJoin={() => {
          if (!activeRace) return
          joinRace(activeRace.id, activeRace.channelId)
        }}
        onStart={() => {
          if (!activeRace) return
          socketRef.current?.emit('race:start', activeRace.id)
        }}
        onClose={closeRaceOverlay}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        channels={channels.map((channel) => ({ id: channel.id, name: channel.name }))}
        members={sortedMembers.map((member) => ({ id: member.id, name: member.name }))}
        onNavigateChannel={(channelId) => setActiveChannelId(channelId)}
        onStartRace={() => startRace()}
        onViewLeaderboard={() => router.push('/leaderboard')}
        onPostAchievement={() => {
          if (currentStreak >= 7) {
            postStreakBanner()
            setActiveChannelId('show-off')
            return
          }

          postWpmCard('show-off')
          setActiveChannelId('show-off')
        }}
        onInviteMember={() => createChallengeDraft()}
      />
    </>
  )
}

export { CommunityClientPremium }
