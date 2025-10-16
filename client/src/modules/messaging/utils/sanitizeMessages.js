const ROLE_PARENT = "PARENT";

export function sanitizeMessagesForRole(messages = [], role) {
  if (!Array.isArray(messages) || !messages.length) return [];
  return messages.filter((message) => {
    if (!message) return false;
    if (role === ROLE_PARENT && message.kind === "system") {
      const meta = message.metadata || {};
      if (meta.source === "ai" || meta.isAIRecommendation) {
        return false;
      }
    }
    return true;
  });
}
