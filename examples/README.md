# Top Issues Examples

This directory contains example files and usage patterns for the `@frontal/top-issues` tool.

## Files

### `example-output.json`

Example Slack payload output that the tool generates. This shows the structure and format of the JSON file created by the script.

**Usage:**
```bash
# After running the tool, compare your output with this example
diff ./output/slack-payload.json examples/example-output.json
```

### `github-actions-workflow.yml`

Complete GitHub Actions workflow configuration for automated issue reporting.

**Features:**
- Scheduled runs every Monday at 1PM UTC
- Manual trigger support
- Artifact upload for report storage
- Slack integration

**Setup:**
1. Copy this file to `.github/workflows/top-issues.yml`
2. Add `SLACK_WEBHOOK_URL` to your repository secrets
3. The workflow will automatically use `GITHUB_TOKEN` for authentication

### `usage-example.sh`

Bash script demonstrating various usage scenarios.

**Scenarios covered:**
1. Basic usage with default repository
2. Generating report for specific repository
3. Customizing time ranges
4. Viewing generated payload
5. Integration with Slack webhook

**Usage:**
```bash
# Make sure you have a GitHub token set
export GH_TOKEN="your-token-here"
export GH_REPOSITORY="owner/repo"

# Run the examples
./examples/usage-example.sh
```

## Integration Examples

### Slack Webhook Integration

```bash
# Generate the report
node scripts/issues.mjs ./output

# Send to Slack
curl -X POST -H 'Content-type: application/json' \
  --data @./output/slack-payload.json \
  "$SLACK_WEBHOOK_URL"
```

### GitHub Actions Integration

See `github-actions-workflow.yml` for a complete example. The workflow:
- Runs on a schedule (Mondays at 1PM UTC)
- Can be manually triggered
- Uploads the report as an artifact
- Posts to Slack automatically

### Custom Time Ranges

Edit `scripts/issues.mjs` to change the time range:

```javascript
const NUM_OF_DAYS = 7;  // Last 7 days instead of 30
```

### Multiple Repositories

To analyze multiple repositories, modify the script to loop through them:

```javascript
const REPOSITORIES = [
  'vercel/turbo',
  'frontal/frontal-core',
  'frontal/frontal-ui'
];

for (const repo of REPOSITORIES) {
  const [owner, repoName] = repo.split('/');
  // Process each repository
}
```

## Testing

Use the example output to verify your setup:

```bash
# Generate a test report
GH_TOKEN="your-token" GH_REPOSITORY="test/repo" \
  node scripts/issues.mjs ./test-output

# Compare with example
cat ./test-output/slack-payload.json | jq .
```

## Troubleshooting

### No Issues Found

If the report shows no issues:
- Check the time range (`NUM_OF_DAYS`)
- Verify the repository has open issues
- Ensure the GitHub token has proper permissions

### API Rate Limits

If you hit rate limits:
- Use an authenticated token (5,000 requests/hour)
- Reduce the number of issues fetched
- Add delays between API calls

### Invalid Output

If the output format is incorrect:
- Check the example output file
- Verify all required fields are present
- Ensure JSON is valid

## Related Documentation

- [Main README](../README.md) - Tool overview and usage
- [API Documentation](../docs/API.md) - Detailed API reference
- [Tests](../tests/) - Test files and examples

