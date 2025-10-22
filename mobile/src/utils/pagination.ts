export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface CursorPage<T> {
  data: T[];
  nextCursor?: string;
}

export function appendCursorPage<T>(existing: CursorPage<T> | undefined, incoming: CursorPage<T>): CursorPage<T> {
  if (!existing) return incoming;
  return {
    data: [...existing.data, ...incoming.data],
    nextCursor: incoming.nextCursor
  };
}
