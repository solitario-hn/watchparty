import { io } from "socket.io-client";

// Same-origin in production; Vite proxies /socket.io during development.
export const socketClient = io(import.meta.env.VITE_SOCKET_URL || undefined, {
  autoConnect: false,
  reconnection: true,
});

export function emitRoomEvent(event, payload) {
  if (!socketClient.connected || !socketClient.partyReady) {
    reportRoomError(
      "Connection lost. Wait for reconnection before making changes.",
    );
    return false;
  }
  socketClient.emit(event, payload);
  return true;
}

export function reportRoomError(message) {
  window.dispatchEvent(
    new CustomEvent("watchparty-error", { detail: message }),
  );
}

socketClient.on("connect", () => {
  socketClient.partyReady = false;
});
socketClient.on("disconnect", () => {
  socketClient.partyReady = false;
});
