import { api } from "./api";

export async function chatbotQuery(message: string) {
  const { data } = await api.post("/chatbot/query", { message });
  return data;
}
