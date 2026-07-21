import citiesConfig from "./config/cities.json";

export type HotelFormState = {
  city: string;
  q: string;
  neighborhood: string;
  minComfort: number;
  strictness: "confirmed_only" | "confirmed_or_unknown";
  requireAC: boolean;
  requireElevator: boolean;
  requireFrontDesk24h: boolean;
  brandedOnly: boolean;
  minReviews: 200 | 500 | 1000;
  budgetMax: number | null;
  sort: "comfort" | "rating" | "reviews" | "unknowns";
  scanPages: number;
};

export const DEFAULT_HOTEL_FORM: HotelFormState = {
  city: "buenos-aires",
  q: "",
  neighborhood: "",
  minComfort: 0,
  strictness: "confirmed_or_unknown",
  requireAC: false,
  requireElevator: false,
  requireFrontDesk24h: false,
  brandedOnly: false,
  minReviews: 200,
  budgetMax: null,
  sort: "comfort",
  scanPages: 4,
};

export function cityOptions(): { slug: string; display: string }[] {
  return (citiesConfig as { slug: string; display: string }[]).map((c) => ({
    slug: c.slug,
    display: c.display,
  }));
}

export function neighborhoodsFor(citySlug: string): {
  name: string;
  bbox: number[];
}[] {
  const city = (citiesConfig as { slug: string; neighborhoods?: { name: string; bbox: number[] }[] }[]).find(
    (c) => c.slug === citySlug,
  );
  return city?.neighborhoods ?? [];
}

export function slugifyCity(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "custom";
}

export function formStateFromSearchParams(
  params: URLSearchParams,
): HotelFormState {
  const city = params.get("city") || DEFAULT_HOTEL_FORM.city;
  const minReviewsRaw = Number(params.get("minReviews") ?? 200);
  const minReviews =
    minReviewsRaw === 500 || minReviewsRaw === 1000 ? minReviewsRaw : 200;
  const sortRaw = params.get("sort") ?? "comfort";
  const sort =
    sortRaw === "rating" || sortRaw === "reviews" || sortRaw === "unknowns"
      ? sortRaw
      : "comfort";
  const budget = params.get("budgetMax");
  return {
    city,
    q: params.get("q") ?? "",
    neighborhood: params.get("neighborhood") ?? "",
    minComfort: clampNum(params.get("minComfort"), 0, 100, 0),
    strictness:
      params.get("strictness") === "confirmed_only"
        ? "confirmed_only"
        : "confirmed_or_unknown",
    requireAC: params.get("requireAC") === "1",
    requireElevator: params.get("requireElevator") === "1",
    requireFrontDesk24h: params.get("requireDesk") === "1",
    brandedOnly: params.get("brandedOnly") === "1",
    minReviews,
    budgetMax: budget != null && budget !== "" ? Number(budget) : null,
    sort,
    scanPages: clampNum(params.get("scanPages"), 1, 4, 4),
  };
}

export function formStateToSearchParams(form: HotelFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (form.city !== DEFAULT_HOTEL_FORM.city) p.set("city", form.city);
  if (form.q) p.set("q", form.q);
  if (form.neighborhood) p.set("neighborhood", form.neighborhood);
  if (form.minComfort > 0) p.set("minComfort", String(form.minComfort));
  if (form.strictness !== DEFAULT_HOTEL_FORM.strictness) {
    p.set("strictness", form.strictness);
  }
  if (form.requireAC) p.set("requireAC", "1");
  if (form.requireElevator) p.set("requireElevator", "1");
  if (form.requireFrontDesk24h) p.set("requireDesk", "1");
  if (form.brandedOnly) p.set("brandedOnly", "1");
  if (form.minReviews !== 200) p.set("minReviews", String(form.minReviews));
  if (form.budgetMax != null) p.set("budgetMax", String(form.budgetMax));
  if (form.sort !== "comfort") p.set("sort", form.sort);
  if (form.scanPages !== 4) p.set("scanPages", String(form.scanPages));
  return p;
}

function clampNum(
  raw: string | null,
  lo: number,
  hi: number,
  fallback: number,
): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}
