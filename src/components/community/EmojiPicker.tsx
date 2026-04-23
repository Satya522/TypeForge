'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Smile, Image as ImageIcon, X } from 'lucide-react'
import data from '@emoji-mart/data'
import dynamic from 'next/dynamic'
import { Theme as GifPickerTheme } from 'gif-picker-react'

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false })
const GifPicker = dynamic(() => import('gif-picker-react'), { ssr: false })
import { cn } from '@/lib/utils'

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void
  onSelectGif?: (url: string) => void
  isOpen?: boolean
  onClose?: () => void
}

export function EmojiPicker({
  onSelectEmoji,
  onSelectGif,
  isOpen = false,
  onClose,
}: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState<'emoji' | 'gif'>('emoji')

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
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('emoji')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2',
                  activeTab === 'emoji'
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <Smile size={14} /> Emojis
              </button>
              <button
                onClick={() => setActiveTab('gif')}
                className={cn(
                  'px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2',
                  activeTab === 'gif'
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <ImageIcon size={14} /> GIFs
              </button>
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
            {activeTab === 'emoji' && (
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
            )}
            {activeTab === 'gif' && (
              <div className="h-[400px] w-[352px] overflow-y-auto custom-scrollbar bg-black/20">
                <GifPicker
                  tenorApiKey={
                    process.env.NEXT_PUBLIC_TENOR_API_KEY || 'LIVDSRZULECB'
                  }
                  onGifClick={(gif) => {
                    if (onSelectGif) onSelectGif(gif.url)
                    else onSelectEmoji(gif.url) // fallback
                    onClose?.()
                  }}
                  theme={GifPickerTheme.DARK}
                  width={352}
                />
              </div>
            )}
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
