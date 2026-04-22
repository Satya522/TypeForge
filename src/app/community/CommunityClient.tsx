"use client";

import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  Crown,
  Hash,
  Loader2,
  LogIn,
  MessageSquare,
  Pin,
  Reply,
  Send,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getCommunitySocket, resetCommunitySocket } from '@/lib/socket';

type UserBadge = {
  id: string;
  icon: string;
  name: string;
};

type Channel = {
  id: string;
  name: string;
  icon: string;
  description: string;
  memberCount: number;
};

type CommunityProfile = {
  id: string;
  name: string;
  isGuest?: boolean;
  avatar?: string | null;
  color: string;
  gradient?: string;
  status: "online" | "idle" | "dnd" | "invisible";
  statusText?: string;
  wpm: number;
  accuracy: number;
  level: number;
  xp: number;
  joinedAt: number;
  badges: UserBadge[];
  currentChannel?: string;
  rankTier?: string;
  isPremium?: boolean;
};

type CommunityMessage = {
  id: string;
  channelId: string;
  type: string;
  subtype?: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  userGradient?: string;
  userBadges?: UserBadge[];
  userLevel?: number;
  content: string;
  timestamp: number;
  reactions?: Record<string, string[]>;
  replyTo?: {
    id: string;
    userName: string;
    content: string;
  } | null;
  edited?: boolean;
  editedAt?: number;
  pinned?: boolean;
};

type TypingUser = {
  color: string;
  name: string;
};

type RacePlayer = {
  id: string;
  name: string;
  color: string;
  gradient?: string;
  progress: number;
  wpm: number;
  finished: boolean;
  finishTime: number | null;
  isCheater?: boolean;
};

type RaceState = {
  id: string;
  channelId: string;
  creatorId: string;
  creatorName: string;
  sentence: string;
  status: "waiting" | "countdown" | "racing" | "finished";
  maxPlayers: number;
  players: RacePlayer[];
  createdAt: number;
  startedAt: number | null;
};

type RaidPlayer = {
  color: string;
  damage: number;
  dps: number;
  name: string;
};

type RaidState = {
  id: string;
  bossName: string;
  channelId: string;
  creatorId: string;
  maxHp: number;
  hp: number;
  players: RaidPlayer[];
  startedAt: number | null;
  status: "waiting" | "active" | "defeated";
};

type CommunityPrefs = {
  activeChannelId: string;
  showMembers: boolean;
  soundEnabled: boolean;
  status: CommunityProfile["status"];
};

type GuestIdentity = {
  avatar: string;
  color: string;
  gradient: string;
  name: string;
};

const STORAGE_PREFS_KEY = "typeforge:community:prefs";
const STORAGE_GUEST_KEY = "typeforge:community:guest";

const DEFAULT_CHANNELS: Channel[] = [
  { id: "general", name: "General", icon: "💬", description: "Hang out and chat about anything typing related", memberCount: 0 },
  { id: "speed-runs", name: "Speed Runs", icon: "⚡", description: "Share your fastest WPM records and compete", memberCount: 0 },
  { id: "tips-tricks", name: "Tips & Tricks", icon: "🎯", description: "Pro techniques, shortcuts, and typing wisdom", memberCount: 0 },
  { id: "show-off", name: "Show Off", icon: "🏆", description: "Flex your milestones, screenshots, and streaks", memberCount: 0 },
  { id: "code-typing", name: "Code Typing", icon: "💻", description: "Talk about typing code with the squad", memberCount: 0 },
  { id: "challenges", name: "Challenges", icon: "⚔️", description: "Queue races and co-op boss fights live", memberCount: 0 },
  { id: "off-topic", name: "Off Topic", icon: "🎮", description: "Memes, setups, music and late-night chaos", memberCount: 0 },
];

const QUICK_REACTIONS = ["🔥", "⚡", "💯", "🎯"];

const GUEST_COLORS = ["#39ff14", "#9bff38", "#58f7ff", "#f6c64f", "#ff7ac6"];
const GUEST_GRADIENTS = [
  "linear-gradient(135deg, #39ff14, #0d8d3f)",
  "linear-gradient(135deg, #58f7ff, #246bff)",
  "linear-gradient(135deg, #f6c64f, #ff7d24)",
  "linear-gradient(135deg, #ff7ac6, #9333ea)",
  "linear-gradient(135deg, #b8ff68, #0ea56a)",
];

const RAID_SEQUENCES = [
  "WEBSOCKET",
  "LOW LATENCY",
  "TYPEFORGE",
  "BOSS RAID",
  "SQUAD WIPE",
  "LIVE PRECISION",
];

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
});

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function createGuestIdentity(): GuestIdentity {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return {
    name: `Typist_${suffix}`,
    avatar: suffix.slice(0, 2),
    color: pickRandom(GUEST_COLORS),
    gradient: pickRandom(GUEST_GRADIENTS),
  };
}

