#!/bin/bash

# Example usage script for top-issues tool
# This script demonstrates how to use the tool in various scenarios

set -e

echo "=== Top Issues Tool Usage Examples ==="
echo ""

# Example 1: Basic usage with default repository
echo "Example 1: Generate report for current repository"
echo "----------------------------------------"
export GH_TOKEN="${GITHUB_TOKEN:-your-token-here}"
export GH_REPOSITORY="${GITHUB_REPOSITORY:-owner/repo}"
node scripts/issues.mjs ./output
echo "Report generated at ./output/slack-payload.json"
echo ""

# Example 2: Generate report for specific repository
echo "Example 2: Generate report for specific repository"
echo "----------------------------------------"
export GH_REPOSITORY="vercel/turbo"
node scripts/issues.mjs ./output-vercel
echo "Report generated at ./output-vercel/slack-payload.json"
echo ""

# Example 3: Test with different time ranges
echo "Example 3: Customize time range (modify NUM_OF_DAYS in script)"
echo "----------------------------------------"
echo "To change the time range, edit scripts/issues.mjs:"
echo "  const NUM_OF_DAYS = 7;  // Last 7 days instead of 30"
echo ""

# Example 4: View the generated payload
echo "Example 4: View generated payload"
echo "----------------------------------------"
if [ -f "./output/slack-payload.json" ]; then
  cat ./output/slack-payload.json | jq .
else
  echo "No output file found. Run Example 1 first."
fi
echo ""

# Example 5: Integration with Slack webhook
echo "Example 5: Send to Slack webhook"
echo "----------------------------------------"
if [ -f "./output/slack-payload.json" ] && [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data @./output/slack-payload.json \
    "$SLACK_WEBHOOK_URL"
  echo "Payload sent to Slack"
else
  echo "Set SLACK_WEBHOOK_URL environment variable to send to Slack"
fi
echo ""

echo "=== Examples Complete ==="

