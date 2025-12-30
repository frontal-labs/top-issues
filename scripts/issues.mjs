#!/usr/bin/env bun

/// <reference path="../../bun.d.ts" />

import { join } from "@frontal/shared-tools/path-utils";
import { Octokit } from "@octokit/rest";

// Configuration constants
const NUM_OF_DAYS = 30;
const NUM_OF_ISSUES = 5;

// Get output directory from command line arguments or environment
const outputDir = process.argv[2] || process.env.OUTPUT_DIR || "./output";

// Validate environment variables
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) {
	console.error(
		"Error: GH_TOKEN or GITHUB_TOKEN environment variable is required",
	);
	process.exit(1);
}

// Get repository from environment or default to current repo
const repository = process.env.GH_REPOSITORY || process.env.GITHUB_REPOSITORY;
if (!repository?.includes("/")) {
	console.error("Error: GH_REPOSITORY must be in format owner/repo");
	process.exit(1);
}

const [owner, repo] = repository.split("/");

// Initialize GitHub client
const octokit = new Octokit({
	auth: token,
});

// Calculate date for search query
function getDaysAgoDate(days) {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
}

// Fetch issues using GitHub Search API
async function fetchIssues() {
	const daysAgo = getDaysAgoDate(NUM_OF_DAYS);
	const query = `repo:${owner}/${repo} is:issue is:open created:>=${daysAgo}`;

	try {
		const { data } = await octokit.rest.search.issuesAndPullRequests({
			q: query,
			sort: "created",
			order: "desc",
			per_page: 100, // Fetch more to ensure we have enough after filtering
		});

		return data.items;
	} catch (error) {
		console.error("Error fetching issues:", error.message);
		throw error;
	}
}

// Fetch reactions for an issue
async function fetchIssueReactions(issueNumber) {
	try {
		const { data } = await octokit.rest.reactions.listForIssue({
			owner,
			repo,
			issue_number: issueNumber,
		});

		// Count 👍 reactions (content: '+1')
		const thumbsUpCount = data.filter(
			(reaction) => reaction.content === "+1",
		).length;
		return thumbsUpCount;
	} catch (error) {
		// If reactions API fails, return 0
		console.warn(
			`Warning: Could not fetch reactions for issue #${issueNumber}:`,
			error.message,
		);
		return 0;
	}
}

// Fetch reactions for all issues
async function fetchReactionsForIssues(issues) {
	const issuesWithReactions = [];

	for (const issue of issues) {
		const thumbsUpCount = await fetchIssueReactions(issue.number);
		issuesWithReactions.push({
			...issue,
			thumbsUpCount,
		});
	}

	return issuesWithReactions;
}

// Generate Slack payload
function generateSlackPayload(issues) {
	const payload = {
		prelude: `Top ${issues.length} issues sorted by 👍 reactions (last ${NUM_OF_DAYS} days).\nNote: This GitHub workflow will run every Monday at 1PM UTC (9AM EST).`,
	};

	// Add each issue to the payload
	issues.forEach((issue, index) => {
		const issueNum = index + 1;
		payload[`issue${issueNum}URL`] = issue.html_url;
		payload[`issue${issueNum}Text`] =
			`👍 ${issue.thumbsUpCount}: ${issue.title}`;
	});

	return payload;
}

// Main execution
async function main() {
	try {
		console.log(`Fetching issues for ${owner}/${repo}...`);
		const issues = await fetchIssues();

		if (issues.length === 0) {
			console.log("No issues found in the specified time range.");
			// Still create an empty payload
			const payload = {
				prelude: `No issues found in the last ${NUM_OF_DAYS} days.`,
			};

			await Bun.mkdir(outputDir, { recursive: true });
			const payloadPath = join(outputDir, "slack-payload.json");
			await Bun.write(payloadPath, JSON.stringify(payload, null, 2));
			console.log(`✅ Report generated successfully at ${payloadPath}`);
			return;
		}

		console.log(`Found ${issues.length} issues. Fetching reactions...`);
		const issuesWithReactions = await fetchReactionsForIssues(issues);

		// Sort by thumbs up count (descending)
		issuesWithReactions.sort((a, b) => b.thumbsUpCount - a.thumbsUpCount);

		// Take top N issues
		const topIssues = issuesWithReactions.slice(0, NUM_OF_ISSUES);

		console.log("Generating Slack payload...");
		const payload = generateSlackPayload(topIssues);

		// Write payload to file using Bun.write (creates directories automatically)
		const payloadPath = join(outputDir, "slack-payload.json");
		await Bun.write(payloadPath, JSON.stringify(payload, null, 2));

		console.log(`✅ Report generated successfully at ${payloadPath}`);
		console.log("\nSummary:");
		console.log(`  • Total issues found: ${issues.length}`);
		console.log(`  • Top ${topIssues.length} issues by 👍 reactions:`);
		topIssues.forEach((issue, index) => {
			console.log(
				`    ${index + 1}. 👍 ${issue.thumbsUpCount}: ${issue.title}`,
			);
		});
	} catch (error) {
		console.error("Error generating report:", error);
		process.exit(1);
	}
}

main();
