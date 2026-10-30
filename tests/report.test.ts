import { describe, expect, test } from "bun:test";
import { buildSlackPayload, rankIssues } from "../src/report";
import type { GitHubIssue } from "../src/types";

function issue(number: number, thumbsUp: number | undefined): GitHubIssue {
  return {
    number,
    title: `Issue ${number}`,
    html_url: `https://github.com/owner/repo/issues/${number}`,
    reactions: thumbsUp === undefined ? undefined : { "+1": thumbsUp },
  };
}

describe("rankIssues", () => {
  test("sorts by +1 reactions descending and keeps the limit", () => {
    const ranked = rankIssues([issue(1, 2), issue(2, 9), issue(3, 5)], 2);
    expect(ranked.map((i) => i.number)).toEqual([2, 3]);
    expect(ranked.map((i) => i.thumbsUpCount)).toEqual([9, 5]);
  });

  test("treats missing reactions as zero", () => {
    const ranked = rankIssues([issue(1, undefined), issue(2, 1)], 5);
    expect(ranked.map((i) => i.thumbsUpCount)).toEqual([1, 0]);
  });

  test("drops fields the payload does not use", () => {
    const [first] = rankIssues([issue(7, 3)], 1);
    expect(Object.keys(first).sort()).toEqual([
      "html_url",
      "number",
      "thumbsUpCount",
      "title",
    ]);
  });
});

describe("buildSlackPayload", () => {
  test("reports an empty result with a single prelude", () => {
    expect(buildSlackPayload([], 30)).toEqual({
      prelude: "No issues found in the last 30 days.",
    });
  });

  test("numbers issue URL and text pairs from 1", () => {
    const payload = buildSlackPayload(
      rankIssues([issue(4, 6), issue(5, 2)], 5),
      14,
    );
    expect(payload.prelude).toStartWith(
      "Top 2 issues sorted by +1 reactions (last 14 days).",
    );
    expect(payload.issue1URL).toBe("https://github.com/owner/repo/issues/4");
    expect(payload.issue1Text).toBe("+1 6: Issue 4");
    expect(payload.issue2URL).toBe("https://github.com/owner/repo/issues/5");
    expect(payload.issue2Text).toBe("+1 2: Issue 5");
    expect(payload.issue3URL).toBeUndefined();
  });
});
