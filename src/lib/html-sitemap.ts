export type SitemapEntry = {
  path: string;
  url: string;
  title: string;
  section: string;
};

export type SitemapVariant = "default" | "ar";

export const SITEMAP_EXCLUDED_PATHS = new Set([
  "/404/",
  "/sitemap/",
  "/sitemap-ar/",
]);

/** Argentina pages whose path has no argentina / ba- / ar- / ari- / buenos-aires segment. */
const EXTRA_AR_PATHS = new Set(["/restaurants/lincoln/"]);

const titlePatterns = [
  /const\s+pageTitle\s*=\s*"([^"]+)"/,
  /const\s+pageTitle\s*=\s*'([^']+)'/,
  /const\s+pageTitle\s*=\s*`([^`]+)`/,
  /pageTitle=\{"([^"]+)"\}/,
  /pageTitle=\{'([^']+)'\}/,
  /pageTitle=\{`([^`]+)`\}/,
  /<title>([^<{]+)<\/title>/i,
];

export const isTrackedRedirectPage = (source: string): boolean =>
  /\bTrackedRedirect\b/.test(source);

const pathSegments = (pathname: string): string[] =>
  pathname
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

/**
 * Argentina local guides, BA/AR-prefixed pages, and Ari/Ariana skincare pages.
 * Matches path segments only so travel pages like /travel/best-of-arctic/ stay public.
 */
export const isArgentinaOrAriPath = (pathname: string): boolean => {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (EXTRA_AR_PATHS.has(normalized) || EXTRA_AR_PATHS.has(pathname)) return true;

  return pathSegments(pathname).some((segment) => {
    if (segment === "argentina") return true;
    if (segment === "buenos-aires") return true;
    if (segment === "palermo") return true;
    if (segment.startsWith("ba-")) return true;
    if (segment.startsWith("ar-")) return true;
    if (segment.startsWith("ari-")) return true;
    if (segment.endsWith("-ari")) return true;
    if (segment.includes("-ari-")) return true;
    return false;
  });
};

export const filePathToRoute = (filePath: string): string | null => {
  const normalized = filePath
    .replace(/\\/g, "/")
    .replace(/^\.\.\/pages\//, "./")
    .replace(/^\/?src\/pages\//, "./");

  if (normalized === "./private" || normalized.startsWith("./private/")) {
    return null;
  }

  let route = normalized.replace(/^\.\//, "/").replace(/\.(astro|md|mdx)$/, "");

  if (route.endsWith("/index")) {
    route = route.slice(0, -"/index".length) || "/";
  }

  if (!route.endsWith("/")) {
    route += "/";
  }

  if (SITEMAP_EXCLUDED_PATHS.has(route)) return null;
  if (route === "/private/" || route.startsWith("/private/")) return null;
  if (/\[[^\]]+\]/.test(route)) return null;

  return route;
};

export const humanizePath = (pathname: string): string => {
  if (pathname === "/") return "Home";
  return pathname
    .replace(/^\/|\/$/g, "")
    .split("/")
    .map((segment) =>
      segment
        .split("-")
        .map((word) => {
          if (word === "usa") return "USA";
          if (word === "ai") return "AI";
          if (word === "ba") return "BA";
          if (word === "std") return "STD";
          if (word === "bf") return "BF";
          if (word === "pg") return "PG";
          if (word === "gta") return "GTA";
          if (word === "iii") return "III";
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" "),
    )
    .join(" · ");
};

const extractQuoted = (source: string, patterns: RegExp[]): string | null => {
  for (const pattern of patterns) {
    const match = source.match(pattern);
    const title = match?.[1]?.trim();
    if (title) return title;
  }
  return null;
};

export const extractTitleFromPageData = (
  source: string,
  dataModules: Record<string, { title?: string; default?: { title?: string } }>,
): string | null => {
  if (!/\bpageTitle\s*=\s*pageData\.title\b/.test(source)) return null;

  const importMatch = source.match(
    /import\s+pageData\s+from\s+["']([^"']+)["']/,
  );
  const basename = importMatch?.[1]?.split("/").pop();
  if (!basename) return null;

  for (const [key, mod] of Object.entries(dataModules)) {
    if (!key.endsWith(`/${basename}`) && !key.endsWith(basename)) continue;
    const title = mod.title ?? mod.default?.title;
    if (typeof title === "string" && title.trim()) return title.trim();
  }

  return null;
};

export const extractTitle = (
  source: string,
  pathname: string,
  dataModules: Record<string, { title?: string; default?: { title?: string } }>,
): string =>
  extractQuoted(source, titlePatterns) ??
  extractTitleFromPageData(source, dataModules) ??
  humanizePath(pathname);

export const sectionLabel = (pathname: string): string => {
  if (pathname === "/") return "Home";
  const segment = pathname.replace(/^\//, "").split("/")[0] ?? "other";
  return humanizePath(`/${segment}/`);
};

export const collectSitemapEntries = (
  pageSources: Record<string, string>,
  dataModules: Record<string, { title?: string; default?: { title?: string } }>,
  siteUrl: string,
  variant: SitemapVariant,
): SitemapEntry[] =>
  Object.entries(pageSources)
    .map(([filePath, source]) => {
      const sourceText = String(source);
      if (isTrackedRedirectPage(sourceText)) return null;

      const path = filePathToRoute(filePath);
      if (!path) return null;

      const isArPage = isArgentinaOrAriPath(path);
      if (variant === "ar" ? !isArPage : isArPage) return null;

      return {
        path,
        url: `${siteUrl}${path}`,
        title: extractTitle(sourceText, path, dataModules),
        section: sectionLabel(path),
      } satisfies SitemapEntry;
    })
    .filter((entry): entry is SitemapEntry => entry !== null)
    .sort((a, b) => a.path.localeCompare(b.path));

export const groupSitemapSections = (
  entries: SitemapEntry[],
): Array<[string, SitemapEntry[]]> =>
  Object.entries(
    entries.reduce<Record<string, SitemapEntry[]>>((acc, entry) => {
      (acc[entry.section] ??= []).push(entry);
      return acc;
    }, {}),
  ).sort(([a], [b]) => {
    if (a === "Home") return -1;
    if (b === "Home") return 1;
    return a.localeCompare(b);
  });

export const sitemapStructuredData = (
  entries: SitemapEntry[],
  pageTitle: string,
  pageDescription: string,
  canonicalUrl: string,
  siteUrl: string,
) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: pageTitle,
  description: pageDescription,
  url: canonicalUrl,
  isPartOf: {
    "@type": "WebSite",
    name: "Nikita Sokolsky",
    url: `${siteUrl}/`,
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: entry.url,
      name: entry.title,
    })),
  },
});
