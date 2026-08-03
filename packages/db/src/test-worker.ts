// Placeholder entrypoint required by wrangler/vitest-pool-workers to boot a
// runtime around the D1 binding. This package has no HTTP surface of its
// own — real apps (apps/web, apps/mcp) own their own worker entrypoints.
export default {
  async fetch() {
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler;
