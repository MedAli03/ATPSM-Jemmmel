import client from "./client";

function unwrap(response) {
  const payload = response?.data;
  if (payload && typeof payload === "object") {
    return payload.data ?? payload;
  }
  return payload;
}

export async function fetchSiteOverview() {
  const res = await client.get("/site/overview");
  return unwrap(res);
}

export async function fetchSiteNavigation() {
  const res = await client.get("/site/navigation");
  return unwrap(res);
}

export async function fetchSiteFooter() {
  const res = await client.get("/site/footer");
  return unwrap(res);
}

export async function fetchSiteHighlights() {
  const res = await client.get("/site/highlights");
  return unwrap(res);
}

export async function fetchSiteHero() {
  const res = await client.get("/site/hero");
  return unwrap(res);
}

export async function fetchSiteContact() {
  const res = await client.get("/site/contact");
  return unwrap(res);
}

export async function fetchSiteAbout() {
  const res = await client.get("/site/about");
  return unwrap(res);
}

export async function fetchSiteNews(params = {}) {
  const res = await client.get("/site/news", { params });
  return unwrap(res);
}

export async function fetchSiteNewsArticle(id) {
  if (!id) return null;
  const res = await client.get(`/site/news/${id}`);
  return unwrap(res);
}

export async function fetchSiteEvents(params = {}) {
  const res = await client.get("/site/events", { params });
  return unwrap(res);
}

export async function fetchSiteEvent(id) {
  if (!id) return null;
  const res = await client.get(`/site/events/${id}`);
  return unwrap(res);
}
