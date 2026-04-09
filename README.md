# TypeForge Typing Platform

**TypeForge** is a modern, premium typing education platform built with the latest Next.js app router. It provides a guided course experience, flexible practice modes, rich analytics, achievements, a leaderboard and an admin panel to manage content. This repository contains the full source code ready for local development and deployment.

## Project Structure

```
typeforge/
├─ prisma/              – Database schema, migrations and seed scripts
├─ src/
│  ├─ app/              – Next.js app router pages and layout
│  ├─ components/       – Reusable UI building blocks
│  ├─ features/         – Encapsulated feature modules (landing, dashboard, learn, practice, etc.)
│  ├─ lib/              – Utility functions (auth, prisma client, helpers)
│  ├─ schemas/          – Zod validation schemas
│  ├─ hooks/            – Custom React hooks
│  ├─ store/            – Zustand global state stores
│  └─ types/            – Shared TypeScript types and enums
├─ .env.example         – Sample environment configuration
├─ package.json         – Dependency declarations and scripts
├─ next.config.js       – Next.js configuration
├─ tailwind.config.js   – Tailwind theme and plugin configuration
├─ postcss.config.js    – PostCSS configuration
├─ tsconfig.json        – TypeScript configuration
└─ README.md            – Project overview and setup instructions
```

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install # or npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and fill in values for `DATABASE_URL`, `NEXTAUTH_SECRET` and your OAuth provider credentials (Google Client ID/Secret). If you plan to use the email-based password recovery flow, configure the `EMAIL_*` variables as well.

3. **Prisma migrations and seeding**

   Generate the Prisma client and run your database migrations:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

   To populate the database with starter content, run:

   ```bash
   pnpm prisma:seed
   ```

4. **Development server**

   Start the Next.js development server:

   ```bash
   pnpm dev
   ```

   The app will be available at `http://localhost:3000`.

5. **Production build**

   To create an optimized production build:

   ```bash
   pnpm build
   pnpm start
   ```

## Deployment

This project is ready to deploy on platforms like **Vercel**, **Netlify** or any infrastructure supporting Node.js and PostgreSQL. Set the environment variables appropriately on your hosting provider.

## Tech Stack

- **Next.js 15** with the App Router
- **React 18** and **TypeScript**
- **Tailwind CSS** with dark mode support and custom theming
- **shadcn/ui** for accessible primitive UI components
- **Framer Motion** for subtle animations
- **Zustand** for client state management
- **React Hook Form** & **Zod** for form handling and validation
- **Prisma ORM** with **PostgreSQL**
- **NextAuth** for authentication via Google and credentials
- **Recharts** for data visualizations on the analytics page
- **Sonner** toast notifications

## Contributing

Contributions are welcome! Open issues and pull requests to suggest enhancements, report bugs or propose new features. This project aims to be a polished, portfolio-quality example of a full‑stack web app built with Next.js and modern tools.

## New Additions in v3

This release extends the TypeForge platform with several experimental and premium features designed to push the boundaries of what a typing platform can offer:

- **Progressive Web App (PWA)** – A web manifest and service worker enable installation on mobile/desktop and provide basic offline support.
- **Real‑time Race Demo** – Join a simulated multiplayer race with live progress bars. A full WebSocket backend can be integrated for true real‑time competition.
- **Subscription Plans** – Compare Free and Premium tiers and simulate a subscription flow. Integrate Stripe or another payment provider for real payments.
- **Community Chat** – A local chat component demonstrates how in‑app messaging might work. Connect a real-time backend (Socket.io, Supabase, etc.) for persistent chat.
- **Dictation Practice** – Experiment with speech‑to‑text typing using the Web Speech API. Not all browsers support this feature.
- **Multilingual Preview** – Preview interface translations in English, Hindi and Spanish. A full internationalization solution can extend this across the app.
- **Ergonomics & Posture Guide** – A dedicated page outlines best practices for healthy typing and includes an illustrative image.
- **Augmented Reality Concept** – Discover ideas for AR typing practice using WebXR and camera overlays. This is currently a conceptual description.
