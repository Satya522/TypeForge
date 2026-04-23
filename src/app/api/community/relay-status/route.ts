import { NextResponse } from "next/server";

const COMMUNITY_SOCKET_URL =
  process.env.NEXT_PUBLIC_COMMUNITY_SOCKET_URL ?? "http://localhost:3001";
const COMMUNITY_RELAY_HEALTH_URL = `${COMMUNITY_SOCKET_URL.replace(/\/$/, "")}/health`;
const COMMUNITY_RELAY_TIMEOUT_MS = 2500;

export async function GET() {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    COMMUNITY_RELAY_TIMEOUT_MS,
  );

  try {
    const response = await fetch(COMMUNITY_RELAY_HEALTH_URL, {
      cache: "no-store",
      signal: controller.signal,
    });

    return NextResponse.json({ available: response.ok });
  } catch {
    return NextResponse.json({ available: false });
  } finally {
    clearTimeout(timeoutId);
  }
}
