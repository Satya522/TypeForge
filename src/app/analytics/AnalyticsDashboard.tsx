"use client";

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, TrendingDown, Minus, Zap, Target, Clock, BarChart3, Activity, Keyboard } from 'lucide-react';
import KeyHeatmap from '@/components/KeyHeatmap';
import { cn } from '@/lib/utils';

interface AnalyticsDatum {
  accuracy: number;
  date: string;
  lessons: number;
  sessions: number;
  time: number;
  wpm: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsDatum[];
  heatmapData: Record<string, number>;
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0f0d]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-xs text-gray-400">{entry.name}:</span>
          <span className="text-sm font-bold text-white">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Premium Activity Heatmap ──
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ActivityHeatmap({ data }: { data: AnalyticsDatum[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxSessions = Math.max(...data.map(d => d.sessions), 1);

  // Build week columns
  const weeks: AnalyticsDatum[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  // Month labels: mark first week index where month changes
  const monthLabels: Map<number, string> = new Map();
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (firstDay) {
      const parts = firstDay.date.split('-');
      const m = parseInt(parts[0]) - 1;
      if (m !== lastMonth) { monthLabels.set(wi, MONTH_NAMES[m]); lastMonth = m; }
    }
  });

  return (
    <div className="w-full select-none">
      {/* Month labels */}
      <div className="flex mb-1.5 pl-8">
        {weeks.map((_, wi) => (
          <div key={wi} className="flex-1 min-w-0 text-[9px] font-black uppercase tracking-widest text-gray-600 truncate">
            {monthLabels.get(wi) ?? ''}
          </div>
        ))}
      </div>

      {/* Grid: day labels + squares */}
      <div className="flex gap-0 w-full">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-[3px] mr-[6px] shrink-0">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-[14px] flex items-center">
              {i % 2 === 0 && (
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-700 w-7 text-right pr-1">{d}</span>
              )}
              {i % 2 !== 0 && <span className="w-7" />}
            </div>
          ))}
        </div>

        {/* Heatmap squares */}
        <div className="flex gap-[3px] w-full overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] flex-1 min-w-[14px]">
              {week.map((day, di) => {
                const globalIdx = wi * 7 + di;
                const intensity = day.sessions / maxSessions;
                const isHovered = hovered === globalIdx;
                const isEmpty = day.sessions === 0;

                const bg = isEmpty
                  ? 'rgba(255,255,255,0.035)'
                  : `rgba(57,255,20,${0.12 + intensity * 0.75})`;
                const glow = !isEmpty
                  ? `0 0 ${5 + intensity * 14}px rgba(57,255,20,${0.08 + intensity * 0.35})`
                  : 'none';

                return (
                  <div
                    key={di}
                    className="relative"
                    onMouseEnter={() => setHovered(globalIdx)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div
                      className="w-full h-[14px] rounded-[3px] cursor-pointer transition-all duration-150"
                      style={{
                        background: isHovered && isEmpty ? 'rgba(57,255,20,0.08)' : bg,
                        boxShadow: isHovered ? `0 0 12px rgba(57,255,20,0.4), ${glow}` : glow,
                        border: isHovered ? '1px solid rgba(57,255,20,0.5)' : '1px solid transparent',
                        transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                      }}
                    />
                    {/* Tooltip */}
                    {isHovered && (
                      <div
                        className="absolute z-[70] pointer-events-none"
                        style={{ bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)' }}
                      >
                        <div
                          className="whitespace-nowrap rounded-xl border border-white/10 px-3 py-2 text-[11px] text-gray-300"
                          style={{ background: 'rgba(8,10,9,0.96)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(57,255,20,0.08)' }}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: isEmpty ? '#333' : `rgba(57,255,20,${0.4 + intensity * 0.6})`, boxShadow: !isEmpty ? `0 0 6px rgba(57,255,20,0.5)` : 'none' }} />
                            <span><strong className="text-white">{day.sessions}</strong> session{day.sessions !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">{day.date}</div>
                        </div>
                        {/* Arrow */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]">
                          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white/10" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 pl-8">
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Less</span>
        {[0, 0.2, 0.4, 0.65, 1].map((v, i) => (
          <div key={i} className="w-[14px] h-[14px] rounded-[3px] transition-transform hover:scale-125"
            style={{
              background: v === 0 ? 'rgba(255,255,255,0.035)' : `rgba(57,255,20,${0.12 + v * 0.75})`,
              boxShadow: v > 0 ? `0 0 ${v * 8}px rgba(57,255,20,${v * 0.4})` : 'none',
            }}
          />
        ))}
        <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">More</span>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard({ data, heatmapData }: AnalyticsDashboardProps) {
  const [activeChart, setActiveChart] = useState<'wpm' | 'accuracy'>('wpm');
  const last30Data = useMemo(() => data.slice(-30), [data]);

  // Compute trends
  const trends = useMemo(() => {
    const activeDays = last30Data.filter(d => d.wpm > 0);
    if (activeDays.length < 2) return { wpmTrend: 0, accTrend: 0, avgWpm: 0, avgAcc: 0, bestWpm: 0, bestAcc: 0, totalTime: 0 };
    
    const half = Math.floor(activeDays.length / 2);
    const firstHalf = activeDays.slice(0, half);
    const secondHalf = activeDays.slice(half);
    
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
    const wpmFirst = avg(firstHalf.map(d => d.wpm));
    const wpmSecond = avg(secondHalf.map(d => d.wpm));
    const accFirst = avg(firstHalf.map(d => d.accuracy));
    const accSecond = avg(secondHalf.map(d => d.accuracy));
    
    return {
      wpmTrend: wpmSecond - wpmFirst,
      accTrend: accSecond - accFirst,
      avgWpm: avg(activeDays.map(d => d.wpm)),
      avgAcc: avg(activeDays.map(d => d.accuracy)),
      bestWpm: Math.max(...activeDays.map(d => d.wpm)),
      bestAcc: Math.max(...activeDays.map(d => d.accuracy)),
      totalTime: last30Data.reduce((s, d) => s + d.time, 0),
    };
  }, [last30Data]);

  // Radar chart data
  const radarData = useMemo(() => {
    const activeDays = last30Data.filter(d => d.wpm > 0);
    if (!activeDays.length) return [];
    const avgWpm = activeDays.reduce((s, d) => s + d.wpm, 0) / activeDays.length;
    const avgAcc = activeDays.reduce((s, d) => s + d.accuracy, 0) / activeDays.length;
    const consistency = 100 - (activeDays.length > 1 
      ? Math.sqrt(activeDays.reduce((s, d) => s + Math.pow(d.wpm - avgWpm, 2), 0) / activeDays.length) 
      : 0);

    return [
      { metric: 'Speed', value: Math.min(100, Math.round(avgWpm * 1.5)), fullMark: 100 },
      { metric: 'Accuracy', value: Math.round(avgAcc), fullMark: 100 },
      { metric: 'Consistency', value: Math.max(0, Math.round(consistency)), fullMark: 100 },
      { metric: 'Endurance', value: Math.min(100, Math.round((trends.totalTime / 60) * 10)), fullMark: 100 },
      { metric: 'Volume', value: Math.min(100, Math.round(last30Data.reduce((s, d) => s + d.sessions, 0) * 5)), fullMark: 100 },
    ];
  }, [last30Data, trends.totalTime]);

  const TrendIcon = ({ val }: { val: number }) => {
    if (val > 1) return <TrendingUp className="w-3.5 h-3.5 text-accent-300" />;
    if (val < -1) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
    return <Minus className="w-3.5 h-3.5 text-gray-500" />;
  };

  return (
    <div className="space-y-8">
      
      {/* ── Trend Cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Avg Speed', value: `${trends.avgWpm.toFixed(0)}`, unit: 'WPM', trend: trends.wpmTrend, color: '#39FF14', colorEnd: '#00cc66', icon: <Zap className="w-5 h-5" />, sparkData: data.slice(-14).map(d => d.wpm) },
          { label: 'Avg Accuracy', value: `${trends.avgAcc.toFixed(1)}`, unit: '%', trend: trends.accTrend, color: '#06b6d4', colorEnd: '#0ea5e9', icon: <Target className="w-5 h-5" />, sparkData: data.slice(-14).map(d => d.accuracy) },
          { label: 'Best WPM', value: `${trends.bestWpm.toFixed(0)}`, unit: 'WPM', trend: 0, color: '#a855f7', colorEnd: '#7c3aed', icon: <Flame className="w-5 h-5" />, sparkData: data.slice(-14).map(d => d.wpm) },
          { label: 'Total Practice', value: `${Math.round(trends.totalTime / 60)}`, unit: 'min', trend: 0, color: '#fbbf24', colorEnd: '#f59e0b', icon: <Clock className="w-5 h-5" />, sparkData: data.slice(-14).map(d => d.time / 60) },
        ].map((card, i) => {
          // Build mini sparkline path
          const sparkMax = Math.max(...card.sparkData, 1);
          const sparkMin = Math.min(...card.sparkData);
          const sparkRange = sparkMax - sparkMin || 1;
          const points = card.sparkData.map((v, j) => {
            const x = (j / (card.sparkData.length - 1)) * 100;
            const y = 100 - ((v - sparkMin) / sparkRange) * 100;
            return `${x},${y}`;
          }).join(' ');
          const areaPoints = `0,100 ${points} 100,100`;

          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', damping: 20 }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f1210] to-[#080a09] p-[1px] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Gradient top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${card.color}, ${card.colorEnd}, transparent)` }} />

              <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-b from-[#0e1210] to-[#080a09] p-5 h-full">

                {/* Ambient glow orbs */}
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-[50px] z-0" style={{ background: `${card.color}12` }} />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700 blur-[40px] z-0" style={{ background: `${card.colorEnd}08` }} />

                {/* Mini sparkline background */}
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500 z-0">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <polygon points={areaPoints} fill={card.color} />
                  </svg>
                </div>

                {/* Header row */}
                <div className="relative z-10 flex items-center justify-between mb-4">
                  {/* Icon with ring */}
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]" style={{ background: `${card.color}10`, color: card.color, border: `1px solid ${card.color}20` }}>
                      {card.icon}
                    </div>
                    {/* Decorative corner dot */}
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: card.color, boxShadow: `0 0 6px ${card.color}` }} />
                  </div>
                  
                  {/* Trend Badge */}
                  {card.trend !== 0 && (
                    <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur-sm" style={{ background: card.trend > 0 ? 'rgba(57,255,20,0.06)' : 'rgba(255,77,109,0.06)', border: `1px solid ${card.trend > 0 ? 'rgba(57,255,20,0.15)' : 'rgba(255,77,109,0.15)'}` }}>
                      <TrendIcon val={card.trend} />
                      <span className={cn("text-[10px] font-black tabular-nums", card.trend > 0 ? "text-accent-300" : "text-red-400")}>
                        {card.trend > 0 ? '+' : ''}{card.trend.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Label */}
                <p className="relative z-10 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500 mb-2">{card.label}</p>

                {/* Value */}
                <div className="relative z-10 flex items-baseline gap-1.5">
                  <p className="text-4xl font-black tabular-nums text-white tracking-tight" style={{ textShadow: `0 0 30px ${card.color}15` }}>
                    {card.value}
                  </p>
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: `${card.color}80` }}>{card.unit}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Main Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* WPM & Accuracy Area Chart (2 cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', damping: 20 }}
          className="lg:col-span-2 group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f1210] to-[#080a09] p-[1px] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, transparent, #39FF14, #06b6d4, transparent)' }} />
          
          <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-b from-[#0e1210] to-[#080a09] p-6 h-full">
            {/* Ambient glow orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-[80px] pointer-events-none bg-accent-300/10" />
            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-[60px] pointer-events-none bg-cyan-500/10" />
            
            {/* Chart toggle header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300/10 border border-accent-300/20 text-accent-300 transition-all group-hover:shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Performance Trend</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-0.5">Last 30 days</p>
                </div>
              </div>
              <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-[3px]">
                {(['wpm', 'accuracy'] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key)}
                    className={cn(
                      "px-4 py-1.5 rounded-[9px] text-[10px] font-black uppercase tracking-widest transition-all",
                      activeChart === key
                        ? "bg-accent-300/10 text-accent-300 shadow-[0_0_12px_rgba(57,255,20,0.1)] border border-accent-300/20"
                        : "text-gray-500 hover:text-gray-300 border border-transparent"
                    )}
                  >
                    {key === 'wpm' ? 'Speed' : 'Accuracy'}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative z-10 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={last30Data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <defs>
                    <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#39FF14" stopOpacity={0.25} />
                      <stop offset="50%" stopColor="#39FF14" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#39FF14" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#3a3a3a" tick={{ fontSize: 10, fill: '#555' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#3a3a3a" tick={{ fontSize: 10, fill: '#555' }} axisLine={false} tickLine={false} domain={activeChart === 'accuracy' ? [0, 100] : ['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  {activeChart === 'wpm' ? (
                    <Area type="monotone" dataKey="wpm" name="WPM" stroke="#39FF14" strokeWidth={2.5} fill="url(#wpmGrad)" dot={false} activeDot={{ r: 6, fill: '#39FF14', stroke: '#0d0d0d', strokeWidth: 3 }} />
                  ) : (
                    <Area type="monotone" dataKey="accuracy" name="Accuracy" stroke="#06b6d4" strokeWidth={2.5} fill="url(#accGrad)" dot={false} activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0d0d0d', strokeWidth: 3 }} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', damping: 20 }}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f1210] to-[#080a09] p-[1px] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, transparent, #a855f7, #7c3aed, transparent)' }} />
          
          <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-b from-[#0e1210] to-[#080a09] p-6 h-full">
            {/* Ambient glow */}
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-[60px] pointer-events-none bg-purple-500/10" />
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-[50px] pointer-events-none bg-violet-500/10" />
            
            <div className="relative z-10 flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 transition-all group-hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Skill Radar</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-0.5">Multi-dimensional</p>
              </div>
            </div>
            <div className="relative z-10 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#888' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="You" dataKey="value" stroke="#a855f7" strokeWidth={2.5} fill="#a855f7" fillOpacity={0.12} dot={{ r: 4, fill: '#a855f7', stroke: '#0d0d0d', strokeWidth: 2 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Activity Heatmap + Practice Bars ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Activity Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', damping: 20 }}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f1210] to-[#080a09] p-[1px] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, transparent, #f97316, #fbbf24, transparent)' }} />
          
          <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-b from-[#0e1210] to-[#080a09] p-6 h-full">
            {/* Ambient glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-[50px] pointer-events-none bg-orange-500/10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-[40px] pointer-events-none bg-amber-500/10" />
            
            <div className="relative z-10 flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 transition-all group-hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Activity Heatmap</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-0.5">Last 90 days</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-400/60 border border-orange-400/15 rounded-full px-3 py-1 bg-orange-400/[0.03]">Hover for details</span>
            </div>
            <div className="relative z-10">
              <ActivityHeatmap data={data} />
            </div>
          </div>
        </motion.div>

        {/* Practice Time Bars */}
        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, type: 'spring', damping: 20 }}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f1210] to-[#080a09] p-[1px] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
        >
          {/* Gradient top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, transparent, #39FF14, #00cc66, transparent)' }} />
          
          <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-b from-[#0e1210] to-[#080a09] p-6 h-full">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-700 blur-[60px] pointer-events-none bg-accent-300/10" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-[40px] pointer-events-none bg-emerald-500/10" />
            
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300/10 border border-accent-300/20 text-accent-300 transition-all group-hover:shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Practice Time</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mt-0.5">Last 30 Days (Min)</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-accent-300/60 border border-accent-300/15 rounded-full px-3 py-1 bg-accent-300/[0.03]">
                {Math.round(last30Data.reduce((s, d) => s + d.time, 0) / 60)} min total
              </span>
            </div>
            <div className="relative z-10 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last30Data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#39FF14" stopOpacity={0.95} />
                      <stop offset="25%"  stopColor="#39FF14" stopOpacity={0.6} />
                      <stop offset="65%"  stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#39FF14" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#3a3a3a" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#3a3a3a" tick={{ fontSize: 9, fill: '#555' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="time" name="Minutes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Key Error Heatmap ── */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', damping: 20 }}
        className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0f1210] to-[#080a09] p-[1px] transition-all duration-500 hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
      >
        {/* Gradient top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] z-10 opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, transparent, #39FF14, #00cc66, transparent)' }} />
        
        <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-b from-[#0e1210] to-[#080a09] p-6 h-full">
          {/* Ambient glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-[100px] pointer-events-none bg-accent-300/10" />
          
          <div className="relative z-10 flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300/10 border border-accent-300/20 text-accent-300 transition-all group-hover:shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                <Keyboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white tracking-tight">Weakness Map</h3>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-accent-300/60 border border-accent-300/15 rounded-full px-3 py-1 bg-accent-300/[0.03]">Thermal View</span>
          </div>
          <p className="relative z-10 text-[10px] text-gray-600 mb-6 ml-[52px] font-bold uppercase tracking-[0.15em]">Hot keys = more errors · Identify and drill your weakest keys</p>
          <div className="relative z-10">
            <KeyHeatmap data={heatmapData} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
