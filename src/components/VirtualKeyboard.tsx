"use client";

import { useMemo, useEffect, useState, useRef } from 'react';
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
  const rm=['8','*','i','I','k','K','<',','];
  const rr=['9','(','o','O','l','L','>','.'];
  const rp=['0',')','-','_','=','+','p','P','[','{',']','}','\\','|',';',':',"'",'"','/','?'];
  if (lp.includes(char)) return { hand:'left', finger:'pinky', label:'L · Pinky', color: '#a855f7' };
  if (lr.includes(char)) return { hand:'left', finger:'ring',  label:'L · Ring',  color: '#3b82f6' };
  if (lm.includes(char)) return { hand:'left', finger:'middle',label:'L · Mid',   color: '#06b6d4' };
  if (li.includes(char)) return { hand:'left', finger:'index', label:'L · Index', color: '#39FF14' };
  if (ri.includes(char)) return { hand:'right',finger:'index', label:'R · Index', color: '#39FF14' };
  if (rm.includes(char)) return { hand:'right',finger:'middle',label:'R · Mid',   color: '#06b6d4' };
  if (rr.includes(char)) return { hand:'right',finger:'ring',  label:'R · Ring',  color: '#3b82f6' };
  if (rp.includes(char)||char==='\n') return { hand:'right',finger:'pinky',label:'R · Pinky',color:'#a855f7'};
  if (char===' ') return { hand:'thumbs',finger:'thumb',label:'Thumb',color:'#f59e0b' };
  return { hand:'unknown',finger:'unknown',label:'',color:'#39FF14' };
};

