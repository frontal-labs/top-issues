# Top Issues API Documentation

This document describes the public API of `@frontal-labs/top-issues`.

## Overview

The tool fetches open GitHub issues created in a time window, ranks them by their +1 reactions, and writes a Slack-compatible `slack-payload.json`.

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GH_TOKEN` | Yes* | GitHub token with read access to issues | `ghp_xxxxxxxxxxxx` |
| `GITHUB_TOKEN` | Yes* | Alternative name for the GitHub token | `ghp_xxxxxxxxxxxx` |
| `GH_REPOSITORY` | No | Repository in `owner/repo` format | `vercel/turbo` |
| `GITHUB_REPOSITORY` | No | Alternative name for the repository | `vercel/turbo` |
| `OUTPUT_DIR` | No | Output directory when no CLI argument is given | `./output` |

\* One of `GH_TOKEN` or `GITHUB_TOKEN` must be set.

When no repository is set through the environment, it is read from the `origin` git remote.

### CLI

```bash
bun src/cli.ts <output-directory>
```

Writes `<output-directory>/slack-payload.json`.

## Programmatic API

### `createTopIssuesClient(config?: TopIssuesConfig)`

Creates a client bound to one repository. Throws if no token or no valid `owner/repo` can be resolved.

| Option | Default | Description |
|--------|---------|-------------|
| `token` | `GH_TOKEN` / `GITHUB_TOKEN` | GitHub token |
| `repository` | `GH_REPOSITORY` / `GITHUB_REPOSITORY` / git remote | `owner/repo` |
| `owner`, `repo` | — | Used when `repository` is not set |
| `days` | `30` | How many days back to search for issues created |
| `limit` | `5` | How many top issues to keep |

Returns `{ owner, repo, days, limit, generateReport }`.

### `generateReport(outputDir?: string): Promise<TopIssuesResult>`

Searches open issues created in the last `days` days, counts their +1 reactions, keeps the top `limit`, writes `slack-payload.json` into `outputDir` (default `./output`), and returns the ranked issues and the payload.

```typescript
const client = await createTopIssuesClient({ repository: "owner/repo", days: 30, limit: 5 });
const { issues, payload } = await client.generateReport("./output");
```

## Pure helpers

These are exported from their modules and have no network or filesystem access.

- `getDaysAgoDate(days: number, now?: Date): string` — UTC `YYYY-MM-DD` for `days` before `now`.
- `parseRepository(repo?: string): { owner, repo } | null` — parses `owner/repo`.
- `rankIssues(issues: GitHubIssue[], limit: number): IssueWithReactions[]` — counts `+1` (missing counts as 0), sorts descending, keeps `limit`.
- `buildSlackPayload(issues: IssueWithReactions[], days: number): SlackPayload` — builds the payload.

## Data Types

```typescript
interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  reactions?: { "+1": number };
}

type IssueWithReactions = Pick<GitHubIssue, "number" | "title" | "html_url"> & {
  thumbsUpCount: number;
};

type SlackPayload = { prelude: string } & Record<string, string>;
// e.g. { prelude, issue1URL, issue1Text, issue2URL, issue2Text, ... }
```

`GitHubIssue` is validated with zod at the GitHub response boundary; a response that does not match throws.

## Error Handling

- **Missing token**: `GH_TOKEN or GITHUB_TOKEN environment variable is required`
- **Invalid repository**: `Repository must be in owner/repo format ...`
- **GitHub API errors** (auth, rate limit, unknown repository): thrown from `generateReport`; the CLI prints them and exits with code 1.
- **No matching issues**: the payload is `{ "prelude": "No issues found in the last N days." }`.

## Rate Limiting

The tool makes one paginated search request per 100 matching issues (the search API returns at most 1000 results). Reaction counts come from the search results themselves, so no per-issue requests are made.

## Testing

```bash
bun run test        # bun test
bun run typecheck   # tsc --noEmit
bun run lint        # biome ci .
```
