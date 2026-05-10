"use client";

import type { CSSProperties } from "react";
import { memo } from "react";

export type TerminalLogoFontName = "fira" | "geist" | "ibm" | "jetbrains" | "space";
export type TerminalLogoThemeName = "amber" | "cyan" | "matrix" | "rose" | "violet";

const FALLBACK_STACK =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

const BLOCK_ART_LINES = [
  "████████╗██╗   ██╗██████╗ ███████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗",
  "╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝",
  "   ██║    ╚████╔╝ ██████╔╝█████╗  █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ",
  "   ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ",
  "   ██║      ██║   ██║     ███████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗",
  "   ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝",
];

const LOGO_FONTS: Record<
  TerminalLogoFontName,
  {
    family: string;
    fontSize: string;
    fontWeight: number;
    lines: string[];
    lineHeight: number;
  }
> = {
  fira: {
    family: `"Fira Code", ${FALLBACK_STACK}`,
    fontSize: "clamp(9px, 1.2vw, 16px)",
    fontWeight: 800,
    lines: BLOCK_ART_LINES,
    lineHeight: 1,
  },
  geist: {
    family: `"Geist Mono", ${FALLBACK_STACK}`,
    fontSize: "clamp(9px, 1.2vw, 16px)",
    fontWeight: 800,
    lines: BLOCK_ART_LINES,
    lineHeight: 1,
  },
  ibm: {
    family: `"IBM Plex Mono", ${FALLBACK_STACK}`,
    fontSize: "clamp(8px, 1.08vw, 14px)",
    fontWeight: 800,
    lines: BLOCK_ART_LINES,
    lineHeight: 1,
  },
  jetbrains: {
    family: `"JetBrains Mono", ${FALLBACK_STACK}`,
    fontSize: "clamp(8px, 1.08vw, 14px)",
    fontWeight: 800,
    lines: BLOCK_ART_LINES,
    lineHeight: 1,
  },
  space: {
    family: `"Space Mono", ${FALLBACK_STACK}`,
    fontSize: "clamp(8px, 1vw, 13px)",
    fontWeight: 700,
    lines: BLOCK_ART_LINES,
    lineHeight: 1,
  },
};

const LOGO_THEMES: Record<TerminalLogoThemeName, { accent: string; rgb: string; soft: string }> = {
  amber: { accent: "#f59e0b", rgb: "245, 158, 11", soft: "#fde68a" },
  cyan: { accent: "#22d3ee", rgb: "34, 211, 238", soft: "#a5f3fc" },
  matrix: { accent: "#4ade80", rgb: "74, 222, 128", soft: "#86efac" },
  rose: { accent: "#fb7185", rgb: "251, 113, 133", soft: "#fecdd3" },
  violet: { accent: "#a855f7", rgb: "168, 85, 247", soft: "#e9d5ff" },
};

function getLogoFont(font: TerminalLogoFontName) {
  return LOGO_FONTS[font] ?? LOGO_FONTS.fira;
}

function getLogoTheme(theme: TerminalLogoThemeName) {
  return LOGO_THEMES[theme] ?? LOGO_THEMES.matrix;
}

type TypeForgeTerminalLogoProps = {
  font: TerminalLogoFontName;
  showTagline?: boolean;
  theme: TerminalLogoThemeName;
};

function TypeForgeTerminalLogo({ font, showTagline = false, theme }: TypeForgeTerminalLogoProps) {
  const logoFont = getLogoFont(font);
  const logoTheme = getLogoTheme(theme);
  const logoStyle: CSSProperties = {
    color: logoTheme.accent,
    fontFamily: logoFont.family,
    fontFeatureSettings: '"liga" 0, "calt" 0, "kern" 0',
    fontSize: logoFont.fontSize,
    fontVariantLigatures: "none",
    fontWeight: logoFont.fontWeight,
    letterSpacing: 0,
    lineHeight: logoFont.lineHeight,
    textRendering: "optimizeSpeed",
    textShadow: `0 0 7px rgba(${logoTheme.rgb}, 0.22)`,
  };

  return (
    <div className="my-4 max-w-full overflow-x-auto overflow-y-hidden pb-1 [scrollbar-width:thin]">
      <pre aria-label="TYPEFORGE ASCII logo" className="m-0 w-max max-w-none whitespace-pre" style={logoStyle}>
        {logoFont.lines.join("\n")}
      </pre>
      {showTagline && (
        <p
          className="mt-4 w-max min-w-full text-center text-[10px] font-black uppercase tracking-[0.18em] sm:text-xs"
          style={{
            color: logoTheme.soft,
            fontFamily: logoFont.family,
            textShadow: `0 0 12px rgba(${logoTheme.rgb}, 0.28)`,
          }}
        >
          ⚒ TYPEFORGE - FORGE YOUR TYPING SPEED ⚒
        </p>
      )}
    </div>
  );
}

export default memo(TypeForgeTerminalLogo);
