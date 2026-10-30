#!/usr/bin/env bun

import { join } from "node:path";
import { env } from "./env";
import { createTopIssuesClient } from "./index";

const outputDir = process.argv[2] || env.OUTPUT_DIR || "./output";

async function main() {
  try {
    const client = await createTopIssuesClient();
    console.log(`Fetching issues for ${client.owner}/${client.repo}...`);
    const { issues } = await client.generateReport(outputDir);
    console.log(
      `OK Report generated successfully at ${join(outputDir, "slack-payload.json")}`,
    );
    if (issues.length === 0) {
      console.log("No issues found in the specified time range.");
      return;
    }
    console.log("\nSummary:");
    console.log(`  • Top ${issues.length} issues by +1 reactions:`);
    issues.forEach((issue, index) => {
      console.log(
        `    ${index + 1}. +1 ${issue.thumbsUpCount}: ${issue.title}`,
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error generating report:", message);
    process.exit(1);
  }
}

await main();
