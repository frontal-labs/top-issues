import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Octokit } from "@octokit/rest";
import { $ } from "bun";
import { z } from "zod";
import { env } from "./env";
import { buildSlackPayload, rankIssues } from "./report";
import {
  GitHubIssueSchema,
  type TopIssuesConfig,
  type TopIssuesResult,
} from "./types";
import { getDaysAgoDate, parseRepository } from "./utils";

export type {
  GitHubIssue,
  IssueWithReactions,
  SlackPayload,
  TopIssuesConfig,
  TopIssuesResult,
} from "./types";

const DEFAULT_DAYS = 30;
const DEFAULT_LIMIT = 5;
const DEFAULT_OUTPUT_DIR = "./output";
const PAYLOAD_FILE_NAME = "slack-payload.json";
// The search API caps results at 1000; 100 per page keeps requests to a minimum.
const SEARCH_PAGE_SIZE = 100;
const GIT_REMOTE_PATTERN = /[:/]([^/]+)\/([^/\s]+?)(?:\.git)?\s*$/;

async function getRepositoryFromGit(): Promise<string | undefined> {
  try {
    const remote = await $`git config --get remote.origin.url`.text();
    const match = GIT_REMOTE_PATTERN.exec(remote);
    return match ? `${match[1]}/${match[2]}` : undefined;
  } catch {
    return undefined;
  }
}

export async function createTopIssuesClient(config: TopIssuesConfig = {}) {
  const token = config.token || env.GH_TOKEN || env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GH_TOKEN or GITHUB_TOKEN environment variable is required",
    );
  }

  const repository =
    config.repository ||
    env.GH_REPOSITORY ||
    env.GITHUB_REPOSITORY ||
    (await getRepositoryFromGit());
  const parsed =
    parseRepository(repository) ??
    (config.owner && config.repo
      ? { owner: config.owner, repo: config.repo }
      : null);
  if (!parsed) {
    throw new Error(
      "Repository must be in owner/repo format (set GH_REPOSITORY or run inside a git checkout with an origin remote)",
    );
  }

  const { owner, repo } = parsed;
  const octokit = new Octokit({ auth: token });
  const days = config.days ?? DEFAULT_DAYS;
  const limit = config.limit ?? DEFAULT_LIMIT;

  async function fetchIssues() {
    const query = `repo:${owner}/${repo} is:issue is:open created:>=${getDaysAgoDate(days)}`;
    const items = await octokit.paginate(
      octokit.rest.search.issuesAndPullRequests,
      {
        q: query,
        sort: "created",
        order: "desc",
        per_page: SEARCH_PAGE_SIZE,
      },
    );
    return z.array(GitHubIssueSchema).parse(items);
  }

  async function generateReport(
    outputDir = DEFAULT_OUTPUT_DIR,
  ): Promise<TopIssuesResult> {
    const issues = rankIssues(await fetchIssues(), limit);
    const payload = buildSlackPayload(issues, days);
    await mkdir(outputDir, { recursive: true });
    await writeFile(
      join(outputDir, PAYLOAD_FILE_NAME),
      JSON.stringify(payload, null, 2),
    );
    return { issues, payload };
  }

  return { owner, repo, days, limit, generateReport };
}
