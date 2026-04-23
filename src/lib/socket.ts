import { io, type Socket } from "socket.io-client";

const COMMUNITY_SOCKET_URL =
  process.env.NEXT_PUBLIC_COMMUNITY_SOCKET_URL ?? "http://localhost:3001";
const COMMUNITY_RELAY_HEALTH_URL = "/api/community/relay-status";
const RELAY_HEALTH_CACHE_TTL_MS = 3000;
const RELAY_HEALTH_TIMEOUT_MS = 2500;

let socketInstance: Socket | null = null;
let relayHealthCheck: Promise<boolean> | null = null;
let relayHealthSnapshot = {
  available: false,
  checkedAt: 0,
};

async function fetchRelayHealth() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    RELAY_HEALTH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(COMMUNITY_RELAY_HEALTH_URL, {
      cache: "no-store",
      credentials: "omit",
      method: "GET",
      mode: "cors",
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { available?: boolean };
    return payload.available === true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function isCommunityRelayAvailable(force = false) {
  if (typeof window === "undefined") {
    return false;
  }

  const now = Date.now();
  if (
    !force &&
    now - relayHealthSnapshot.checkedAt < RELAY_HEALTH_CACHE_TTL_MS
  ) {
    return relayHealthSnapshot.available;
  }

  if (!relayHealthCheck) {
    relayHealthCheck = fetchRelayHealth()
      .then((available) => {
        relayHealthSnapshot = {
          available,
          checkedAt: Date.now(),
        };
        return available;
      })
      .finally(() => {
        relayHealthCheck = null;
      });
  }

  return relayHealthCheck;
}

export function getCommunitySocket() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(COMMUNITY_SOCKET_URL, {
      autoConnect: false,
      reconnection: false,
      transports: ["websocket"],
    });
  }

  return socketInstance;
}

export function resetCommunitySocket() {
  if (!socketInstance) {
    return;
  }

  socketInstance.disconnect();
  socketInstance = null;
}
