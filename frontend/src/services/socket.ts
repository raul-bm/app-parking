import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket?.connected) return;

  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
  });
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function onFriendshipUpdated(callback: () => void) {
  socket?.on("friendship:updated", callback);
}

export function offFriendshipUpdated(callback: () => void) {
  socket?.off("friendship:updated", callback);
}

export function onGroupsUpdated(callback: () => void) {
  socket?.on("groups:updated", callback);
}

export function offGroupsUpdated(callback: () => void) {
  socket?.off("groups:updated", callback);
}
