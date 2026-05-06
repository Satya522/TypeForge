<p align="center">
  <img src="public/icon-512.png" width="120" alt="TypeForge Logo" />
</p>

<h1 align="center">TypeForge</h1>

<p align="center">
  <strong>The open-source typing intelligence platform that turns raw keystrokes into measurable skill.</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-40%2B-blueviolet?style=for-the-badge" alt="Features" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Why TypeForge?

Most typing tools measure speed. **TypeForge measures intelligence.**

It doesn't just track WPM — it reconstructs your entire session into a live performance fingerprint: burst patterns, recovery speed, focus drift, pressure response, weak-zone mapping, and rhythm stability. The analytics engine alone runs 1,500+ lines of pure typing science.

Whether you're a developer drilling code snippets, a student mastering touch typing, or a competitive typist chasing leaderboard ranks — TypeForge adapts to you.

---

## Features

### ⌨️ Core Typing Engine

| Module | Description |
|---|---|
| **Guided Lessons** | Structured curriculum from home-row basics to advanced paragraphs |
| **Practice Modes** | Speed Test, Accuracy Drill, Timed Challenge, Custom Text |
| **Code Practice** | Language-specific code typing with syntax highlighting (JS, Python, Rust, etc.) |
| **Custom Practice** | Paste any text and practice with full metrics tracking |
| **AI Practice** | AI-generated passages tailored to your weak zones |
| **Dictation Mode** | Speech-to-text practice using Web Speech API |

### 🎮 Typing Games Arcade

Ten fully-built browser games — not demos, not placeholders — real games with scoring, progression, and visual effects:

| Game | Mechanic |
|---|---|
| **Neon Sprint** | Speed-run through neon corridors by typing words before they vanish |
| **Cyber Defend** | Tower-defense meets typing — destroy waves by typing attack codes |
| **Syntax Shooter** | Shoot down syntax errors by typing correct code fragments |
| **Terminal Hacker** | Solve hacking puzzles by typing terminal commands under pressure |
| **Code Breaker** | Crack cipher codes with precision typing before the clock runs out |
| **Letter Rain** | Classic falling-letters with modern particle effects and combos |
| **Memory Matrix** | Memorize and re-type grid patterns with increasing difficulty |
| **Type Racer Pro** | Race against AI opponents with real-time progress visualization |
| **Rhythm Typer** | Music-synced typing where rhythm and accuracy both matter |
| **Zen Garden** | Calm, meditative typing with ambient soundscapes and no timer |

### 📊 Analytics Intelligence Engine

The analytics dashboard is not a simple chart page. It's a **typing performance lab** built on a custom 1,500+ line analytics model that produces:

- **Typing DNA Profile** — Archetype classification (Rhythm Architect, Aggressive Starter, Flow Keeper, etc.)
- **Skill Radar** — 6-axis radar chart: Speed, Accuracy, Consistency, Control, Endurance, Recovery
- **Rhythm Timeline** — 12-point session reconstruction showing pace, focus, and flow across time
- **Pressure Response Model** — How you handle mistakes: Rapid Stabilizer, Controlled Reset, or Confidence Dip
- **Focus Drift Analysis** — Time-banded attention mapping with critical/watch/steady state detection
- **Session Stamina** — Sprint vs. Marathon performance comparison across session lengths
- **Weak Zone Mapping** — Key-cluster friction detection with targeted drill recommendations
- **Growth Series** — Multi-metric trend visualization with interactive area charts
- **Training Command Center** — Consistency heatmap, session load dots, momentum tracking, and AI coach insights
- **Session Replay** — Compressed session signature showing launch burst, correction spike, recovery, and finish quality

### 🗺️ Learning Roadmap

Interactive, scroll-animated roadmap with glassmorphic milestone cards, cinematic hero section, and editorial scroll-reveal animations.

### 👥 Community Hub

- Real-time chat with WebSocket relay server
- Emoji picker (emoji-mart) with GIF search integration
- Channel-based messaging with user identity cards
- Live race ticker, streak flex banners, WPM flex cards
- Daily pulse and notification center
- Command palette for power users

### 🏆 Competitive Features

| Feature | Description |
|---|---|
| **Leaderboard** | Global and filtered rankings with animated entries |
| **Tournaments** | Bracket-style competitive typing events |
| **Race Mode** | Real-time multiplayer typing races with progress bars |
| **Achievements** | Unlockable badges based on performance milestones |
| **Streak Tracking** | Quality-weighted streak system (not just day-counting) |

### 🧑‍💼 Platform Features

| Feature | Description |
|---|---|
| **User Profiles** | Public profiles with hover cards, custom avatars, and photo upload |
| **Settings** | Premium settings panel with theme, font, sound, and notification controls |
| **Onboarding** | Guided first-run experience with skill assessment |
| **PWA Support** | Installable on mobile/desktop with offline capability |
| **Admin Panel** | Content management and user administration |
| **Teacher Dashboard** | Classroom management and student progress tracking |
| **Subscription Tiers** | Free and Premium tier comparison with payment flow |

---

## Architecture

