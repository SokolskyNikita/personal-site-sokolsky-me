import { describe, expect, it } from "vitest";
import { displayHotelName } from "../display";

describe("displayHotelName", () => {
  it("title-cases all-caps names", () => {
    expect(displayHotelName("EL FARO APART MONUMENTAL")).toBe(
      "El Faro Apart Monumental",
    );
    expect(displayHotelName("MONROE SUITES")).toBe("Monroe Suites");
  });

  it("keeps short tokens as acronyms", () => {
    expect(displayHotelName("HOTEL NH BUENOS AIRES LATINO")).toBe(
      "Hotel NH Buenos Aires Latino",
    );
    expect(displayHotelName("SLS BUENOS AIRES PUERTO MADERO")).toBe(
      "SLS Buenos Aires Puerto Madero",
    );
  });

  it("leaves already-mixed names alone", () => {
    expect(displayHotelName("Four Seasons Hotel Buenos Aires")).toBe(
      "Four Seasons Hotel Buenos Aires",
    );
    expect(displayHotelName("Palladio Hotel Buenos Aires - MGallery")).toBe(
      "Palladio Hotel Buenos Aires - MGallery",
    );
  });

  it("handles small connector words", () => {
    expect(displayHotelName("INTERCONTINENTAL BUENOS AIRES BY IHG")).toBe(
      "Intercontinental Buenos Aires by IHG",
    );
  });
});
