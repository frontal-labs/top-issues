import { z } from "zod";

// The subset of a GitHub issue search result this tool reads.
export const GitHubIssueSchema = z.object({
  html_url: z.string(),
  number: z.number(),
  reactions: z.object({ "+1": z.number() }).optional(),
  title: z.string(),
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
  days?: number;
  limit?: number;
  owner?: string;
  repo?: string;
  repository?: string;
  token?: string;
}

export interface TopIssuesResult {
  issues: IssueWithReactions[];
  payload: SlackPayload;
}
