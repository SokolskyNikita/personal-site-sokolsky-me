import citiesConfig from "./config/cities.json";

export type HotelFormState = {
  city: string;
  q: string;
  neighborhood: string;
  checkInStart: string;
  checkInEnd: string;
  nightsMin: number;
  nightsMax: number;
  adults: number;
  pinLat: number | null;
  pinLng: number | null;
  strictness: "confirmed_only" | "confirmed_or_unknown";
  requireAC: boolean;
  requireFrontDesk24h: boolean;
  brandedOnly: boolean;
  minReviews: 200 | 500 | 1000;
  budgetMax: number | null;
  sort:
    | "comfort"
    | "deal"
    | "nightly"
    | "rating"
    | "reviews"
    | "distance"
    | "unknowns";
};

export const DEFAULT_HOTEL_FORM: HotelFormState = {
  city: "buenos-aires",
  q: "",
  neighborhood: "",
  checkInStart: "",
  checkInEnd: "",
  nightsMin: 2,
  nightsMax: 2,
  adults: 2,
  pinLat: null,
  pinLng: null,
  strictness: "confirmed_or_unknown",
  requireAC: false,
  requireFrontDesk24h: false,
  brandedOnly: false,
  minReviews: 200,
  budgetMax: null,
  sort: "comfort",
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
  const sortAllowed = [
    "comfort",
    "deal",
    "nightly",
    "rating",
    "reviews",
    "distance",
    "unknowns",
  ] as const;
  const sort = sortAllowed.includes(sortRaw as (typeof sortAllowed)[number])
    ? (sortRaw as HotelFormState["sort"])
    : "comfort";
  const budget = params.get("budgetMax");
  const pinLat = params.get("pinLat");
  const pinLng = params.get("pinLng");
  return {
    city,
    q: params.get("q") ?? "",
    neighborhood: params.get("neighborhood") ?? "",
    checkInStart: params.get("checkInStart") ?? "",
    checkInEnd: params.get("checkInEnd") ?? "",
    nightsMin: clampNum(params.get("nightsMin"), 1, 14, 2),
    nightsMax: clampNum(params.get("nightsMax"), 1, 14, 2),
    adults: clampNum(params.get("adults"), 1, 8, 2),
    pinLat: pinLat != null && pinLat !== "" ? Number(pinLat) : null,
    pinLng: pinLng != null && pinLng !== "" ? Number(pinLng) : null,
    strictness:
      params.get("strictness") === "confirmed_only"
        ? "confirmed_only"
        : "confirmed_or_unknown",
    requireAC: params.get("requireAC") === "1",
    requireFrontDesk24h: params.get("requireDesk") === "1",
    brandedOnly: params.get("brandedOnly") === "1",
    minReviews,
    budgetMax: budget != null && budget !== "" ? Number(budget) : null,
    sort,
  };
}

export function formStateToSearchParams(form: HotelFormState): URLSearchParams {
  const p = new URLSearchParams();
  if (form.city !== DEFAULT_HOTEL_FORM.city) p.set("city", form.city);
  if (form.q) p.set("q", form.q);
  if (form.neighborhood) p.set("neighborhood", form.neighborhood);
  if (form.checkInStart) p.set("checkInStart", form.checkInStart);
  if (form.checkInEnd) p.set("checkInEnd", form.checkInEnd);
  if (form.nightsMin !== 2) p.set("nightsMin", String(form.nightsMin));
  if (form.nightsMax !== form.nightsMin) {
    p.set("nightsMax", String(form.nightsMax));
  } else if (form.nightsMin !== 2) {
    p.set("nightsMax", String(form.nightsMax));
  }
  if (form.adults !== 2) p.set("adults", String(form.adults));
  if (form.pinLat != null) p.set("pinLat", String(form.pinLat));
  if (form.pinLng != null) p.set("pinLng", String(form.pinLng));
  if (form.strictness !== DEFAULT_HOTEL_FORM.strictness) {
    p.set("strictness", form.strictness);
  }
  if (form.requireAC) p.set("requireAC", "1");
  if (form.requireFrontDesk24h) p.set("requireDesk", "1");
  if (form.brandedOnly) p.set("brandedOnly", "1");
  if (form.minReviews !== 200) p.set("minReviews", String(form.minReviews));
  if (form.budgetMax != null) p.set("budgetMax", String(form.budgetMax));
  if (form.sort !== "comfort") p.set("sort", form.sort);
  return p;
}

function clampNum(
  raw: string | null,
  lo: number,
  hi: number,
  fallback: number,
): number {
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(hi, Math.max(lo, n));
}
