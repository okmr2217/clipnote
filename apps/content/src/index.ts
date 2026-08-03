export default {
  async fetch(): Promise<Response> {
    return new Response("Clipnote content worker — not yet implemented", {
      status: 501,
      headers: { "content-type": "text/plain" },
    });
  },
} satisfies ExportedHandler;
