import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    GH_REPOSITORY: z.string().optional(),
    GH_TOKEN: z.string().optional(),
    GITHUB_REPOSITORY: z.string().optional(),
    GITHUB_TOKEN: z.string().optional(),
    OUTPUT_DIR: z.string().optional(),
  },
});
