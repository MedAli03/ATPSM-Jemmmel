import { io } from "socket.io-client";

let socketInstance = null;

function resolveBaseURL() {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const devPorts = new Set(["5173", "5174", "4173", "4174", "3000"]);
    const baseProtocol = protocol === "https:" ? "https:" : "http:";
    if (devPorts.has(port)) {
      return `${baseProtocol}//${hostname}:5000`;
    }
    const portSegment = port ? `:${port}` : "";
    return `${baseProtocol}//${hostname}${portSegment}`;
  }
  return "http://localhost:5000";
}

export function getMessagingSocket(token) {
  if (!token) return null;
  if (!socketInstance) {
    socketInstance = io(`${resolveBaseURL()}/messages`, {
      path: "/ws",
      transports: ["websocket", "polling"],
      autoConnect: false,
      withCredentials: true,
    });
  }
  socketInstance.auth = { token };
  return socketInstance;
}

export function disconnectMessagingSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
  }
}
