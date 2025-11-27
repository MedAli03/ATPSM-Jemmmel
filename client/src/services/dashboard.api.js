// src/services/dashboard.api.js
import http from "./http";

/**
 * Backend exposes a shared overview endpoint for president/director:
 *  - GET /dashboard/overview (baseURL already includes /api)
 *
 * Example response we’ll consume:
 * {
 *   users: { total: 1248, deltaPct: 12.4 },
 *   activities: { total: 42, delta: 3 },         // delta = +3 new
 *   reports: { total: 24, deltaPct: -7.7 },
 *   series: { labels: ["يناير","فبراير",...], values: [10,22,18,...] }
 * }
 */
export async function getDashboardOverview() {
  const { data } = await http.get("/dashboard/overview");
  return data;
}