function loadGuestIdentity() {
  if (typeof window === "undefined") {
    return createGuestIdentity();
  }

  const raw = window.localStorage.getItem(STORAGE_GUEST_KEY);
  if (!raw) {
    const identity = createGuestIdentity();
    window.localStorage.setItem(STORAGE_GUEST_KEY, JSON.stringify(identity));
    return identity;
  }

  try {
    const parsed = JSON.parse(raw) as GuestIdentity;
    if (parsed.name && parsed.color && parsed.gradient) {
      return parsed;
    }
  } catch (error) {
    console.error("[Community] Failed to parse guest identity", error);
  }

  const identity = createGuestIdentity();
  window.localStorage.setItem(STORAGE_GUEST_KEY, JSON.stringify(identity));
  return identity;
}

function loadPrefs(): CommunityPrefs {
  if (typeof window === "undefined") {
    return {
      activeChannelId: "general",
      showMembers: true,
      soundEnabled: true,
      status: "online",
    };
  }

  const raw = window.localStorage.getItem(STORAGE_PREFS_KEY);
  if (!raw) {
    return {
      activeChannelId: "general",
      showMembers: true,
      soundEnabled: true,
      status: "online",
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CommunityPrefs>;
    return {
      activeChannelId: parsed.activeChannelId || "general",
      showMembers: parsed.showMembers ?? true,
      soundEnabled: parsed.soundEnabled ?? true,
      status: parsed.status || "online",
    };
  } catch (error) {
    console.error("[Community] Failed to parse preferences", error);
    return {
      activeChannelId: "general",
      showMembers: true,
      soundEnabled: true,
      status: "online",
    };
  }
}

function savePrefs(prefs: CommunityPrefs) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(prefs));
}

function withMessage(list: CommunityMessage[], nextMessage: CommunityMessage) {
  const existingIndex = list.findIndex((message) => message.id === nextMessage.id);
  if (existingIndex === -1) {
    return [...list, nextMessage].sort((left, right) => left.timestamp - right.timestamp);
  }

  const copy = [...list];
  copy[existingIndex] = nextMessage;
  return copy;
}

function getInitials(name?: string | null) {
  if (!name) {
    return "TF";
  }

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function renderInlineMarkup(content: string) {
  return content
    .split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`${part}-${index}`} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={`${part}-${index}`}
            className="rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 text-[0.82em] text-accent-100"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={`${part}-${index}`} className="italic text-gray-200">
            {part.slice(1, -1)}
          </em>
        );
      }

      return <span key={`${part}-${index}`}>{part}</span>;
    });
}

