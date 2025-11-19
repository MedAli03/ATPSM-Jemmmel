// src/api/dashboard.president.js
import client from "./client";

export const getOverview = (params) =>
  client.get("/dashboard/president/overview", { params }).then((r) => r.data);

export const activateYear = (anneeId) =>
  client.post(`/dashboard/president/annees/${anneeId}/activate`).then((r) => r.data);

export const broadcast = (payload) =>
  client
    .post("/dashboard/president/notifications/broadcast", payload)
    .then((r) => r.data);

