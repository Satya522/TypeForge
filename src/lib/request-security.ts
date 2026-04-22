import type { NextRequest } from "next/server";

export const COMMUNITY_CHANNEL_IDS = new Set([
  "general",
  "speed-runs",
  "tips-tricks",
  "show-off",
  "code-typing",
  "challenges",
  "off-topic",
]);

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function sanitizePlainText(input: string, maxLength: number) {
  return input
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeName(name: string, maxLength = 50) {
  return sanitizePlainText(name, maxLength).replace(/\s+/g, " ");
}
