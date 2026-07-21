import { WINDOW_CAP } from "./constants";

export type StayWindow = {
  checkIn: string;
  checkOut: string;
  nights: number;
};

export type WindowGenInput = {
  /** Inclusive YYYY-MM-DD */
  checkInStart: string;
  /** Inclusive YYYY-MM-DD */
  checkInEnd: string;
  nightsMin: number;
  nightsMax: number;
  cap?: number;
};

function parseUtc(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

function formatUtc(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
}

/**
 * Generate stay windows from a check-in range × nights range.
 * Caps at WINDOW_CAP (default 21). Prefers shorter stays and earlier check-ins
 * when the cartesian product exceeds the cap.
 */
export function generateStayWindows(input: WindowGenInput): StayWindow[] {
  const nightsMin = Math.max(1, Math.floor(input.nightsMin));
  const nightsMax = Math.max(nightsMin, Math.floor(input.nightsMax));
  const cap = input.cap ?? WINDOW_CAP;
  const start = parseUtc(input.checkInStart);
  const end = parseUtc(input.checkInEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return [];
  }

  const out: StayWindow[] = [];
  for (let cur = new Date(start); cur <= end; cur = addDays(cur, 1)) {
    for (let nights = nightsMin; nights <= nightsMax; nights++) {
      const checkOut = addDays(cur, nights);
      out.push({
        checkIn: formatUtc(cur),
        checkOut: formatUtc(checkOut),
        nights,
      });
      if (out.length >= cap) return out;
    }
  }
  return out;
}

export function median(nums: number[]): number | null {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[mid - 1]! + s[mid]!) / 2 : s[mid]!;
}
