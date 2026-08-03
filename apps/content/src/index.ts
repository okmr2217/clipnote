import { Hono } from "hono";

const app = new Hono();

app.get("*", (c) => {
  return c.text("Clipnote content worker — not yet implemented", 501);
});

export default app;
