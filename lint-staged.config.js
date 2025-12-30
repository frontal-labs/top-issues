export default {
	"*.{js,ts,cjs,mjs,d.cts,d.mts,json,jsonc}": [
		"bunx @biomejs/biome check --write --no-errors-on-unmatched",
	],
};
