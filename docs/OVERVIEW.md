# Top Issues Documentation

This directory contains comprehensive documentation for the `@frontal/top-issues` tool.

## Overview

The top-issues tool automates issue tracking and reporting by fetching top issues from GitHub repositories, prioritizing them by user engagement (reactions), and generating Slack-compatible payloads for automated notifications.

## Documentation Structure

### [`API.md`](./API.md)

Complete API reference documentation covering:
- Command line options
- GitHub API integration
- Issue filtering and sorting logic
- Slack payload generation
- Configuration options

### [`../README.md`](../README.md)

Getting started guide with:
- Quick start instructions
- Usage examples
- GitHub Actions integration
- Configuration details

### [`../examples/`](../examples/)

Practical examples:
- GitHub Actions workflows
- Slack integration examples
- Output format examples

## Key Concepts

### Issue Prioritization

Issues are prioritized by:
- **Reaction count**: 👍 reactions indicate community interest
- **Recency**: Recently created issues are prioritized
- **Status**: Only open issues are considered

### Time Range Filtering

By default, the tool fetches issues from the last 30 days:
- Configurable via `NUM_OF_DAYS` constant
- Focuses on recent, active issues
- Prevents stale issues from dominating reports

### Slack Integration

Generates formatted payloads for Slack notifications:
- Pre-configured format for Slack webhooks
- Includes issue URLs and descriptions
- Ready for automated posting via GitHub Actions

## Common Use Cases

### 1. Weekly Issue Reports

Schedule weekly reports to surface top community concerns:

```yaml
on:
  schedule:
    - cron: '0 13 * * 1'  # Every Monday at 1PM UTC
```

### 2. Manual Issue Tracking

Generate reports on-demand for issue triage sessions:

```bash
node scripts/issues.mjs ./output
```

### 3. Multi-Repository Monitoring

Monitor issues across multiple repositories by modifying the search query.

## Best Practices

1. **Regular scheduling**: Set up weekly or daily reports
2. **Review promptly**: Address high-engagement issues quickly
3. **Engage community**: Respond to issues with high reaction counts
4. **Track trends**: Monitor issue patterns over time
5. **Customize thresholds**: Adjust time ranges and issue counts based on repository activity

## Troubleshooting

### Common Issues

**"GITHUB_TOKEN not set"**
- Ensure token is configured in GitHub Actions secrets
- Use `GITHUB_TOKEN` environment variable

**"No issues found"**
- Check repository has open issues in time range
- Verify repository name and permissions
- Adjust `NUM_OF_DAYS` if needed

## Related Tools

- **top-pull-requests**: Similar tool for pull request tracking
- GitHub Issues API: Provides the underlying data

## Quick Links

- [Main README](../README.md) - Getting started guide
- [API Reference](./API.md) - Complete API documentation
- [Examples](../examples/) - Usage examples and workflows
