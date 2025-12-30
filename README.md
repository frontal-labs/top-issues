# @frontal/top-issues

An internal tool that automates issue tracking and reporting by fetching top issues from GitHub repositories and generating Slack-compatible payloads for automated notifications.

## Purpose

This tool is designed to:
- **Surface high-engagement issues** from GitHub repositories
- **Automate community reporting** through scheduled GitHub Actions
- **Provide insights** into popular topics and community concerns
- **Streamline issue prioritization** based on user reactions

## Features

- **Smart Issue Filtering**: Fetches open issues from the last 30 days
- **Reaction-based Sorting**: Prioritizes issues by 👍 reaction count
- **Slack Integration**: Generates formatted payloads for Slack notifications
- **Configurable Parameters**: Customizable time range and issue count
- **GitHub Actions Ready**: Designed for automated workflows

## Installation

This package uses Bun as the runtime and package manager:

```bash
# Install dependencies
bun install
```

## Usage

### Command Line

```bash
# Basic usage
bun scripts/issues.mjs <output-directory>

# Example
bun scripts/issues.mjs ./output
```

### GitHub Actions Integration

```yaml
# .github/workflows/top-issues.yml
name: Top Issues Report
on:
  schedule:
    - cron: '0 13 * * 1'  # Every Monday at 1PM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest
      - name: Install dependencies
        run: bun install
        
      - name: Generate top issues report
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: bun tools/top-issues/scripts/issues.mjs ./output
        
      - name: Post to Slack
        uses: 8398a7/action-slack@v3
        with:
          status: success
          payload_file_path: ./output/slack-payload.json
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GH_TOKEN` | Yes | GitHub personal access token or Actions token |
| `GH_REPOSITORY` | No | Repository in format `owner/repo` (defaults to current repo) |

### Parameters

The following constants can be modified in `scripts/issues.mjs`:

```javascript
const NUM_OF_DAYS = 30;    // Time range for issue search
const NUM_OF_ISSUES = 5;   // Number of top issues to fetch
```

### Output Format

The tool generates a `slack-payload.json` file with the following structure:

```json
{
  "prelude": "Top 5 issues sorted by 👍 reactions (last 30 days).\nNote: This GitHub workflow will run every Monday at 1PM UTC (9AM EST).",
  "issue1URL": "https://github.com/owner/repo/issues/123",
  "issue1Text": "👍 42: Add support for custom plugins",
  "issue2URL": "https://github.com/owner/repo/issues/456",
  "issue2Text": "👍 28: Improve error handling in build process"
}
```

## Customization

### Multi-Repository Support

To analyze multiple repositories, modify the search query:

```javascript
// In scripts/issues.mjs
const REPOSITORIES = [
  'vercel/turbo',
  'frontal/frontal-core',
  'frontal/frontal-ui'
];

// Update the search query
const query = REPOSITORIES.map(repo => `repo:${repo}`).join(' ') + 
              ` is:issue is:open created:>=${daysAgo}`;
```

### Custom Filtering

Add additional filters to the search query:

```javascript
// Filter by labels
q: `repo:${OWNER}/${REPO} is:issue is:open created:>=${daysAgo} label:bug`,

// Filter by assignee
q: `repo:${OWNER}/${REPO} is:issue is:open created:>=${daysAgo} assignee:username`,

// Filter by milestone
q: `repo:${OWNER}/${REPO} is:issue is:open created:>=${daysAgo} milestone:"v2.0"`,
```

## Development

### Scripts

```bash
# Run tests
bun test

# Generate issues report
bun run generate
```

### Manual Testing

```bash
# Test with a specific repository
GH_REPOSITORY=vercel/turbo bun scripts/issues.mjs ./test-output

# Verify output
cat ./test-output/slack-payload.json
```

## Troubleshooting

### Common Issues

**Error: "GITHUB_TOKEN not set"**
- Ensure the `GITHUB_TOKEN` environment variable is properly configured
- For GitHub Actions, use `${{ secrets.GITHUB_TOKEN }}`

**Error: "Pass a directory to write the slack payload in"**
- Provide an output directory as a command line argument
- Ensure the directory exists and is writable

**No issues found**
- Check if the repository has open issues in the specified time range
- Verify the repository name and permissions

### Debug Mode

Enable verbose logging by adding debug statements:

```javascript
// In scripts/issues.mjs
console.log('Search query:', `repo:${owner}/${repo} is:issue is:open created:>=${daysAgo}`);
console.log('Found issues:', issues.map(issue => ({
  title: issue.title,
  reactions: issue.thumbsUpCount,
  url: issue.html_url
})));
```

## Reference

- [Code of Conduct](../../docs/CODE_OF_CONDUCT.md)
- [Contributing Guidelines](../../docs/CONTRIBUTING.md)
- [License](../../LICENSE)

