'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩'],
  'Gestures': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎳', '🏓', '🏸', '🏒', '🏑', '🥍', '🏘️'],
  'Nature': ['🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '💫', '⭐', '🌟'],
  'Food': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥑'],
  'Objects': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘'],
  'Symbols': ['✨', '🌈', '⭐', '💫', '✅', '❌', '❎', '🔥', '💥', '💢', '💯', '🎉', '🎊', '🎈', '🎀', '🎁'],
}

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function EmojiPicker({ onSelectEmoji, isOpen = false, onClose }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Smileys')

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute bottom-full mb-2 right-0 bg-black border border-white/10 rounded-lg shadow-2xl p-4 w-80 z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Smile size={16} className="text-accent-300" />
              Emoji Picker
            </h3>
            {onClose && (
              <motion.button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
              >
                <X size={16} />
              </motion.button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category as keyof typeof EMOJI_CATEGORIES)}
                className={cn(
                  'px-2 py-1 rounded text-xs font-medium transition-colors flex-shrink-0',
                  selectedCategory === category
                    ? 'bg-accent-300/20 text-accent-300 border border-accent-300/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                whileHover={{ scale: 1.05 }}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Emojis grid */}
          <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
            {EMOJI_CATEGORIES[selectedCategory].map((emoji) => (
              <motion.button
                key={emoji}
                onClick={() => {
                  onSelectEmoji(emoji)
                  onClose?.()
                }}
                className="text-2xl hover:bg-white/10 p-2 rounded transition-colors"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                {emoji}
              </motion.button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center">Click any emoji to add it</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
