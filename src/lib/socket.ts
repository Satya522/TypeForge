import { io, type Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getCommunitySocket() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(process.env.NEXT_PUBLIC_COMMUNITY_SOCKET_URL ?? 'http://localhost:3001', {
      autoConnect: false,
      transports: ['websocket'],
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
