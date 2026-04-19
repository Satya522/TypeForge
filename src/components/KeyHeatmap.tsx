"use client";

import React from 'react';

/**
 * KeyHeatmap visualizes per-key error frequency using a simple grid of keys.
 * The `data` prop is a mapping from key character to an integer frequency.
 * Cells are tinted based on their relative error count. This component
 * supports only a subset of characters for demonstration purposes.
 */
export default function KeyHeatmap({ data }: { data: Record<string, number> }) {
  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];
  // Determine max value to normalize intensities
  const maxVal = Math.max(...Object.values(data), 0);
  const getColor = (val: number): React.CSSProperties => {
    if (maxVal === 0) return {};
    const intensity = val / maxVal;
    // Map intensity to a blue-red gradient: low errors -> greenish, high -> red
    const red = Math.round(255 * intensity);
    const green = Math.round(255 * (1 - intensity));
    return {
      backgroundColor: `rgba(${red}, ${green}, 150, 0.3)`,
      borderColor: `rgba(${red}, ${green}, 150, 0.6)`,
    };
  };
  return (
    <div className="flex flex-col gap-2 lg:gap-3 w-full max-w-3xl mx-auto bg-black/20 p-4 lg:p-8 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-2 lg:gap-3 justify-center w-full">
          {ri === 1 && <div className="flex-[0.5]" />}
          {ri === 2 && <div className="flex-[1]" />}
          {ri === 3 && <div className="flex-[1.5]" />}

          {row.map((key) => {
            const val = data[key] ?? 0;
            const style = getColor(val);
            return (
              <div
                key={key}
                className="flex-1 min-w-[2rem] h-10 sm:h-12 lg:h-14 flex flex-col items-center justify-center rounded-xl font-bold shadow-md transition-all duration-300 hover:scale-[1.03] border-b-4 border-r-2"
                style={{
                   ...style,
                   backgroundColor: style.backgroundColor || 'var(--tw-colors-gray-900, #111827)',
                   borderColor: style.borderColor || 'rgba(255,255,255,0.05)',
                   color: val > 0 ? '#fff' : '#a3a3a3'
                }}
              >
                <span className="text-sm lg:text-xl uppercase">{key}</span>
                {val > 0 ? (
                   <span className="text-[9px] lg:text-[10px] opacity-70 mt-0.5 tracking-widest absolute bottom-1 hidden sm:block">
                     {val}
                   </span>
                ) : null}
              </div>
            );
          })}

          {ri === 1 && <div className="flex-[0.5]" />}
          {ri === 2 && <div className="flex-[1.5]" />}
          {ri === 3 && <div className="flex-[3.5]" />}
        </div>
      ))}
    </div>
  );
}
