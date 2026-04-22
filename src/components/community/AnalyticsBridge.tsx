import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Share2,
  Swords,
  MessageCircle,
  Users,
  Zap,
  Target,
  TrendingUp,
  Copy,
  Heart,
  MessageSquare,
} from 'lucide-react'

interface AnalyticsBridgeProps {
  wpm: number
  accuracy: number
  consistency: number
  heatmapData?: string
  lastSessionDate?: string
  weakKeys?: string[]
  onSharePerformance?: () => void
  onChallengeFriend?: () => void
  onPostToSquad?: () => void
  onOpenDrills?: () => void
  className?: string
}

const AnalyticsBridge: React.FC<AnalyticsBridgeProps> = ({
  wpm,
  accuracy,
  consistency,
  heatmapData,
  lastSessionDate,
  weakKeys = [],
  onSharePerformance,
  onChallengeFriend,
  onPostToSquad,
  onOpenDrills,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'challenge' | 'drills'>('share')
  const [shareMessage, setShareMessage] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyShareLink = () => {
    const shareText = `Check out my typing performance: ${wpm} WPM, ${accuracy.toFixed(1)}% accuracy! TypeForge`
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-black/60 to-black/60 backdrop-blur-md',
        className
      )}
    >
      <div className="p-6">
        {/* Header */}
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-cyan-400" />
          Share & Connect
        </h3>

        {/* Performance snapshot */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4"
          >
            <p className="text-xs text-slate-400 mb-1">Current WPM</p>
            <p className="text-2xl font-bold text-cyan-300">{Math.round(wpm)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <p className="text-xs text-slate-400 mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-amber-300">
              {accuracy.toFixed(1)}%
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
          >
            <p className="text-xs text-slate-400 mb-1">Consistency</p>
            <p className="text-2xl font-bold text-emerald-300">
              {consistency.toFixed(0)}%
            </p>
          </motion.div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-2 mb-4 border-b border-white/5">
          {(['share', 'challenge', 'drills'] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 px-2 text-sm font-semibold capitalize border-b-2 transition-colors',
                activeTab === tab
                  ? 'text-cyan-300 border-cyan-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              )}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'share' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Share to squad */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Users size={14} />
                Post to Squad
              </p>
              <textarea
                placeholder="Share your performance with your squad..."
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                className="w-full h-20 p-2 rounded border border-white/10 bg-white/5 text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-cyan-500/50"
              />
              <motion.button
                onClick={onPostToSquad}
                className="mt-3 w-full h-9 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageSquare size={14} />
                Post to Squad
              </motion.button>
            </div>

            {/* Share performance card */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Share2 size={14} />
                Performance Card
              </p>
              <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 mb-3">
                <p className="text-xs text-slate-400 mb-2">Preview</p>
                <p className="text-sm text-white font-medium mb-1">
                  My best: {wpm} WPM • {accuracy.toFixed(1)}% Accuracy
                </p>
                <p className="text-xs text-slate-400">
                  {lastSessionDate || 'Today'} • TypeForge
                </p>
              </div>
              <motion.button
                onClick={handleCopyShareLink}
                className="w-full h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy Share Link'}
              </motion.button>
            </div>

            {/* Share heatmap */}
            {heatmapData && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white mb-3">
                  Share Heatmap
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  Show your weak keys to the community and get drill recommendations
                </p>
                <motion.button
                  className="w-full h-9 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Share2 size={14} />
                  Share Heatmap
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'challenge' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Challenge friend */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Zap size={14} />
                Challenge a Friend
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Send your current performance as a challenge for your friends to beat
              </p>
              <motion.button
                onClick={onChallengeFriend}
                className="w-full h-9 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap size={14} />
                Challenge Friend
              </motion.button>
            </div>

            {/* Ghost replay info */}
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
              <p className="text-sm font-semibold text-white mb-2">Ghost Replay</p>
              <p className="text-xs text-slate-400 mb-3">
                Your friends can race against this exact performance with Ghost Replay mode
              </p>
              <motion.button
                className="w-full h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm font-semibold transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Enable Ghost Replay
              </motion.button>
            </div>

            {/* Leaderboard entry */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white mb-2">Weekly Leaderboard</p>
              <p className="text-xs text-slate-400 mb-3">
                Your score: #{Math.floor(Math.random() * 100) + 1} this week
              </p>
              <motion.button
                className="w-full h-9 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all"
              >
                View Leaderboard
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'drills' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Weak keys drills */}
            {weakKeys.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white mb-3">
                  Focus Drills
                </p>
                <p className="text-xs text-slate-400 mb-3">
                  Work on your weak keys: {weakKeys.join(', ')}
                </p>
                <motion.button
                  onClick={onOpenDrills}
                  className="w-full h-9 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target size={14} />
                  Start Focus Drills
                </motion.button>
              </div>
            )}

            {/* Accuracy improvement */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white mb-3">
                Accuracy Improvement
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Practice with reduced speed to improve your accuracy to 98%+
              </p>
              <motion.button
                className="w-full h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-sm font-semibold transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Accuracy Challenge
              </motion.button>
            </div>

            {/* Coach recommendations */}
            <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-sm font-semibold text-white mb-2">
                Coach Recommendations
              </p>
              <p className="text-xs text-slate-400 mb-3">
                Based on your performance, a coach suggests focusing on consistency and pacing
              </p>
              <motion.button
                className="w-full h-9 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-sm font-semibold transition-all"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                View Coach Advice
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default AnalyticsBridge
