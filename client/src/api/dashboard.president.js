// src/api/dashboard.president.js
import client from "./client";

export const getOverview = (params) =>
  client.get("/dashboard/president/overview", { params }).then((r) => r.data);

export const getCounters = () =>
  client.get("/dashboard/president/counters").then((r) => r.data);

export const getUsersSummary = () =>
  client.get("/dashboard/president/users/summary").then((r) => r.data);

export const getGroupsSummary = (anneeId) =>
  client
    .get("/dashboard/president/groups/summary", { params: { anneeId } })
    .then((r) => r.data);

export const getPeiStats = (anneeId) =>
  client
    .get("/dashboard/president/pei-stats", { params: { anneeId } })
    .then((r) => r.data);

export const getWeeklyActivities = (anneeId, weeks = 8) =>
  client
    .get("/dashboard/president/activities/weekly", {
      params: { anneeId, weeks },
    })
    .then((r) => r.data);

export const getEvalDistribution = (anneeId, bins = 10) =>
  client
    .get("/dashboard/president/evaluations/distribution", {
      params: { anneeId, bins },
    })
    .then((r) => r.data);

export const getLatestActualites = (limit = 8) =>
  client
    .get("/dashboard/president/actualites/latest", { params: { limit } })
    .then((r) => r.data);

export const getUpcomingEvents = (limit = 8) =>
  client
    .get("/dashboard/president/events/upcoming", { params: { limit } })
    .then((r) => r.data);

export const getRecent = (limit = 8) =>
  client
    .get("/dashboard/president/recent", { params: { limit } })
    .then((r) => r.data);

// export const getUnreadCount = () =>
//   client
//     .get("/dashboard/president/notifications/unread-count")
//     .then((r) => r.data);

export const activateYear = (anneeId) =>
  client.post(`/dashboard/president/annees/${anneeId}/activate`).then((r) => r.data);

export const broadcast = (payload) =>
  client
    .post("/dashboard/president/notifications/broadcast", payload)
    .then((r) => r.data);

export async function getUnreadCount() {
  const { data } = await client.get("/notifications/me/unread-count");
  // backend typically returns { ok:true, data: { count: 3 } } or { ok:true, data: 3 }
  const count = typeof data?.data === "number" ? data.data : data?.data?.count ?? 0;
  return count;
}
// recent items (generic feed)
export async function getRecentFeed() {
  const { data } = await client.get(`/notifications/me`);
  // expected { ok:true, data: [ ...items ] }
  return data?.data ?? [];
}

