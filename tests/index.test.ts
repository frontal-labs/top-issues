import { describe, expect, test } from "bun:test";

describe("Top Issues", () => {
	test("sanity check", () => {
		expect(1 + 1).toBe(2);
	});

	test("environment check", () => {
		expect(process.env.NODE_ENV).toBeDefined();
	});
});
