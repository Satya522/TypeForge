import { NextRequest, NextResponse } from "next/server";

type OsFamily = "android" | "ios" | "linux" | "macos" | "unknown" | "windows";

const OS_LABELS: Record<OsFamily, string> = {
  android: "Android",
  ios: "iOS",
  linux: "Linux",
  macos: "macOS",
  unknown: "Unknown OS",
  windows: "Windows",
};

function cleanHeader(value: string | null) {
  return value?.replace(/^"|"$/g, "").trim() ?? "";
}

function getOsFamily(value: string): OsFamily {
  const normalized = value.toLowerCase();
  if (normalized.includes("android")) return "android";
  if (normalized.includes("iphone") || normalized.includes("ipad") || normalized.includes("ios")) return "ios";
  if (normalized.includes("win")) return "windows";
  if (normalized.includes("mac")) return "macos";
  if (normalized.includes("linux") || normalized.includes("x11") || normalized.includes("ubuntu")) return "linux";
  return "unknown";
}

export async function GET(request: NextRequest) {
  const platform = cleanHeader(request.headers.get("sec-ch-ua-platform"));
  const userAgent = request.headers.get("user-agent") ?? "";
  const family = getOsFamily(`${platform} ${userAgent}`);

  return NextResponse.json(
    {
      family,
      os: family === "unknown" ? OS_LABELS.unknown : platform || OS_LABELS[family],
      platform,
      source: platform ? "sec-ch-ua-platform" : "user-agent",
      userAgent: userAgent.slice(0, 220),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
