// Lazy-load the Socket.IO client from a CDN so the messaging UI remains usable
// even when local npm dependencies are unavailable during builds.
const SOCKET_IO_CDN = "https://cdn.jsdelivr.net/npm/socket.io-client@4.8.1/dist/socket.io.min.js";
const SOCKET_IO_SCRIPT_ID = "messaging-socket-io-client";

let socketInstance = null;
let loaderPromise = null;

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

function loadSocketIoScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }
  if (window.io) {
    return Promise.resolve(window.io);
  }
  if (!loaderPromise) {
    loaderPromise = new Promise((resolve, reject) => {
      let script = document.getElementById(SOCKET_IO_SCRIPT_ID);

      function handleError(event) {
        cleanup();
        reject(event instanceof Error ? event : new Error("socket.io script failed to load"));
      }

      function handleLoad() {
        cleanup();
        if (window.io) {
          resolve(window.io);
        } else {
          reject(new Error("socket.io client unavailable after script load"));
        }
      }

      function cleanup() {
        if (script) {
          script.removeEventListener("load", handleLoad);
          script.removeEventListener("error", handleError);
        }
      }

      if (script) {
        script.addEventListener("load", handleLoad, { once: true });
        script.addEventListener("error", handleError, { once: true });
        return;
      }

      script = document.createElement("script");
      script.id = SOCKET_IO_SCRIPT_ID;
      script.src = SOCKET_IO_CDN;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.addEventListener("load", handleLoad, { once: true });
      script.addEventListener("error", handleError, { once: true });
      document.head.appendChild(script);
    }).catch((error) => {
      loaderPromise = null;
      throw error;
    });
  }
  return loaderPromise;
}

export async function getMessagingSocket(token) {
  if (!token) return null;
  try {
    const io = await loadSocketIoScript();
    if (!io) return null;
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
  } catch (error) {
    console.error("Failed to initialise messaging socket", error);
    return null;
  }
}

export function disconnectMessagingSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
