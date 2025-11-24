import { api } from "./api";

export async function chatbotQuery(message: string) {
  const { data } = await api.post("/chatbot/query", { message });
  return data;
}

export async function getChatbotHistory() {
  const { data } = await api.get("/chatbot/history");
  return data;
}
