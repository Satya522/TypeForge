/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║  TypeForge Community — WebSocket Server (LV99 BEAST)    ║
 * ║  Real-time chat · Typing Races · DMs · Reactions        ║
 * ║  Replies · Presence · Pinned Messages · Challenges      ║
 * ╚══════════════════════════════════════════════════════════╝
 * Run: node server.js
 */
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import jwt from "jsonwebtoken";
import Redis from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";

const prisma = new PrismaClient();

const PORT = 3001;
const httpServer = createServer(handleRelayHttpRequest);
const DEFAULT_ALLOWED_ORIGINS = [
  process.env.NEXTAUTH_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);
const ALLOWED_ORIGINS = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  try {
    return ALLOWED_ORIGINS.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function applyRelayCorsHeaders(req, res) {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function handleRelayHttpRequest(req, res) {
  applyRelayCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    });
    res.end(
      JSON.stringify({
        ok: true,
        port: PORT,
        service: "typeforge-community-relay",
        timestamp: Date.now(),
      }),
    );
    return;
  }

  if (req.url === "/" || req.url === "/status") {
    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    });
    res.end("TypeForge community relay is running.");
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
}

const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ["GET", "POST"],
  },
  allowRequest(req, callback) {
    callback(null, isAllowedOrigin(req.headers.origin));
  },
  maxHttpBufferSize: 100_000,
  pingTimeout: 60000,
  pingInterval: 25000,
});

if (process.env.REDIS_URL) {
  try {
    const pubClient = new Redis(process.env.REDIS_URL);
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    console.log(
      `🚀 Dedicated Redis Adapter connected for Multi-Server Scaling!`,
    );
  } catch (e) {
    console.error("Redis connection failed", e);
  }
}

// Global Rate Limiter
const rateLimits = new Map();
function checkRateLimit(key, limit = 5, windowMs = 1000) {
  const now = Date.now();
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, lastTime: now });
    return false;
  }
  const bucket = rateLimits.get(key);
  if (now - bucket.lastTime > windowMs) {
    bucket.count = 1;
    bucket.lastTime = now;
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

// ELO Helper
function getRankTier(elo) {
  if (elo >= 2200) return "Vantablack";
  if (elo >= 1900) return "Neon";
  if (elo >= 1600) return "Platinum";
  if (elo >= 1300) return "Gold";
  if (elo >= 1000) return "Silver";
  return "Bronze";
}

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
const onlineUsers = new Map(); // socketId → user
const channelMessages = new Map(); // channelId → Message[]
const typingUsers = new Map(); // channelId → Set<socketId>
const pinnedMessages = new Map(); // channelId → Message[]
const dmConversations = new Map(); // `${id1}:${id2}` → Message[]
const activeRaces = new Map(); // raceId → RaceState
const activeRaids = new Map(); // raidId → RaidState

const CHANNELS = [
  {
    id: "general",
    name: "General",
    icon: "💬",
    description: "Hang out and chat about anything typing related",
    memberCount: 0,
  },
  {
    id: "speed-runs",
    name: "Speed Runs",
    icon: "⚡",
    description: "Share your fastest WPM records and compete",
    memberCount: 0,
  },
  {
    id: "tips-tricks",
    name: "Tips & Tricks",
    icon: "🎯",
    description: "Pro techniques, shortcuts, and typing wisdom",
    memberCount: 0,
  },
  {
    id: "show-off",
    name: "Show Off",
    icon: "🏆",
    description: "Flex your milestones, screenshots, and streaks",
    memberCount: 0,
  },
  {
    id: "code-typing",
    name: "Code Typing",
    icon: "💻",
    description: "Talk about typing code — JS, Python, Rust and more",
    memberCount: 0,
  },
  {
    id: "challenges",
    name: "Challenges",
    icon: "⚔️",
    description: "Issue and accept real-time typing duels",
    memberCount: 0,
  },
  {
    id: "off-topic",
    name: "Off Topic",
    icon: "🎮",
    description: "Games, memes, music — anything goes",
    memberCount: 0,
  },
];

CHANNELS.forEach(async (ch) => {
  channelMessages.set(ch.id, []);
  pinnedMessages.set(ch.id, []);

  // Load from database on startup
  try {
    const msgs = await prisma.communityMessage.findMany({
      where: { channelId: ch.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        author: {
          select: {
            avatarUrl: true,
            image: true,
            name: true,
            nickname: true,
            username: true,
          },
        },
        reactions: true,
        replyToMessage: { select: { id: true, userName: true, content: true } },
      },
    });

    const formatted = msgs.reverse().map((m) => ({
      id: m.id,
      channelId: m.channelId,
      type: m.type,
      subtype: m.subtype || undefined,
      userId: m.visitorId || m.authorId || undefined,
      userName: m.author ? getDisplayName(m.author, m.userName) : m.userName,
      avatarUrl: m.author ? resolveAvatarUrl(m.author) : null,
      userColor: m.userColor,
      userGradient: m.userGradient,
      content: m.content,
      timestamp: m.createdAt.getTime(),
      pinned: m.pinned,
      edited: m.edited,
      editedAt: m.editedAt?.getTime() || undefined,
      replyTo: m.replyToMessage
        ? {
            id: m.replyToMessage.id,
            userName: m.replyToMessage.userName,
            content: m.replyToMessage.content,
          }
        : null,
      reactions: m.reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r.userName);
        return acc;
      }, {}),
    }));

    channelMessages.set(ch.id, formatted);
    pinnedMessages.set(
      ch.id,
      formatted.filter((m) => m.pinned),
    );
  } catch (e) {
    console.error(`Failed to load messages for ${ch.id}`, e);
  }
});

