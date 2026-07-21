import { describe, expect, it } from "vitest";
import {
  convertCurrency,
  parseSearchCurrency,
  USD_TO_CURRENCY,
} from "../currency";

describe("currency helpers", () => {
  it("parses supported currencies and falls back otherwise", () => {
    expect(parseSearchCurrency("EUR")).toBe("EUR");
    expect(parseSearchCurrency("gbp")).toBe("USD");
    expect(parseSearchCurrency("JPY", "EUR")).toBe("EUR");
  });

  it("converts via static USD rates", () => {
    expect(convertCurrency(100, "USD", "USD")).toBe(100);
    expect(convertCurrency(100, "USD", "EUR")).toBeCloseTo(
      100 * USD_TO_CURRENCY.EUR,
      6,
    );
    expect(convertCurrency(100, "USD", "GBP")).toBeCloseTo(
      100 * USD_TO_CURRENCY.GBP,
      6,
    );
    expect(convertCurrency(92, "EUR", "USD")).toBeCloseTo(100, 6);
  });
});
