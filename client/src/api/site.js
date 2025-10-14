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
