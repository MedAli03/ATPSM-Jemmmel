// src/config/env.ts
// src/config/env.ts
// Centralise the API URL so that the mobile client is aligned with the backend
// (which listens on port 4000 by default – see server/server.js).
// When testing on a real device, replace "localhost" with your machine IP
// or override this value via an env-specific mechanism.
const API_BASE_URL = "http://localhost:4000/api";
// ⚠️ 192.168.1.10 = IP de ton PC sur le réseau Wi-Fi

export { API_BASE_URL };
