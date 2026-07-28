/**
 * Airline → region for lie-flat rankings filters.
 * Groupings follow airline/network geography (hubs & markets), not UN M49.
 */
export const LIE_FLAT_REGIONS = [
  "North America",
  "Latin America",
  "Europe",
  "Middle East",
  "Africa",
  "South & Central Asia",
  "East Asia",
  "Southeast Asia",
  "Oceania",
] as const;

export type LieFlatRegion = (typeof LIE_FLAT_REGIONS)[number];

const AIRLINE_REGIONS: Record<string, LieFlatRegion> = {
  // North America
  "Alaska/Hawaiian": "North America",
  "American Airlines": "North America",
  "Delta Air Lines": "North America",
  JetBlue: "North America",
  "United Airlines": "North America",
  "Air Canada": "North America",
  WestJet: "North America",
  Aeromexico: "North America",

  // Latin America (incl. Caribbean & Central America)
  Avianca: "Latin America",
  Azul: "Latin America",
  "Boliviana de Aviación": "Latin America",
  "Copa Airlines": "Latin America",
  "LATAM Airlines": "Latin America",
  "Surinam Airways": "Latin America",
  "Air Caraïbes": "Latin America",

  // Europe (incl. Turkey & European Russia for airline geography)
  "Aer Lingus": "Europe",
  Aeroflot: "Europe",
  "Air Europa": "Europe",
  "Air France": "Europe",
  "Air Serbia": "Europe",
  "Austrian Airlines": "Europe",
  "British Airways": "Europe",
  "Brussels Airlines": "Europe",
  Condor: "Europe",
  Corsair: "Europe",
  "Discover Airlines": "Europe",
  "Edelweiss Air": "Europe",
  Finnair: "Europe",
  Iberia: "Europe",
  Iberojet: "Europe",
  "ITA Airways": "Europe",
  KLM: "Europe",
  LEVEL: "Europe",
  "LOT Polish Airlines": "Europe",
  "La Compagnie": "Europe",
  Lufthansa: "Europe",
  "Nordwind Airlines": "Europe",
  SAS: "Europe",
  SWISS: "Europe",
  "TAP Air Portugal": "Europe",
  "Turkish Airlines": "Europe",
  "Virgin Atlantic": "Europe",

  // Middle East
  Emirates: "Middle East",
  "Etihad Airways": "Middle East",
  flydubai: "Middle East",
  "Gulf Air": "Middle East",
  "EL AL": "Middle East",
  "Iraqi Airways": "Middle East",
  "Kuwait Airways": "Middle East",
  "Oman Air": "Middle East",
  "Qatar Airways": "Middle East",
  "Riyadh Air": "Middle East",
  "Royal Jordanian": "Middle East",
  Saudia: "Middle East",

  // Africa (incl. Indian Ocean carriers that network with Africa)
  "Air Algérie": "Africa",
  "Air Côte d'Ivoire": "Africa",
  "Air Mauritius": "Africa",
  "Air Peace": "Africa",
  "Air Seychelles": "Africa",
  "Air Tanzania": "Africa",
  "Air Austral": "Africa",
  Egyptair: "Africa",
  "Ethiopian Airlines": "Africa",
  "Kenya Airways": "Africa",
  "Royal Air Maroc": "Africa",
  RwandAir: "Africa",
  "South African Airways": "Africa",
  "TAAG Angola": "Africa",
  "Uganda Airlines": "Africa",

  // South & Central Asia (merged — neither subregion alone had 5+ airlines)
  "Air Astana": "South & Central Asia",
  "Azerbaijan Airlines": "South & Central Asia",
  "Uzbekistan Airways": "South & Central Asia",
  "Air India": "South & Central Asia",
  BeOnd: "South & Central Asia",
  "Biman Bangladesh": "South & Central Asia",
  "SriLankan Airlines": "South & Central Asia",

  // East Asia
  "Air China": "East Asia",
  ANA: "East Asia",
  "Asiana Airlines": "East Asia",
  "Beijing Capital Airlines": "East Asia",
  "Cathay Pacific": "East Asia",
  "China Airlines": "East Asia",
  "China Eastern": "East Asia",
  "China Southern": "East Asia",
  "EVA Air": "East Asia",
  "Hainan Airlines": "East Asia",
  "Hong Kong Airlines": "East Asia",
  "Japan Airlines": "East Asia",
  "Juneyao Air": "East Asia",
  "Korean Air": "East Asia",
  "MIAT Mongolian": "East Asia",
  "Shanghai Airlines": "East Asia",
  "Shenzhen Airlines": "East Asia",
  "Sichuan Airlines": "East Asia",
  "Starlux Airlines": "East Asia",
  "Tianjin Airlines": "East Asia",
  XiamenAir: "East Asia",
  ZIPAIR: "East Asia",

  // Southeast Asia
  "Garuda Indonesia": "Southeast Asia",
  "Malaysia Airlines": "Southeast Asia",
  "Philippine Airlines": "Southeast Asia",
  "Royal Brunei": "Southeast Asia",
  "Singapore Airlines": "Southeast Asia",
  "Thai Airways": "Southeast Asia",
  "Vietnam Airlines": "Southeast Asia",

  // Oceania
  "Air New Zealand": "Oceania",
  "Air Tahiti Nui": "Oceania",
  Aircalin: "Oceania",
  "Fiji Airways": "Oceania",
  Qantas: "Oceania",
};

export function airlineRegion(airline: string): LieFlatRegion | null {
  return AIRLINE_REGIONS[airline] ?? null;
}