```
typeforge/
├── prisma/                    # Database schema, migrations, seed data
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/                    # Static assets, PWA manifest, media
│   ├── manifest.json
│   ├── service-worker.js
│   └── media/
├── src/
│   ├── app/                   # Next.js App Router (35+ routes)
│   │   ├── analytics/         # Performance lab & intelligence engine
│   │   ├── community/         # Real-time chat hub
│   │   ├── games/             # 10-game typing arcade
│   │   ├── learn/             # Structured lesson curriculum
│   │   ├── practice/          # Multi-mode practice engine
│   │   ├── map/               # Interactive learning roadmap
│   │   ├── profile/           # Public user profiles
│   │   ├── settings/          # User preferences
│   │   ├── api/               # REST API routes
│   │   └── ...                # 25+ additional routes
│   ├── components/
│   │   ├── community/         # Chat, channels, commands, notifications
│   │   ├── motion/            # Framer Motion primitives & providers
│   │   ├── navigation/        # Navbar, mega menu, mobile drawer
│   │   ├── premium/           # Aurora, glow, grain, shimmer effects
│   │   ├── profile/           # Hover cards, photo dialog, settings form
│   │   ├── ui/                # Radix-based primitive components
│   │   └── ...                # Game components, keyboard, metrics
│   ├── features/
│   │   └── landing/           # Hero, features grid, CTA, FAQ, stats
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Auth, Prisma, utilities, telemetry
│   └── types/                 # TypeScript declarations
├── server.js                  # WebSocket relay server (Socket.io)
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### Data Flow

```
User Input → Typing Engine → Session Telemetry → Analytics Model → Intelligence Surface
                                    ↓
                              PostgreSQL (Prisma)
                                    ↓
                        Growth Series → Recommendations → Coach Insights
```

---

## Tech Stack

### Core Framework

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 16.2 | App Router, SSR, API routes, Turbopack |
| [React](https://react.dev) | 19.2 | UI rendering with concurrent features |
| [TypeScript](https://typescriptlang.org) | 5.9 | End-to-end type safety |

### Data Layer

| Technology | Purpose |
|---|---|
| [Prisma](https://prisma.io) | Type-safe ORM with migrations |
| [PostgreSQL](https://postgresql.org) | Primary database |
| [NextAuth.js](https://next-auth.js.org) | Authentication (Google, GitHub, Credentials) |
| [Zod](https://zod.dev) | Runtime schema validation |

### UI & Design

| Technology | Purpose |
|---|---|
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling with dark mode |
| [Framer Motion](https://framer.com/motion) | Physics-based animations and transitions |
| [GSAP](https://gsap.com) | High-performance scroll animations |
| [Radix UI](https://radix-ui.com) | Accessible headless UI primitives |
| [Lucide](https://lucide.dev) | Icon system |
| [Lenis](https://lenis.darkroom.engineering) | Smooth scroll engine |

### Data Visualization

| Technology | Purpose |
|---|---|
| [Recharts](https://recharts.org) | Composable chart components |
| [Tremor](https://tremor.so) | Dashboard-grade visualization blocks |
| [react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar) | GitHub-style contribution heatmaps |

### Real-time & State

| Technology | Purpose |
|---|---|
| [Socket.io](https://socket.io) | WebSocket server + client for community chat |
| [Zustand](https://zustand-demo.pmnd.rs) | Lightweight global state management |
| [TanStack Query](https://tanstack.com/query) | Server state, caching, and synchronization |
| [React Hook Form](https://react-hook-form.com) | Performant form handling |

### DX & Tooling

| Technology | Purpose |
|---|---|
| [Turbopack](https://turbo.build) | Next.js dev server bundler |
| [ESLint](https://eslint.org) | Code quality enforcement |
| [PostCSS](https://postcss.org) | CSS transformation pipeline |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18.x
- **PostgreSQL** running locally or a hosted instance
- **pnpm** (recommended) or npm

### 1. Clone & Install

```bash
git clone https://github.com/Satya522/TypeForge.git
cd TypeForge
pnpm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/typeforge_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_random_secret_here"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
pnpm prisma:seed
```

### 4. Launch

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live.

### 5. Community Server (Optional)

To enable real-time chat:

```bash
pnpm relay
```

---

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub
2. Import the project on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and handles the rest

### Other Platforms

TypeForge runs on any platform that supports Node.js 18+ and PostgreSQL:

- **Railway** — One-click Postgres + Node.js deployment
- **Render** — Free tier available with managed Postgres
- **Docker** — Containerize with the included Next.js standalone output
- **AWS / GCP** — Deploy to ECS, Cloud Run, or any container service

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | App base URL (`http://localhost:3000` for dev) |
| `NEXTAUTH_SECRET` | ✅ | Random string for JWT encryption |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | ⬜ | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | ⬜ | GitHub OAuth client secret |
| `ALLOWED_ORIGINS` | ⬜ | CORS origins for WebSocket relay |
| `REDIS_URL` | ⬜ | Redis URL for Socket.io adapter |

---

## Scripts

```bash
pnpm dev              # Start development server (Turbopack)
pnpm build            # Create optimized production build
pnpm start            # Start production server
pnpm relay            # Start WebSocket community relay server
pnpm prisma:migrate   # Run Prisma migrations
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:seed      # Seed database with starter content
```

---

## Contributing

Contributions are welcome. Whether it's a bug fix, new feature, or documentation improvement — open an issue or submit a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with obsessive attention to detail.</strong>
  <br />
  <sub>If TypeForge helped you, consider giving it a ⭐</sub>
</p>