const needsShift = (c: string) => !c ? false : /[A-Z~!@#$%^&*()_+{}|:"<>?]/.test(c);

/* ─── FINGER ZONE COLORS per key (subtle tint) ─── */
const FINGER_ZONE: Record<string, string> = {
  // Left pinky
  '`':'#7c3aed','1':'#7c3aed','q':'#7c3aed','a':'#7c3aed','z':'#7c3aed',
  // Left ring
  '2':'#2563eb','w':'#2563eb','s':'#2563eb','x':'#2563eb',
  // Left middle
  '3':'#0891b2','e':'#0891b2','d':'#0891b2','c':'#0891b2',
  // Left index
  '4':'#166534','5':'#166534','r':'#166534','t':'#166534','f':'#166534','g':'#166534','v':'#166534','b':'#166534',
  // Right index
  '6':'#14532d','7':'#14532d','y':'#14532d','u':'#14532d','h':'#14532d','j':'#14532d','n':'#14532d','m':'#14532d',
  // Right middle
  '8':'#155e75','i':'#155e75','k':'#155e75',',':'#155e75',
  // Right ring
  '9':'#1e3a5f','o':'#1e3a5f','l':'#1e3a5f','.':'#1e3a5f',
  // Right pinky
  '0':'#4a1d96','p':'#4a1d96','-':'#4a1d96','=':'#4a1d96','[':'#4a1d96',']':'#4a1d96','\\':'#4a1d96',';':'#4a1d96',"'":'#4a1d96','/':'#4a1d96',
};

type KeyDef = {
  id: string;
  top?: string;
  bot: string;
  w?: number;
  isAnchor?: boolean;
};

const ROWS: KeyDef[][] = [
  [
    { id:'`', top:'~', bot:'`' }, { id:'1', top:'!', bot:'1' }, { id:'2', top:'@', bot:'2' },
    { id:'3', top:'#', bot:'3' }, { id:'4', top:'$', bot:'4' }, { id:'5', top:'%', bot:'5' },
    { id:'6', top:'^', bot:'6' }, { id:'7', top:'&', bot:'7' }, { id:'8', top:'*', bot:'8' },
    { id:'9', top:'(', bot:'9' }, { id:'0', top:')', bot:'0' }, { id:'-', top:'_', bot:'-' },
    { id:'=', top:'+', bot:'=' }, { id:'backspace', bot:'⌫', w:2 },
  ],
  [
    { id:'tab', bot:'Tab', w:1.5 }, { id:'q', bot:'Q' }, { id:'w', bot:'W' },
    { id:'e', bot:'E' }, { id:'r', bot:'R' }, { id:'t', bot:'T' },
    { id:'y', bot:'Y' }, { id:'u', bot:'U' }, { id:'i', bot:'I' },
    { id:'o', bot:'O' }, { id:'p', bot:'P' }, { id:'[', top:'{', bot:'[' },
    { id:']', top:'}', bot:']' }, { id:'\\', top:'|', bot:'\\', w:1.5 },
  ],
  [
    { id:'caps', bot:'Caps', w:1.8 },
    { id:'a', bot:'A', isAnchor:true }, { id:'s', bot:'S', isAnchor:true },
    { id:'d', bot:'D', isAnchor:true }, { id:'f', bot:'F', isAnchor:true }, { id:'g', bot:'G' },
    { id:'h', bot:'H' }, { id:'j', bot:'J', isAnchor:true }, { id:'k', bot:'K', isAnchor:true },
    { id:'l', bot:'L', isAnchor:true }, { id:';', top:':', bot:';', isAnchor:true }, { id:"'", top:'"', bot:"'" },
    { id:'enter', bot:'Enter', w:2.2 },
  ],
  [
    { id:'shift-l', bot:'⇧ Shift', w:2.5 },
    { id:'z', bot:'Z' }, { id:'x', bot:'X' },
    { id:'c', bot:'C' }, { id:'v', bot:'V' }, { id:'b', bot:'B' },
    { id:'n', bot:'N' }, { id:'m', bot:'M' }, { id:',', top:'<', bot:',' },
    { id:'.', top:'>', bot:'.' }, { id:'/', top:'?', bot:'/' },
    { id:'shift-r', bot:'⇧ Shift', w:2.5 },
  ],
  [
    { id:'ctrl-l', bot:'Ctrl', w:1.3 }, { id:'win', bot:'⊞', w:1.3 },
    { id:'alt-l', bot:'Alt', w:1.3 }, { id:'space', bot:'', w:6.5 },
    { id:'alt-r', bot:'Alt', w:1.3 }, { id:'fn', bot:'Fn', w:1.3 },
    { id:'ctrl-r', bot:'Ctrl', w:1.3 },
  ],
];

/* ─── PREMIUM HAND SVG ─── */
function HandSVG({ side, activeFinger, color }: { side:'left'|'right', activeFinger?: string, color: string }) {
  const isL = side === 'left';
  const fingers: { id:string; x:number; h:number; rx:number }[] = isL
    ? [
        { id:'pinky',  x:0,  h:22, rx:5 },
        { id:'ring',   x:16, h:30, rx:5 },
        { id:'middle', x:32, h:34, rx:5 },
        { id:'index',  x:48, h:28, rx:5 },
        { id:'thumb',  x:58, h:16, rx:5 },
      ]
    : [
        { id:'thumb',  x: 6, h:16, rx:5 },
        { id:'index',  x:18, h:28, rx:5 },
        { id:'middle', x:34, h:34, rx:5 },
        { id:'ring',   x:50, h:30, rx:5 },
        { id:'pinky',  x:66, h:22, rx:5 },
      ];

  return (
    <svg width="82" height="58" viewBox="0 0 82 58" className="shrink-0 overflow-visible">
      {/* Glow defs */}
      <defs>
        <filter id={`glow-${side}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Palm */}
      <rect x="6" y="36" width="70" height="19" rx="9"
        fill="#0f0f0f" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {fingers.map(f => {
        const isActive = activeFinger === f.id;
        const y = 36 - f.h;
        return (
          <g key={f.id}>
            {/* Base finger */}
            <rect x={f.x + 1} y={y} width={13} height={f.h + 6} rx={f.rx}
              fill={isActive ? color : '#1a1a1a'}
              opacity={isActive ? 1 : 0.3}
              style={{ transition: 'fill 0.18s ease, opacity 0.18s ease' }}
            />
            {/* Fingernail highlight */}
            {isActive && (
              <rect x={f.x + 4} y={y + 2} width={7} height={5} rx={3}
                fill="rgba(255,255,255,0.18)"
                style={{ filter: `url(#glow-${side})` }}
              />
            )}
            {/* Glow orb when active */}
            {isActive && (
              <rect x={f.x + 1} y={y} width={13} height={f.h + 6} rx={f.rx}
                fill={color} opacity={0.25}
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
  const [ripples, setRipples] = useState<{ id:number; keyId:string; correct:boolean }[]>([]);
  const rIdRef = useRef(0);

  useEffect(() => {
    if (lastStatus && lastStatus !== 'idle') {
      const kid = getBaseKeyId(lastTypedChar || '') || null;
      setFeedback(lastStatus);
      setPressedKeyId(kid);
      if (kid) {
        const rid = ++rIdRef.current;
        setRipples(r => [...r, { id: rid, keyId: kid, correct: lastStatus === 'correct' }]);
        setTimeout(() => setRipples(r => r.filter(x => x.id !== rid)), 600);
      }
      const t = setTimeout(() => { setFeedback(null); setPressedKeyId(null); }, 200);
      return () => clearTimeout(t);
    }
  }, [lastStatus, lastTypedChar]);

  const activeColor = fingerData?.color || '#39FF14';

  return (
    <div className="flex flex-col items-center w-full gap-2">
      
      {/* ── Finger Guide / Hand Indicator ── */}
      <div className="h-[58px] flex items-center justify-center w-full gap-3">
        <HandSVG
          side="left"
          color={activeColor}
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
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{
                opacity: 1, y: 0, scale: 1,
                x: feedback === 'wrong' ? [-4, 4, -3, 3, 0] : 0,
              }}
              exit={{ opacity: 0, y: -4, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              {/* Key chip */}
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider border backdrop-blur-md"
                style={{
                  background: feedback === 'wrong'
                    ? 'rgba(255,77,109,0.12)' : `${activeColor}11`,
                  borderColor: feedback === 'wrong'
                    ? 'rgba(255,77,109,0.35)' : `${activeColor}33`,
                  color: feedback === 'wrong' ? '#ff4d6d' : activeColor,
                  boxShadow: feedback === 'wrong'
                    ? '0 0 16px rgba(255,77,109,0.2)'
                    : `0 0 16px ${activeColor}22`,
                }}
              >
                <span className="opacity-70 font-mono text-[12px]">
                  {targetChar === ' ' ? '␣' : targetChar === '\n' ? '↵' : targetChar || '—'}
                </span>
                <span className="opacity-40 text-[9px]">·</span>
                <span>{fingerData.label}</span>
                {shiftNeeded && <span className="opacity-50 text-[9px] font-medium">+⇧</span>}
              </div>
            </motion.div>
          ) : (
            <div className="text-[10px] text-gray-600 tracking-[0.25em] uppercase font-medium">Ready</div>
          )}
        </AnimatePresence>

        <HandSVG
          side="right"
          color={activeColor}
          activeFinger={
            fingerData?.hand === 'right' ? fingerData.finger
            : fingerData?.hand === 'thumbs' ? 'thumb'
            : shiftSide === 'shift-r' ? 'pinky'
            : undefined
          }
        />
      </div>

      {/* ── Keyboard Body (Premium Flat Deck) ── */}
      <div className="w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full rounded-[24px] relative border-b-[6px] border-[#060606]"
          style={{
            padding: '14px 16px 20px',
            transformOrigin: 'top center',
            background: 'linear-gradient(180deg, rgba(22,22,22,0.95) 0%, rgba(12,12,12,0.95) 100%)',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.08), ' +
              '0 24px 80px rgba(0,0,0,0.9), ' +
              '0 12px 24px rgba(0,0,0,0.6), ' +
              'inset 0 2px 0 rgba(255,255,255,0.15), ' +
              'inset 0 -8px 24px rgba(0,0,0,0.8)',
          }}
        >
          {/* Insane Underglow Ring */}
          <div
            className="absolute -inset-[2px] rounded-[24px] pointer-events-none -z-10"
            style={{
              background: `linear-gradient(90deg, #a855f7, #3b82f6, ${activeColor}, #06b6d4, #a855f7)`,
              opacity: 0.15,
              filter: 'blur(12px)',
            }}
          />
          <div
            className="absolute bottom-0 left-[5%] right-[5%] h-[3px] rounded-full pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent, ${activeColor}, transparent)`,
              opacity: 0.8,
              filter: 'blur(6px)',
              boxShadow: `0 0 40px ${activeColor}`,
            }}
          />

        {/* Key rows */}
        <div className="flex flex-col gap-[4px]">
          {ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-[4px]">
              {row.map(key => {
                const isTarget = activeKeyId === key.id;
                const isShift = shiftSide === key.id;
                const isHighlighted = isTarget || isShift;
                const isPressed = pressedKeyId === key.id && feedback !== null;
                const isWrong = isPressed && feedback === 'wrong';
                const isCorrect = isPressed && feedback === 'correct';
                const zoneColor = FINGER_ZONE[key.id] || '#1a1a1a';
                const keyRipples = ripples.filter(r => r.keyId === key.id);

                // Determine key face color
                let faceGradient: string;
                let faceBorder: string;
                let faceGlow: string;

                if (isHighlighted) {
                  // Massive neon bloom
                  faceGradient = `linear-gradient(160deg, ${activeColor}FF 0%, ${activeColor}B0 50%, ${activeColor}90 100%)`;
                  faceBorder = `1px solid ${activeColor}`;
                  faceGlow = `0 0 30px ${activeColor}80, 0 0 10px ${activeColor}A0, inset 0 2px 2px rgba(255,255,255,0.4)`;
                } else if (isWrong) {
                  faceGradient = 'linear-gradient(160deg, #ff0a54 0%, #be123c 100%)';
                  faceBorder = '1px solid #ff4d6d';
                  faceGlow = '0 0 24px rgba(255,10,84,0.6), inset 0 2px 2px rgba(255,255,255,0.3)';
                } else if (isCorrect) {
                  faceGradient = 'linear-gradient(160deg, #39FF14 0%, #166534 100%)';
                  faceBorder = '1px solid #39FF14';
                  faceGlow = '0 0 24px rgba(57,255,20,0.4), inset 0 2px 2px rgba(255,255,255,0.3)';
                } else {
                  // True glassmorphism/matte keycap
                  faceGradient = `linear-gradient(160deg, rgba(40,40,40,0.9) 0%, rgba(20,20,20,0.9) 100%)`;
                  faceBorder = '1px solid rgba(255,255,255,0.08)';
                  faceGlow = `inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.5)`;
                }

                const labelColor = isHighlighted
                  ? '#000000'
                  : isWrong || isCorrect
                  ? '#ffffff'
                  : key.isAnchor
                  ? '#00D4AA' /* Anchor keys distinct neon */
                  : '#a3a3a3';

                return (
                  <div
                    key={key.id}
                    className="relative select-none"
                    style={{ flex: key.w || 1, minWidth: 0 }}
                  >
                    {/* Outer shell (gives massive 3D depth) */}
                    <div
                      className="w-full rounded-[8px] transition-all"
                      style={{
                        padding: '0 0 5px 0',
                        background: isHighlighted
                          ? `linear-gradient(180deg, ${activeColor}60 0%, ${activeColor}20 100%)`
                          : isWrong
                          ? 'linear-gradient(180deg, #be123c88 0%, #700b21 100%)'
                          : 'linear-gradient(180deg, #2a2a2a 0%, #050505 100%)',
                        boxShadow: isHighlighted
                          ? `0 5px 0 ${activeColor}55, 0 8px 16px rgba(0,0,0,0.9)`
                          : '0 5px 0 rgba(0,0,0,0.9), 0 6px 10px rgba(0,0,0,0.7)',
                        transform: isPressed ? 'translateY(4px)' : 'translateY(0)',
                        transition: 'transform 70ms cubic-bezier(0.2,0,0,1), box-shadow 70ms cubic-bezier(0.2,0,0,1), filter 70ms',
                        filter: isPressed ? 'brightness(1.5)' : 'none',
                      }}
                    >
                      {/* Keycap face */}
                      <div
                        className="w-full flex flex-col items-center justify-center rounded-[7px] h-[34px] sm:h-[42px] md:h-[46px] relative overflow-hidden backdrop-blur-md"
                        style={{
                          background: faceGradient,
                          border: faceBorder,
                          boxShadow: faceGlow,
                          transition: 'background 80ms ease, box-shadow 80ms ease, border 80ms ease',
                        }}
                      >
                        {/* Subtle keycap sheen */}
                        <div
                          className="absolute inset-0 pointer-events-none rounded-[5px]"
                          style={{
                            background: 'linear-gradient(170deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 50%)',
                          }}
                        />

                        {/* Ripple */}
                        {keyRipples.map(r => (
                          <motion.div
                            key={r.id}
                            className="absolute inset-0 rounded-[5px] pointer-events-none"
                            initial={{ opacity: 0.8, scale: 0.5 }}
                            animate={{ opacity: 0, scale: 1.5 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            style={{
                              background: r.correct
                                ? `radial-gradient(circle, ${activeColor}66 0%, transparent 70%)`
                                : 'radial-gradient(circle, #ff4d6d66 0%, transparent 70%)',
                            }}
                          />
                        ))}

                        {/* Labels */}
                        {key.top ? (
                          <div className="flex flex-col items-center leading-none gap-[1px]">
                            <span className="text-[7px] sm:text-[8px] opacity-60" style={{ color: labelColor }}>
                              {key.top}
                            </span>
                            <span className="text-[10px] sm:text-[11px] md:text-[12px] font-bold leading-none" style={{ color: labelColor }}>
                              {key.bot}
                            </span>
                          </div>
                        ) : key.id === 'space' ? (
                          <div
                            className="w-[45%] h-[4px] rounded-full opacity-30 shadow-inner"
                            style={{ background: isHighlighted ? '#111' : '#fff' }}
                          />
                        ) : (
                          <span
                            className="font-bold leading-none tracking-wide"
                            style={{
                              fontSize: key.bot.length > 4 ? '8px' : key.bot.length > 2 ? '9px' : key.bot.length > 1 ? '10px' : '13px',
                              color: labelColor,
                              textShadow: isHighlighted ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
                            }}
                          >
                            {key.bot}
                          </span>
                        )}

                        {/* Home row bump */}
                        {key.isAnchor && !isHighlighted && (
                          <div
                            className="absolute bottom-[4px] w-[14px] h-[2px] rounded-full shadow-[0_0_8px_#00D4AA]"
                            style={{ background: isWrong ? '#ff4d6d' : '#00D4AA' }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Target key extreme pulse ring */}
                    {isTarget && !isPressed && (
                      <motion.div
                        className="absolute -inset-[2px] rounded-[10px] pointer-events-none"
                        animate={{ opacity: [0.6, 0.1, 0.6] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                          boxShadow: `0 0 0 2px ${activeColor}66, 0 0 20px ${activeColor}40`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        </motion.div>
      </div>
    </div>
  );
}
