/**
 * Display helper for hotel names that arrive in ALL CAPS (or similar).
 * Leaves already-mixed names alone so "Four Seasons" / "MGallery" stay intact.
 */

const SMALL_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "by",
  "de",
  "del",
  "di",
  "el",
  "for",
  "from",
  "in",
  "la",
  "las",
  "los",
  "of",
  "on",
  "or",
  "the",
  "to",
  "vs",
  "with",
  "y",
]);

function letterStats(name: string): { letters: number; upper: number; lower: number } {
  let letters = 0;
  let upper = 0;
  let lower = 0;
  for (const ch of name) {
    if (ch >= "A" && ch <= "Z") {
      letters += 1;
      upper += 1;
    } else if (ch >= "a" && ch <= "z") {
      letters += 1;
      lower += 1;
    } else if (/\p{L}/u.test(ch)) {
      letters += 1;
      // Treat non-ASCII letters as "cased" already; don't force rewrite.
      lower += 1;
    }
  }
  return { letters, upper, lower };
}

function needsRecase(name: string): boolean {
  const { letters, upper, lower } = letterStats(name);
  if (letters < 3) return false;
  // Mostly/all uppercase (common in Google Hotels feeds).
  if (lower === 0 && upper >= 3) return true;
  return upper / letters >= 0.7 && lower / letters <= 0.15;
}

function titleCaseWord(word: string, isFirst: boolean): string {
  if (/^\d+$/.test(word)) return word;
  const lower = word.toLocaleLowerCase("en");
  // Short alphabetic tokens → brand acronyms (NH, SLS, HTL, IHG).
  if (/^[a-z]{2,3}$/.test(lower) && !SMALL_WORDS.has(lower)) {
    return lower.toLocaleUpperCase("en");
  }
  if (!isFirst && SMALL_WORDS.has(lower)) return lower;
  return lower.charAt(0).toLocaleUpperCase("en") + lower.slice(1);
}

function toTitleCase(name: string): string {
  let firstWord = true;
  return name.replace(/[A-Za-zÀ-ÿ]+(?:'[A-Za-zÀ-ÿ]+)?|\d+/g, (word) => {
    const out = titleCaseWord(word, firstWord);
    firstWord = false;
    return out;
  });
}

/** Human-facing hotel name; safe to use only for display, not for search URLs. */
export function displayHotelName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return name;
  if (!needsRecase(trimmed)) return trimmed;
  return toTitleCase(trimmed);
}
