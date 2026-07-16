import type {
  ItineraryOption,
  LieFlatPolicy,
  MaxTotalHours,
  Segment,
} from "./types";

export type PolicyFilterResult = {
  passes: boolean;
  unverified: boolean;
};

function longestSegment(segments: Segment[]): Segment {
  return segments.reduce((best, seg) =>
    seg.durationMinutes > best.durationMinutes ? seg : best,
  );
}

function segmentSatisfies(seg: Segment, includeUnverified: boolean): {
  ok: boolean;
  unverified: boolean;
} {
  if (seg.seatClassification === "lie_flat") {
    return { ok: true, unverified: false };
  }
  if (seg.seatClassification === "unknown" && includeUnverified) {
    return { ok: true, unverified: true };
  }
  return { ok: false, unverified: false };
}

/**
 * Apply a lie-flat policy at itinerary level.
 * `none` filters nothing. UNKNOWN never satisfies a policy unless includeUnverified.
 */
export function applyLieFlatPolicy(
  option: ItineraryOption,
  policy: LieFlatPolicy,
  includeUnverified = false,
): PolicyFilterResult {
  if (policy === "none") {
    return { passes: true, unverified: false };
  }

  const { segments } = option;

  if (policy === "any_segment") {
    let anyUnverified = false;
    for (const seg of segments) {
      const result = segmentSatisfies(seg, includeUnverified);
      if (result.ok) {
        return { passes: true, unverified: result.unverified };
      }
      if (seg.seatClassification === "unknown") anyUnverified = true;
    }
    // No segment satisfied; if we only had unknowns without includeUnverified, fail
    void anyUnverified;
    return { passes: false, unverified: false };
  }

  if (policy === "longest_segment") {
    const longest = longestSegment(segments);
    const result = segmentSatisfies(longest, includeUnverified);
    return { passes: result.ok, unverified: result.unverified };
  }

  // all_segments
  let unverified = false;
  for (const seg of segments) {
    const result = segmentSatisfies(seg, includeUnverified);
    if (!result.ok) {
      return { passes: false, unverified: false };
    }
    if (result.unverified) unverified = true;
  }
  return { passes: true, unverified };
}

export function filterByLieFlatPolicy(
  options: ItineraryOption[],
  policy: LieFlatPolicy,
  includeUnverified = false,
): ItineraryOption[] {
  const out: ItineraryOption[] = [];
  for (const option of options) {
    const result = applyLieFlatPolicy(option, policy, includeUnverified);
    if (result.passes) {
      out.push({ ...option, unverified: result.unverified });
    }
  }
  return out;
}

export function filterByMaxTotalHours(
  options: ItineraryOption[],
  maxTotalHours: MaxTotalHours,
): ItineraryOption[] {
  const maxMinutes = maxTotalHours * 60;
  return options.filter(
    (option) => option.totalDurationMinutes <= maxMinutes,
  );
}
