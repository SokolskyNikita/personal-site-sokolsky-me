import { describe, expect, it } from "vitest";
import {
  AGENT_DISCOVERY_LINKS,
  handleAgentDiscovery,
  withAgentDiscoveryHeaders,
} from "../agent-discovery";

describe("agent discovery", () => {
  it("negotiates a Markdown homepage", async () => {
    const response = await handleAgentDiscovery(
      new Request("https://sokolsky.me/", {
        headers: { Accept: "text/markdown, text/html;q=0.8" },
      }),
    );

    expect(response?.headers.get("content-type")).toContain("text/markdown");
    expect(response?.headers.get("vary")).toBe("Accept");
    expect(response?.headers.get("link")).toBe(AGENT_DISCOVERY_LINKS);
    expect(await response?.text()).toContain("# Nikita Sokolsky");
  });

  it("does not negotiate an explicitly unacceptable Markdown variant", async () => {
    const response = await handleAgentDiscovery(
      new Request("https://sokolsky.me/", {
        headers: { Accept: "text/markdown;q=0, text/html" },
      }),
    );

    expect(response).toBeNull();
  });

  it("publishes a valid API catalog", async () => {
    const response = await handleAgentDiscovery(
      new Request("https://sokolsky.me/.well-known/api-catalog"),
    );
    const body = (await response?.json()) as {
      linkset: Array<Record<string, unknown>>;
    };

    expect(response?.headers.get("content-type")).toContain(
      "application/linkset+json",
    );
    expect(body.linkset[0]?.anchor).toBe("https://sokolsky.me/api");
    expect(body.linkset[0]?.["service-desc"]).toBeDefined();
    expect(body.linkset[0]?.["service-doc"]).toBeDefined();
  });

  it("publishes a digest for the advertised skill", async () => {
    const response = await handleAgentDiscovery(
      new Request(
        "https://sokolsky.me/.well-known/agent-skills/index.json",
      ),
    );
    const body = (await response?.json()) as {
      $schema: string;
      skills: Array<{ digest: string }>;
    };

    expect(body.$schema).toBe(
      "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    );
    expect(body.skills[0]?.digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("adds discovery links to HTML asset responses", () => {
    const response = withAgentDiscoveryHeaders(
      new Response("<h1>Hello</h1>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }),
      "/",
    );

    expect(response.headers.get("link")).toBe(AGENT_DISCOVERY_LINKS);
    expect(response.headers.get("content-signal")).toContain("ai-input=yes");
    expect(response.headers.get("vary")).toContain("Accept");
  });
});
