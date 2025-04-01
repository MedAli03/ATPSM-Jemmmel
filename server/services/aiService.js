// services/aiService.js
const generateInsights = (progressReports) => {
  // Implement your AI logic here
  const keywords = progressReports
    .join(" ")
    .match(/\b(\w+)\b/g)
    .filter((word) => word.length > 4);

  return `Key development areas: ${[...new Set(keywords)]
    .slice(0, 5)
    .join(", ")}`;
};
