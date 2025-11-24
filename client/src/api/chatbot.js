import client from "./client";
import { useMutation } from "@tanstack/react-query";

export async function chatbotQuery({ message }) {
  const { data } = await client.post("/chatbot/query", { message });
  return data;
}

export function useChatbotMutation(options = {}) {
  return useMutation({
    mutationFn: chatbotQuery,
    ...options,
  });
}
