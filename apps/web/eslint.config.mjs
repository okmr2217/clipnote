import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `wrangler types`が生成する型定義（development.md参照）。14000行超の
    // 生成物で、先頭の`/* eslint-disable */`だけではパース自体は避けられず
    // lintが大幅に遅くなるため、next-env.d.ts同様に除外する。
    "cloudflare-env.d.ts",
  ]),
]);

export default eslintConfig;
