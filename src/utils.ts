const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Returns the UTC calendar date (YYYY-MM-DD) that is `days` before `now`. */
export function getDaysAgoDate(days: number, now: Date = new Date()): string {
  return new Date(now.getTime() - days * MS_PER_DAY).toISOString().slice(0, 10);
}

export function parseRepository(
  repo?: string,
): { owner: string; repo: string } | null {
  const [owner, name, ...rest] = repo?.split("/") ?? [];
  if (!(owner && name) || rest.length > 0) {
    return null;
  }
  return { owner, repo: name };
}
