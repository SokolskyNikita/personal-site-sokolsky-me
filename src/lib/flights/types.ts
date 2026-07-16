import { z } from "zod";

export const CabinSchema = z.enum([
  "economy",
  "premium_economy",
  "business",
  "first",
]);
export type Cabin = z.infer<typeof CabinSchema>;

export const LieFlatPolicySchema = z.enum([
  "none",
  "any_segment",
  "longest_segment",
  "all_segments",
]);
export type LieFlatPolicy = z.infer<typeof LieFlatPolicySchema>;

export const SeatClassificationSchema = z.enum([
  "lie_flat",
  "not_lie_flat",
  "unknown",
]);
export type SeatClassification = z.infer<typeof SeatClassificationSchema>;

/** Registry id or a raw validated IATA code (3 uppercase letters). */
export const LocationRefSchema = z.string().min(1).max(64);
export type LocationRef = z.infer<typeof LocationRefSchema>;

export const DateRangeSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days: z.number().int().min(1).max(14),
});
export type DateRange = z.infer<typeof DateRangeSchema>;

export const TripTypeSchema = z.enum(["one_way", "round_trip"]);
export type TripType = z.infer<typeof TripTypeSchema>;

export const MAX_TOTAL_HOURS_OPTIONS = [12, 18, 24, 36, 48, 72] as const;
export const MaxTotalHoursSchema = z.union([
  z.literal(12),
  z.literal(18),
  z.literal(24),
  z.literal(36),
  z.literal(48),
  z.literal(72),
]);
export type MaxTotalHours = z.infer<typeof MaxTotalHoursSchema>;

export const LegSearchSchema = z.object({
  origin: LocationRefSchema,
  dest: LocationRefSchema,
  tripType: TripTypeSchema.default("one_way"),
  tripLengthDays: z.number().int().min(1).max(30).default(7),
  dateRange: DateRangeSchema,
  maxStops: z.union([z.literal(1), z.literal(2)]),
  maxTotalHours: MaxTotalHoursSchema.default(24),
  cabin: CabinSchema,
  lieFlatPolicy: LieFlatPolicySchema,
  includeUnverified: z.boolean().default(false),
  currency: z.string().min(3).max(3).default("USD"),
  gl: z.string().min(2).max(2).default("us"),
  hl: z.string().min(2).max(5).default("en"),
  deepSearch: z.boolean().default(false),
  topN: z.number().int().min(1).max(20).default(2),
});
export type LegSearch = z.infer<typeof LegSearchSchema>;

export const SegmentSchema = z.object({
  carrier: z.string(),
  carrierCode: z.string().optional(),
  flightNumber: z.string(),
  aircraft: z.string().optional(),
  departureAirport: z.string(),
  arrivalAirport: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  durationMinutes: z.number().int().nonnegative(),
  cabin: CabinSchema.optional(),
  amenities: z.array(z.string()),
  seatClassification: SeatClassificationSchema,
  legroom: z.string().optional(),
});
export type Segment = z.infer<typeof SegmentSchema>;

export const LayoverSchema = z.object({
  airport: z.string(),
  durationMinutes: z.number().int().nonnegative(),
});
export type Layover = z.infer<typeof LayoverSchema>;

export const ItineraryOptionSchema = z.object({
  id: z.string(),
  segments: z.array(SegmentSchema).min(1),
  layovers: z.array(LayoverSchema),
  totalDurationMinutes: z.number().int().nonnegative(),
  price: z.number().nonnegative(),
  currency: z.string(),
  provider: z.string(),
  googleFlightsUrl: z.string().optional(),
  departureToken: z.string().optional(),
  bookingToken: z.string().optional(),
  departureDate: z.string(),
  destinationAirport: z.string(),
  destinationLabel: z.string().optional(),
  returnSegments: z.array(SegmentSchema).min(1).optional(),
  returnLayovers: z.array(LayoverSchema).optional(),
  returnDurationMinutes: z.number().int().nonnegative().optional(),
  returnDate: z.string().optional(),
  unverified: z.boolean().default(false),
  raw: z.unknown().optional(),
});
export type ItineraryOption = z.infer<typeof ItineraryOptionSchema>;

export const PlanStepSchema = z.object({
  stepIndex: z.number().int().nonnegative(),
  date: z.string(),
  returnDate: z.string().optional(),
  originBatch: z.array(z.string()).min(1),
  destBatch: z.array(z.string()).min(1),
});
export type PlanStep = z.infer<typeof PlanStepSchema>;

export const QueryPlanSchema = z.object({
  steps: z.array(PlanStepSchema),
  callCount: z.number().int().nonnegative(),
  estimatedMaxCalls: z.number().int().nonnegative(),
  originAirports: z.array(z.string()),
  destAirports: z.array(z.string()),
  dates: z.array(z.string()),
});
export type QueryPlan = z.infer<typeof QueryPlanSchema>;

export const SearchResultSchema = z.object({
  spec: LegSearchSchema,
  options: z.array(ItineraryOptionSchema),
  grouped: z.record(z.string(), z.array(ItineraryOptionSchema)),
  stats: z.object({
    callsMade: z.number().int().nonnegative(),
    cacheHits: z.number().int().nonnegative(),
    optionsParsed: z.number().int().nonnegative(),
    optionsPassingFilters: z.number().int().nonnegative(),
  }),
  stepErrors: z
    .array(
      z.object({
        stepIndex: z.number().int().nonnegative(),
        message: z.string(),
      }),
    )
    .default([]),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export type GroupBy = "date" | "destination" | "origin";

export type GroupResultsOptions = {
  groupBy: GroupBy;
  topN: number;
};

export interface FlightProvider {
  search(spec: LegSearch): Promise<ItineraryOption[]>;
}
