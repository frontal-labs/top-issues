import { z } from "zod";

// The subset of a GitHub issue search result this tool reads.
export const GitHubIssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  html_url: z.string(),
  reactions: z.object({ "+1": z.number() }).optional(),
});

export type GitHubIssue = z.infer<typeof GitHubIssueSchema>;

export type IssueWithReactions = Pick<
  GitHubIssue,
  "number" | "title" | "html_url"
> & {
  thumbsUpCount: number;
};

export type SlackPayload = { prelude: string } & Record<string, string>;

export interface TopIssuesConfig {
  token?: string;
  repository?: string;
  owner?: string;
  repo?: string;
  days?: number;
  limit?: number;
}

export interface TopIssuesResult {
  issues: IssueWithReactions[];
  payload: SlackPayload;
}