const NEON_COLORS = [
  "#39ff14",
  "#00ffff",
  "#ff6ec7",
  "#ffff00",
  "#ff4444",
  "#7b68ee",
  "#ff8c00",
  "#00ff7f",
  "#ff1493",
  "#1e90ff",
  "#e040fb",
  "#76ff03",
  "#18ffff",
  "#ffd740",
  "#ff6e40",
];

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #39ff14, #00cc00)",
  "linear-gradient(135deg, #00ffff, #0088ff)",
  "linear-gradient(135deg, #ff6ec7, #ff1493)",
  "linear-gradient(135deg, #ffff00, #ff8c00)",
  "linear-gradient(135deg, #7b68ee, #4b0082)",
  "linear-gradient(135deg, #ff4444, #cc0000)",
  "linear-gradient(135deg, #00ff7f, #008b45)",
  "linear-gradient(135deg, #1e90ff, #0000cd)",
  "linear-gradient(135deg, #e040fb, #9c27b0)",
  "linear-gradient(135deg, #76ff03, #33691e)",
];

const BADGES = [
  { id: "speed-demon", name: "Speed Demon", icon: "⚡", minWpm: 80 },
  { id: "centurion", name: "Centurion", icon: "💯", minWpm: 100 },
  { id: "legend", name: "Legend", icon: "🔥", minWpm: 120 },
  { id: "god-tier", name: "God Tier", icon: "👑", minWpm: 150 },
];

// Race sentences pool
const RACE_SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump.",
  "Sphinx of black quartz judge my vow.",
  "Two driven jocks help fax my big quiz.",
  "The five boxing wizards jump quickly.",
  "Jackdaws love my big sphinx of quartz.",
  "Crazy Frederick bought many very exquisite opal jewels.",
  "We promptly judged antique ivory buckles for the next prize.",
  "A mad boxer shot a quick gloved jab to the jaw of his dizzy opponent.",
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
const CHANNEL_IDS = new Set(CHANNELS.map((channel) => channel.id));
const USER_STATUS_VALUES = new Set(["online", "idle", "dnd", "invisible"]);
const REACTION_VALUES = new Set([
  "🔥",
  "⚡",
  "💯",
  "🎯",
  "🏆",
  "😂",
  "👏",
  "👀",
]);

function isValidChannel(channelId) {
  return CHANNEL_IDS.has(channelId);
}

