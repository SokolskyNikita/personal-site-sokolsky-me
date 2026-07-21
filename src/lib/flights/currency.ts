/** Supported display currencies for flight search. */
export const SEARCH_CURRENCIES = ["USD", "EUR", "GBP"] as const;
export type SearchCurrency = (typeof SEARCH_CURRENCIES)[number];

/**
 * Units of each currency per 1 USD.
 * Static mid-market approximations — not live FX.
 */
export const USD_TO_CURRENCY: Record<SearchCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
};

export function isSearchCurrency(value: string): value is SearchCurrency {
  return (SEARCH_CURRENCIES as readonly string[]).includes(value);
}

export function parseSearchCurrency(
  value: string | null | undefined,
  fallback: SearchCurrency = "USD",
): SearchCurrency {
  if (value && isSearchCurrency(value)) return value;
  return fallback;
}

/** Convert an amount between supported currencies via USD. */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
): number {
  const fromCode = parseSearchCurrency(from);
  const toCode = parseSearchCurrency(to);
  if (fromCode === toCode) return amount;
  const usd = amount / USD_TO_CURRENCY[fromCode];
  return usd * USD_TO_CURRENCY[toCode];
}
