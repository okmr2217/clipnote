import path from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig, defineProject, mergeConfig } from "vitest/config";

export default defineConfig(async () => {
  const migrationsPath = path.join(import.meta.dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return mergeConfig(
    defineConfig({}),
    defineProject({
      plugins: [
        cloudflareTest({
          wrangler: { configPath: "./wrangler.jsonc" },
          miniflare: {
            // Test-only binding so the setup file can apply migrations
            // before each test file runs.
            bindings: { TEST_MIGRATIONS: migrations },
          },
        }),
      ],
      test: {
        setupFiles: ["./test/apply-migrations.ts"],
      },
    }),
  );
});
