'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Zap,
  Trophy,
  Flame,
  Star,
  Code2,
  Smile,
  Reply as ReplyIcon,
  Pin,
  Copy,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { ProfileHoverCard } from '@/components/profile'
import { Avatar } from '@/components/ui/avatar'

const QUICK_REACTIONS = ['🔥', '⚡', '💯', '🎯', '⭐', '🏆', '😂', '👏', '👀', '❤️', '🎉', '✨']

type MessageAttachment = {
  id: string
  type: 'image' | 'file' | 'video'
  url: string
  fileName?: string
  fileSize?: number
}

type MessageContent = {
  id: string
  userId?: string
  userName: string
  avatarUrl?: string | null
  userColor: string
  content: string
  timestamp: number
  wpm?: number
  accuracy?: number
  messageType?: 'text' | 'score' | 'achievement' | 'race-result'
  reactions?: Record<string, string[]>
  isPinned?: boolean
  attachments?: MessageAttachment[]
  replyTo?: {
    userName: string
    content: string
  }
}

interface MessageBubbleProps {
  message: MessageContent
  onReply?: (message: MessageContent) => void
  onReact?: (emoji: string) => void
  onPin?: () => void
  onDelete?: () => void
  onCopy?: () => void
  currentUserId?: string
}

export function MessageBubble({
  message,
  onReply,
  onReact,
  onPin,
  onDelete,
  onCopy,
  currentUserId,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const reactionCounts = message.reactions
    ? Object.entries(message.reactions).map(([emoji, users]) => ({
        emoji,
        count: users.length,
      }))
    : []

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group py-2 px-2 hover:bg-white/5 rounded-lg transition-colors"
    >
      {/* Reply context */}
      {message.replyTo && (
        <div className="mb-2 px-3 py-2 rounded-md bg-white/5 border-l-2 border-accent-300/50 text-xs">
          <p className="text-slate-400">
            <span className="text-slate-300 font-medium">Replying to {message.replyTo.userName}</span>
          </p>
          <p className="text-slate-500 truncate">{message.replyTo.content}</p>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <ProfileHoverCard
          userId={message.userId}
          fallbackAvatarUrl={message.avatarUrl}
          fallbackName={message.userName}
        >
          <Avatar
            src={message.avatarUrl}
            name={message.userName}
            size={32}
            className="ring-1 ring-white/8"
            fallbackClassName="text-xs"
          />
        </ProfileHoverCard>

        {/* Message content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <ProfileHoverCard
              userId={message.userId}
              fallbackAvatarUrl={message.avatarUrl}
              fallbackName={message.userName}
            >
              <p className="text-sm font-semibold text-white">{message.userName}</p>
            </ProfileHoverCard>
            <p className="text-xs text-slate-500">{timeString}</p>
            {message.isPinned && (
              <div className="flex items-center gap-1 text-xs text-amber-400 ml-auto">
                <Pin size={12} className="fill-current" />
              </div>
            )}
          </div>

          {/* Score card for score messages */}
          {message.messageType === 'score' && (
            <div className="mb-2 p-3 rounded-lg bg-gradient-to-r from-accent-300/10 to-accent-200/10 border border-accent-300/20">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent-300">{message.wpm}</p>
                  <p className="text-xs text-slate-400">WPM</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-300">{message.accuracy?.toFixed(1)}%</p>
                  <p className="text-xs text-slate-400">Accuracy</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-amber-300">✨</p>
                  <p className="text-xs text-slate-400">New PB!</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-white">{message.content}</p>
            </div>
          )}

          {/* Regular message */}
          {message.messageType !== 'score' && (
            <p className="text-sm text-slate-300 break-words leading-relaxed">{message.content}</p>
          )}

          {/* Media attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment, idx) => (
                <motion.div
                  key={`${attachment.id}-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group rounded-lg overflow-hidden bg-white/5 border border-accent-300/20 p-2"
                >
                  {attachment.type === 'image' && (
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="max-w-sm max-h-64 rounded-md object-cover"
                    />
                  )}
                  {attachment.type === 'video' && (
                    <video
                      src={attachment.url}
                      controls
                      className="max-w-sm max-h-64 rounded-md"
                    />
                  )}
                  {attachment.type === 'file' && (
                    <div className="p-3 flex items-center gap-3">
                      <FileText size={32} className="text-accent-300 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{attachment.fileName}</p>
                        {attachment.fileSize && (
                          <p className="text-xs text-slate-400">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </p>
                        )}
                      </div>
                      <motion.a
                        href={attachment.url}
                        download={attachment.fileName}
                        className="p-2 rounded-lg hover:bg-white/10 text-accent-300 transition-colors flex-shrink-0"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download size={18} />
                      </motion.a>
                    </div>
                  )}

                  {/* Download button for images and videos */}
                  {(attachment.type === 'image' || attachment.type === 'video') && (
                    <motion.a
                      href={attachment.url}
                      download={attachment.fileName || `media-${attachment.id}`}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-accent-300 opacity-0 group-hover:opacity-100 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={16} />
                    </motion.a>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Reactions */}
          {reactionCounts.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {reactionCounts.map((r) => (
                <motion.button
                  key={r.emoji}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{r.emoji}</span>
                  <span className="text-slate-400">{r.count}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReactions(!showReactions)}
          >
            <Smile size={16} />
          </motion.button>

          <motion.button
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReply?.(message)}
          >
            <ReplyIcon size={16} />
          </motion.button>

          <div className="relative">
            <motion.button
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={16} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-40 bg-black border border-white/10 rounded-lg shadow-lg z-50"
                >
                  {onCopy && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                      onClick={() => {
                        onCopy()
                        setShowMenu(false)
                      }}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  )}
                  {onPin && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/5 flex items-center gap-2 transition-colors"
                      onClick={() => {
                        onPin()
                        setShowMenu(false)
                      }}
                    >
                      <Pin size={14} />
                      Pin
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors border-t border-white/5"
                      onClick={() => {
                        onDelete()
                        setShowMenu(false)
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Emoji reactions picker */}
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 ml-11 flex gap-1 p-2 rounded-lg bg-black border border-white/10 w-fit"
          >
            {QUICK_REACTIONS.map((emoji) => (
              <motion.button
                key={emoji}
                className="w-7 h-7 rounded hover:bg-white/10 text-base flex items-center justify-center"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onReact?.(emoji)
                  setShowReactions(false)
                }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
