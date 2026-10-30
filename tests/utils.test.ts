import { describe, expect, test } from "bun:test";
import { getDaysAgoDate, parseRepository } from "../src/utils";

describe("getDaysAgoDate", () => {
  test("returns the UTC calendar date N days before now", () => {
    const now = new Date("2026-03-15T23:30:00Z");
    expect(getDaysAgoDate(30, now)).toBe("2026-02-13");
  });

  test("returns today for zero days", () => {
    const now = new Date("2026-03-15T08:00:00Z");
    expect(getDaysAgoDate(0, now)).toBe("2026-03-15");
  });
});

describe("parseRepository", () => {
  test("splits owner/repo", () => {
    expect(parseRepository("frontal-labs/top-issues")).toEqual({
      owner: "frontal-labs",
      repo: "top-issues",
    });
  });

  test.each([undefined, "", "no-slash", "/repo", "owner/", "a/b/c"])(
    "rejects %p",
    (input) => {
      expect(parseRepository(input)).toBeNull();
    },
  );
});
