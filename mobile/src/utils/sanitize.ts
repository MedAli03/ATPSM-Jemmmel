export function sanitizeText(input: string): string {
  return input.replace(/[<>]/g, (char) => ({ '<': '&lt;', '>': '&gt;' }[char] ?? char));
}
