import { describe, expect, it } from "vitest";
import worker, { type Env } from "../worker";

function assetEnv(response: Response): Env {
  return { ASSETS: { fetch: async () => response } } as unknown as Env;
}

describe("markdown assets", () => {
  it("labels the CV Markdown as UTF-8 so non-ASCII characters survive", async () => {
    const response = await worker.fetch(
      new Request("https://sokolsky.me/files/Sokolsky-Nikita-CV-2026-Short.md"),
      assetEnv(
        new Response("Seattle, WA · sokolx@gmail.com", {
          headers: { "Content-Type": "text/markdown" },
        }),
      ),
    );

    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await response.text()).toContain("·");
  });

  it("keeps a charset the asset server already set", async () => {
    const response = await worker.fetch(
      new Request("https://sokolsky.me/files/missing.md"),
      assetEnv(
        new Response("<h1>Not found</h1>", {
          status: 404,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }),
      ),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe(
      "text/html; charset=utf-8",
    );
  });
});