function sanitizeText(input, maxLength = 2000) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function sanitizeName(input) {
  const cleaned = sanitizeText(input, 32)
    .replace(/[^\p{L}\p{N}_\-\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || null;
}

function getDisplayName(user, fallback = "Typist") {
  const nickname = sanitizeName(user?.nickname || "");
  if (nickname) return nickname;

  const username = sanitizeName(user?.username || "");
  if (username) return username;

  const name = sanitizeName(user?.name || "");
  return name || fallback;
}

function resolveAvatarUrl(user) {
  return user?.avatarUrl || user?.image || null;
}

function getUserBadges(wpm) {
  return BADGES.filter((b) => wpm >= b.minWpm);
}

function broadcastOnlineUsers() {
  const users = Array.from(onlineUsers.values()).map((u) => ({
    ...u,
    badges: getUserBadges(u.wpm),
  }));
  io.emit("users:online", users);

  // Update member counts
  CHANNELS.forEach((ch) => {
    ch.memberCount = io.sockets.adapter.rooms.get(ch.id)?.size || 0;
  });

  emitCommunityMeta();
}

function buildCommunityMeta() {
  const typingByChannel = Object.fromEntries(
    CHANNELS.map((channel) => [
      channel.id,
      Array.from(typingUsers.get(channel.id) || [])
        .map((id) => onlineUsers.get(id))
        .filter(Boolean)
        .map((user) => ({ name: user.name, color: user.color })),
    ]),
  );

  const activeRaceSummaries = Array.from(activeRaces.values()).map((race) => ({
    id: race.id,
    channelId: race.channelId,
    channelName:
      CHANNELS.find((channel) => channel.id === race.channelId)?.name ||
      race.channelId,
    participantCount: race.players.length,
    status: race.status,
    players: race.players.map((player) => ({
      id: player.id,
      name: player.name,
      color: player.color,
      wpm: player.wpm,
      accuracy: player.accuracy,
      progress: player.progress,
      finished: player.finished,
    })),
  }));

  const activeRaidSummaries = Array.from(activeRaids.values()).map((raid) => ({
    id: raid.id,
    channelId: raid.channelId,
    bossName: raid.bossName,
    participantCount: raid.players.size,
    status: raid.status,
    players: Array.from(raid.players.values()).map((player) => ({
      name: player.name,
      color: player.color,
    })),
  }));

  return {
    typingByChannel,
    activeRaces: activeRaceSummaries,
    activeRaids: activeRaidSummaries,
  };
}

function emitCommunityMeta(target = io) {
  target.emit("community:meta", buildCommunityMeta());
}

function emitCommunityMessage(message) {
  io.to(message.channelId).emit("message:new", message);
  io.emit("community:message", message);
}

/* ═══════════════════════════════════════════════
   CONNECTION HANDLER
═══════════════════════════════════════════════ */
io.on("connection", (socket) => {
  console.log(`🟢 Connected: ${socket.id}`);

  /* ── User Join ── */
  socket.on("user:join", async (data = {}) => {
    let authName = undefined;
    let authId = undefined;

    // Parse JWT if provided to prevent impersonation
    if (data?.token && process.env.NEXTAUTH_SECRET) {
      try {
        const decoded = jwt.verify(data.token, process.env.NEXTAUTH_SECRET, {
          audience: "typeforge-community-socket",
          issuer: "typeforge-app",
        });
        authId = decoded.sub;
        authName = decoded.name;
      } catch (err) {
        console.error("Socket authentication failed for:", socket.id);
      }
    }

    let dbUser = null;
    if (authId) {
      dbUser = await prisma.user
        .findUnique({
          where: { id: authId },
          select: {
            avatarUrl: true,
            eloRating: true,
            handle: true,
            id: true,
            image: true,
            isBanned: true,
            isPremium: true,
            name: true,
            nickname: true,
            practiceSessions: {
              orderBy: { sessionDate: "desc" },
              take: 1,
              select: { accuracy: true, wpm: true },
            },
            rankTier: true,
            username: true,
          },
        })
        .catch((error) => {
          console.error("Socket user lookup failed:", error);
          return null;
        });

      if (!dbUser || dbUser.isBanned) {
        socket.emit("error", "Account access restricted.");
        socket.disconnect(true);
        return;
      }
    }

    const isGuest = !authId;
    // Guest names are forcefully prefixed unless overridden by secure auth
    let finalName = sanitizeName(
      getDisplayName(dbUser, authName || data?.name || ""),
    );
    if (!finalName) {
      const requested = sanitizeName(data?.name || "");
      if (requested && !requested.toLowerCase().startsWith("guest")) {
        finalName = `Guest_${requested.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 10)}`;
      } else {
        finalName = `Guest_${socket.id.slice(0, 5)}`;
      }
    }

    const user = {
      id: authId || socket.id,
      name: finalName,
      isGuest,
      avatar: !isGuest ? resolveAvatarUrl(dbUser) : data?.avatar || null,
      handle: dbUser?.handle || null,
      color: data?.color || pickRandom(NEON_COLORS),
      gradient: data?.gradient || pickRandom(AVATAR_GRADIENTS),
      status: "online", // online | idle | dnd | invisible
      statusText: "",
      wpm: data?.wpm || Math.floor(Math.random() * 80 + 40),
      accuracy: data?.accuracy || Math.floor(Math.random() * 10 + 90),
      level: data?.level || Math.floor(Math.random() * 50 + 1),
      xp: data?.xp || Math.floor(Math.random() * 5000),
      joinedAt: Date.now(),
      badges: [],
      currentChannel: "general",
      rankTier: "Bronze",
      isPremium: true,
    };

    // Fetch real ELO and Rank if logged in
    if (!isGuest && dbUser) {
      user.rankTier = dbUser.rankTier;
      user.isPremium = dbUser.isPremium;
      user.level = Math.floor(dbUser.eloRating / 100);
      user.wpm = Math.round(dbUser.practiceSessions?.[0]?.wpm || user.wpm);
      user.accuracy = Math.round(
        dbUser.practiceSessions?.[0]?.accuracy || user.accuracy,
      );
    }

    user.badges = getUserBadges(user.wpm);
    onlineUsers.set(socket.id, user);

    // Send initial data
    socket.emit("channels:list", CHANNELS);
    socket.emit("user:profile", user);
    broadcastOnlineUsers();

    // Auto-join general
    socket.join("general");
    socket.emit("channel:history", {
      channelId: "general",
      messages: (channelMessages.get("general") || []).slice(-100),
      pinned: pinnedMessages.get("general") || [],
    });

    // System message
    const sysMsg = {
      id: generateId(),
      channelId: "general",
      type: "system",
      subtype: "join",
      content: `${user.name} joined the chat`,
      timestamp: Date.now(),
      userName: user.name,
      userColor: user.color,
    };
    channelMessages.get("general")?.push(sysMsg);
    emitCommunityMessage(sysMsg);
  });

  /* ── Channel Join ── */
  socket.on("channel:join", (channelId) => {
    if (!isValidChannel(channelId)) {
      socket.emit("error", "Invalid channel.");
      return;
    }
    const user = onlineUsers.get(socket.id);

    // Leave all channel rooms
    CHANNELS.forEach((ch) => socket.leave(ch.id));
    socket.join(channelId);

    if (user) user.currentChannel = channelId;

    socket.emit("channel:history", {
      channelId,
      messages: (channelMessages.get(channelId) || []).slice(-100),
      pinned: pinnedMessages.get(channelId) || [],
    });

    broadcastOnlineUsers();
  });

  /* ── Send Message ── */
  socket.on("message:send", (data) => {
    if (checkRateLimit(`${socket.id}:message-send`, 12, 10_000)) {
      socket.emit("error", "Rate limited. Please slow down.");
      return;
    }

    const user = onlineUsers.get(socket.id);
    if (!user) return;
    const channelId = isValidChannel(data?.channelId)
      ? data.channelId
      : user.currentChannel || "general";
    const content = sanitizeText(data?.content, 2000);
    if (!content) return;

    const replyTo =
      data?.replyTo && typeof data.replyTo === "object"
        ? {
            id: sanitizeText(data.replyTo.id, 64),
            userName: sanitizeText(data.replyTo.userName, 50),
            content: sanitizeText(data.replyTo.content, 240),
          }
        : null;

    const msg = {
      id: generateId(),
      channelId,
      type: "user",
      userId: user.id,
      userName: user.name,
      avatarUrl: user.avatar,
      userColor: user.color,
      userGradient: user.gradient,
      userBadges: user.badges,
      userLevel: user.level,
      content,
      timestamp: Date.now(),
      reactions: {},
      replyTo,
      edited: false,
      pinned: false,
    };

    const msgs = channelMessages.get(data.channelId);
    if (msgs) {
      msgs.push(msg);
      if (msgs.length > 300) msgs.splice(0, msgs.length - 300);
    }

    emitCommunityMessage(msg);

    // Persist to database
    prisma.communityMessage
      .create({
        data: {
          id: msg.id,
          channelId: msg.channelId,
          type: msg.type,
          subtype: msg.subtype,
          content: msg.content,
          userName: msg.userName,
          userColor: msg.userColor,
          userGradient: msg.userGradient,
          visitorId: user.isGuest ? user.id : null,
          authorId: !user.isGuest ? user.id : null,
          replyToId: msg.replyTo?.id || null,
          pinned: msg.pinned,
        },
      })
      .catch((e) => console.error("DB Save Error:", e));

    // Stop typing
    const typing = typingUsers.get(channelId);
    if (typing) {
      typing.delete(socket.id);
      io.to(channelId).emit("typing:update", {
        channelId,
        users: Array.from(typing)
          .map((id) => onlineUsers.get(id))
          .filter(Boolean)
          .map((u) => ({ name: u.name, color: u.color })),
      });
      emitCommunityMeta();
    }

    // Milestone achievements
    const totalUserMsgs = Array.from(channelMessages.values())
      .flat()
      .filter((m) => m.userId === socket.id).length;

    if ([10, 50, 100, 500].includes(totalUserMsgs)) {
      const milestone = {
        id: generateId(),
        channelId,
        type: "system",
        subtype: "milestone",
        content: `🎉 ${user.name} just sent their ${totalUserMsgs}th message!`,
        timestamp: Date.now(),
      };
      channelMessages.get(channelId)?.push(milestone);
      emitCommunityMessage(milestone);
      io.to(channelId).emit("confetti:burst", {
        userId: socket.id,
        userName: user.name,
      });
    }
  });

  /* ── Edit Message ── */
  socket.on("message:edit", (data) => {
    if (checkRateLimit(`${socket.id}:message-edit`, 10, 10_000)) {
      socket.emit("error", "Too many edit attempts.");
      return;
    }
    const { messageId, channelId, newContent } = data;
    if (!isValidChannel(channelId)) return;
    const sanitizedContent = sanitizeText(newContent, 2000);
    if (!sanitizedContent) return;
    const actorId = onlineUsers.get(socket.id)?.id;
    const msgs = channelMessages.get(channelId);
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId && m.userId === actorId);
    if (!msg) return;
    msg.content = sanitizedContent;
    msg.edited = true;
    msg.editedAt = Date.now();
    io.to(channelId).emit("message:edited", {
      messageId,
      channelId,
      content: sanitizedContent,
      editedAt: msg.editedAt,
    });

    prisma.communityMessage
      .update({
        where: { id: messageId },
        data: {
          content: sanitizedContent,
          edited: true,
          editedAt: new Date(msg.editedAt),
        },
      })
      .catch((e) => console.error(e));
  });

  /* ── Delete Message ── */
  socket.on("message:delete", (data) => {
    const { messageId, channelId } = data;
    if (!isValidChannel(channelId)) return;
    const actorId = onlineUsers.get(socket.id)?.id;
    const msgs = channelMessages.get(channelId);
    if (!msgs) return;
    const idx = msgs.findIndex(
      (m) => m.id === messageId && m.userId === actorId,
    );
    if (idx >= 0) {
      msgs.splice(idx, 1);
      io.to(channelId).emit("message:deleted", { messageId, channelId });
      prisma.communityMessage
        .delete({ where: { id: messageId } })
        .catch((e) => console.error(e));
    }
  });

  /* ── Pin/Unpin Message ── */
  socket.on("message:pin", (data) => {
    const { messageId, channelId } = data;
    if (!isValidChannel(channelId)) return;
    const msgs = channelMessages.get(channelId);
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;

    const pinned = pinnedMessages.get(channelId) || [];
    const pinIdx = pinned.findIndex((p) => p.id === messageId);

    if (pinIdx >= 0) {
      pinned.splice(pinIdx, 1);
      msg.pinned = false;
    } else {
      pinned.push(msg);
      msg.pinned = true;
      if (pinned.length > 20) pinned.shift();
    }

    io.to(channelId).emit("message:pinUpdate", {
      messageId,
      channelId,
      pinned: msg.pinned,
      pinnedMessages: pinned,
    });

    prisma.communityMessage
      .update({
        where: { id: messageId },
        data: { pinned: msg.pinned },
      })
      .catch((e) => console.error(e));
  });

  /* ── Reactions ── */
  socket.on("message:react", (data) => {
    const { messageId, channelId, emoji } = data;
    if (!isValidChannel(channelId) || !REACTION_VALUES.has(emoji)) return;
    const user = onlineUsers.get(socket.id);
    if (!user) return;

    const msgs = channelMessages.get(channelId);
    if (!msgs) return;
    const msg = msgs.find((m) => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

    const idx = msg.reactions[emoji].indexOf(user.name);
    if (idx >= 0) {
      msg.reactions[emoji].splice(idx, 1);
      if (msg.reactions[emoji].length === 0) delete msg.reactions[emoji];
      prisma.communityReaction
        .deleteMany({
          where: { messageId, emoji, userName: user.name },
        })
        .catch((e) => console.error(e));
    } else {
      msg.reactions[emoji].push(user.name);
      prisma.communityReaction
        .create({
          data: { messageId, emoji, userName: user.name },
        })
        .catch((e) => console.error(e));
    }

    io.to(channelId).emit("message:reacted", {
      messageId,
      channelId,
      reactions: msg.reactions,
    });
  });

  /* ── Typing ── */
  socket.on("typing:start", (channelId) => {
    if (!isValidChannel(channelId)) return;
    if (!typingUsers.has(channelId)) typingUsers.set(channelId, new Set());
    typingUsers.get(channelId).add(socket.id);
    const users = Array.from(typingUsers.get(channelId))
      .map((id) => onlineUsers.get(id))
      .filter(Boolean)
      .filter((u) => u.id !== socket.id)
      .map((u) => ({ name: u.name, color: u.color }));
    io.to(channelId).emit("typing:update", { channelId, users });
    emitCommunityMeta();
  });

  socket.on("typing:stop", (channelId) => {
    if (!isValidChannel(channelId)) return;
    const typing = typingUsers.get(channelId);
    if (typing) {
      typing.delete(socket.id);
      const users = Array.from(typing)
        .map((id) => onlineUsers.get(id))
        .filter(Boolean)
        .map((u) => ({ name: u.name, color: u.color }));
      io.to(channelId).emit("typing:update", { channelId, users });
      emitCommunityMeta();
    }
  });

  /* ── User Status ── */
  socket.on("user:status", (data) => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      if (typeof data === "string") {
        if (USER_STATUS_VALUES.has(data)) user.status = data;
      } else {
        if (data.status && USER_STATUS_VALUES.has(data.status))
          user.status = data.status;
        if (data.statusText !== undefined)
          user.statusText = sanitizeText(data.statusText, 80);
      }
      broadcastOnlineUsers();
    }
  });

  /* ═══ TYPING RACE SYSTEM ═══ */
  socket.on("race:create", (data) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;
    const channelId = isValidChannel(data?.channelId)
      ? data.channelId
      : "challenges";
    const maxPlayers = Math.min(4, Math.max(2, Number(data?.maxPlayers) || 4));

    const race = {
      id: generateId(),
      creatorId: socket.id,
      creatorName: user.name,
      creatorColor: user.color,
      sentence: pickRandom(RACE_SENTENCES),
      status: "waiting", // waiting | countdown | racing | finished
      maxPlayers,
      players: [
        {
          id: socket.id,
          accountId: user.isGuest ? null : user.id,
          name: user.name,
          color: user.color,
          gradient: user.gradient,
          progress: 0,
          wpm: 0,
          finished: false,
          finishTime: null,
        },
      ],
      createdAt: Date.now(),
      startedAt: null,
      channelId,
    };

    activeRaces.set(race.id, race);
    io.to(race.channelId).emit("race:created", race);
    emitCommunityMeta();

    // System message
    const msg = {
      id: generateId(),
      channelId: race.channelId,
      type: "system",
      subtype: "race",
      content: `⚔️ ${user.name} started a typing race! Type /join ${race.id.slice(0, 6)} to compete!`,
      timestamp: Date.now(),
      raceId: race.id,
    };
    channelMessages.get(race.channelId)?.push(msg);
    emitCommunityMessage(msg);
  });

  socket.on("race:join", (raceId) => {
    const user = onlineUsers.get(socket.id);
    const race = activeRaces.get(raceId);
    if (!user || !race || race.status !== "waiting") return;
    if (race.players.length >= race.maxPlayers) return;
    if (race.players.find((p) => p.id === socket.id)) return;

    race.players.push({
      id: socket.id,
      accountId: user.isGuest ? null : user.id,
      name: user.name,
      color: user.color,
      gradient: user.gradient,
      progress: 0,
      wpm: 0,
      finished: false,
      finishTime: null,
    });

    io.to(race.channelId).emit("race:updated", race);
    emitCommunityMeta();
  });

  socket.on("race:start", (raceId) => {
    const race = activeRaces.get(raceId);
    if (!race || race.creatorId !== socket.id || race.status !== "waiting")
      return;

    race.status = "countdown";
    io.to(race.channelId).emit("race:countdown", { raceId, seconds: 3 });
    emitCommunityMeta();

    setTimeout(() => {
      race.status = "racing";
      race.startedAt = Date.now();
      io.to(race.channelId).emit("race:started", race);
      emitCommunityMeta();
    }, 3000);
  });

  socket.on("race:progress", (data) => {
    const { raceId, progress, wpm, intervals } = data;
    const race = activeRaces.get(raceId);
    if (!race || race.status !== "racing") return;

    const player = race.players.find((p) => p.id === socket.id);
    if (!player || player.finished) return;

    player.progress = Math.max(0, Math.min(100, Number(progress) || 0));
    player.wpm = Math.max(0, Math.min(300, Number(wpm) || 0));

    // 🛡️ ANTI-CHEAT SYSTEM 🛡️
    if (Array.isArray(intervals) && intervals.length > 5) {
      const normalizedIntervals = intervals
        .filter((value) => Number.isFinite(value))
        .slice(0, 120)
        .map((value) => Number(value));
      const avg =
        normalizedIntervals.reduce((a, b) => a + b, 0) /
        normalizedIntervals.length;
      const variance =
        normalizedIntervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) /
        normalizedIntervals.length;
      const stdDev = Math.sqrt(variance);

      // Inhuman consistency or impossible speed
      if ((stdDev < 5 && player.wpm > 120) || player.wpm > 280) {
        player.isCheater = true;
        const user = onlineUsers.get(socket.id);
        if (user && !user.isGuest) {
          prisma.user
            .update({
              where: { id: user.id },
              data: {
                isBanned: true,
                banReason:
                  "Inhuman typing speed/variance detected via Anti-Cheat",
              },
            })
            .catch(console.error);
        }
      }
    }

    if (player.progress >= 100) {
      player.finished = true;
      player.finishTime = Date.now() - race.startedAt;
    }

    io.to(race.channelId).emit("race:progress", {
      raceId,
      players: race.players,
    });
    emitCommunityMeta();

    // Check if all active (non-cheating) finished
    const validPlayers = race.players.filter((p) => !p.isCheater);
    if (validPlayers.every((p) => p.finished)) {
      race.status = "finished";
      const sorted = [...validPlayers].sort(
        (a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity),
      );
      io.to(race.channelId).emit("race:finished", { raceId, results: sorted });
      emitCommunityMeta();

      if (sorted.length > 0) {
        io.to(race.channelId).emit("confetti:burst", {
          userId: sorted[0].id,
          userName: sorted[0].name,
        });

        const resultMsg = {
          id: generateId(),
          channelId: race.channelId,
          type: "system",
          subtype: "race-result",
          content: `🏁 Race finished! Winner: ${sorted[0].name} (${sorted[0].wpm} WPM)`,
          timestamp: Date.now(),
        };
        channelMessages.get(race.channelId)?.push(resultMsg);
        emitCommunityMessage(resultMsg);
      }

      // ELO Update Logic (Ranked Matchmaking effect)
      if (sorted.length > 1) {
        const winner = sorted[0];
        const losers = sorted.slice(1);

        if (!winner.accountId) return;
        prisma.user
          .findUnique({ where: { id: winner.accountId } })
          .then(async (dbWinner) => {
            if (!dbWinner) return;
            let eloGain = 0;

            for (const loser of losers) {
              if (!loser.accountId) continue;
              const dbLoser = await prisma.user.findUnique({
                where: { id: loser.accountId },
              });
              if (dbLoser) {
                // Simplified ELO transfer
                const K = 32;
                const expectedW =
                  1 /
                  (1 +
                    Math.pow(
                      10,
                      (dbLoser.eloRating - dbWinner.eloRating) / 400,
                    ));
                const gain = Math.round(K * (1 - expectedW));
                eloGain += gain;

                const newLoserElo = Math.max(0, dbLoser.eloRating - gain);
                await prisma.user.update({
                  where: { id: loser.accountId },
                  data: {
                    eloRating: newLoserElo,
                    rankTier: getRankTier(newLoserElo),
                  },
                });
              }
            }

            const newWinnerElo = dbWinner.eloRating + eloGain;
            await prisma.user.update({
              where: { id: winner.accountId },
              data: {
                eloRating: newWinnerElo,
                rankTier: getRankTier(newWinnerElo),
              },
            });

            // Notify the room of ELO gain
            emitCommunityMessage({
              id: generateId(),
              channelId: race.channelId,
              type: "system",
              subtype: "milestone",
              content: `🏆 ${winner.name} earned +${eloGain} ELO and is now Ranked ${getRankTier(newWinnerElo)}!`,
              timestamp: Date.now(),
            });
          })
          .catch(console.error);
      }

      setTimeout(() => {
        activeRaces.delete(raceId);
        emitCommunityMeta();
      }, 30000);
    }
  });

  socket.on("race:cancel", (raceId) => {
    const race = activeRaces.get(raceId);
    if (!race || race.creatorId !== socket.id) return;
    activeRaces.delete(raceId);
    io.to(race.channelId).emit("race:cancelled", { raceId });
    emitCommunityMeta();
  });

  /* ═══ BOSS RAIDS (CO-OP TYPING) ═══ */
  socket.on("raid:create", (data) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;
    const channelId = isValidChannel(data?.channelId)
      ? data.channelId
      : "general";

    const bossThemes = [
      "Cyber Daemon",
      "Neon Leviathan",
      "Null Pointer Virus",
      "Ransomware Elite",
    ];
    const bName = pickRandom(bossThemes);

    const raid = {
      id: generateId(),
      channelId,
      creatorId: socket.id,
      bossName: bName,
      maxHp: 2000,
      hp: 2000,
      status: "waiting", // waiting | active | defeated
      players: new Map(), // socket.id -> { name, color, damage, dps }
      createdAt: Date.now(),
      startedAt: null,
    };

    // Auto-join creator
    raid.players.set(socket.id, {
      name: user.name,
      color: user.color,
      damage: 0,
      dps: 0,
    });

    activeRaids.set(raid.id, raid);
    io.to(raid.channelId).emit("raid:created", {
      ...raid,
      players: Array.from(raid.players.values()),
    });
    emitCommunityMeta();

    // Broadcast system message
    const msg = {
      id: generateId(),
      channelId: raid.channelId,
      type: "system",
      subtype: "raid",
      content: `🔥 WARNING: Boss Event [${bName}] initiated by ${user.name}! Type /raid to join!`,
      timestamp: Date.now(),
      raidId: raid.id,
    };
    channelMessages.get(raid.channelId)?.push(msg);
    emitCommunityMessage(msg);
  });

  socket.on("raid:join", (raidId) => {
    const user = onlineUsers.get(socket.id);
    const raid = activeRaids.get(raidId);
    if (!user || !raid || raid.status !== "waiting") return;
    if (raid.players.size >= 4) return;

    if (!raid.players.has(socket.id)) {
      raid.players.set(socket.id, {
        name: user.name,
        color: user.color,
        damage: 0,
        dps: 0,
      });
      io.to(raid.channelId).emit("raid:updated", {
        ...raid,
        players: Array.from(raid.players.values()),
      });
      emitCommunityMeta();
    }
  });

  socket.on("raid:start", (raidId) => {
    const raid = activeRaids.get(raidId);
    if (!raid || raid.creatorId !== socket.id || raid.status !== "waiting")
      return;

    raid.status = "active";
    raid.startedAt = Date.now();
    io.to(raid.channelId).emit("raid:started", {
      ...raid,
      players: Array.from(raid.players.values()),
    });
    emitCommunityMeta();
  });

  socket.on("raid:hit", (data) => {
    if (checkRateLimit(`${socket.id}:raid-hit`, 25, 10_000)) {
      socket.emit("error", "Raid spam blocked. Slow down.");
      return;
    }
    const { raidId, damage } = data;
    const raid = activeRaids.get(raidId);
    if (!raid || raid.status !== "active") return;

    const p = raid.players.get(socket.id);
    if (!p) return;
    const normalizedDamage = Math.max(1, Math.min(500, Number(damage) || 0));

    // Apply Damage
    p.damage += normalizedDamage;
    raid.hp = Math.max(0, raid.hp - normalizedDamage);

    // Calculate DPS
    const elapsedSeconds = (Date.now() - raid.startedAt) / 1000;
    p.dps = Math.round(p.damage / Math.max(1, elapsedSeconds));

    io.to(raid.channelId).emit("raid:progress", {
      id: raid.id,
      raidId: raid.id,
      channelId: raid.channelId,
      hp: raid.hp,
      maxHp: raid.maxHp,
      status: raid.status,
      players: Array.from(raid.players.values()),
    });
    emitCommunityMeta();

    // Check Defeat
    if (raid.hp <= 0) {
      raid.status = "defeated";
      const duration = ((Date.now() - raid.startedAt) / 1000).toFixed(1);

      const results = Array.from(raid.players.values()).sort(
        (a, b) => b.damage - a.damage,
      );
      const mvp = results[0];

      io.to(raid.channelId).emit("raid:defeated", {
        raidId: raid.id,
        duration,
        results,
      });

      const msg = {
        id: generateId(),
        channelId: raid.channelId,
        type: "system",
        subtype: "raid",
        content: `⚔️ BOSS DEFEATED: [${raid.bossName}] destroyed in ${duration}s! MVP: ${mvp.name} with ${mvp.damage} DMG.`,
        timestamp: Date.now(),
      };
      channelMessages.get(raid.channelId)?.push(msg);
      emitCommunityMessage(msg);

      setTimeout(() => {
        activeRaids.delete(raid.id);
        emitCommunityMeta();
      }, 10000);
    }
  });

  /* ═══ DMs ═══ */
  socket.on("dm:send", (data) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;
    if (checkRateLimit(`${socket.id}:dm-send`, 20, 60_000)) {
      socket.emit("error", "Too many direct messages.");
      return;
    }
    const { targetId, content } = data;
    const targetEntry = Array.from(onlineUsers.entries()).find(
      ([, onlineUser]) => onlineUser.id === targetId,
    );
    const targetSocketId = targetEntry?.[0];
    const target = targetEntry?.[1];
    if (!target) return;
    const sanitizedContent = sanitizeText(content, 1000);
    if (!sanitizedContent) return;

    const convKey = [socket.id, targetSocketId].sort().join(":");
    if (!dmConversations.has(convKey)) dmConversations.set(convKey, []);

    const msg = {
      id: generateId(),
      type: "dm",
      fromId: socket.id,
      fromName: user.name,
      fromColor: user.color,
      fromGradient: user.gradient,
      toId: target.id,
      toName: target.name,
      content: sanitizedContent,
      timestamp: Date.now(),
    };

    dmConversations.get(convKey).push(msg);
    socket.emit("dm:new", msg);
    io.to(targetSocketId).emit("dm:new", msg);
  });

  socket.on("dm:history", (targetId) => {
    const targetEntry = Array.from(onlineUsers.entries()).find(
      ([, onlineUser]) => onlineUser.id === targetId,
    );
    const targetSocketId = targetEntry?.[0];
    const convKey = [socket.id, targetSocketId || targetId].sort().join(":");
    socket.emit("dm:history", {
      targetId,
      messages: (dmConversations.get(convKey) || []).slice(-100),
    });
  });

  /* ── Disconnect ── */
  socket.on("disconnect", () => {
    const user = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    typingUsers.forEach((set) => set.delete(socket.id));

    // Remove from active races
    activeRaces.forEach((race, raceId) => {
      race.players = race.players.filter((p) => p.id !== socket.id);
      if (race.players.length === 0) activeRaces.delete(raceId);
    });

    // Remove from active raids
    activeRaids.forEach((raid, raidId) => {
      if (raid.players.has(socket.id)) {
        raid.players.delete(socket.id);
        io.to(raid.channelId).emit("raid:updated", {
          ...raid,
          players: Array.from(raid.players.values()),
        });
        emitCommunityMeta();
        if (raid.players.size === 0) activeRaids.delete(raidId);
      }
    });

    broadcastOnlineUsers();

    if (user) {
      const sysMsg = {
        id: generateId(),
        channelId: "general",
        type: "system",
        subtype: "leave",
        content: `${user.name} left the chat`,
        timestamp: Date.now(),
        userName: user.name,
        userColor: user.color,
      };
      channelMessages.get("general")?.push(sysMsg);
      emitCommunityMessage(sysMsg);
    }

    console.log(`🔴 Disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`\n╔══════════════════════════════════════════════════╗`);
  console.log(`║  ⚡ TypeForge Community Server — Port ${PORT}       ║`);
  console.log(`║  📡 WebSocket: ws://localhost:${PORT}              ║`);
  console.log(
    `║  🎮 Channels: ${CHANNELS.length} | Races: Enabled            ║`,
  );
  console.log(`╚══════════════════════════════════════════════════╝\n`);
});
