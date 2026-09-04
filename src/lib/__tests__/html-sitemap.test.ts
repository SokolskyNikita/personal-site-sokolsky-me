import { describe, expect, it } from "vitest";
import {
  collectSitemapEntries,
  filePathToRoute,
  isArgentinaOrAriPath,
} from "../html-sitemap";

describe("isArgentinaOrAriPath", () => {
  it("matches Argentina, Buenos Aires, AR, and Ari path segments", () => {
    expect(isArgentinaOrAriPath("/argentina/kavanagh/")).toBe(true);
    expect(isArgentinaOrAriPath("/culture/argentina/female-archetypes/")).toBe(
      true,
    );
    expect(isArgentinaOrAriPath("/apartments/buenos-aires/")).toBe(true);
    expect(isArgentinaOrAriPath("/doctors/ba-dentists/")).toBe(true);
    expect(isArgentinaOrAriPath("/furniture/ar-beds/")).toBe(true);
    expect(isArgentinaOrAriPath("/misc/ar-status-regularization/")).toBe(true);
    expect(isArgentinaOrAriPath("/apartments/palermo/")).toBe(true);
    expect(isArgentinaOrAriPath("/skincare/ari-match-tool/")).toBe(true);
    expect(isArgentinaOrAriPath("/skincare/current-ari-list/")).toBe(true);
    expect(isArgentinaOrAriPath("/restaurants/lincoln/")).toBe(true);
  });

  it("leaves unrelated pages on the public sitemap", () => {
    expect(isArgentinaOrAriPath("/")).toBe(false);
    expect(isArgentinaOrAriPath("/travel/best-of-arctic/")).toBe(false);
    expect(isArgentinaOrAriPath("/travel/best-of-south-america/")).toBe(false);
    expect(isArgentinaOrAriPath("/health/army-bf-calc/")).toBe(false);
    expect(isArgentinaOrAriPath("/love/levels/")).toBe(false);
    expect(isArgentinaOrAriPath("/barbers/")).toBe(false);
    expect(isArgentinaOrAriPath("/car-rental/search/")).toBe(false);
    expect(isArgentinaOrAriPath("/restaurants/asuncion/")).toBe(false);
  });
});

describe("filePathToRoute", () => {
  it("maps page files from both pages-dir and lib-relative globs", () => {
    expect(filePathToRoute("./argentina/kavanagh.astro")).toBe(
      "/argentina/kavanagh/",
    );
    expect(filePathToRoute("../pages/skincare/ari-match-tool.astro")).toBe(
      "/skincare/ari-match-tool/",
    );
    expect(filePathToRoute("./travel/index.astro")).toBe("/travel/");
  });

  it("drops private, sitemap, 404, and dynamic routes", () => {
    expect(filePathToRoute("./private/nuno-review.astro")).toBeNull();
    expect(filePathToRoute("./sitemap.astro")).toBeNull();
    expect(filePathToRoute("./sitemap-ar.astro")).toBeNull();
    expect(filePathToRoute("./404.astro")).toBeNull();
    expect(filePathToRoute("./blog/[slug].astro")).toBeNull();
  });
});

describe("collectSitemapEntries", () => {
  const pageSources = {
    "./argentina/kavanagh.astro": `const pageTitle = "Edificio Kavanagh";`,
    "./skincare/ari-match-tool.astro": `const pageTitle = "Ari match tool";`,
    "./flights/search.astro": `const pageTitle = "Flight search";`,
    "./apartments/palermo.astro": `import TrackedRedirect from "../../components/TrackedRedirect.astro";`,
  };

  it("splits Argentina/Ari pages onto the AR sitemap only", () => {
    const publicEntries = collectSitemapEntries(
      pageSources,
      {},
      "https://sokolsky.me",
      "default",
    );
    const arEntries = collectSitemapEntries(
      pageSources,
      {},
      "https://sokolsky.me",
      "ar",
    );

    expect(publicEntries.map((entry) => entry.path)).toEqual([
      "/flights/search/",
    ]);
    expect(arEntries.map((entry) => entry.path)).toEqual([
      "/argentina/kavanagh/",
      "/skincare/ari-match-tool/",
    ]);
  });
});
