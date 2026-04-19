import type { Metadata } from "next";
import GamesHubClient from "./GamesHubClient";

export const metadata: Metadata = {
  title: "Typing Games – TypeForge",
  description:
    "6 premium typing games — Speed Typing, Word Rain, Terminal Hacker, Bomb Defuse, Ghost Racer, and Word Scramble. Sharpen reflexes and have fun.",
};

export default function GamesPage() {
  return <GamesHubClient />;
}
