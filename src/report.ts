import type { GitHubIssue, IssueWithReactions, SlackPayload } from "./types";

/** Counts +1 reactions, sorts by them descending and keeps the top `limit`. */
export function rankIssues(
  issues: GitHubIssue[],
  limit: number,
): IssueWithReactions[] {
  return issues
    .map(({ number, title, html_url, reactions }) => ({
      number,
      title,
      html_url,
      thumbsUpCount: reactions?.["+1"] ?? 0,
    }))
    .sort((a, b) => b.thumbsUpCount - a.thumbsUpCount)
    .slice(0, limit);
}

export function buildSlackPayload(
  issues: IssueWithReactions[],
  days: number,
): SlackPayload {
  if (issues.length === 0) {
    return { prelude: `No issues found in the last ${days} days.` };
  }
  const payload: SlackPayload = {
    prelude: `Top ${issues.length} issues sorted by +1 reactions (last ${days} days).\nNote: This GitHub workflow will run every Monday at 1PM UTC (9AM EST).`,
  };
  issues.forEach((issue, index) => {
    const issueNum = index + 1;
    payload[`issue${issueNum}URL`] = issue.html_url;
    payload[`issue${issueNum}Text`] =
      `+1 ${issue.thumbsUpCount}: ${issue.title}`;
  });
  return payload;
}