export default function CommunityClient() {
  const { data: session, status: sessionStatus } = useSession();

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const previousChannelRef = useRef("general");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [hydrated, setHydrated] = useState(false);
  const [socketStatus, setSocketStatus] = useState<"idle" | "connecting" | "connected" | "offline">("idle");
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<CommunityProfile[]>([]);
  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, CommunityMessage[]>>({});
  const [pinnedByChannel, setPinnedByChannel] = useState<Record<string, CommunityMessage[]>>({});
  const [typingByChannel, setTypingByChannel] = useState<Record<string, TypingUser[]>>({});
  const [activeChannelId, setActiveChannelId] = useState("general");
  const [showMembers, setShowMembers] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<CommunityProfile["status"]>("online");
  const [draft, setDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState<CommunityMessage | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [currentRace, setCurrentRace] = useState<RaceState | null>(null);
  const [currentRaid, setCurrentRaid] = useState<RaidState | null>(null);
  const [raidSequence, setRaidSequence] = useState(pickRandom(RAID_SEQUENCES));
  const [raidInput, setRaidInput] = useState("");
  const [connectionNote, setConnectionNote] = useState<string | null>(null);

  const activeMessages = messagesByChannel[activeChannelId] || [];
  const pinnedMessages = pinnedByChannel[activeChannelId] || [];
  const typingUsers = typingByChannel[activeChannelId] || [];
  const activeChannel = channels.find((channel) => channel.id === activeChannelId) || DEFAULT_CHANNELS[0];
  const currentUserName = profile?.name || session?.user?.name || "You";
  const joinedRace = !!currentRace?.players.some((player) => player.name === currentUserName);
  const joinedRaid = !!currentRaid?.players.some((player) => player.name === currentUserName);
  const canStartRace = currentRace?.status === "waiting" && currentRace.creatorName === currentUserName;
  const canStartRaid = currentRaid?.status === "waiting" && currentRaid.players[0]?.name === currentUserName;
  const raidProgress = currentRaid ? ((currentRaid.maxHp - currentRaid.hp) / currentRaid.maxHp) * 100 : 0;
  const raidSequenceProgress = (raidInput.length / raidSequence.length) * 100;

  function stopTypingSoon(channelId: string) {
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit("typing:stop", channelId);
    }, 850);
  }

  useEffect(() => {
    const prefs = loadPrefs();
    setActiveChannelId(prefs.activeChannelId);
    setShowMembers(prefs.showMembers);
    setSoundEnabled(prefs.soundEnabled);
    setSelectedStatus(prefs.status);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    savePrefs({
      activeChannelId,
      showMembers,
      soundEnabled,
      status: selectedStatus,
    });
  }, [activeChannelId, hydrated, selectedStatus, showMembers, soundEnabled]);

  useEffect(() => {
    if (sessionStatus === "loading" || !hydrated) {
      return;
    }

    const socket = getCommunitySocket();
    if (!socket) {
      return;
    }

    socketRef.current = socket;
    let cancelled = false;

    async function emitJoin() {
      const guestIdentity = loadGuestIdentity();
      let token: string | undefined;

      if (session?.user?.id) {
        try {
          const response = await fetch("/api/auth/socket-token", { cache: "no-store" });
          if (response.ok) {
            const data = (await response.json()) as { token?: string };
            token = data.token;
          }
        } catch (error) {
          console.error("[Community] Failed to fetch socket token", error);
        }
      }

      if (cancelled) {
        return;
      }

      socketRef.current?.emit("user:join", {
        avatar: session?.user?.image || guestIdentity.avatar,
        color: guestIdentity.color,
        gradient: guestIdentity.gradient,
        name: session?.user?.name || guestIdentity.name,
        token,
      });
    }

    const handleConnect = () => {
      setSocketStatus("connected");
      setConnectionNote(null);
      void emitJoin();
    };

    const handleDisconnect = () => {
      setSocketStatus("offline");
      setConnectionNote("Live relay disconnected. Persisted history still loads, but real-time chat pauses until the socket server is back.");
    };

    const handleChannels = (incomingChannels: Channel[]) => {
      setChannels(incomingChannels);
    };

    const handleProfile = (incomingProfile: CommunityProfile) => {
      setProfile(incomingProfile);
      setSelectedStatus(incomingProfile.status || "online");
    };

    const handleHistory = (payload: { channelId: string; messages: CommunityMessage[]; pinned: CommunityMessage[] }) => {
      setMessagesByChannel((current) => ({ ...current, [payload.channelId]: payload.messages }));
      setPinnedByChannel((current) => ({ ...current, [payload.channelId]: payload.pinned }));
    };

    const handleMessageNew = (message: CommunityMessage) => {
      setMessagesByChannel((current) => ({
        ...current,
        [message.channelId]: withMessage(current[message.channelId] || [], message),
      }));

      if (message.pinned) {
        setPinnedByChannel((current) => ({
          ...current,
          [message.channelId]: withMessage(current[message.channelId] || [], message),
        }));
      }
    };

    const handleMessageEdited = (payload: { channelId: string; content: string; editedAt: number; messageId: string }) => {
      setMessagesByChannel((current) => ({
        ...current,
        [payload.channelId]: (current[payload.channelId] || []).map((message) =>
          message.id === payload.messageId
            ? { ...message, content: payload.content, edited: true, editedAt: payload.editedAt }
            : message
        ),
      }));
    };

    const handleMessageDeleted = (payload: { channelId: string; messageId: string }) => {
      setMessagesByChannel((current) => ({
        ...current,
        [payload.channelId]: (current[payload.channelId] || []).filter((message) => message.id !== payload.messageId),
      }));
      setPinnedByChannel((current) => ({
        ...current,
        [payload.channelId]: (current[payload.channelId] || []).filter((message) => message.id !== payload.messageId),
      }));
    };

    const handlePinUpdate = (payload: {
      channelId: string;
      messageId: string;
      pinned: boolean;
      pinnedMessages: CommunityMessage[];
    }) => {
      setMessagesByChannel((current) => ({
        ...current,
        [payload.channelId]: (current[payload.channelId] || []).map((message) =>
          message.id === payload.messageId ? { ...message, pinned: payload.pinned } : message
        ),
      }));
      setPinnedByChannel((current) => ({ ...current, [payload.channelId]: payload.pinnedMessages }));
    };

    const handleReacted = (payload: { channelId: string; messageId: string; reactions: Record<string, string[]> }) => {
      setMessagesByChannel((current) => ({
        ...current,
        [payload.channelId]: (current[payload.channelId] || []).map((message) =>
          message.id === payload.messageId ? { ...message, reactions: payload.reactions } : message
        ),
      }));
    };

    const handleTypingUpdate = (payload: { channelId: string; users: TypingUser[] }) => {
      setTypingByChannel((current) => ({ ...current, [payload.channelId]: payload.users }));
    };

    const handleUsersOnline = (incomingUsers: CommunityProfile[]) => {
      setOnlineUsers(incomingUsers);
    };

    const handleRaceCreated = (race: RaceState) => {
      setCurrentRace(race);
    };

    const handleRaceUpdated = (race: RaceState) => {
      setCurrentRace(race);
    };

    const handleRaceCountdown = (payload: { raceId: string }) => {
      setCurrentRace((current) =>
        current?.id === payload.raceId ? { ...current, status: "countdown" } : current
      );
    };

    const handleRaceStarted = (race: RaceState) => {
      setCurrentRace(race);
    };

    const handleRaceProgress = (payload: { players: RacePlayer[]; raceId: string }) => {
      setCurrentRace((current) =>
        current?.id === payload.raceId ? { ...current, players: payload.players, status: "racing" } : current
      );
    };

    const handleRaceFinished = (payload: { raceId: string; results: RacePlayer[] }) => {
      setCurrentRace((current) =>
        current?.id === payload.raceId ? { ...current, players: payload.results, status: "finished" } : current
      );
    };

    const handleRaidCreated = (raid: RaidState) => {
      setCurrentRaid(raid);
      setRaidInput("");
      setRaidSequence(pickRandom(RAID_SEQUENCES));
    };

    const handleRaidUpdated = (raid: RaidState) => {
      setCurrentRaid(raid);
    };

    const handleRaidStarted = (raid: RaidState) => {
      setCurrentRaid(raid);
      setRaidInput("");
      setRaidSequence(pickRandom(RAID_SEQUENCES));
    };

    const handleRaidProgress = (raid: RaidState) => {
      setCurrentRaid((current) => (current?.id === raid.id ? { ...current, ...raid } : current));
    };

    const handleRaidDefeated = (payload: { raidId: string }) => {
      setCurrentRaid((current) =>
        current?.id === payload.raidId ? { ...current, hp: 0, status: "defeated" } : current
      );
      setRaidInput("");
    };

    const handleServerError = (message: string) => {
      toast.error(message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("channels:list", handleChannels);
    socket.on("user:profile", handleProfile);
    socket.on("channel:history", handleHistory);
    socket.on("message:new", handleMessageNew);
    socket.on("message:edited", handleMessageEdited);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("message:pinUpdate", handlePinUpdate);
    socket.on("message:reacted", handleReacted);
    socket.on("typing:update", handleTypingUpdate);
    socket.on("users:online", handleUsersOnline);
    socket.on("race:created", handleRaceCreated);
    socket.on("race:updated", handleRaceUpdated);
    socket.on("race:countdown", handleRaceCountdown);
    socket.on("race:started", handleRaceStarted);
    socket.on("race:progress", handleRaceProgress);
    socket.on("race:finished", handleRaceFinished);
    socket.on("raid:created", handleRaidCreated);
    socket.on("raid:updated", handleRaidUpdated);
    socket.on("raid:started", handleRaidStarted);
    socket.on("raid:progress", handleRaidProgress);
    socket.on("raid:defeated", handleRaidDefeated);
    socket.on("error", handleServerError);

    if (socket.connected) {
      setSocketStatus("connected");
      void emitJoin();
    } else {
      setSocketStatus("connecting");
      socket.connect();
    }

    return () => {
      cancelled = true;

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("channels:list", handleChannels);
      socket.off("user:profile", handleProfile);
      socket.off("channel:history", handleHistory);
      socket.off("message:new", handleMessageNew);
      socket.off("message:edited", handleMessageEdited);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("message:pinUpdate", handlePinUpdate);
      socket.off("message:reacted", handleReacted);
      socket.off("typing:update", handleTypingUpdate);
      socket.off("users:online", handleUsersOnline);
      socket.off("race:created", handleRaceCreated);
      socket.off("race:updated", handleRaceUpdated);
      socket.off("race:countdown", handleRaceCountdown);
      socket.off("race:started", handleRaceStarted);
      socket.off("race:progress", handleRaceProgress);
      socket.off("race:finished", handleRaceFinished);
      socket.off("raid:created", handleRaidCreated);
      socket.off("raid:updated", handleRaidUpdated);
      socket.off("raid:started", handleRaidStarted);
      socket.off("raid:progress", handleRaidProgress);
      socket.off("raid:defeated", handleRaidDefeated);
      socket.off("error", handleServerError);
      resetCommunitySocket();
    };
  }, [hydrated, session?.user?.id, session?.user?.image, session?.user?.name, sessionStatus]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    async function loadHistoryFallback() {
      if (messagesByChannel[activeChannelId]?.length) {
        return;
      }

      try {
        const response = await fetch(`/api/community/messages?channelId=${activeChannelId}`, { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { messages?: CommunityMessage[] };
        if (cancelled || !data.messages) {
          return;
        }

        setMessagesByChannel((current) => ({ ...current, [activeChannelId]: data.messages || [] }));
      } catch (error) {
        console.error("[Community] Failed to load fallback history", error);
      }
    }

    void loadHistoryFallback();

    return () => {
      cancelled = true;
    };
  }, [activeChannelId, hydrated, messagesByChannel]);

  useEffect(() => {
    if (!messageEndRef.current) {
      return;
    }

    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [activeChannelId, activeMessages.length]);

  useEffect(() => {
    if (socketStatus !== "connected" || !socketRef.current) {
      return;
    }

    const previousChannelId = previousChannelRef.current;
    if (previousChannelId !== activeChannelId) {
      socketRef.current.emit("typing:stop", previousChannelId);
    }

    socketRef.current.emit("channel:join", activeChannelId);
    previousChannelRef.current = activeChannelId;
  }, [activeChannelId, socketStatus]);

  useEffect(() => {
    if (socketStatus !== "connected" || !socketRef.current) {
      return;
    }

    socketRef.current.emit("user:status", selectedStatus);
  }, [selectedStatus, socketStatus]);

  function handleDraftChange(value: string) {
    setDraft(value);

    if (!socketRef.current || socketStatus !== "connected") {
      return;
    }

    if (!value.trim()) {
      socketRef.current.emit("typing:stop", activeChannelId);
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    socketRef.current.emit("typing:start", activeChannelId);
    stopTypingSoon(activeChannelId);
  }

  function clearComposerState() {
    setDraft("");
    setReplyTarget(null);
    setEditingMessageId(null);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    socketRef.current?.emit("typing:stop", activeChannelId);
  }

  function handleSubmitMessage() {
    const content = draft.trim();
    if (!content) {
      return;
    }

    if (!socketRef.current || socketStatus !== "connected") {
      toast.error("Live relay offline hai. Real-time features ke liye socket server chalu rakho.");
      return;
    }

    if (content === "/race") {
      if (currentRace?.status === "waiting") {
        socketRef.current.emit("race:join", currentRace.id);
        toast.success("Race lobby join kar li.");
      } else {
        socketRef.current.emit("race:create", { channelId: activeChannelId, maxPlayers: 4 });
        toast.success("Naya race lobby create ho gaya.");
      }
      clearComposerState();
      return;
    }

    if (content === "/raid") {
      if (currentRaid?.status === "waiting") {
        socketRef.current.emit("raid:join", currentRaid.id);
        toast.success("Boss raid squad me join kar liya.");
      } else {
        socketRef.current.emit("raid:create", { channelId: activeChannelId });
        toast.success("Boss raid summon ho gaya.");
      }
      clearComposerState();
      return;
    }

    if (content.startsWith("/join ")) {
      const joinCode = content.replace("/join", "").trim();
      if (currentRace?.id.startsWith(joinCode)) {
        socketRef.current.emit("race:join", currentRace.id);
        toast.success("Race queue join ho gayi.");
      } else if (currentRaid?.id.startsWith(joinCode)) {
        socketRef.current.emit("raid:join", currentRaid.id);
        toast.success("Raid queue join ho gayi.");
      } else {
        toast.error("Match code mila nahi.");
      }
      clearComposerState();
      return;
    }

    if (editingMessageId) {
      socketRef.current.emit("message:edit", {
        channelId: activeChannelId,
        messageId: editingMessageId,
        newContent: content,
      });
      clearComposerState();
      return;
    }

    socketRef.current.emit("message:send", {
      channelId: activeChannelId,
      content,
      replyTo: replyTarget
        ? {
            id: replyTarget.id,
            userName: replyTarget.userName || "Unknown",
            content: replyTarget.content,
          }
        : null,
    });

    clearComposerState();
  }

  function handleReact(messageId: string, emoji: string) {
    socketRef.current?.emit("message:react", {
      channelId: activeChannelId,
      emoji,
      messageId,
    });
  }

  function handleDelete(messageId: string) {
    socketRef.current?.emit("message:delete", {
      channelId: activeChannelId,
      messageId,
    });
  }

  function handlePin(messageId: string) {
    socketRef.current?.emit("message:pin", {
      channelId: activeChannelId,
      messageId,
    });
  }

  function handleRaceAction() {
    if (!socketRef.current || !currentRace) {
      return;
    }

    if (canStartRace) {
      socketRef.current.emit("race:start", currentRace.id);
      return;
    }

    socketRef.current.emit("race:join", currentRace.id);
  }

  function handleRaidAction() {
    if (!socketRef.current || !currentRaid) {
      return;
    }

    if (canStartRaid) {
      socketRef.current.emit("raid:start", currentRaid.id);
      return;
    }

    socketRef.current.emit("raid:join", currentRaid.id);
  }

  function handleRaidInputChange(value: string) {
    const normalized = value.toUpperCase();
    if (!raidSequence.startsWith(normalized)) {
      return;
    }

    setRaidInput(normalized);

    if (normalized !== raidSequence) {
      return;
    }

    if (socketRef.current && currentRaid?.status === "active") {
      socketRef.current.emit("raid:hit", {
        damage: Math.max(90, raidSequence.length * 18),
        raidId: currentRaid.id,
      });
    }

    setRaidInput("");
    setRaidSequence(pickRandom(RAID_SEQUENCES));
  }

  if (!hydrated || sessionStatus === "loading") {
    return (
      <section className="section-shell py-24">
        <div className="panel flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin text-accent-200" />
            Community relay sync ho raha hai...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden pb-20 pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-24 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-accent-300/10 blur-[130px]" />
        <div className="absolute right-0 top-52 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-300/40 to-transparent" />
      </div>

      <div className="section-shell relative z-10 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel overflow-hidden p-6 sm:p-8">
            <div className="eyebrow">Premium Community</div>
            <div className="mt-5 max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight text-gray-100 sm:text-5xl">
                Beast-mode squad chat, live races, aur co-op boss fights ek hi premium hub me.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
                Transcript me jo premium vision tha usko yahan real-time relay, persisted history, reply/reaction flow,
                aur raid surface ke saath wapas build kiya gaya hai.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="panel-muted p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-accent-100">
                  <Wifi className="h-3.5 w-3.5" />
                  Relay
                </div>
                <div className="mt-2 text-2xl font-semibold text-gray-100">
                  {socketStatus === "connected" ? "Live" : socketStatus === "connecting" ? "Booting" : "Offline"}
                </div>
                <p className="mt-1 text-sm text-gray-400">Socket chat + events realtime sync me.</p>
              </div>
              <div className="panel-muted p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-accent-100">
                  <Users className="h-3.5 w-3.5" />
                  Presence
                </div>
                <div className="mt-2 text-2xl font-semibold text-gray-100">{onlineUsers.length}</div>
                <p className="mt-1 text-sm text-gray-400">Live members abhi squad me active.</p>
              </div>
              <div className="panel-muted p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-accent-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Persistence
                </div>
                <div className="mt-2 text-2xl font-semibold text-gray-100">Ready</div>
                <p className="mt-1 text-sm text-gray-400">History + preferences refresh ke baad bhi yaad rehte hain.</p>
              </div>
            </div>
          </div>

          <div className="panel flex flex-col justify-between gap-5 p-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-accent-100">Identity</div>
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                    socketStatus === "connected"
                      ? "bg-accent-300/10 text-accent-100"
                      : "bg-white/5 text-gray-400"
                  )}
                >
                  {socketStatus === "connected" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                  {socketStatus}
                </div>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <Avatar
                  src={profile?.avatar}
                  name={profile?.name || session?.user?.name}
                  size={56}
                  className="rounded-2xl border border-white/10 text-lg"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-100">{profile?.name || session?.user?.name || "Guest Typist"}</p>
                    {profile?.isPremium ? <Crown className="h-4 w-4 text-amber-300" /> : null}
                  </div>
                  <p className="text-sm text-gray-400">
                    {profile?.rankTier || "Bronze"} rank · {profile?.wpm || 72} WPM · {profile?.accuracy || 96}% acc
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-[0.22em] text-gray-500">Presence Mode</label>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as CommunityProfile["status"])}
                className="w-full rounded-2xl border border-surface-300 bg-surface-100 px-4 py-3 text-sm text-gray-100 outline-none transition-colors focus:border-accent-200"
              >
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="dnd">Do Not Disturb</option>
                <option value="invisible">Invisible</option>
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                className="justify-center gap-2 rounded-2xl"
                onClick={() => setSoundEnabled((current) => !current)}
                type="button"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {soundEnabled ? "Sound On" : "Sound Off"}
              </Button>
              <Button
                variant="secondary"
                className="justify-center gap-2 rounded-2xl"
                onClick={() => setShowMembers((current) => !current)}
                type="button"
              >
                <Users className="h-4 w-4" />
                {showMembers ? "Hide Squad" : "Show Squad"}
              </Button>
            </div>

            {!session?.user ? (
              <div className="rounded-2xl border border-accent-300/20 bg-accent-300/8 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-100">Guest mode active</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Login karoge to identity aur session har device par aur achchhe se sync hoga.
                    </p>
                  </div>
                  <LogIn className="mt-0.5 h-4 w-4 text-accent-100" />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => signIn(undefined, { callbackUrl: "/community" })} className="rounded-2xl">
                    Login Now
                  </Button>
                  <Link
                    href="/register"
                    className="inline-flex items-center rounded-2xl border border-white/10 px-4 py-2 text-sm text-gray-300 transition-colors hover:border-accent-200 hover:text-accent-100"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {connectionNote ? (
          <div className="panel-muted flex items-start gap-3 border border-amber-400/15 p-4 text-sm text-amber-100">
            <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{connectionNote}</span>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4">
            <div className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Text Channels</p>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-gray-400">
                  {channels.length} rooms
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    type="button"
                    onClick={() => setActiveChannelId(channel.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                      activeChannelId === channel.id
                        ? "border-accent-300/30 bg-accent-300/10 shadow-[0_0_0_1px_rgba(57,255,20,0.08)]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05]"
                    )}
                  >
                    <span className="mt-0.5 text-base">{channel.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-100">
                        <Hash className="h-3.5 w-3.5 text-gray-500" />
                        {channel.name}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">{channel.description}</span>
                    </span>
                    <span className="text-[11px] text-gray-500">{channel.memberCount}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Quick Commands</p>
              <div className="mt-4 space-y-3 text-sm text-gray-400">
                <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                  <span className="font-mono text-accent-100">/race</span> naya typing duel lobby banata ya join karta hai.
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                  <span className="font-mono text-accent-100">/raid</span> co-op boss fight summon ya join karta hai.
                </div>
                <div className="rounded-2xl border border-white/5 bg-black/20 p-3">
                  <span className="font-mono text-accent-100">/join code</span> active lobby ke short code se jump-in.
                </div>
              </div>
            </div>
          </aside>

          <div className="panel flex min-h-[48rem] flex-col overflow-hidden">
            <div className="border-b border-white/5 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent-100">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Community Hub
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-100">#{activeChannel.name}</h2>
                  <p className="mt-1 text-sm text-gray-400">{activeChannel.description}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    className="rounded-2xl border-accent-300/15 bg-accent-300/8 text-accent-100 hover:bg-accent-300/12"
                    onClick={() => {
                      if (currentRace) {
                        handleRaceAction();
                        return;
                      }
                      socketRef.current?.emit("race:create", { channelId: activeChannelId, maxPlayers: 4 });
                    }}
                    type="button"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {currentRace ? (canStartRace ? "Start Race" : joinedRace ? "Race Ready" : "Join Race") : "Create Race"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-2xl border-white/10"
                    onClick={() => {
                      if (currentRaid) {
                        handleRaidAction();
                        return;
                      }
                      socketRef.current?.emit("raid:create", { channelId: activeChannelId });
                    }}
                    type="button"
                  >
                    <Swords className="mr-2 h-4 w-4" />
                    {currentRaid ? (canStartRaid ? "Start Raid" : joinedRaid ? "Raid Ready" : "Join Raid") : "Summon Boss"}
                  </Button>
                </div>
              </div>

              {pinnedMessages.length ? (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                  {pinnedMessages.slice(-3).map((message) => (
                    <button
                      key={message.id}
                      type="button"
                      onClick={() => setReplyTarget(message)}
                      className="min-w-[16rem] rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-accent-100">
                        <Pin className="h-3.5 w-3.5" />
                        Pinned
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-200">{message.content}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
              {activeMessages.length === 0 ? (
                <div className="flex min-h-[16rem] items-center justify-center">
                  <div className="max-w-md text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-300/20 bg-accent-300/10">
                      <Sparkles className="h-6 w-6 text-accent-100" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-gray-100">Channel ready for the first drop</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      Live relay connect hote hi yahan history aur messages render honge. Aap chahein to pehla message ya
                      slash command se shuru kar sakte ho.
                    </p>
                  </div>
                </div>
              ) : null}

              {activeMessages.map((message) => {
                const isSystem = message.type === "system";
                const isOwnMessage = message.userName === currentUserName;

                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="rounded-full border border-accent-300/15 bg-accent-300/8 px-4 py-2 text-xs text-accent-100">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={cn(
                      "rounded-[1.6rem] border p-4 transition-colors",
                      isOwnMessage
                        ? "border-accent-300/20 bg-accent-300/8"
                        : "border-white/6 bg-white/[0.03]"
                    )}
                  >
                    <div className="flex gap-3">
                      <Avatar
                        name={message.userName}
                        size={40}
                        className="rounded-2xl border border-white/10 text-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-100">{message.userName || "Unknown"}</span>
                          {message.userLevel ? (
                            <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-gray-400">
                              Lv.{message.userLevel}
                            </span>
                          ) : null}
                          <span className="text-xs text-gray-500">{timeFormatter.format(new Date(message.timestamp))}</span>
                          {message.edited ? <span className="text-[11px] text-gray-500">edited</span> : null}
                        </div>

                        {message.replyTo ? (
                          <div className="mt-3 rounded-2xl border border-white/6 bg-black/20 px-3 py-2 text-xs text-gray-400">
                            Replying to <span className="text-gray-200">{message.replyTo.userName}</span>: {message.replyTo.content}
                          </div>
                        ) : null}

                        <div className="mt-3 text-sm leading-7 text-gray-300">{renderInlineMarkup(message.content)}</div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {QUICK_REACTIONS.map((emoji) => (
                            <button
                              key={`${message.id}-${emoji}`}
                              type="button"
                              onClick={() => handleReact(message.id, emoji)}
                              className="rounded-full border border-white/8 px-2.5 py-1 text-xs text-gray-400 transition-colors hover:border-accent-200 hover:text-accent-100"
                            >
                              {emoji} {message.reactions?.[emoji]?.length || ""}
                            </button>
                          ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setReplyTarget(message)}
                            className="inline-flex items-center gap-1 rounded-full border border-white/8 px-3 py-1.5 text-gray-400 transition-colors hover:border-accent-200 hover:text-accent-100"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePin(message.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-white/8 px-3 py-1.5 text-gray-400 transition-colors hover:border-accent-200 hover:text-accent-100"
                          >
                            <Pin className="h-3.5 w-3.5" />
                            {message.pinned ? "Unpin" : "Pin"}
                          </button>
                          {isOwnMessage ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(message.id);
                                  setDraft(message.content);
                                }}
                                className="rounded-full border border-white/8 px-3 py-1.5 text-gray-400 transition-colors hover:border-accent-200 hover:text-accent-100"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(message.id)}
                                className="rounded-full border border-white/8 px-3 py-1.5 text-gray-400 transition-colors hover:border-red-400/30 hover:text-red-300"
                              >
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.length ? (
                <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-sm text-gray-400">
                  <span className="text-gray-200">{typingUsers.map((user) => user.name).join(", ")}</span> typing...
                </div>
              ) : null}

              <div ref={messageEndRef} />
            </div>

            <div className="border-t border-white/5 p-5 sm:p-6">
              {replyTarget ? (
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-accent-300/15 bg-accent-300/8 px-4 py-3 text-sm text-gray-300">
                  <span>
                    Replying to <span className="text-accent-100">{replyTarget.userName}</span>
                  </span>
                  <button type="button" onClick={() => setReplyTarget(null)} className="text-xs text-gray-400 hover:text-gray-200">
                    Clear
                  </button>
                </div>
              ) : null}

              {editingMessageId ? (
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-gray-300">
                  <span>Editing selected message</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMessageId(null);
                      setDraft("");
                    }}
                    className="text-xs text-gray-400 hover:text-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : null}

              <div className="rounded-[1.75rem] border border-white/8 bg-black/20 p-3">
                <textarea
                  value={draft}
                  onChange={(event) => handleDraftChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmitMessage();
                    }
                  }}
                  placeholder={`Message #${activeChannel.name} · /race · /raid · markdown bhi support karta hai`}
                  className="min-h-[7.5rem] w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-gray-100 outline-none placeholder:text-gray-500"
                />

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <span className="rounded-full border border-white/8 px-2.5 py-1">**bold**</span>
                    <span className="rounded-full border border-white/8 px-2.5 py-1">*italic*</span>
                    <span className="rounded-full border border-white/8 px-2.5 py-1">`code`</span>
                  </div>
                  <Button className="rounded-2xl px-5" onClick={handleSubmitMessage} type="button">
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className={cn("space-y-4", !showMembers && "xl:hidden")}>
            {currentRace ? (
              <div className="panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-100">Typing Race</p>
                    <h3 className="mt-2 text-xl font-semibold text-gray-100">{currentRace.status === "finished" ? "Race Results" : "Live Queue"}</h3>
                  </div>
                  <Zap className="h-5 w-5 text-accent-100" />
                </div>

                <p className="mt-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-3 text-sm leading-6 text-gray-300">
                  {currentRace.sentence}
                </p>

                <div className="mt-4 space-y-3">
                  {currentRace.players.map((player, index) => (
                    <div key={`${player.name}-${index}`} className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-100">{player.name}</span>
                        <span className="text-xs text-gray-500">{player.wpm} WPM</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-accent-200 to-accent-300"
                          style={{ width: `${Math.min(100, player.progress)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button className="mt-4 w-full rounded-2xl" onClick={handleRaceAction} type="button">
                  <Zap className="mr-2 h-4 w-4" />
                  {canStartRace ? "Start Race" : joinedRace ? "Race Joined" : "Join Race"}
                </Button>
              </div>
            ) : null}

            {currentRaid ? (
              <div className="panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent-100">Co-op Boss Fight</p>
                    <h3 className="mt-2 text-xl font-semibold text-gray-100">{currentRaid.bossName}</h3>
                  </div>
                  <Swords className="h-5 w-5 text-accent-100" />
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gray-500">
                    <span>Boss HP</span>
                    <span>{Math.max(0, Math.round(currentRaid.hp))} / {currentRaid.maxHp}</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 via-accent-200 to-accent-300"
                      style={{ width: `${Math.max(0, 100 - raidProgress)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {currentRaid.players.map((player) => (
                    <div key={player.name} className="rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-100">{player.name}</span>
                        <span className="text-xs text-gray-500">{player.damage} DMG</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{player.dps} DPS live</p>
                    </div>
                  ))}
                </div>

                <Button className="mt-4 w-full rounded-2xl" onClick={handleRaidAction} type="button">
                  <Swords className="mr-2 h-4 w-4" />
                  {canStartRaid ? "Start Raid" : joinedRaid ? "Raid Joined" : "Join Raid"}
                </Button>

                {joinedRaid && currentRaid.status === "active" ? (
                  <div className="mt-4 rounded-[1.5rem] border border-white/8 bg-black/20 p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-gray-500">
                      <span>Damage sequence</span>
                      <span>{Math.round(raidSequenceProgress)}%</span>
                    </div>
                    <div className="mt-3 text-center text-xl font-semibold tracking-[0.24em] text-gray-100">
                      {raidSequence}
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-200 to-cyan-300"
                        style={{ width: `${raidSequenceProgress}%` }}
                      />
                    </div>
                    <input
                      value={raidInput}
                      onChange={(event) => handleRaidInputChange(event.target.value)}
                      placeholder="Type sequence to deal damage"
                      className="mt-4 w-full rounded-2xl border border-surface-300 bg-surface-100 px-4 py-3 text-sm text-gray-100 outline-none transition-colors focus:border-accent-200"
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {showMembers ? (
              <div className="panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-500">Online Squad</p>
                    <h3 className="mt-2 text-xl font-semibold text-gray-100">Members</h3>
                  </div>
                  <Users className="h-5 w-5 text-accent-100" />
                </div>

                <div className="mt-4 space-y-3">
                  {[...onlineUsers]
                    .sort((left, right) => right.wpm - left.wpm)
                    .map((member) => (
                      <div key={`${member.id}-${member.name}`} className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] p-3">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          size={44}
                          className="rounded-2xl border border-white/10 text-sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-gray-100">{member.name}</p>
                            {member.isPremium ? <Crown className="h-3.5 w-3.5 text-amber-300" /> : null}
                          </div>
                          <p className="text-xs text-gray-500">
                            {member.rankTier || "Bronze"} · {member.wpm} WPM · {member.accuracy}% acc
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            <div className="panel-muted p-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-accent-100">
                <Trophy className="h-3.5 w-3.5" />
                Why this restore matters
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-400">
                <li>Guest identity aur preferences refresh ke baad yaad rehte hain.</li>
                <li>Authenticated users secure socket token ke saath join karte hain.</li>
                <li>Chat, race aur raid ek hi premium surface me stitched hain.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
