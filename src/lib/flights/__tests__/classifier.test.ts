import { describe, expect, it } from "vitest";
import { classifySeat, extractLegroom } from "../classifier";

describe("classifySeat", () => {
  it("classifies lie-flat amenity strings from business cabin", () => {
    expect(classifySeat(["Lie flat seat", "Wi-Fi"])).toBe("lie_flat");
    expect(classifySeat(["Flat bed", "Power outlet"])).toBe("lie_flat");
    expect(classifySeat(["Individual suite"])).toBe("lie_flat");
    expect(classifySeat(["Private suite with door"])).toBe("lie_flat");
  });

  it('classifies "Angled flat seat" as NOT_LIE_FLAT', () => {
    expect(classifySeat(["Angled flat seat"])).toBe("not_lie_flat");
  });

  it("classifies reclining / legroom strings as NOT_LIE_FLAT", () => {
    expect(classifySeat(["Reclining seat"])).toBe("not_lie_flat");
    expect(classifySeat(["Extra reclining seat"])).toBe("not_lie_flat");
    expect(classifySeat(["Average legroom (31 in)"])).toBe("not_lie_flat");
    expect(classifySeat(["Below average legroom (29 in)"])).toBe("not_lie_flat");
    expect(classifySeat(["Above average legroom (34 in)"])).toBe("not_lie_flat");
  });

  it("returns UNKNOWN when no seat-type string is present", () => {
    expect(classifySeat([])).toBe("unknown");
    expect(classifySeat(["In-seat power & USB outlets", "Stream media to your device"])).toBe(
      "unknown",
    );
  });

  it("is case-insensitive", () => {
    expect(classifySeat(["LIE FLAT SEAT"])).toBe("lie_flat");
    expect(classifySeat(["ANGLED FLAT SEAT"])).toBe("not_lie_flat");
  });
});

describe("extractLegroom", () => {
  it("extracts legroom amenity when present", () => {
    expect(extractLegroom(["Average legroom (31 in)", "Wi-Fi"])).toBe(
      "Average legroom (31 in)",
    );
  });

  it("returns undefined when absent", () => {
    expect(extractLegroom(["Wi-Fi"])).toBeUndefined();
  });
});
