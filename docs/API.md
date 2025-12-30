# Top Issues API Documentation

This document provides detailed API documentation for the `@frontal/top-issues` tool.

## Overview

The top-issues tool fetches GitHub issues, analyzes their reactions, and generates Slack-compatible payloads for automated reporting.

## Configuration

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GH_TOKEN` | Yes | GitHub personal access token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_TOKEN` | Yes | Alternative name for GitHub token | `ghp_xxxxxxxxxxxx` |
| `GH_REPOSITORY` | No | Repository in format `owner/repo` | `vercel/turbo` |
| `GITHUB_REPOSITORY` | No | Alternative name for repository | `vercel/turbo` |

### Script Parameters

The script accepts one command-line argument:

```bash
bun scripts/issues.mjs <output-directory>
```

- `output-directory`: Path where the `slack-payload.json` file will be written

### Configuration Constants

Edit `scripts/issues.mjs` to customize:

```javascript
const NUM_OF_DAYS = 30;    // Time range for issue search (default: 30)
const NUM_OF_ISSUES = 5;   // Number of top issues to return (default: 5)
```

## Functions

### `getDaysAgoDate(days: number): string`

Calculates a date string for a specified number of days ago.

**Parameters:**
- `days`: Number of days to go back

**Returns:** ISO date string (YYYY-MM-DD format)

**Example:**
```javascript
const daysAgo = getDaysAgoDate(30);
// Returns: "2024-01-15" (30 days ago from today)
```

### `fetchIssues(): Promise<GitHubIssue[]>`

Fetches open issues from GitHub using the search API.

**Returns:** Promise resolving to an array of GitHub issues

**Example:**
```javascript
const issues = await fetchIssues();
console.log(`Found ${issues.length} issues`);
```

### `fetchIssueReactions(issueNumber: number): Promise<number>`

Fetches reactions for a specific issue and counts 👍 reactions.

**Parameters:**
- `issueNumber`: The issue number

**Returns:** Promise resolving to the count of 👍 reactions

**Example:**
```javascript
const thumbsUpCount = await fetchIssueReactions(123);
console.log(`Issue #123 has ${thumbsUpCount} 👍 reactions`);
```

### `fetchReactionsForIssues(issues: GitHubIssue[]): Promise<IssueWithReactions[]>`

Fetches reactions for multiple issues in sequence.

**Parameters:**
- `issues`: Array of GitHub issues

**Returns:** Promise resolving to issues with reaction counts

**Example:**
```javascript
const issuesWithReactions = await fetchReactionsForIssues(issues);
```

### `generateSlackPayload(issues: IssueWithReactions[]): SlackPayload`

Generates a Slack-compatible payload from analyzed issues.

**Parameters:**
- `issues`: Array of issues with reaction counts (sorted by thumbs up count)

**Returns:** Slack payload object

**Example:**
```javascript
const payload = generateSlackPayload(topIssues);
// {
//   prelude: "Top 5 issues...",
//   issue1URL: "https://...",
//   issue1Text: "👍 42: Issue title",
//   ...
// }
```

## Data Types

### `GitHubIssue`

```typescript
interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  html_url: string;
}
```

### `IssueWithReactions`

```typescript
interface IssueWithReactions extends GitHubIssue {
  thumbsUpCount: number;
}
```

### `SlackPayload`

```typescript
interface SlackPayload {
  prelude: string;
  issue1URL?: string;
  issue1Text?: string;
  issue2URL?: string;
  issue2Text?: string;
  // ... up to issue5URL and issue5Text
}
```

## Error Handling

The tool handles various error scenarios:

1. **Missing Token**: Exits with error if `GH_TOKEN` or `GITHUB_TOKEN` is not set
2. **Invalid Repository**: Exits with error if repository format is invalid
3. **Missing Output Directory**: Exits with error if output directory argument is missing
4. **API Errors**: Logs warnings for reaction API failures but continues processing
5. **No Issues Found**: Generates an empty payload with a message

## Rate Limiting

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests/hour
- **Unauthenticated requests**: 60 requests/hour

The tool makes:
- 1 request to search issues
- N requests to fetch reactions (one per issue)

For 100 issues, this requires 101 requests, well within authenticated limits.

## Best Practices

1. **Use GitHub Actions Token**: In CI/CD, use `${{ secrets.GITHUB_TOKEN }}` which has appropriate permissions
2. **Cache Results**: Consider caching results to reduce API calls
3. **Error Handling**: Always check for errors and handle gracefully
4. **Logging**: Use console.log for progress updates
5. **Testing**: Test with a small repository first before running on large repos

## Examples

See the `examples/` directory for:
- Example output files
- GitHub Actions workflows
- Usage scripts

