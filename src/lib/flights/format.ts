import { CABIN_LABELS } from "./cabin";
import { modeInvolvesLieFlat } from "./modes";
import type { ItineraryOption, LieFlatPolicy, Segment } from "./types";

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${String(m).padStart(2, "0")}m`;
}

export function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${Math.round(price)}`;
  }
}

export function formatDateHeader(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function viaAirports(option: ItineraryOption): string {
  if (option.segments.length <= 1) return "nonstop";
  const vias = option.segments.slice(0, -1).map((s) => s.arrivalAirport);
  return `via ${vias.join(", ")}`;
}

function primaryCarrier(option: ItineraryOption): string {
  return option.segments[0]?.carrier ?? "Unknown";
}

function lieFlatDetail(option: ItineraryOption): string {
  const parts = option.segments
    .filter((s) => s.seatClassification === "lie_flat")
    .map((s) => {
      const craft = s.aircraft ? ` (${s.aircraft})` : "";
      return `${s.departureAirport}→${s.arrivalAirport}${craft}`;
    });
  if (parts.length === 0) {
    return option.unverified ? "lie-flat: unverified" : "lie-flat: none";
  }
  return `lie-flat: ${parts.join(", ")}`;
}

function cabinSeatDetail(option: ItineraryOption): string {
  const seg = longestSegment(option.segments);
  const cabin = seg.cabin ? CABIN_LABELS[seg.cabin] : "cabin unknown";
  const legroom = seg.legroom ?? seg.amenities.find((a) => /legroom/i.test(a));
  return legroom ? `${cabin}, ${legroom}` : cabin;
}

function longestSegment(segments: Segment[]): Segment {
  return segments.reduce((best, seg) =>
    seg.durationMinutes > best.durationMinutes ? seg : best,
  );
}

function layoverDetail(option: ItineraryOption): string {
  if (option.layovers.length === 0) return "no layover";
  return `layover ${option.layovers.map((l) => formatDuration(l.durationMinutes)).join(", ")}`;
}

/**
 * Mode-aware single-line result row.
 * Lie-flat detail when policy involves lie-flat; cabin + seat descriptor otherwise.
 */
export function formatResultRow(
  option: ItineraryOption,
  policy: LieFlatPolicy,
): string {
  const dest =
    option.destinationLabel ??
    option.destinationAirport;
  const head = `${formatPrice(option.price, option.currency)} — ${dest} — ${primaryCarrier(option)} ${viaAirports(option)}`;
  const middle = modeInvolvesLieFlat(policy)
    ? lieFlatDetail(option)
    : cabinSeatDetail(option);
  const unverified = option.unverified ? " — unverified" : "";
  return `${head} — ${middle} — ${layoverDetail(option)} — total ${formatDuration(option.totalDurationMinutes)}${unverified}`;
}
