import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Top-level and nested (media/container) rule bodies for a selector. */
function ruleBodies(css: string, selector: string): string[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, "g");
  const bodies: string[] = [];
  for (const match of stripComments(css).matchAll(re)) {
    bodies.push(match[1] ?? "");
  }
  return bodies;
}

function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const chunk of body.split(";")) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    out[trimmed.slice(0, colon).trim()] = trimmed.slice(colon + 1).trim();
  }
  return out;
}

describe("flight route timeline layout invariants", () => {
  const css = readFileSync(
    join(root, "src/styles/flights-search.css"),
    "utf8",
  );
  const app = readFileSync(
    join(root, "src/components/flights/search-app.ts"),
    "utf8",
  );

  it("never caps hop width — that leaves a gap after layover chips", () => {
    const hops = ruleBodies(css, ".fs-route-flight");
    expect(hops.length).toBeGreaterThan(0);
    for (const body of hops) {
      expect(declarations(body).maxWidth ?? declarations(body)["max-width"]).toBeUndefined();
      expect(body).not.toMatch(/max-width\s*:/);
    }
  });

  it("shrink-wraps layover units so leftover width cannot sit after the chip", () => {
    const flexRules = ruleBodies(css, ".fs-route-unit")
      .map(declarations)
      .filter((d) => d.flex);
    expect(flexRules.length).toBeGreaterThan(0);
    expect(flexRules[0]!.flex).toMatch(/^0\s+1\s+/);
    for (const rule of flexRules) {
      expect(rule.flex, "layover units must not grow").toMatch(/^0\s+/);
    }
  });

  it("lets only the last hop unit grow to fill the row", () => {
    const last = ruleBodies(css, ".fs-route-unit:last-child");
    expect(last.length).toBeGreaterThan(0);
    expect(declarations(last[0]!).flex).toMatch(/^1\s+1\s+/);
  });

  it("keeps stops and ends from absorbing extra width", () => {
    expect(declarations(ruleBodies(css, ".fs-route-stop")[0]!).flex).toBe("none");
    expect(declarations(ruleBodies(css, ".fs-route-end")[0]!).flex).toBe("none");
  });

  it("renders hop before the following airport inside each unit", () => {
    expect(app).toMatch(
      /<span class="fs-route-unit">\s*\$\{hop\}\s*<span class="fs-route-stop"/,
    );
    expect(app).toMatch(
      /<span class="fs-route-unit">\s*\$\{hop\}\s*<span class="fs-route-end"/,
    );
  });
});
