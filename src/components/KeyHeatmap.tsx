"use client";

import React from 'react';

/**
 * KeyHeatmap visualizes per-key error frequency using a simple grid of keys.
 * The `data` prop is a mapping from key character to an integer frequency.
 * Cells are tinted based on their relative error count. This component
 * supports only a subset of characters for demonstration purposes.
 */
export default function KeyHeatmap({ data }: { data: Record<string, number> }) {
  // Define rows of a typical keyboard layout
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
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
    <div className="inline-flex flex-col gap-1">
      {rows.map((row, ri) => (
        <div key={ri} className="flex gap-1 justify-center">
          {row.map((key) => {
            const val = data[key] ?? 0;
            const style = getColor(val);
            return (
              <div
                key={key}
                className="w-8 h-8 flex items-center justify-center rounded-md text-xs text-gray-200 border"
                style={style}
              >
                {key.toUpperCase()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
