"use client";

import React from 'react';

/**
 * KeyHeatmap visualizes per-key error frequency using a realistic 60% keyboard grid.
 */
export default function KeyHeatmap({ data }: { data: Record<string, number> }) {
  // Proportioned 60% Keyboard Layout (Total 15U per row)
  const rows = [
    [
      { id: '`', label: '~', w: 1 }, { id: '1', label: '1', w: 1 }, { id: '2', label: '2', w: 1 },
      { id: '3', label: '3', w: 1 }, { id: '4', label: '4', w: 1 }, { id: '5', label: '5', w: 1 },
      { id: '6', label: '6', w: 1 }, { id: '7', label: '7', w: 1 }, { id: '8', label: '8', w: 1 },
      { id: '9', label: '9', w: 1 }, { id: '0', label: '0', w: 1 }, { id: '-', label: '-', w: 1 },
      { id: '=', label: '=', w: 1 }, { id: 'backspace', label: 'Backspace', w: 2 }
    ],
    [
      { id: 'tab', label: 'Tab', w: 1.5 }, { id: 'q', label: 'Q', w: 1 }, { id: 'w', label: 'W', w: 1 },
      { id: 'e', label: 'E', w: 1 }, { id: 'r', label: 'R', w: 1 }, { id: 't', label: 'T', w: 1 },
      { id: 'y', label: 'Y', w: 1 }, { id: 'u', label: 'U', w: 1 }, { id: 'i', label: 'I', w: 1 },
      { id: 'o', label: 'O', w: 1 }, { id: 'p', label: 'P', w: 1 }, { id: '[', label: '[', w: 1 },
      { id: ']', label: ']', w: 1 }, { id: '\\', label: '\\', w: 1.5 }
    ],
    [
      { id: 'caps', label: 'Caps', w: 1.75 }, { id: 'a', label: 'A', w: 1 }, { id: 's', label: 'S', w: 1 },
      { id: 'd', label: 'D', w: 1 }, { id: 'f', label: 'F', w: 1 }, { id: 'g', label: 'G', w: 1 },
      { id: 'h', label: 'H', w: 1 }, { id: 'j', label: 'J', w: 1 }, { id: 'k', label: 'K', w: 1 },
      { id: 'l', label: 'L', w: 1 }, { id: ';', label: ';', w: 1 }, { id: '\'', label: '\'', w: 1 },
      { id: 'enter', label: 'Enter', w: 2.25 }
    ],
    [
      { id: 'lshift', label: 'Shift', w: 2.25 }, { id: 'z', label: 'Z', w: 1 }, { id: 'x', label: 'X', w: 1 },
      { id: 'c', label: 'C', w: 1 }, { id: 'v', label: 'V', w: 1 }, { id: 'b', label: 'B', w: 1 },
      { id: 'n', label: 'N', w: 1 }, { id: 'm', label: 'M', w: 1 }, { id: ',', label: ',', w: 1 },
      { id: '.', label: '.', w: 1 }, { id: '/', label: '/', w: 1 }, { id: 'rshift', label: 'Shift', w: 2.75 }
    ],
    [
      { id: 'ctrl', label: 'Ctrl', w: 1.25 }, { id: 'win', label: 'Win', w: 1.25 },
      { id: 'alt', label: 'Alt', w: 1.25 }, { id: ' ', label: '', w: 6.25 },
      { id: 'ralt', label: 'Alt', w: 1.25 }, { id: 'fn', label: 'Fn', w: 1.25 },
      { id: 'menu', label: 'Menu', w: 1.25 }, { id: 'rctrl', label: 'Ctrl', w: 1.25 }
    ]
  ];

  const maxVal = Math.max(...Object.values(data), 1);

  const getColor = (val: number): React.CSSProperties => {
    // 0 errors -> Muted stealth look so vibrant colors pop out
    if (val === 0) {
      return {
        background: 'rgba(15, 20, 15, 0.4)',
        borderColor: 'rgba(57, 255, 20, 0.12)',
        color: 'rgba(57, 255, 20, 0.4)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.02)',
      };
    }

    const intensity = val / maxVal;
    
    // TypeForge Thermal Palette mapping (Cyan -> Neon Green -> Purple -> Hot Pink)
    const stops = [
      { t: 0.0, c: [0, 200, 255] },     // Cyan (Slightly weak)
      { t: 0.33, c: [57, 255, 20] },    // Neon Green (Moderate)
      { t: 0.66, c: [160, 30, 255] },   // Purple (Weak)
      { t: 1.0, c: [255, 0, 128] }      // Hot Pink (Danger/Very Weak)
    ];
    
    let lower = stops[0], upper = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
        if (intensity >= stops[i].t && intensity <= stops[i+1].t) {
            lower = stops[i];
            upper = stops[i+1];
            break;
        }
    }
    
    const range = upper.t - lower.t;
    const mix = range === 0 ? 0 : (intensity - lower.t) / range;
    
    const r = Math.round(lower.c[0] + (upper.c[0] - lower.c[0]) * mix);
    const g = Math.round(lower.c[1] + (upper.c[1] - lower.c[1]) * mix);
    const b = Math.round(lower.c[2] + (upper.c[2] - lower.c[2]) * mix);

    return {
      background: `rgba(${r}, ${g}, ${b}, ${0.15 + intensity * 0.45})`,
      borderColor: `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.5})`,
      color: `rgba(${Math.min(r + 100, 255)}, ${Math.min(g + 100, 255)}, ${Math.min(b + 100, 255)}, 0.95)`,
      boxShadow: `0 4px 10px rgba(0,0,0,0.5), 0 0 ${8 + intensity * 15}px rgba(${r}, ${g}, ${b}, ${0.25 + intensity * 0.35}), inset 0 2px 2px rgba(255,255,255,0.05)`,
      transform: `translateY(${-intensity * 2.5}px)`,
    };
  };

  return (
    <div className="relative flex flex-col p-3 sm:p-5 rounded-2xl bg-[#050705] border border-white/[0.04] shadow-2xl w-full mx-auto overflow-hidden">
      <div className="flex flex-col gap-[3px] sm:gap-1 w-full">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-[3px] sm:gap-1 w-full">
            {row.map((keyObj) => {
              const val = data[keyObj.id] ?? 0;
              const style = getColor(val);
              return (
                <div
                  key={keyObj.id}
                  className="relative bg-[#000000] select-none transition-all duration-500 rounded-[5px] sm:rounded-[7px] group/key"
                  style={{
                    flex: `${keyObj.w} 0 0`,
                    minWidth: 0,
                    height: '2.2rem',
                    boxShadow: '0 3px 5px rgba(0,0,0,0.8)'
                  }}
                >
                  {/* Key Face */}
                  <div
                    className="absolute inset-x-0 top-0 bottom-[2px] sm:bottom-[3px] flex items-center justify-center rounded-[4px] sm:rounded-[6px] text-[8px] sm:text-[10px] font-bold tracking-wider transition-all duration-300 backdrop-blur-md group-hover/key:brightness-125"
                    style={{
                      border: '1px solid',
                      padding: '0 2px',
                      ...style,
                    }}
                  >
                    <span className="opacity-90 truncate">{keyObj.label}</span>
                    {/* Subtle Inner Highlight */}
                    <div className="absolute inset-0 rounded-[3px] sm:rounded-[5px] pointer-events-none" 
                         style={{ background: 'linear-gradient(170deg, rgba(255,255,255,0.04) 0%, transparent 40%)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
