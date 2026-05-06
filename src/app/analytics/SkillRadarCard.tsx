"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";

export type DailyStats = {
  date: string;
  score: number;
  wpm: number;
  accuracy: number;
  sessions: number;
  minutes: number;
};

export interface SkillRadarCardProps {
  yearOptions: number[];
  monthOptions: string[];
  dailyStatsByDate: Record<string, DailyStats>;
  initialYear: number;
  initialMonthIndex: number;
  monthlyStats: { monthScore: number };
  getMonthlyScore?: (year: number, monthIndex: number) => number;
  renderRadar: (mode: 'monthly' | 'daily', score: number | undefined, selectedYear: number, selectedMonthIndex: number, selectedDay: number | null) => React.ReactNode;
}

const cssAnimations = `
  @keyframes spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes softPulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeSlideUp {
    animation: fadeSlideUp 300ms ease-out forwards;
  }
  .hide-scroll::-webkit-scrollbar {
    display: none;
  }
  .hide-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

function toISODateString(year: number, month: number, day: number) {
  const y = year.toString().padStart(4, "0");
  const m = (month + 1).toString().padStart(2, "0");
  const d = day.toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function SkillRadarCard({
  yearOptions,
  monthOptions,
  dailyStatsByDate,
  initialYear,
  initialMonthIndex,
  monthlyStats,
  getMonthlyScore,
  renderRadar,
}: SkillRadarCardProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(initialMonthIndex);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [picking, setPicking] = useState<'year' | 'month' | 'day' | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'daily'>('monthly');
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = cssAnimations;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleClearDate = () => {
    setSelectedDay(null);
    setViewMode('monthly');
    setAnimKey(prev => prev + 1);
  };

  const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const selectedDateISO = selectedDay ? toISODateString(selectedYear, selectedMonthIndex, selectedDay) : "";
  const dailyStats = selectedDay ? dailyStatsByDate[selectedDateISO] : undefined;
  
  const formatDateLabel = () => {
    if (!selectedDay) return "";
    return `${monthOptions[selectedMonthIndex].toUpperCase()} ${selectedDay}, ${selectedYear}`;
  };

  const currentMonthScore = getMonthlyScore ? getMonthlyScore(selectedYear, selectedMonthIndex) : monthlyStats.monthScore;

  return (
    <div 
      className="relative flex flex-col rounded-3xl overflow-hidden"
      style={{
        height: '480px',
        background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {}
      <div className="flex items-center justify-between px-5 pt-5 pb-0 flex-shrink-0">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/30">
          Skill Radar
        </span>
        
        {viewMode === 'daily' ? (
          <button
            onClick={handleClearDate}
            className="text-[11px] font-medium tracking-wide uppercase text-white/40 hover:text-white/70 border border-white/[0.08] hover:border-white/20 px-3 py-1 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Clear
          </button>
        ) : (
          <div className="h-[26px]" />
        )}
      </div>

      {}
      <div className="text-center px-5 pt-2 pb-0 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white/90 tracking-tight">
          Monthly Score Profile
        </h2>
        <div key={`title-${animKey}`} className="animate-fadeSlideUp">
          {viewMode === 'monthly' ? (
            <p className="text-[11px] text-white/30 mt-0.5">
              {monthOptions[selectedMonthIndex]} {selectedYear} · {currentMonthScore}/100 avg
            </p>
          ) : dailyStats ? (
            <p className="text-[11px] text-white/30 mt-0.5">
              {formatDateLabel()} · {dailyStats.score}/100
              <span className="text-white/20"> · month avg {currentMonthScore}</span>
            </p>
          ) : (
            <p className="text-[11px] text-white/20 mt-0.5">
              No data for this date
            </p>
          )}
        </div>
      </div>

      {}
      <div className="flex-1 relative flex items-center justify-center min-h-0 w-full">
        
        {}
        {picking && (
          <div className="absolute inset-0 z-50 flex flex-col justify-center p-2 rounded-3xl animate-in fade-in zoom-in-95 duration-200">
             <div className="absolute inset-0 bg-[#0f1218]/80 backdrop-blur-xl rounded-3xl" onClick={() => setPicking(null)} />
             <div className="relative z-10 w-full bg-[#0b0d12]/95 border border-white/10 rounded-[24px] p-3 shadow-2xl backdrop-blur-2xl animate-fadeSlideUp">
               <div className="flex justify-between items-center mb-4 px-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                   Select {picking}
                 </p>
                 <button onClick={() => setPicking(null)} className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                   <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </button>
               </div>
               
               <div className="px-1">
                 {picking === 'year' && (
                   <div className="grid grid-cols-4 gap-3">
                     {yearOptions.map(y => (
                        <button key={y} onClick={() => { setSelectedYear(y); setPicking(null); setSelectedMonthIndex(0); setSelectedDay(null); }}
                                className={`flex items-center justify-center w-full h-10 rounded-full text-sm font-bold border transition-transform hover:scale-105 ${selectedYear === y ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}>
                          {y}
                        </button>
                     ))}
                   </div>
                 )}
                 {picking === 'month' && (
                   <div className="grid grid-cols-4 gap-2">
                     {monthOptions.map((m, i) => (
                        <button key={i} onClick={() => { setSelectedMonthIndex(i); setPicking(null); setSelectedDay(null); }}
                                className={`flex items-center justify-center w-full h-10 rounded-full text-sm font-bold border transition-transform hover:scale-105 ${selectedMonthIndex === i ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"}`}>
                          {m}
                        </button>
                     ))}
                   </div>
                 )}
                 {picking === 'day' && (
                   <div>
                     <div className="grid grid-cols-7 mb-1 text-center text-[9px] font-bold text-white/30 tracking-widest">
                       <span>SU</span><span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span>
                     </div>
                     <div className="grid grid-cols-7 gap-y-1 gap-x-1 justify-items-center">
                       {Array.from({ length: new Date(selectedYear, selectedMonthIndex, 1).getDay() }).map((_, i) => (
                         <div key={`empty-${i}`} className="w-8 h-8" />
                       ))}
                       {dayOptions.map(d => {
                          const iso = toISODateString(selectedYear, selectedMonthIndex, d);
                          const hasData = !!dailyStatsByDate[iso];
                          return (
                            <button key={d} onClick={() => { setSelectedDay(d); setPicking(null); }}
                                    className={`relative flex flex-col items-center justify-center w-8 h-8 rounded-full text-xs font-bold border transition-all hover:scale-110 ${selectedDay === d ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-transparent border-transparent text-white/80 hover:bg-white/10"} ${!hasData && selectedDay !== d ? "opacity-50 font-medium" : ""}`}>
                              {d}
                              {hasData && <div className={`absolute bottom-[2px] w-[3px] h-[3px] rounded-full ${selectedDay === d ? "bg-black" : "bg-cyan-400"}`} />}
                            </button>
                          )
                       })}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>
        )}

        <div key={`radar-${animKey}`} className="w-full h-full animate-fadeSlideUp flex items-center justify-center">
          {viewMode === 'daily' && !dailyStats ? (
            <div className="flex-1 flex flex-col items-center justify-center relative w-full h-full"
                 style={{ background: 'radial-gradient(circle at center, rgba(139,92,246,0.06) 0%, transparent 70%)' }}>
              <svg className="absolute" width="140" height="140" style={{ animation: 'spinRing 20s linear infinite' }}>
                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" strokeDasharray="8 6"/>
              </svg>
              <div style={{ animation: 'softPulse 2.5s ease-in-out infinite' }}>
                <Calendar size={28} color="rgba(139,92,246,0.55)" />
              </div>
              <p className="text-sm font-semibold text-white/50 mt-3">No session data</p>
              <p className="text-xs text-white/25 text-center max-w-[150px] mt-1 leading-relaxed">
                Try a different date or complete a session first.
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ overflow: 'visible', padding: '44px' }}>
              {renderRadar(viewMode, dailyStats?.score, selectedYear, selectedMonthIndex, selectedDay)}
            </div>
          )}
        </div>
      </div>

      {}
      <div className="flex-shrink-0 h-[48px] flex items-center justify-center w-full px-5">
        {viewMode === 'daily' && dailyStats ? (
          <div key={`stats-${animKey}`} className="flex justify-center gap-2 animate-fadeSlideUp w-full">
            {[
              ["WPM", dailyStats.wpm],
              ["ACC", dailyStats.accuracy],
              ["SES", dailyStats.sessions],
              ["MIN", dailyStats.minutes],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:scale-105 transition-all duration-150 cursor-default"
                   style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                   onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                <span className="text-[9px] font-semibold tracking-[0.15em] uppercase text-white/30">
                  {label}
                </span>
                <span className="text-xs font-bold tabular-nums text-white/80">
                  {value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full w-full" />
        )}
      </div>

      {}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 px-5 py-4"
           style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        
        <button onClick={() => setPicking('year')} className="relative flex items-center justify-between gap-2 bg-white/[0.04] border border-white/[0.08] text-white/80 text-[11px] font-bold rounded-full pl-4 pr-3 py-1.5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all min-w-[70px]">
          {selectedYear}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5L7.5 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button onClick={() => setPicking('month')} className="relative flex items-center justify-between gap-2 bg-white/[0.04] border border-white/[0.08] text-white/80 text-[11px] font-bold rounded-full pl-4 pr-3 py-1.5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all min-w-[70px]">
          {monthOptions[selectedMonthIndex]}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5L7.5 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        <button onClick={() => setPicking('day')} className="relative flex items-center justify-between gap-2 bg-white/[0.04] border border-white/[0.08] text-white/80 text-[11px] font-bold rounded-full pl-4 pr-3 py-1.5 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all min-w-[70px]">
          {selectedDay ? String(selectedDay).padStart(2, '0') : "Day"}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5L7.5 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
}

export function SkillRadarCardExample() {
  const sampleDailyStats: Record<string, DailyStats> = {
    "2026-04-08": { date: "2026-04-08", score: 62, wpm: 28, accuracy: 85, sessions: 2, minutes: 12 },
    "2026-04-09": { date: "2026-04-09", score: 69, wpm: 31, accuracy: 89, sessions: 1, minutes: 35 },
    "2026-04-15": { date: "2026-04-15", score: 75, wpm: 34, accuracy: 92, sessions: 4, minutes: 45 },
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
      <div className="w-full max-w-md">
        <SkillRadarCard
          yearOptions={[2025, 2026]}
          monthOptions={months}
          initialYear={2026}
          initialMonthIndex={3} 
          monthlyStats={{ monthScore: 58 }}
          dailyStatsByDate={sampleDailyStats}
          renderRadar={(mode, score) => (
            <div className="w-full h-full flex items-center justify-center rounded-full border border-white/10 relative">
              <span className="text-white/20 uppercase tracking-widest text-xs font-semibold">
                {mode === 'daily' ? `Daily: ${score}` : 'Monthly'}
              </span>
            </div>
          )}
        />
      </div>
    </div>
  );
}
