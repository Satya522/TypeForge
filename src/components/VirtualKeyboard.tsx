"use client";

import { useMemo, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type VirtualKeyboardProps = {
  targetChar: string;
  lastStatus?: 'idle' | 'correct' | 'wrong';
  lastTypedChar?: string | null;
};

/* ─── CHAR → PHYSICAL KEY ID ─── */
const getBaseKeyId = (char: string) => {
  if (!char) return null;
  if (char === ' ') return 'space';
  if (char === '\n') return 'enter';
  const shifted: Record<string, string> = {
    '~':'`','!':'1','@':'2','#':'3','$':'4','%':'5','^':'6',
    '&':'7','*':'8','(':'9',')':'0','_':'-','+':'=','{':'[',
    '}':']','|':'\\',':':';','"':"'",'<':',','>':'.','?':'/'
  };
  return shifted[char] || char.toLowerCase();
};

/* ─── FINGER MAP ─── */
const getFingerInfo = (char: string) => {
  if (!char) return null;
  const lp=['`','~','1','!','q','Q','a','A','z','Z'];
  const lr=['2','@','w','W','s','S','x','X'];
  const lm=['3','#','e','E','d','D','c','C'];
  const li=['4','$','5','%','r','R','t','T','f','F','g','G','v','V','b','B'];
  const ri=['6','^','7','&','y','Y','u','U','h','H','j','J','n','N','m','M'];
  const rm=['8','*','i','I','k','K',',','<'];
  const rr=['9','(','o','O','l','L','.','>'];
  const rp=['0',')','-','_','=','+','p','P','[','{',']','}','\\','|',';',':',  "'",'"','/','?'];
  if (lp.includes(char)) return { hand:'left', finger:'pinky', label:'L Pinky' };
  if (lr.includes(char)) return { hand:'left', finger:'ring', label:'L Ring' };
  if (lm.includes(char)) return { hand:'left', finger:'middle', label:'L Middle' };
  if (li.includes(char)) return { hand:'left', finger:'index', label:'L Index' };
  if (ri.includes(char)) return { hand:'right', finger:'index', label:'R Index' };
  if (rm.includes(char)) return { hand:'right', finger:'middle', label:'R Middle' };
  if (rr.includes(char)) return { hand:'right', finger:'ring', label:'R Ring' };
  if (rp.includes(char)||char==='\n') return { hand:'right', finger:'pinky', label:'R Pinky' };
  if (char===' ') return { hand:'thumbs', finger:'thumb', label:'Thumb' };
  return { hand:'unknown', finger:'unknown', label:'' };
};

const needsShift = (c: string) => !c ? false : /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(c);

/* ─── FINGER COLORS ─── */
const FINGER_COLORS: Record<string, string> = {
  pinky: '#39FF14',   
  ring: '#39FF14',    
  middle: '#39FF14',  
  index: '#39FF14',   
  thumb: '#39FF14',   
};

/* ─── LAYOUT: Each key has id, top label, bottom label, flex weight ─── */
type KeyDef = {
  id: string;
  top?: string;    // shifted symbol
  bot: string;     // primary label
  w?: number;      // flex weight (default 1)
  isAnchor?: boolean;
};

const ROWS: KeyDef[][] = [
  // Row 0 — Number row
  [
    { id:'`', top:'~', bot:'`' }, { id:'1', top:'!', bot:'1' }, { id:'2', top:'@', bot:'2' },
    { id:'3', top:'#', bot:'3' }, { id:'4', top:'$', bot:'4' }, { id:'5', top:'%', bot:'5' },
    { id:'6', top:'^', bot:'6' }, { id:'7', top:'&', bot:'7' }, { id:'8', top:'*', bot:'8' },
    { id:'9', top:'(', bot:'9' }, { id:'0', top:')', bot:'0' }, { id:'-', top:'_', bot:'-' },
    { id:'=', top:'+', bot:'=' }, { id:'backspace', bot:'⌫', w:2 },
  ],
  // Row 1 — QWERTY top
  [
    { id:'tab', bot:'Tab', w:1.5 }, { id:'q', bot:'Q' }, { id:'w', bot:'W' },
    { id:'e', bot:'E' }, { id:'r', bot:'R' }, { id:'t', bot:'T' },
    { id:'y', bot:'Y' }, { id:'u', bot:'U' }, { id:'i', bot:'I' },
    { id:'o', bot:'O' }, { id:'p', bot:'P' }, { id:'[', top:'{', bot:'[' },
    { id:']', top:'}', bot:']' }, { id:'\\', top:'|', bot:'\\', w:1.5 },
  ],
  // Row 2 — Home row
  [
    { id:'caps', bot:'Caps', w:1.8 },
    { id:'a', bot:'A', isAnchor:true }, { id:'s', bot:'S', isAnchor:true },
    { id:'d', bot:'D', isAnchor:true }, { id:'f', bot:'F', isAnchor:true }, { id:'g', bot:'G' },
    { id:'h', bot:'H' }, { id:'j', bot:'J', isAnchor:true }, { id:'k', bot:'K', isAnchor:true },
    { id:'l', bot:'L', isAnchor:true }, { id:';', top:':', bot:';', isAnchor:true }, { id:"'", top:'"', bot:"'" },
    { id:'enter', bot:'Enter', w:2.2 },
  ],
  // Row 3 — Shift row
  [
    { id:'shift-l', bot:'Shift', w:2.5 },
    { id:'z', bot:'Z' }, { id:'x', bot:'X' },
    { id:'c', bot:'C' }, { id:'v', bot:'V' }, { id:'b', bot:'B' },
    { id:'n', bot:'N' }, { id:'m', bot:'M' }, { id:',', top:'<', bot:',' },
    { id:'.', top:'>', bot:'.' }, { id:'/', top:'?', bot:'/' },
    { id:'shift-r', bot:'Shift', w:2.5 },
  ],
  // Row 4 — Bottom row
  [
    { id:'ctrl-l', bot:'Ctrl', w:1.3 }, { id:'win', bot:'Win', w:1.3 },
    { id:'alt-l', bot:'Alt', w:1.3 }, { id:'space', bot:'', w:6.5 },
    { id:'alt-r', bot:'Alt', w:1.3 }, { id:'fn', bot:'Fn', w:1.3 },
    { id:'ctrl-r', bot:'Ctrl', w:1.3 },
  ],
];

/* ─── MINI HAND SVG ─── */
function HandOverlay({ side, activeFinger }: { side:'left'|'right', activeFinger?:string }) {
  const isL = side === 'left';
  const fingers: { id:string; x:number; h:number; }[] = [
    { id:'pinky', x: isL ? 0 : 64, h: 22 },
    { id:'ring',  x: isL ? 16 : 48, h: 30 },
    { id:'middle', x: isL ? 32 : 32, h: 34 },
    { id:'index', x: isL ? 48 : 16, h: 28 },
    { id:'thumb', x: isL ? 58 : 6, h: 18 },
  ];

  return (
    <svg width="80" height="56" viewBox="0 0 80 56" className="shrink-0">
      {/* Palm */}
      <rect x="8" y="36" width="64" height="18" rx="9" fill="#111" stroke="#1a1a1a" strokeWidth="1" />
      {fingers.map(f => {
        const isActive = activeFinger === f.id;
        const color = isActive ? (FINGER_COLORS[f.id] || '#39FF14') : '#1c1c1c';
        const y = 36 - f.h;
        return (
          <g key={f.id}>
            <rect
              x={f.x + 2} y={y} width={12} height={f.h + 4} rx={6}
              fill={color}
              opacity={isActive ? 1 : 0.25}
              style={{ transition: 'all 0.2s ease' }}
            />
            {isActive && (
              <rect
                x={f.x + 2} y={y} width={12} height={f.h + 4} rx={6}
                fill={color} opacity={0.3}
                style={{ filter: 'blur(6px)' }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ─── MAIN COMPONENT ─── */
export default function VirtualKeyboard({ targetChar, lastStatus, lastTypedChar }: VirtualKeyboardProps) {
  const activeKeyId = useMemo(() => getBaseKeyId(targetChar), [targetChar]);
  const fingerData = useMemo(() => getFingerInfo(targetChar), [targetChar]);
  const shiftNeeded = useMemo(() => needsShift(targetChar), [targetChar]);
  const shiftSide = useMemo(() => {
    if (!shiftNeeded) return null;
    return fingerData?.hand === 'left' ? 'shift-r' : 'shift-l';
  }, [shiftNeeded, fingerData]);

  const [feedback, setFeedback] = useState<'correct'|'wrong'|null>(null);
  const [pressedKeyId, setPressedKeyId] = useState<string|null>(null);

  // Visual feedback pulse
  useEffect(() => {
    if (lastStatus && lastStatus !== 'idle') {
      setFeedback(lastStatus);
      setPressedKeyId(getBaseKeyId(lastTypedChar || '') || null);
      const t = setTimeout(() => { setFeedback(null); setPressedKeyId(null); }, 250);
      return () => clearTimeout(t);
    }
  }, [lastStatus, lastTypedChar]);

  // Finger color for the current target
  const activeFingerColor = fingerData ? (FINGER_COLORS[fingerData.finger] || '#39FF14') : '#39FF14';

  return (
    <div className="flex flex-col items-center w-full">
      {/* ── Finger Guide Chip ── */}
      <div className="h-8 mb-3 flex items-center justify-center w-full gap-4">
        <HandOverlay
          side="left"
          activeFinger={
            fingerData?.hand === 'left' ? fingerData.finger
            : fingerData?.hand === 'thumbs' ? 'thumb'
            : shiftSide === 'shift-l' ? 'pinky'
            : undefined
          }
        />

        <AnimatePresence mode="popLayout">
          {fingerData && fingerData.label ? (
            <motion.div
              key={fingerData.label + targetChar}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1, scale: 1,
                x: feedback === 'wrong' ? [-3, 3, -3, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide border backdrop-blur-sm",
                feedback === 'wrong'
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-white/[0.03] border-white/[0.08] text-gray-300"
              )}
            >
              <span className="opacity-60">
                {targetChar === ' ' ? '␣' : targetChar === '\n' ? '↵' : targetChar}
              </span>
              <div className="w-1 h-1 rounded-full" style={{ background: activeFingerColor }} />
              <span style={{ color: activeFingerColor }}>{fingerData.label}</span>
              {shiftNeeded && <span className="text-gray-500 text-[10px]">+⇧</span>}
            </motion.div>
          ) : (
            <div className="text-[10px] text-gray-600 tracking-widest uppercase">Ready</div>
          )}
        </AnimatePresence>

        <HandOverlay
          side="right"
          activeFinger={
            fingerData?.hand === 'right' ? fingerData.finger
            : fingerData?.hand === 'thumbs' ? 'thumb'
            : shiftSide === 'shift-r' ? 'pinky'
            : undefined
          }
        />
      </div>

      {/* ── Keyboard Body ── */}
      <div
        className="w-full rounded-2xl p-[6px] sm:p-2"
        style={{
          background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex flex-col gap-[3px] sm:gap-1">
          {ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-[3px] sm:gap-1">
              {row.map(key => {
                const isTarget = activeKeyId === key.id;
                const isShift = shiftSide === key.id;
                const isHighlighted = isTarget || isShift;
                const isPressed = pressedKeyId === key.id && feedback !== null;
                const isWrong = isPressed && feedback === 'wrong';
                const isCorrect = isPressed && feedback === 'correct';

                // Get finger color zone for subtle finger-color tinting
                const keyFingerInfo = getFingerInfo(key.bot.toLowerCase() || '');
                const fingerZoneColor = keyFingerInfo ? FINGER_COLORS[keyFingerInfo.finger] : undefined;

                return (
                  <div
                    key={key.id}
                    className="relative select-none"
                    style={{ flex: key.w || 1 }}
                  >
                    {/* 3D Keycap: outer shell (bottom shadow) */}
                    <div
                      className="w-full rounded-[5px] sm:rounded-md transition-all duration-150"
                      style={{
                        padding: '0 0 3px 0',
                        background: isHighlighted
                          ? `linear-gradient(180deg, ${activeFingerColor}88 0%, ${activeFingerColor}44 100%)`
                          : isWrong
                            ? 'linear-gradient(180deg, #ef444488 0%, #ef444444 100%)'
                            : key.isAnchor
                              ? 'linear-gradient(180deg, rgba(57,255,20,0.1) 0%, rgba(57,255,20,0.02) 100%)'
                              : 'linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%)',
                        boxShadow: isHighlighted
                          ? `0 0 16px ${activeFingerColor}40, 0 2px 4px rgba(0,0,0,0.5)`
                          : isWrong
                            ? '0 0 12px rgba(239,68,68,0.3), 0 2px 4px rgba(0,0,0,0.5)'
                            : key.isAnchor
                              ? '0 0 8px rgba(57,255,20,0.1), 0 2px 4px rgba(0,0,0,0.4)'
                              : '0 2px 4px rgba(0,0,0,0.4)',
                        transform: isPressed ? 'translateY(1px)' : 'translateY(0)',
                      }}
                    >
                      {/* Inner keycap face */}
                      <div
                        className={cn(
                          "w-full flex flex-col items-center justify-center rounded-[4px] sm:rounded-[5px] transition-all duration-150",
                          "h-[28px] sm:h-[34px] md:h-[38px]",
                        )}
                        style={{
                          background: isHighlighted
                            ? `linear-gradient(180deg, ${activeFingerColor}DD 0%, ${activeFingerColor}99 100%)`
                            : isWrong
                              ? 'linear-gradient(180deg, #dc2626 0%, #b91c1c 100%)'
                              : isCorrect
                                ? 'linear-gradient(180deg, #166534 0%, #14532d 100%)'
                                : key.isAnchor
                                  ? 'linear-gradient(180deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)'
                                  : 'linear-gradient(180deg, #1e1e1e 0%, #161616 100%)',
                          boxShadow: isPressed
                            ? 'inset 0 1px 3px rgba(0,0,0,0.4)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.2)',
                          border: isHighlighted
                            ? `1px solid ${activeFingerColor}66`
                            : key.isAnchor
                              ? '1px solid rgba(57,255,20,0.3)'
                              : '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        {/* Key labels */}
                        {key.top ? (
                          <div className="flex flex-col items-center leading-none gap-0">
                            <span
                              className="text-[7px] sm:text-[8px] leading-none opacity-40 font-medium"
                              style={{ color: isHighlighted ? '#000' : key.isAnchor ? '#39FF14' : '#888' }}
                            >
                              {key.top}
                            </span>
                            <span
                              className={cn(
                                "text-[9px] sm:text-[10px] md:text-[11px] leading-none font-semibold",
                              )}
                              style={{ color: isHighlighted ? '#000' : isWrong ? '#fff' : key.isAnchor ? '#39FF14' : '#999' }}
                            >
                              {key.bot}
                            </span>
                          </div>
                        ) : key.id === 'space' ? (
                          // Spacebar — empty with subtle texture
                          <div className="w-full h-full" />
                        ) : (
                          <span
                            className={cn(
                              "text-[8px] sm:text-[9px] md:text-[10px] font-semibold tracking-wide",
                              key.bot.length > 3 ? "text-[7px] sm:text-[8px]" : ""
                            )}
                            style={{ color: isHighlighted ? '#000' : isWrong ? '#fff' : key.isAnchor ? '#39FF14' : '#888' }}
                          >
                            {key.bot}
                          </span>
                        )}

                        {/* Home row anchor bump */}
                        {key.isAnchor && !isHighlighted && (
                          <div
                            className="absolute bottom-[5px] sm:bottom-[6px] w-[8px] h-[2px] rounded-full"
                            style={{ background: 'rgba(57,255,20,0.6)' }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Glow ring pulse for target key */}
                    {isTarget && (
                      <motion.div
                        className="absolute inset-0 rounded-[5px] sm:rounded-md pointer-events-none"
                        animate={{ opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          boxShadow: `0 0 20px ${activeFingerColor}50, inset 0 0 8px ${activeFingerColor}20`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
