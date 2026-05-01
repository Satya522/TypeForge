'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, X } from 'lucide-react'
import data from '@emoji-mart/data'
import dynamic from 'next/dynamic'

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function EmojiPicker({
  onSelectEmoji,
  isOpen = false,
  onClose,
}: EmojiPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute bottom-full mb-2 left-0 bg-[#0b0d10] border border-white/10 rounded-2xl shadow-2xl w-[352px] z-50 origin-bottom-left overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/5 bg-black/40">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-400">
              <Smile size={14} />
              Emojis
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-slate-500 hover:text-accent-400 transition"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="bg-[#0b0d10] flex-1 max-h-[400px] overflow-hidden emoji-mart-container relative">
            <Picker
              data={data}
              onEmojiSelect={(emoji: any) => {
                onSelectEmoji(emoji.native)
              }}
              theme="dark"
              autoFocus={true}
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            .emoji-mart-container em-emoji-picker {
               --rgb-accent: 34, 197, 94;
               --color-border: transparent;
               --rgb-background: 11, 13, 16;
               width: 100% !important;
               height: 400px !important;
            }
          `,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
