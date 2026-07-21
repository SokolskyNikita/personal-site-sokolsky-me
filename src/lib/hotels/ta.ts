/**
 * Tripadvisor title concordance — never mis-join.
 * Match by normalized title (+ optional city token). Ambiguous → null.
 */

export type TripadvisorPlace = {
  title?: string;
  rating?: number;
  reviews?: number;
  place_id?: string | number;
  location?: string;
  type?: string;
};

export type TaMatch = {
  rating: number | null;
  reviews: number | null;
  placeId: string | null;
  title: string;
  confidence: "exact" | "strong";
};

export function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(hotel|the|a|an)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token Jaccard; 1 = identical token sets. */
export function titleSimilarity(a: string, b: string): number {
  const ta = new Set(normalizeTitle(a).split(" ").filter(Boolean));
  const tb = new Set(normalizeTitle(b).split(" ").filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = ta.size + tb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Pick a single unambiguous TA place for a hotel name in a city.
 * Exact normalized match wins; otherwise one strong (≥0.85) match only.
 */
export function matchTripadvisor(
  hotelName: string,
  cityDisplay: string,
  places: TripadvisorPlace[],
): TaMatch | null {
  const target = normalizeTitle(hotelName);
  if (!target || !places.length) return null;

  const cityTok = normalizeTitle(cityDisplay).split(" ")[0] ?? "";
  const candidates = places.filter((p) => {
    if (!p.title) return false;
    const loc = (p.location ?? "").toLowerCase();
    if (cityTok && loc && !loc.includes(cityTok) && !normalizeTitle(p.title).includes(cityTok)) {
      // Keep if title is otherwise exact — some results omit city in location.
      return normalizeTitle(p.title) === target;
    }
    return true;
  });

  const exact = candidates.filter((p) => normalizeTitle(p.title!) === target);
  if (exact.length === 1) {
    return toMatch(exact[0]!, "exact");
  }
  if (exact.length > 1) return null;

  const scored = candidates
    .map((p) => ({ p, sim: titleSimilarity(hotelName, p.title!) }))
    .filter((x) => x.sim >= 0.85)
    .sort((a, b) => b.sim - a.sim);

  if (scored.length === 0) return null;
  if (scored.length >= 2 && scored[0]!.sim - scored[1]!.sim < 0.05) {
    return null; // ambiguous
  }
  return toMatch(scored[0]!.p, "strong");
}

function toMatch(p: TripadvisorPlace, confidence: "exact" | "strong"): TaMatch {
  return {
    rating: typeof p.rating === "number" ? p.rating : null,
    reviews: typeof p.reviews === "number" ? p.reviews : null,
    placeId:
      p.place_id != null ? String(p.place_id) : null,
    title: p.title ?? "",
    confidence,
  };
}

/** Concordance: Google vs TA rating agreement (bonus already in taBonus). */
export function ratingConcordance(
  googleRating: number | null,
  taRating: number | null,
): "agree" | "soft" | "diverge" | "unknown" {
  if (googleRating == null || taRating == null) return "unknown";
  const d = Math.abs(googleRating - taRating);
  if (d <= 0.2) return "agree";
  if (d <= 0.5) return "soft";
  return "diverge";
}
