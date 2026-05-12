# TypeForge - AI Context
**Type**: Premium typing test, analytics, & community platform.
**Stack**: Next.js 16 (App Router), React 19, TypeScript, TailwindCSS, FramerMotion, GSAP, Zustand, Socket.io, Prisma, PostgreSQL, NextAuth.

## DB Schema Core (Prisma)
- **User**: role, isPremium, eloRating, rankTier, streakTracking, settings.
- **Session/Practice**: wpm, rawWpm, accuracy, telemetry, errors.
- **CommunityRoom**: slug, category, isPremium, real-time chats.
- **Squad/Tournament**: clan system, multiplayer live events, races, Boss Raids.
- **Content**: LessonPath, PracticeContent (TEXT, CODE, QUOTE).

## Architecture & Routing
- `src/app`: /analytics, /community, /dashboard, /games, /race, /tournaments, /login, /profile.
- `src/components`: 
  - *Auth/UI*: TerminalAuth.tsx, Navbar.tsx, AppChrome.tsx, ThemeProvider.tsx.
  - *Games*: CyberDefendGame, NeonSprintGame, CodeBreakerGame, TerminalHackerGame.
  - *Data/Stats*: KeyHeatmap, SessionResults, SessionMetrics.
- `server.js`: Custom Node+Socket.io server (Redis adapter) for real-time multiplayer.
- `src/lib`: Prisma & Socket singletons.

## AI Engineering Directives
1. **Design**: "Beast-level", premium, glassmorphism, dark mode, smooth gradients.
2. **Animation**: `framer-motion` for state/layout transitions, `gsap` for complex scroll/entrances, `lenis` for smooth scrolling. 60fps minimum.
3. **Code Quality**: Zero-comment production code (unless complex). Modular, reusable React components. 
4. **State**: `Zustand` for complex client state, `React Query` for data fetching.
5. **Styling**: Tailwind primarily. Vanilla CSS *only* when Tailwind falls short for extreme custom aesthetics.
