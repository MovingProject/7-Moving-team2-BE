export type PagedResult<T> = {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
};
