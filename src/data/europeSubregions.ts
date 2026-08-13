import type { TravelSpot } from "../components/travel/TravelSpotGuide.astro";
import { europeTravelSpots } from "./europeTravelSpots";

export const europeSubregionOrder = [
  "northern-europe",
  "western-europe",
  "central-europe",
  "southern-europe",
  "southeast-europe",
  "eastern-europe",
] as const;

export type EuropeSubregionSlug = (typeof europeSubregionOrder)[number];

const countryAliases: Record<string, string> = {
  "Netherlands (Kingdom of the)": "Netherlands",
};

// Travel-standard split: Nordics+Baltics, Atlantic west, Mitteleuropa,
// Mediterranean south, the Balkans, and post-Soviet east plus the Caucasus.
const subregionByCountry: Record<string, EuropeSubregionSlug> = {
  Iceland: "northern-europe",
  Norway: "northern-europe",
  Sweden: "northern-europe",
  Denmark: "northern-europe",
  Finland: "northern-europe",
  Estonia: "northern-europe",
  Latvia: "northern-europe",
  Lithuania: "northern-europe",

  UK: "western-europe",
  Ireland: "western-europe",
  France: "western-europe",
  Belgium: "western-europe",
  Netherlands: "western-europe",
  Luxembourg: "western-europe",
  Monaco: "western-europe",

  Germany: "central-europe",
  Austria: "central-europe",
  Switzerland: "central-europe",
  Liechtenstein: "central-europe",
  Poland: "central-europe",
  Czechia: "central-europe",
  Slovakia: "central-europe",
  Hungary: "central-europe",
  Slovenia: "central-europe",

  Spain: "southern-europe",
  Portugal: "southern-europe",
  Italy: "southern-europe",
  Malta: "southern-europe",
  Greece: "southern-europe",
  Andorra: "southern-europe",
  "San Marino": "southern-europe",
  "Holy See": "southern-europe",
  Vatican: "southern-europe",

  Croatia: "southeast-europe",
  "Bosnia and Herzegovina": "southeast-europe",
  Serbia: "southeast-europe",
  Montenegro: "southeast-europe",
  Albania: "southeast-europe",
  "North Macedonia": "southeast-europe",
  Kosovo: "southeast-europe",
  Bulgaria: "southeast-europe",
  Romania: "southeast-europe",

  Ukraine: "eastern-europe",
  Belarus: "eastern-europe",
  Moldova: "eastern-europe",
  Russia: "eastern-europe",
  Georgia: "eastern-europe",
  Armenia: "eastern-europe",
  Azerbaijan: "eastern-europe",
};

export function europeSubregionForSpot(spot: TravelSpot): EuropeSubregionSlug {
  const country = countryAliases[spot.countries[0]] ?? spot.countries[0];
  const subregion = subregionByCountry[country];
  if (!subregion) {
    throw new Error(`No Europe subregion mapping for ${country} (${spot.id})`);
  }
  return subregion;
}

export const europeSpotsBySubregion = Object.fromEntries(
  europeSubregionOrder.map((slug) => [
    slug,
    europeTravelSpots.filter((spot) => europeSubregionForSpot(spot) === slug),
  ]),
) as Record<EuropeSubregionSlug, TravelSpot[]>;

export const europeSubregionImportedSpotCounts: Record<string, number> = Object.fromEntries(
  europeSubregionOrder.map((slug) => [
    `./best-of-${slug}.astro`,
    europeSpotsBySubregion[slug].length,
  ]),
);
