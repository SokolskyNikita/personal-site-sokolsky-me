// Data for /travel/best-of-europe. Kept out of the .astro frontmatter so the
// Astro compiler (Go WASM, ~2GB heap cap) never has to parse it; it OOMed on CI.
import type { TravelSpot } from "../components/travel/TravelSpotGuide.astro";

export const europeTravelSpots = [
  {
    "id": "matera-sassi",
    "name": "Matera and the Sassi",
    "countries": [
      "Italy"
    ],
    "area": "Basilicata",
    "kind": "Rock-cut city",
    "access": "Rail/road access and steep walking",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 9,
      "easeOfAccess": 10,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "A large rock-cut settlement with evidence of human occupation from the Palaeolithic to the present",
    "why": "Matera’s rarity is the way cave houses, churches and lanes along the ravine form a city with roots in prehistory. Together the Sassi form an urban fabric built into the natural caves of the Murgia.",
    "realityCheck": "It is now polished and popular. Stay overnight or walk beyond the central lanes to see the city form rather than only the hotel version.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Sassi_di_Matera",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/670/"
    },
    "map": {
      "name": "Sassi di Matera",
      "formattedAddress": "Sassi di Matera, 75100 Matera MT, Italy",
      "placeId": "ChIJp4xntt5-RxMRT-Vw0dgu8FQ",
      "location": {
        "lat": 40.6648626,
        "lng": 16.6107106
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJp4xntt5-RxMRT-Vw0dgu8FQ"
    },
    "trip": {
      "days": 5,
      "costUsd": 850,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "nazare-north-canyon",
    "name": "Nazaré North Canyon giant waves",
    "countries": [
      "Portugal"
    ],
    "area": "Nazaré",
    "kind": "Submarine-canyon surf",
    "access": "Clifftop viewpoints in swell season",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 10,
      "easeOfAccess": 5,
      "lowTouristCrowds": 3,
    },
    "uniqueness": "A submarine canyon that helps produce some of the world’s largest surfable waves",
    "why": "The Nazaré Canyon focuses and refracts incoming swell toward Praia do Norte, where it can meet waves arriving from another direction. Distant Atlantic storms supply the swell, while the canyon's bathymetry helps produce surf over 20 metres high in exceptional conditions.",
    "realityCheck": "Big-wave days are weather-dependent. The season is usually autumn through winter, and a trip can miss the waves entirely.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Nazar%C3%A9,_Portugal#Surfing",
    "source": {
      "label": "NASA Earth Observatory",
      "url": "https://earthobservatory.nasa.gov/images/149486/monster-waves-of-nazare"
    },
    "map": {
      "name": "Nazare Canyon",
      "formattedAddress": "Nazare Canyon, Portugal",
      "placeId": "ChIJtzL8r9BXHw0R9K2LQdmvr-I",
      "rating": 4.9,
      "reviewCount": 24,
      "location": {
        "lat": 39.6,
        "lng": -9.3333333
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJtzL8r9BXHw0R9K2LQdmvr-I"
    },
    "trip": {
      "days": 5,
      "costUsd": 650,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Lisbon or Porto, ground transfer to Nazaré, lodging, meals and swell-window buffer."
    }
  },
{
    "id": "edinburgh-old-town",
    "name": "Edinburgh Old and New Towns",
    "countries": [
      "UK"
    ],
    "area": "Scotland",
    "kind": "Lebedev-loved city fabric",
    "access": "Easy rail/flight access",
    "scores": {
      "globallyUnique": 5,
      "laymenInterest": 9,
      "easeOfAccess": 10,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "Artemy top-tier rating: medieval ridge and planned Georgian city facing each other",
    "why": "Edinburgh is a city, but below the million-person cutoff and in Artemy’s top tier. Its travel value is the paired urban form: Old Town ridge, castle rock, closes, New Town geometry and volcanic hills around the center.",
    "realityCheck": "Festival season changes the city completely. Visit outside peak weeks if the built form is the point.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Old_and_New_Towns_of_Edinburgh",
    "source": {
      "label": "Artemy Lebedev travel rating",
      "url": "https://www.tema.ru/travel/edinburgh/"
    },
    "trip": {
      "days": 4,
      "costUsd": 550,
      "note": "Assumes travel from London via Heathrow (LHR), rail or short flight to Edinburgh, city lodging, meals and local transport."
    },
    "map": {
      "name": "Edinburgh Old Town",
      "formattedAddress": "Edinburgh Old Town, Edinburgh, UK",
      "placeId": "ChIJc1I_X4XHh0gRV9nOqdrZAnk",
      "location": {
        "lat": 55.9489628,
        "lng": -3.1898944
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJc1I_X4XHh0gRV9nOqdrZAnk"
    }
  },
{
    "id": "ajaccio-corsica",
    "name": "Ajaccio and the Gulf of Ajaccio",
    "countries": [
      "France"
    ],
    "area": "Corsica",
    "kind": "Lebedev-loved island city",
    "access": "Flight or ferry access",
    "scores": {
      "globallyUnique": 5,
      "laymenInterest": 9,
      "easeOfAccess": 8,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "Artemy top-tier rating: Corsican harbor city between Napoleonic memory and granite island coast",
    "why": "Ajaccio is included because it is in Artemy’s top tier and gives the Europe page a Corsican urban island case: harbor, citadel edge, Napoleon sites, mountain-backed coast and a different island identity from mainland France.",
    "realityCheck": "The city is modest. Its value comes from pairing the harbor with Corsican roads, coast and interior villages.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Ajaccio",
    "source": {
      "label": "Artemy Lebedev travel rating",
      "url": "https://www.tema.ru/travel/ajaccio/"
    },
    "trip": {
      "days": 5,
      "costUsd": 850,
      "note": "Assumes travel from London via Heathrow (LHR), flights or ferry routing to Corsica, city lodging, meals, local transport and island-road buffer."
    },
    "map": {
      "name": "Ajaccio",
      "formattedAddress": "Ajaccio, France",
      "placeId": "ChIJgyOd0rNp2hIRAF-V_aUZCAQ",
      "location": {
        "lat": 41.919229,
        "lng": 8.738635
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJgyOd0rNp2hIRAF-V_aUZCAQ"
    }
  },
{
    "id": "svaneti-tower-houses",
    "name": "Svaneti tower-houses and Ushguli",
    "countries": [
      "Georgia"
    ],
    "area": "Upper Svaneti",
    "kind": "Mountain defensive villages",
    "access": "Long mountain-road travel; seasonal conditions matter",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 9,
      "easeOfAccess": 5,
      "lowTouristCrowds": 7,
    },
    "uniqueness": "A dense, still-inhabited medieval tower-house landscape in the high Caucasus",
    "why": "Svaneti’s koshki towers are rare because they are not a museum village or a single skyline. Hundreds of defensive tower-houses remain woven into mountain settlements, preserved by isolation and still read against glaciers and daily village life.",
    "realityCheck": "Road conditions and weather decide the trip. Ushguli is remote, increasingly visited in summer, and still not a casual city break.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Upper_Svaneti",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/709/"
    },
    "map": {
      "name": "Ushguli",
      "formattedAddress": "Ushguli, Georgia",
      "placeId": "ChIJGSneBn-4W0ARjqW2w6XkW2g",
      "location": {
        "lat": 42.915824,
        "lng": 43.0189245
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJGSneBn-4W0ARjqW2w6XkW2g"
    },
    "trip": {
      "days": 8,
      "costUsd": 1300,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "danube-delta",
    "name": "Danube Delta",
    "countries": [
      "Romania",
      "Ukraine"
    ],
    "area": "Black Sea coast",
    "kind": "Reed-bed delta ecosystem",
    "access": "Travel from delta towns and villages uses 15 water routes plus nine land routes, with ARBDD permits and route restrictions.",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 9,
      "easeOfAccess": 4,
      "lowTouristCrowds": 6,
    },
    "uniqueness": "Europe’s largest continuous marshland and one of the world’s great reed-bed systems",
    "why": "The delta is a network of reedbeds, floating reed islands, channels and lakes rather than a single viewpoint. More than 300 bird species use it. It is one of Europe's best-preserved deltas, but navigation, tourism and pollution are putting pressure on it.",
    "realityCheck": "It is slow and seasonal. Expect boat-heavy logistics, mosquitoes and weather; check ARBDD permits and route rules before visiting. Treat the Ukrainian side as a separate trip: current Australian travel advice says not to travel from Romania to Ukraine.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Danube_Delta",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/588/"
    },
    "map": {
      "name": "Danube Delta Biosphere Reserve",
      "formattedAddress": "Unnamed Road, Caraorman, Romania",
      "placeId": "ChIJTYNlLjOVuUARrg_twMEBkAg",
      "rating": 4.6,
      "reviewCount": 16,
      "location": {
        "lat": 45.0760245,
        "lng": 29.3973904
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJTYNlLjOVuUARrg_twMEBkAg"
    },
    "trip": {
      "days": 6,
      "costUsd": 900,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "chiatura-cable-cars",
    "name": "Chiatura cable cars",
    "countries": [
      "Georgia"
    ],
    "area": "Imereti",
    "kind": "Urban cable-car transit",
    "access": "Local cable-car and town access",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 7,
      "easeOfAccess": 10,
      "lowTouristCrowds": 8,
    },
    "uniqueness": "A manganese-mining town with cable cars linking its steep valley and outlying districts",
    "why": "Chiatura's 1954 cable-car network moved mineworkers and ore through the steep manganese-mining valley. Modern replacement lines now connect the city centre with outlying districts, while the historic Sashevardno line reopened in late 2024.",
    "realityCheck": "The original Soviet-era system was taken out of service as unsafe, while four modern lines reopened in 2021 and the Sashevardno historic line reopened in late 2024. Check which lines are running before you go.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Chiatura",
    "source": {
      "label": "Wander-Lush",
      "url": "https://wander-lush.org/kutaisi-to-chiatura/"
    },
    "map": {
      "name": "Central Cable Car Station",
      "formattedAddress": "77QP+W6Q, Chiatura, Georgia",
      "placeId": "ChIJ4WeKJOOhXEARDsIMnAc7YY8",
      "rating": 4.9,
      "reviewCount": 80,
      "location": {
        "lat": 42.2898364,
        "lng": 43.2855938
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ4WeKJOOhXEARDsIMnAc7YY8"
    },
    "trip": {
      "days": 6,
      "costUsd": 1000,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Tbilisi or Kutaisi, ground transfer to Chiatura, lodging, meals and local transport."
    }
  },
{
    "id": "olm-dinaric-karst",
    "name": "The olm and the Dinaric karst underground fauna",
    "countries": [
      "Slovenia",
      "Croatia",
      "Bosnia and Herzegovina",
      "Italy"
    ],
    "area": "Dinaric karst",
    "kind": "Cave biodiversity",
    "access": "Tourist cave tours and vivarium exhibits",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 8,
      "easeOfAccess": 10,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "Europe’s only cave-adapted vertebrate and one of the world’s richest regions for subterranean biodiversity",
    "why": "The olm is a blind, neotenic aquatic salamander that lives in the underground waters of the Dinaric karst, from northeastern Italy through Slovenia and Croatia to Bosnia and Herzegovina. Postojna’s Vivarium gives visitors a public view of the animal, while much of the wider cave ecosystem is physically inaccessible.",
    "realityCheck": "Postojna is a mass-tourism site with about a million visitors a year. Wild olm habitat is sensitive to pollution and disturbance, and many caves are inaccessible, so the public vivarium is the practical low-impact way to see the species.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Olm",
    "source": {
      "label": "PLOS ONE",
      "url": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0170945"
    },
    "map": {
      "name": "Vivarij- Vivarium",
      "formattedAddress": "Jamska cesta 29, 6230 Postojna, Slovenia",
      "placeId": "ChIJ-8XUE1gxe0cRN6Qr1MylowA",
      "rating": 3.6,
      "reviewCount": 251,
      "location": {
        "lat": 45.7822509,
        "lng": 14.2047179
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ-8XUE1gxe0cRN6Qr1MylowA"
    },
    "trip": {
      "days": 5,
      "costUsd": 800,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "thingvellir-silfra",
    "name": "Þingvellir and the Silfra fissure",
    "countries": [
      "Iceland"
    ],
    "area": "Southwest Iceland",
    "kind": "Subaerial plate boundary",
    "access": "Golden Circle roads; Silfra snorkeling or diving requires a buddy, a park permit and full cold-water equipment; diving also requires certification",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 7,
      "easeOfAccess": 8,
      "lowTouristCrowds": 3,
    },
    "uniqueness": "An exposed section of Iceland’s Mid-Atlantic rift, with the clear, diveable Silfra fissure inside the rift zone",
    "why": "Þingvellir is an onshore section of Iceland’s Mid-Atlantic rift, where the land between the North American and Eurasian plates is pulling apart and subsiding. Silfra is a water-filled fissure within that rift zone, fed by groundwater filtered through lava from Langjökull glacier and clear enough for roughly 100 metres of visibility.",
    "realityCheck": "Þingvellir is not obscure and Silfra is tightly regulated. Book an operator well ahead or arrange the park permit yourself; expect a buddy requirement, full cold-water gear and water around 2–4°C. The geology matters more than the Instagram split-shot.",
    "wikiUrl": "https://en.wikipedia.org/wiki/%C3%9Eingvellir",
    "source": {
      "label": "Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Silfra"
    },
    "map": {
      "name": "Arctic Adventures Silfra Fissure",
      "formattedAddress": "Thingvellir National Park, 801, Iceland",
      "placeId": "ChIJY5oNa-101kgRFdo1xXhgCPY",
      "rating": 4.7,
      "reviewCount": 1160,
      "location": {
        "lat": 64.2562828,
        "lng": -21.1161408
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJY5oNa-101kgRFdo1xXhgCPY"
    },
    "trip": {
      "days": 4,
      "costUsd": 1200,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "monemvasia",
    "name": "Monemvasia",
    "countries": [
      "Greece"
    ],
    "area": "Laconia",
    "kind": "Medieval fortress town on a sea rock",
    "access": "Road or KTEL bus from Athens; local bus from Gefyra to the fortress",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 8,
      "easeOfAccess": 7,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "Artemy top-tier rating: a walled medieval town on a massive sea rock reached by a narrow causeway",
    "why": "Lebedev's top-tier rating is one reason to include Monemvasia. The town's urban form is unusually compressed: a fortified settlement on a causeway-linked rock, with Byzantine, Venetian and Ottoman layers.",
    "realityCheck": "The rock town is small and can be busy in summer. The upper town is reached by a steep, winding path. Stay overnight if you want the lower town after day traffic leaves.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Monemvasia",
    "source": {
      "label": "Artemy Lebedev travel rating",
      "url": "https://www.tema.ru/travel/rating/cities/"
    },
    "trip": {
      "days": 5,
      "costUsd": 950,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Athens, road transfer through the Peloponnese, lodging, meals and site time."
    },
    "map": {
      "name": "Monemvasia",
      "formattedAddress": "Monemvasia, Greece",
      "placeId": "ChIJX6oO5NFBnhQRMbvzuQYKfds",
      "location": {
        "lat": 36.6876016,
        "lng": 23.056032
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJX6oO5NFBnhQRMbvzuQYKfds"
    }
  },
{
    "id": "mount-athos",
    "name": "Mount Athos",
    "countries": [
      "Greece"
    ],
    "area": "Chalkidiki",
    "kind": "Autonomous monastic peninsula",
    "access": "Permit-limited ferry and foot travel",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 6,
      "easeOfAccess": 3,
      "lowTouristCrowds": 9,
    },
    "uniqueness": "An Orthodox monastic republic with medieval continuity and strict access rules",
    "why": "Mount Athos is a European travel anomaly: an autonomous monastic peninsula, Byzantine religious continuity, no ordinary road tourism and a permit system that shapes who can enter at all. Lebedev’s Athos travel entry makes it a strong missing candidate.",
    "realityCheck": "Women are barred under Athos rules, and male visitors need permits. This is a religious community first and a travel oddity second.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Mount_Athos",
    "source": {
      "label": "Artemy Lebedev",
      "url": "https://www.tema.ru/travel/athos/"
    },
    "trip": {
      "days": 6,
      "costUsd": 1050,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Thessaloniki, transfer to Ouranoupoli, Athos permit, ferry, simple lodging, meals and schedule buffer."
    },
    "map": {
      "name": "Mount Athos",
      "formattedAddress": "Mount Athos, Greece",
      "placeId": "ChIJ84zY0QU1rxQRgZL_MrXK23w",
      "location": {
        "lat": 40.2644928,
        "lng": 24.2152731
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ84zY0QU1rxQRgZL_MrXK23w"
    }
  },
{
    "id": "baarle-border-maze",
    "name": "Baarle-Hertog / Baarle-Nassau border maze",
    "countries": [
      "Belgium",
      "Netherlands"
    ],
    "area": "Baarle",
    "kind": "Inhabited enclave system",
    "access": "Road, bike or regional bus access",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 8,
      "easeOfAccess": 10,
      "lowTouristCrowds": 7,
    },
    "uniqueness": "A town where Belgian and Dutch borders run through streets and buildings",
    "why": "At Loveren 19, the border passes through a house, so one foot can be in Belgium and the other in the Netherlands. The 22 Belgian enclaves and eight Dutch enclaves put marked borders through streets, gardens and other buildings, and the 4 km enclave walk makes the arrangement easy to follow.",
    "realityCheck": "The charm is cartographic, not scenic. Go with a map or walking route and pay attention to the marked borders on the pavement.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Baarle-Hertog",
    "source": {
      "label": "Visit Baarle",
      "url": "https://m-en.visitbaarle.com/locaties/enclaves-5e43f39e38374665355357fe"
    },
    "map": {
      "name": "Baarle-Hertog",
      "formattedAddress": "Baarle-Hertog, Belgium",
      "placeId": "ChIJKU8WMUOlxkcRIE1NL6uZAAQ",
      "location": {
        "lat": 51.4418257,
        "lng": 4.9317107
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJKU8WMUOlxkcRIE1NL6uZAAQ"
    },
    "trip": {
      "days": 4,
      "costUsd": 550,
      "note": "Assumes travel from London via Heathrow (LHR), rail or flight to Brussels/Amsterdam, local train/bus or rental car, lodging, meals and border-walk time."
    }
  },
{
    "id": "bergen-bryggen",
    "name": "Bergen and Bryggen",
    "countries": [
      "Norway"
    ],
    "area": "Vestland",
    "kind": "Harbor city with a Hanseatic wharf",
    "access": "Easy flight/rail access",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 10,
      "easeOfAccess": 10,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "Artemy top-tier rating: UNESCO-listed Hanseatic wharf in Bergen, a harbor city between the sea and steep mountains",
    "why": "Bergen appears in Artemy’s top tier. Around the harbor, Bryggen’s timber trading quarter, the Fish Market and the Fløibanen funicular are all within a short walk. Fjord trips leave from the city too.",
    "realityCheck": "Rain is part of the trip. Bryggen is compact, so add the hills or a fjord day rather than treating it as a one-street stop.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Bryggen",
    "source": {
      "label": "Artemy Lebedev travel rating",
      "url": "https://www.tema.ru/travel/rating/cities/"
    },
    "trip": {
      "days": 5,
      "costUsd": 750,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Bergen, city lodging, meals, local transport and a weather buffer."
    },
    "map": {
      "name": "Bryggen",
      "formattedAddress": "5003 Bergen, Norway",
      "placeId": "ChIJ4TG-gB38PEYRLiN1fX1lePI",
      "rating": 4.7,
      "reviewCount": 6147,
      "location": {
        "lat": 60.3975672,
        "lng": 5.3245494
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ4TG-gB38PEYRLiN1fX1lePI"
    }
  },
{
    "id": "azerbaijan-mud-volcanoes",
    "name": "Azerbaijan mud volcanoes",
    "countries": [
      "Azerbaijan"
    ],
    "area": "Gobustan and Absheron",
    "kind": "Mud volcano field",
    "access": "80 km / 1 h 20 min from Baku by car via E119; raw field routes need a 4x4 or local driver",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 9,
      "easeOfAccess": 7,
      "lowTouristCrowds": 7,
    },
    "uniqueness": "One of Earth's highest concentrations of mud volcanoes, with more than 300 on land and offshore",
    "why": "Azerbaijan has more than 300 mud volcanoes on land and offshore, many clustered near Baku and Qobustan. The Gobustan and Absheron fields expose cold mud, methane-rich gas and sedimentary geology, while submarine eruptions can build short-lived islands in the Caspian Sea.",
    "realityCheck": "The 2024 tourism complex has a visitor center, exhibits and guided quad-bike or golf-cart routes. Raw field sites remain off-road, so check local conditions and arrange a driver before leaving Baku.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Mud_volcanoes_in_Azerbaijan",
    "source": {
      "label": "NASA Earth Observatory",
      "url": "https://science.nasa.gov/earth/earth-observatory/a-school-of-mud-volcano-islands-in-azerbaijan/"
    },
    "map": {
      "name": "Mud Volcanoes Tourism Complex",
      "formattedAddress": "56MP+VM, Cheyildagh, Azerbaijan",
      "placeId": "ChIJddTLP0ZfOkAR6q8eDLlkpcQ",
      "rating": 4.2,
      "reviewCount": 286,
      "location": {
        "lat": 40.1847299,
        "lng": 49.2369421
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJddTLP0ZfOkAR6q8eDLlkpcQ"
    },
    "trip": {
      "days": 5,
      "costUsd": 1050,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "wadden-sea",
    "name": "Wadden Sea",
    "countries": [
      "Netherlands",
      "Germany",
      "Denmark"
    ],
    "area": "North Sea coast",
    "kind": "Tidal flats",
    "access": "Guided mudflat walks, ferries and island bases",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 8,
      "easeOfAccess": 8,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "The largest unbroken intertidal sand-and-mud-flat system on Earth",
    "why": "The Wadden Sea is the world's largest unbroken system of intertidal sand and mud flats. Tides expose the seabed twice a day, and up to 6.1 million birds can be present at once; 10–12 million pass through each year.",
    "realityCheck": "Timing controls everything. Use tide-aware guides for wadlopen, plan ferries carefully and expect wind, mud and weather rather than polished seaside ease.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Wadden_Sea",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/1314/"
    },
    "map": {
      "name": "Wadden Sea National Park",
      "formattedAddress": "Denmark",
      "placeId": "ChIJmXU0hpzHtEcRZXZFzvmikho",
      "rating": 4.6,
      "reviewCount": 7260,
      "location": {
        "lat": 55.2410323,
        "lng": 8.4972079
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJmXU0hpzHtEcRZXZFzvmikho"
    },
    "trip": {
      "days": 5,
      "costUsd": 900,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "pompeii-herculaneum",
    "name": "Pompeii and Herculaneum",
    "countries": [
      "Italy"
    ],
    "area": "Bay of Naples",
    "kind": "Buried Roman cities",
    "access": "Rail and site walking",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 8,
      "easeOfAccess": 10,
      "lowTouristCrowds": 3,
    },
    "uniqueness": "Roman urban life preserved by the 79 CE eruption of Vesuvius",
    "why": "Pompeii gives urban scale while Herculaneum gives denser preservation of houses, timber and upper floors. Together they form a rare city-level disaster record.",
    "realityCheck": "Heat and crowds can be rough. Herculaneum often gives the better preservation-to-crowd ratio.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Pompeii",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/829/"
    },
    "map": {
      "name": "Archaeological Park of Herculaneum",
      "formattedAddress": "Corso Resina, 187, 80056 Ercolano NA, Italy",
      "placeId": "ChIJ17d1Me-mOxMRe4JncVKqWGI",
      "rating": 4.8,
      "reviewCount": 15680,
      "location": {
        "lat": 40.8059253,
        "lng": 14.3473869
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ17d1Me-mOxMRe4JncVKqWGI"
    },
    "trip": {
      "days": 5,
      "costUsd": 900,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "macaronesian-laurel-forest",
    "name": "Macaronesian laurel forest",
    "countries": [
      "Portugal",
      "Spain"
    ],
    "area": "Madeira, Canary Islands and Azores",
    "kind": "Tertiary relict forest",
    "access": "Island forest hikes and levada trails",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 10,
      "easeOfAccess": 6,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "A living remnant of the laurel forests that once covered southern Europe and North Africa",
    "why": "This ranks first because laurisilva is a surviving vegetation type from the Tertiary, now effectively gone from its old continental range and still functioning at scale in Macaronesia. Madeira holds the largest surviving area, with quieter fragments in the Azores and Canaries.",
    "realityCheck": "Fanal and the famous Madeira levadas can be busy, but the rarity is the whole cloud-forest ecosystem. Go beyond the easiest viewpoints if the forest itself is the point.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Laurisilva_of_Madeira",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/934/"
    },
    "map": {
      "name": "Fanal Forest",
      "formattedAddress": "9270, Portugal",
      "placeId": "ChIJCecqzXxPYAwR8GHuxUuHLN4",
      "rating": 4.8,
      "reviewCount": 7155,
      "location": {
        "lat": 32.8096141,
        "lng": -17.1438626
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJCecqzXxPYAwR8GHuxUuHLN4"
    },
    "trip": {
      "days": 6,
      "costUsd": 1100,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "santorini-caldera",
    "name": "Santorini caldera towns",
    "countries": [
      "Greece"
    ],
    "area": "Cyclades",
    "kind": "Lebedev-loved volcanic island",
    "access": "Flight or ferry access",
    "scores": {
      "globallyUnique": 5,
      "laymenInterest": 9,
      "easeOfAccess": 10,
      "lowTouristCrowds": 3,
    },
    "uniqueness": "Artemy top-tier rating: inhabited caldera rim above a Bronze Age volcanic system",
    "why": "Artemy's top-tier rating has a concrete basis: whitewashed villages sit on the rim of a mostly submerged volcanic caldera formed by the Late Bronze Age Minoan eruption.",
    "realityCheck": "Cruise crowds can flatten the place. Stay away from the peak-hour Oia/Fira circuit if possible.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Santorini_caldera",
    "source": {
      "label": "Artemy Lebedev travel rating",
      "url": "https://www.tema.ru/travel/santorini/"
    },
    "trip": {
      "days": 5,
      "costUsd": 950,
      "note": "Assumes travel from London via Heathrow (LHR), flights or Athens ferry routing, island lodging, meals, local buses/taxis and seasonal crowd buffer."
    },
    "map": {
      "name": "Santorini caldera",
      "formattedAddress": "Santorini caldera, Vothonas 847 00, Greece",
      "placeId": "ChIJ8ZIksA_OmRQRF3Zgm9HaoaQ",
      "rating": 4.6,
      "reviewCount": 529,
      "location": {
        "lat": 36.395556,
        "lng": 25.459167
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ8ZIksA_OmRQRF3Zgm9HaoaQ"
    }
  },
{
    "id": "basel-trinational-trams",
    "name": "Basel trinational tram network",
    "countries": [
      "Switzerland",
      "France",
      "Germany"
    ],
    "area": "Basel border region",
    "kind": "Cross-border urban transit",
    "access": "Regular public transit",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 6,
      "easeOfAccess": 10,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "Urban tram lines crossing from one city into two neighboring countries",
    "why": "Travel Stack Exchange identifies Basel as an unusual mass-transit case where tram lines run from Switzerland into both France and Germany. The everydayness of the border crossing is the point.",
    "realityCheck": "The trams are normal transit, so the interest is in riding the cross-border lines and understanding the Schengen border context.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Trams_in_Basel",
    "source": {
      "label": "Travel Stack Exchange",
      "url": "https://travel.stackexchange.com/questions/107729/are-there-any-binational-mass-rapid-transit-systems"
    },
    "map": {
      "name": "Border Triangle Basel",
      "formattedAddress": "Westquaistrasse 75, 4057 Basel, Switzerland",
      "placeId": "ChIJkXwGkoG5kUcRkAu0D_U8heU",
      "rating": 4.2,
      "reviewCount": 2854,
      "location": {
        "lat": 47.5885062,
        "lng": 7.589741699999999
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJkXwGkoG5kUcRkAu0D_U8heU"
    },
    "trip": {
      "days": 4,
      "costUsd": 450,
      "note": "Assumes travel from London via Heathrow (LHR), flights or rail to Basel, local transit, lodging and meals."
    }
  },
{
    "id": "svalbard-high-arctic",
    "name": "Svalbard high Arctic",
    "countries": [
      "Norway"
    ],
    "area": "Norwegian High Arctic",
    "kind": "Accessible polar archipelago",
    "access": "Direct flights from Oslo or Tromsø to Longyearbyen; guided travel recommended outside town",
    "scores": {
      "globallyUnique": 5,
      "laymenInterest": 9,
      "easeOfAccess": 5,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "A high-Arctic settlement and wilderness edge with the Global Seed Vault nearby",
    "why": "Svalbard combines direct flights, polar-bear country, months of midnight sun and polar night, a settlement outside Schengen and the Global Seed Vault in permafrost.",
    "realityCheck": "Outside Longyearbyen, you should travel with a professional guide because of polar-bear risk and rapidly changing conditions. Independent travel can require notification to the Governor and search-and-rescue insurance.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Svalbard",
    "source": {
      "label": "Visit Svalbard",
      "url": "https://en.visitsvalbard.com/inspiration/various/svalbard-global-seed-vault"
    },
    "map": {
      "name": "Longyearbyen",
      "formattedAddress": "Longyearbyen 9170, Svalbard and Jan Mayen",
      "placeId": "ChIJ31dFT9hSnEUR7JVkocqyhto",
      "location": {
        "lat": 78.2253231,
        "lng": 15.6256365
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ31dFT9hSnEUR7JVkocqyhto"
    },
    "trip": {
      "days": 6,
      "costUsd": 1700,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "auschwitz-birkenau",
    "name": "Auschwitz-Birkenau Memorial and Museum",
    "countries": [
      "Poland"
    ],
    "area": "Oświęcim",
    "kind": "Holocaust memorial museum",
    "access": "Online-reserved, timed access to the memorial and museum",
    "scores": {
      "globallyUnique": 9,
      "laymenInterest": 7,
      "easeOfAccess": 10,
      "lowTouristCrowds": 3,
    },
    "uniqueness": "The largely intact grounds of Auschwitz I and Auschwitz II-Birkenau, the principal Nazi German concentration and extermination camp complex",
    "why": "The visit covers preserved grounds and exhibitions at Auschwitz I and Auschwitz II-Birkenau, the principal Nazi German concentration and extermination camp complex. The museum preserves victims' belongings and survivor testimonies while documenting how the Holocaust was carried out.",
    "realityCheck": "Plan for a sober, several-hour visit. Entry passes are limited and reserved online, opening hours vary by month and the Auschwitz I and Auschwitz II-Birkenau sites are 3.5 km apart.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Auschwitz-Birkenau_State_Museum",
    "source": {
      "label": "Auschwitz-Birkenau State Museum",
      "url": "https://www.auschwitz.org/en/visiting/basic-information/"
    },
    "map": {
      "name": "Memorial and Museum Auschwitz-Birkenau",
      "formattedAddress": "Więźniów Oświęcimia 55, 32-600 Oświęcim, Poland",
      "placeId": "ChIJof9NATK-FkcRxVMagtZz4eg",
      "rating": 4.8,
      "reviewCount": 3853,
      "location": {
        "lat": 50.0293909,
        "lng": 19.2054949
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJof9NATK-FkcRxVMagtZz4eg"
    },
    "trip": {
      "days": 5,
      "costUsd": 700,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Krakow or Katowice, transfer to Oświęcim, timed entry or guide, lodging, meals and local transport."
    }
  },
{
    "id": "delta-works",
    "name": "Delta Works and Oosterscheldekering",
    "countries": [
      "Netherlands"
    ],
    "area": "Zeeland",
    "kind": "Water-control infrastructure",
    "access": "Free road, cycle and foot access",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 6,
      "easeOfAccess": 8,
      "lowTouristCrowds": 7,
    },
    "uniqueness": "A nine-kilometre movable storm-surge barrier with 65 concrete piers, 62 gates and a public road, cycle path and footpath",
    "why": "Travel Stack Exchange describes the 9 km Oosterscheldekering as a cycle crossing with a separate cycle path. The barrier normally leaves the Oosterschelde open to tides and closes its 62 gates when high water threatens.",
    "realityCheck": "This is infrastructure travel. Pair the crossing with Deltapark Neeltje Jans, which explains the Delta Works, or with a cycling route; the barrier has a road, cycle path and footpath.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Delta_Works",
    "source": {
      "label": "Travel Stack Exchange",
      "url": "https://travel.stackexchange.com/questions/139851/longest-bridge-tunnel-that-can-be-cycled-over-through"
    },
    "map": {
      "name": "Delta Projects Netherlands",
      "formattedAddress": "Noordzee Route, 4354 RC Vrouwenpolder, Netherlands",
      "placeId": "ChIJrQz6LJ7yxEcR-6pod8-JOVQ",
      "rating": 4.6,
      "reviewCount": 146,
      "location": {
        "lat": 51.6194922,
        "lng": 3.6832669
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJrQz6LJ7yxEcR-6pod8-JOVQ"
    },
    "trip": {
      "days": 5,
      "costUsd": 600,
      "note": "Assumes travel from London via Heathrow (LHR), rail or flight to the Netherlands, Zeeland transfer, lodging, meals and local bike/road access."
    }
  },
{
    "id": "hovertravel-hovercraft",
    "name": "Hovertravel Portsmouth-Ryde hovercraft",
    "countries": [
      "UK"
    ],
    "area": "Solent",
    "kind": "Scheduled hovercraft service",
    "access": "Regular passenger service",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 5,
      "easeOfAccess": 10,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "The only scheduled passenger hovercraft service in Europe.",
    "why": "Hovertravel is Europe's only scheduled passenger hovercraft service, carrying commuters, schoolchildren and tourists between Southsea and Ryde. It is public transport, not a fairground novelty.",
    "realityCheck": "Weather can disrupt service. The ride is short, so pair it with Isle of Wight or Portsmouth context.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Hovertravel",
    "source": {
      "label": "Hovertravel: About Hovertravel",
      "url": "https://www.hovertravel.co.uk/company/about-hovertravel/"
    },
    "map": {
      "name": "Hovertravel | Southsea",
      "formattedAddress": "Clarence Esplanade, Southsea, Portsmouth, Southsea PO5 3AD, UK",
      "placeId": "ChIJa2syRo5ddEgRHUcPWyM2wU4",
      "rating": 4.6,
      "reviewCount": 2531,
      "location": {
        "lat": 50.7851587,
        "lng": -1.099968
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJa2syRo5ddEgRHUcPWyM2wU4"
    },
    "trip": {
      "days": 1,
      "costUsd": 120,
      "note": "Assumes travel from London: rail to Portsmouth, Hovertravel crossing to Ryde, local transit and meals; overnight stay optional."
    }
  },
{
    "id": "plitvice-lakes",
    "name": "Plitvice Lakes",
    "countries": [
      "Croatia"
    ],
    "area": "Lika-Senj and Karlovac counties",
    "kind": "Travertine lake system",
    "access": "Boardwalk routes and marked trails through a national park",
    "scores": {
      "globallyUnique": 6,
      "laymenInterest": 10,
      "easeOfAccess": 10,
      "lowTouristCrowds": 2,
    },
    "uniqueness": "A cascade of 16 named lakes separated by actively growing tufa barriers, unusual for its scale and intactness.",
    "why": "The lake system is visually arresting, but it ranks below places whose defining process has no close analogue: tufa barriers also shape Croatia's Krka River. Plitvice's case is the combination of scale, clear water and public access to an active tufa-building system.",
    "realityCheck": "It is popular and the park uses timed entry. Start early and reserve a slot in the high season. Stay on marked routes: tufa barriers are fragile and the park prohibits straying from trails.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Plitvice_Lakes_National_Park",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/98/"
    },
    "map": {
      "name": "Plitvice Lakes National Park",
      "formattedAddress": "Croatia",
      "placeId": "ChIJPQ_Z_mxeYUcRcF6aN_iPGgU",
      "rating": 4.8,
      "reviewCount": 127825,
      "location": {
        "lat": 44.8653966,
        "lng": 15.5820119
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJPQ_Z_mxeYUcRcF6aN_iPGgU"
    },
    "trip": {
      "days": 5,
      "costUsd": 750,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "st-kilda-scotland",
    "name": "St Kilda archipelago",
    "countries": [
      "UK"
    ],
    "area": "Outer Hebrides",
    "kind": "Lebedev-loved remote archipelago",
    "access": "Boat access in good weather",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 9,
      "easeOfAccess": 2,
      "lowTouristCrowds": 9,
    },
    "uniqueness": "Artemy top-tier rating: evacuated Atlantic island culture and seabird cliffs",
    "why": "St Kilda fits the list because Artemy places it in his top rating tier and the archipelago is also globally hard to replace: an evacuated village, sea stacks, seabird colonies and Atlantic isolation in one small group of islands.",
    "realityCheck": "Landings depend on weather and sea state. Treat any visit as a long Hebrides detour rather than a casual Scotland stop.",
    "wikiUrl": "https://en.wikipedia.org/wiki/St_Kilda,_Scotland",
    "source": {
      "label": "Artemy Lebedev travel rating",
      "url": "https://www.tema.ru/travel/rating/cities/"
    },
    "trip": {
      "days": 7,
      "costUsd": 1600,
      "note": "Assumes travel from London via Heathrow (LHR), flights or rail to Scotland, Hebrides ferry/boat logistics, lodging, meals and a weather buffer."
    },
    "map": {
      "name": "St. Kilda",
      "formattedAddress": "St. Kilda, United Kingdom",
      "placeId": "ChIJAeeUbku88kgRCcS0FFCB9z0",
      "rating": 4.7,
      "reviewCount": 31,
      "location": {
        "lat": 57.83481324783624,
        "lng": -8.56354406037558
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJAeeUbku88kgRCcS0FFCB9z0"
    }
  },
{
    "id": "timanfaya-lanzarote",
    "name": "Timanfaya, Lanzarote",
    "countries": [
      "Spain"
    ],
    "area": "Canary Islands",
    "kind": "Historic basaltic eruption field",
    "access": "Managed national-park routes and demonstrations",
    "scores": {
      "globallyUnique": 6,
      "laymenInterest": 9,
      "easeOfAccess": 9,
      "lowTouristCrowds": 2,
    },
    "uniqueness": "A young lava landscape from one of the longest recorded basaltic fissure eruptions",
    "why": "Timanfaya is notable for the 1730-1736 eruption and for public geothermal demonstrations, but it ranks lower because geothermal cooking and young basaltic landscapes have rivals in the Azores, Iceland, Greece and beyond.",
    "realityCheck": "Much of the park is route-controlled. The demonstrations are memorable, but the stronger trip is understanding how much of Lanzarote the eruption remade.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Timanfaya_National_Park",
    "source": {
      "label": "CACT Lanzarote",
      "url": "https://cactlanzarote.com/en/visit/montanas-del-fuego"
    },
    "map": {
      "name": "Timanfaya National Park",
      "formattedAddress": "Las Palmas, Spain",
      "placeId": "ChIJUVTH9Zc-RgwRPmKK6e7qTN8",
      "rating": 4.6,
      "reviewCount": 36358,
      "location": {
        "lat": 29.0157497,
        "lng": -13.7829235
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJUVTH9Zc-RgwRPmKK6e7qTN8"
    },
    "trip": {
      "days": 5,
      "costUsd": 800,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "giants-causeway",
    "name": "Giant’s Causeway",
    "countries": [
      "UK"
    ],
    "area": "County Antrim",
    "kind": "Columnar basalt",
    "access": "Easy coastal access",
    "scores": {
      "globallyUnique": 6,
      "laymenInterest": 8,
      "easeOfAccess": 10,
      "lowTouristCrowds": 0,
    },
    "uniqueness": "A distinctive basalt-column coast with related formations at Staffa, Mull and Ulva in Scotland",
    "why": "The Causeway is worth keeping, but columnar basalt is not exclusive to this coast: related formations occur at Staffa, Mull and Ulva in Scotland. The draw here is scale, coastal setting and mythology rather than a process unique to Europe.",
    "realityCheck": "It is busy and managed. Walk farther along the coast for context and do not mistake fame for rarity.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Giant%27s_Causeway",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/369/"
    },
    "map": {
      "name": "Giant's Causeway",
      "formattedAddress": "44 Causeway Rd, Bushmills BT57 8SU, UK",
      "placeId": "ChIJD48V9EQpYEgR0h_eGaCMIvM",
      "rating": 4.7,
      "reviewCount": 28825,
      "location": {
        "lat": 55.2408073,
        "lng": -6.5115554
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJD48V9EQpYEgR0h_eGaCMIvM"
    },
    "trip": {
      "days": 4,
      "costUsd": 650,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "dolomites",
    "name": "Dolomites",
    "countries": [
      "Italy"
    ],
    "area": "Eastern Alps",
    "kind": "Fossil reef mountains",
    "access": "Road, cable-car, hut and hiking access",
    "scores": {
      "globallyUnique": 6,
      "laymenInterest": 7,
      "easeOfAccess": 6,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "A classic example of mountains in dolomitic limestone, with Triassic carbonate platforms and tectonic and glacial landforms",
    "why": "The Dolomites merit a place here because their pale limestone peaks expose Triassic carbonate platforms, fossilized atolls and reef-and-basin relationships. Tectonic uplift and erosion shaped that record into a mountain range that remains legible from the trail.",
    "realityCheck": "They are not obscure: the Odle trail near Seceda reportedly drew about 8,000 walkers in one day in summer 2025, and ski resorts get busy in winter. Choose a base by the geology or hikes you want rather than by a postcard peak.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Dolomites",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/1237/"
    },
    "map": {
      "name": "Dolomites",
      "formattedAddress": "Dolomites, 32023 Rocca Pietore, Province of Belluno, Italy",
      "placeId": "ChIJMRTS-V9DeEcRu9n4gwcnT2c",
      "rating": 4.8,
      "reviewCount": 2904,
      "location": {
        "lat": 46.4102117,
        "lng": 11.8440351
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJMRTS-V9DeEcRu9n4gwcnT2c"
    },
    "trip": {
      "days": 6,
      "costUsd": 1000,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "skocjan-caves",
    "name": "Škocjan Caves",
    "countries": [
      "Slovenia"
    ],
    "area": "Karst Plateau",
    "kind": "Cave system",
    "access": "Guided cave route",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 10,
      "easeOfAccess": 6,
      "lowTouristCrowds": 3,
    },
    "uniqueness": "One of the world's largest known underground river canyons in the Classical Karst",
    "why": "The Reka River canyon reaches up to 150 metres high and more than 120 metres wide; its scale is the main event.",
    "realityCheck": "Tours are fixed-route and damp. The surface karst nearby helps explain the cave.",
    "wikiUrl": "https://en.wikipedia.org/wiki/%C5%A0kocjan_Caves",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/390/"
    },
    "map": {
      "name": "Skocjan Caves",
      "formattedAddress": "Matavun 12, 6215 Divača, Slovenia",
      "placeId": "ChIJmebBnZE4e0cR9X9K7-7dp9g",
      "rating": 4.8,
      "reviewCount": 15220,
      "location": {
        "lat": 45.663089,
        "lng": 13.9892129
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJmebBnZE4e0cR9X9K7-7dp9g"
    },
    "trip": {
      "days": 5,
      "costUsd": 850,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "maltese-megalithic-temples",
    "name": "Maltese megalithic temples",
    "countries": [
      "Malta"
    ],
    "area": "Malta and Gozo",
    "kind": "Megalithic temple complex",
    "access": "Heritage Malta sites across Malta and Gozo; the Hypogeum requires timed entry",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 8,
      "easeOfAccess": 8,
      "lowTouristCrowds": 4,
    },
    "uniqueness": "An island-only megalithic tradition older than Stonehenge and the pyramids",
    "why": "The Maltese temples rank high because they form a distinct architectural tradition: enormous freestanding complexes built on small islands without metal tools or the wheel. Ġgantija is the clearest starting point for the set.",
    "realityCheck": "The Hypogeum admits only 10 people at a time and Heritage Malta recommends booking early. The open-air temples are easier to visit, but protective shelters are part of the conservation strategy.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Megalithic_Temples_of_Malta",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/132/"
    },
    "map": {
      "name": "Ġgantija Archaeological Park",
      "formattedAddress": "Triq John Otto Bayer, Ix-Xagħra, Malta",
      "placeId": "ChIJk8jh_Nu0DxMR6LWcGLbQ7Pg",
      "rating": 4.4,
      "reviewCount": 9679,
      "location": {
        "lat": 36.0489144,
        "lng": 14.2678184
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJk8jh_Nu0DxMR6LWcGLbQ7Pg"
    },
    "trip": {
      "days": 5,
      "costUsd": 750,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "meteora",
    "name": "Meteora",
    "countries": [
      "Greece"
    ],
    "area": "Thessaly",
    "kind": "Monastic geology",
    "access": "Road or bus to Kalambaka, then local transfers and monastery stairs",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 8,
      "easeOfAccess": 8,
      "lowTouristCrowds": 2,
    },
    "uniqueness": "Orthodox monasteries perched on a localized landscape of vertical rock pillars",
    "why": "Meteora combines sandstone pillars with Orthodox monasteries that were once reached by ladders, ropes and a hoisting net. Similar rock formations exist elsewhere, but this combination of geology and monastic architecture is rare.",
    "realityCheck": "Dress rules and changing opening days matter. Several monasteries involve steep stairs, and day-trip crowds are real.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Meteora",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/455/"
    },
    "map": {
      "name": "Meteora",
      "formattedAddress": "Kalabaka 422 00, Greece",
      "placeId": "ChIJOX8y6K4PWRMR_zK82NStJ3E",
      "rating": 4.9,
      "reviewCount": 53156,
      "location": {
        "lat": 39.7217044,
        "lng": 21.6305896
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJOX8y6K4PWRMR_zK82NStJ3E"
    },
    "trip": {
      "days": 6,
      "costUsd": 1000,
      "note": "Assumes travel from London via Heathrow (LHR), with economy flights where needed, midrange lodging, meals, local transfers, required fees and a realistic buffer for weather or permits."
    }
  },
{
    "id": "bletchley-park",
    "name": "Bletchley Park and the National Museum of Computing",
    "countries": [
      "UK"
    ],
    "area": "Milton Keynes",
    "kind": "Codebreaking and computing site museum",
    "access": "Rail and museum access",
    "scores": {
      "globallyUnique": 5,
      "laymenInterest": 7,
      "easeOfAccess": 10,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "The codebreaking campus tied to Enigma, Colossus and early computing",
    "why": "Travel Stack Exchange points visitors looking for Alan Turing sites to Bletchley Park, Hut 8, the Bombe reconstruction and the National Museum of Computing. The place is stronger than a memorial because the work happened there.",
    "realityCheck": "Bletchley Park and the computing museum have separate tickets and opening rules. Plan for both if the early-computing story is the reason to go.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Bletchley_Park",
    "source": {
      "label": "Travel Stack Exchange",
      "url": "https://travel.stackexchange.com/questions/92157/are-there-any-museums-or-sites-in-england-honouring-alan-turing"
    },
    "map": {
      "name": "Bletchley Park",
      "formattedAddress": "The Mansion, Bletchley Park, Sherwood Dr, Bletchley, Milton Keynes MK3 6DS, UK",
      "placeId": "ChIJI5OiID5VdkgRc383lIhmbKs",
      "rating": 4.7,
      "reviewCount": 17526,
      "location": {
        "lat": 51.99706219999999,
        "lng": -0.7412023
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJI5OiID5VdkgRc383lIhmbKs"
    },
    "trip": {
      "days": 1,
      "costUsd": 80,
      "note": "Assumes travel from London: train to Bletchley, museum admission, meals and local transit."
    }
  },
{
    "id": "wieliczka-salt-mine",
    "name": "Wieliczka Salt Mine",
    "countries": [
      "Poland"
    ],
    "area": "Near Krakow",
    "kind": "Underground mine museum",
    "access": "Guided underground route",
    "scores": {
      "globallyUnique": 6,
      "laymenInterest": 9,
      "easeOfAccess": 10,
      "lowTouristCrowds": 2,
    },
    "uniqueness": "A historic salt mine with underground chapels, chambers and visitor routes",
    "why": "UNESCO lists Wieliczka with Bochnia as a royal salt-mining complex worked from the 13th century. The visitor route passes through former mine workings with underground chapels, statues and chambers carved from rock salt.",
    "realityCheck": "The route is structured and popular. Book the correct language tour and expect stairs, fixed timing and limited freedom underground.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Wieliczka_Salt_Mine",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/32/"
    },
    "map": {
      "name": "Wieliczka Salt Mine",
      "formattedAddress": "Daniłowicza 10, 32-020 Wieliczka, Poland",
      "placeId": "ChIJS46BBdhDFkcRFbST_a5JJZc",
      "rating": 4.6,
      "reviewCount": 34888,
      "location": {
        "lat": 49.98350199999999,
        "lng": 20.0551878
      },
      "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJS46BBdhDFkcRFbST_a5JJZc"
    },
    "trip": {
      "days": 4,
      "costUsd": 650,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Krakow, local transfer to Wieliczka, guided mine ticket, lodging and meals."
    }
  },
{
    "id": "bru-na-boinne",
    "name": "Brú na Bóinne",
    "countries": [
      "Ireland"
    ],
    "area": "County Meath",
    "kind": "Neolithic passage-tomb landscape",
    "access": "Visitor-centre shuttle and timed guided tours; Newgrange chamber access is limited and pre-booking is essential",
    "scores": {
      "globallyUnique": 8,
      "laymenInterest": 8,
      "easeOfAccess": 9,
      "lowTouristCrowds": 5,
    },
    "uniqueness": "A dense Boyne Valley ritual landscape with chambered tombs older than Stonehenge",
    "why": "Brú na Bóinne is Ireland’s strongest archaeology entry because Newgrange, Knowth and Dowth form a connected Neolithic ritual landscape with large mounds, long passages and carved stones. Newgrange’s winter-solstice alignment gives the site a precise astronomical hook without making the whole visit about one famous chamber.",
    "realityCheck": "Newgrange chamber access is timed and capacity-controlled. Book ahead, and treat Knowth and the wider Boyne landscape as part of the point rather than only chasing the solstice story.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Br%C3%BA_na_B%C3%B3inne",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/659/"
    },
    "map": {
      "name": "Brú na Bóinne Visitor Centre",
      "formattedAddress": "Glebe, Donore, Co. Meath, A92 EH5C, Ireland",
      "location": {
        "lat": 53.694567,
        "lng": -6.446309
      },
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Br%C3%BA+na+B%C3%B3inne+Visitor+Centre+Ireland"
    },
    "trip": {
      "days": 4,
      "costUsd": 700,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Dublin, bus or rental-car access to the Boyne Valley, timed site tickets, lodging, meals and local transfers."
    }
  },
{
    "id": "skellig-michael",
    "name": "Skellig Michael",
    "countries": [
      "Ireland"
    ],
    "area": "County Kerry",
    "kind": "Atlantic monastic island",
    "access": "Seasonal licensed boats; weather-dependent landings",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 9,
      "easeOfAccess": 3,
      "lowTouristCrowds": 8,
    },
    "uniqueness": "A stone beehive monastery set on a steep Atlantic sea stack",
    "why": "Skellig Michael earns a card because the geography and monastic archaeology are inseparable: tiny cells, stairways and terraces built into a storm-exposed rock far off the Kerry coast. It has the drama of remote-island travel while remaining a regulated public visit rather than a private expedition.",
    "realityCheck": "Landing trips run only in the season and depend on weather and sea conditions; visitor numbers are capped. Book early and plan Kerry as the trip, not a one-day guaranteed landing.",
    "wikiUrl": "https://en.wikipedia.org/wiki/Skellig_Michael",
    "source": {
      "label": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/757/"
    },
    "map": {
      "name": "Skellig Michael",
      "formattedAddress": "Skellig Michael, Co. Kerry, Ireland",
      "location": {
        "lat": 51.771111,
        "lng": -10.540556
      },
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Skellig+Michael+Ireland"
    },
    "trip": {
      "days": 6,
      "costUsd": 1200,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Dublin or Cork, ground transfer to Portmagee or Ballinskelligs, licensed boat ticket, Kerry lodging, meals and weather buffer."
    }
  },
{
    "id": "the-burren",
    "name": "The Burren",
    "countries": [
      "Ireland"
    ],
    "area": "County Clare",
    "kind": "Limestone karst and cultural landscape",
    "access": "Road access, marked walks and guided cave visits",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 7,
      "easeOfAccess": 9,
      "lowTouristCrowds": 6,
    },
    "uniqueness": "A glaciated limestone pavement landscape with rare flora, caves and megaliths",
    "why": "The Burren is Ireland's least replaceable landscape entry: exposed limestone pavement, grikes full of unusual plants, turloughs, caves, wedge tombs and Atlantic farming all occupy one region. The limestone surface is the point, with the coast as a useful orientation marker.",
    "realityCheck": "The Cliffs of Moher are nearby, but they are a separate stop. Walk the Burren National Park, visit Poulnabrone Dolmen and take a guided tour at Doolin or Aillwee Cave; the limestone pavement is what makes the Burren distinct.",
    "wikiUrl": "https://en.wikipedia.org/wiki/The_Burren",
    "source": {
      "label": "Burren and Cliffs of Moher UNESCO Global Geopark",
      "url": "https://www.burrengeopark.ie/"
    },
    "map": {
      "name": "The Burren National Park",
      "formattedAddress": "Burren National Park, Co. Clare, Ireland",
      "location": {
        "lat": 53.048056,
        "lng": -9.034167
      },
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Burren+National+Park+Ireland"
    },
    "trip": {
      "days": 5,
      "costUsd": 850,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Shannon or Dublin, rental car or regional transport in County Clare, lodging, meals, site tickets and walking-weather buffer."
    }
  },
{
    "id": "ceide-fields",
    "name": "Céide Fields",
    "countries": [
      "Ireland"
    ],
    "area": "County Mayo",
    "kind": "Neolithic field system under blanket bog",
    "access": "Visitor centre, cliff viewing platform and guided bog tours",
    "scores": {
      "globallyUnique": 7,
      "laymenInterest": 6,
      "easeOfAccess": 7,
      "lowTouristCrowds": 8,
    },
    "uniqueness": "A Stone Age farming landscape preserved beneath Atlantic blanket bog",
    "why": "Céide Fields is a strong Ireland entry for the archaeology-minded: walls, fields and settlement traces from early farming lie beneath peat on the north Mayo coast. The visitor centre's exhibition and guided bog tour explain a settlement that is mostly hidden from view.",
    "realityCheck": "The site is subtle compared with Newgrange or Skellig. Go for the preserved landscape story, the bog archaeology and the north Mayo setting rather than a single spectacular ruin.",
    "wikiUrl": "https://en.wikipedia.org/wiki/C%C3%A9ide_Fields",
    "source": {
      "label": "Heritage Ireland",
      "url": "https://heritageireland.ie/places-to-visit/ceide-fields-neolithic-site-visitor-centre/"
    },
    "map": {
      "name": "Céide Fields",
      "formattedAddress": "Ballycastle, Co. Mayo, Ireland",
      "location": {
        "lat": 54.306667,
        "lng": -9.454167
      },
      "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=C%C3%A9ide+Fields+County+Mayo+Ireland"
    },
    "trip": {
      "days": 5,
      "costUsd": 850,
      "note": "Assumes travel from London via Heathrow (LHR), flights to Dublin or Knock, western-Ireland ground transport, visitor-centre ticket, lodging, meals and Atlantic-weather buffer."
    }
  },
  // Added from the official UNESCO World Heritage List for intact cultural coverage.
  {
      "id": "unesco-569-historic-centres-of-berat-and-gjirokastra",
      "name": "Historic Centres of Berat and Gjirokastra",
      "countries": [
          "Albania"
      ],
      "area": "Central and southern Albania",
      "kind": "UNESCO historic place",
      "access": "Road and bus access from Tirana; steep, uneven stone streets in both historic centres.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 6,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "Two well-preserved fortified historic centres where Ottoman-era houses sit alongside Byzantine churches and mosques.",
      "why": "Berat's Kala includes 13th-century Byzantine churches and Ottoman mosques, while Gjirokastra has 17th-century two-storey houses around its citadel, a bazaar and an 18th-century mosque.",
      "realityCheck": "The two old centres are walkable but steep and uneven. Gjirokastra's shopping streets are touristy, while access to some Byzantine churches in Berat can depend on finding a local key-holder.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/569/"
      },
      "map": {
          "name": "Historic Centres of Berat and Gjirokastra",
          "formattedAddress": "Albania",
          "location": {
              "lat": 40.07416667,
              "lng": 20.14083333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centres+of+Berat+and+Gjirokastra+Albania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-777-monasteries-of-haghpat-and-sanahin",
      "name": "Monasteries of Haghpat and Sanahin",
      "countries": [
          "Armenia"
      ],
      "area": "Lori Province",
      "kind": "UNESCO cultural heritage",
      "access": "Road access from Vanadzor or Alaverdi; local buses and marshrutka vans are possible, but schedules need checking.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 6,
        "easeOfAccess": 6,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "These two complexes combine Byzantine ecclesiastical forms with traditional vernacular building styles from the Caucasus.",
      "why": "These two Byzantine monasteries in the Tumanian region date from the Kiurikian dynasty's prosperous period, the 10th to 13th centuries. They were important centres of learning and Sanahin was known for its school of illuminators and calligraphers.",
      "realityCheck": "Yerevan is 3.5–4 hours away by road and reliable public transport is limited. Stay in Vanadzor or Alaverdi and check local schedules and opening arrangements.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/777/"
      },
      "map": {
          "name": "Monasteries of Haghpat and Sanahin",
          "formattedAddress": "Armenia",
          "location": {
              "lat": 41.095,
              "lng": 44.71028
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monasteries+of+Haghpat+and+Sanahin+Armenia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-960-monastery-of-geghard-and-the-upper-azat-valley",
      "name": "Monastery of Geghard and the Upper Azat Valley",
      "countries": [
          "Armenia"
      ],
      "area": "Kotayk Province, Armenia",
      "kind": "UNESCO religious heritage",
      "access": "Road access from Yerevan; taxi or tour is simplest, while public transport requires a marshrutka to Garni and a local taxi. Check local hours before visiting.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 8,
        "easeOfAccess": 8,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "Rock-cut churches and tombs within a still-used medieval monastery at the entrance to the Azat Valley",
      "why": "The complex combines a 1215 main church with 13th-century churches and tombs cut into the living rock, including the Proshyan princes' mausoleum.",
      "realityCheck": "The site is commonly combined with Garni on half-day trips from Yerevan, so weekday mornings are quieter than weekend afternoons. The gorge road can be icy in January and February; check conditions before driving.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/960/"
      },
      "map": {
          "name": "Monastery of Geghard and the Upper Azat Valley",
          "formattedAddress": "Armenia",
          "location": {
              "lat": 40.140439,
              "lng": 44.818525
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monastery+of+Geghard+and+the+Upper+Azat+Valley+Armenia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1011-cathedral-and-churches-of-echmiatsin-and-the-archaeological-site-of-zvar",
      "name": "Cathedral and Churches of Echmiatsin and the Archaeological Site of Zvartnots",
      "countries": [
          "Armenia"
      ],
      "area": "Armenia",
      "kind": "UNESCO religious and archaeological heritage",
      "access": "The property is split across three areas around Vagharshapat; Zvartnots is a ticketed museum-reserve with fixed visitor hours.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A single World Heritage property joining Echmiatsin's cathedral and three churches with the ruins of Zvartnots, a seventh-century circular cathedral.",
      "why": "The 301–303 cathedral at Echmiatsin and the seventh-century circular church at Zvartnots record the development of Armenia's central-domed cross-hall design, a form that influenced architecture and art across the region.",
      "realityCheck": "The cathedral reopened after a six-year restoration in 2024, but the property still spans three areas and Zvartnots has fixed visitor hours. Check current hours and any church or conservation closures before planning the visit.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1011/"
      },
      "map": {
          "name": "Cathedral and Churches of Echmiatsin and the Archaeological Site of Zvartnots",
          "formattedAddress": "Armenia",
          "location": {
              "lat": 40.15931,
              "lng": 44.29514
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cathedral+and+Churches+of+Echmiatsin+and+the+Archaeological+Site+of+Zvartnots+Armenia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-784-historic-centre-of-the-city-of-salzburg",
      "name": "Historic Centre of the City of Salzburg",
      "countries": [
          "Austria"
      ],
      "area": "Salzburg, Austria",
      "kind": "UNESCO historic city centre",
      "access": "Pedestrian old town; Salzburg Central Station is a 20-minute walk away, with trolleybus lines 1, 3, 5, 6 and 25 to the city centre",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 8,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "The most completely preserved surviving example of an ecclesiastical city-state from the Holy Roman Empire, with a Baroque skyline dominated by Hohensalzburg Fortress",
      "why": "Salzburg retains the split between the prince-archbishops' monumental district around the cathedral and the burghers' narrow streets and small plots. Italian architects Vincenzo Scamozzi and Santino Solari gave the centre much of its Baroque appearance.",
      "realityCheck": "Salzburg is a major tourist stop: the city recorded 1,836,515 arrivals and 3,288,513 overnight stays in 2025. For summer 2026, the old town's pedestrian streets and a 1 July–31 August traffic rule limit car access in the centre, so use public transport or park-and-ride.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/784/"
      },
      "map": {
          "name": "Historic Centre of the City of Salzburg",
          "formattedAddress": "Austria",
          "location": {
              "lat": 47.80055556,
              "lng": 13.04333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+the+City+of+Salzburg+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-785-semmering-railway",
      "name": "Semmering Railway",
      "countries": [
          "Austria"
      ],
      "area": "Lower Austria and Styria, Austria",
      "kind": "UNESCO industrial heritage",
      "access": "Daily train service from Vienna or Graz; marked railway hiking trails and local buses",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "A continuously operating 19th-century mountain railway with 14 tunnels, 16 major viaducts and nearby resort buildings",
      "why": "Built between 1848 and 1854, the 41-km route crosses the Semmering Pass through 14 tunnels and 16 major viaducts, and the line remains in continuous use.",
      "realityCheck": "Trains run daily, but this is an active public railway rather than a heritage excursion. The railway hiking trail is closed between Semmering and Wolfsbergkogel; use the detour via Südbahnstraße and Adlitzgrabenstraße.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/785/"
      },
      "map": {
          "name": "Semmering Railway",
          "formattedAddress": "Austria",
          "location": {
              "lat": 47.64877778,
              "lng": 15.82797222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Semmering+Railway+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-786-palace-and-gardens-of-schonbrunn",
      "name": "Palace and Gardens of Schönbrunn",
      "countries": [
          "Austria"
      ],
      "area": "Vienna",
      "kind": "UNESCO cultural landscape",
      "access": "In Vienna; U4, trams 10 and 60 and bus 10A stop at the palace",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "The palace and gardens form a Baroque Gesamtkunstwerk; the 18th-century park layout is virtually untouched and the complex retains its original architecture, furnishings and spatial relationship.",
      "why": "From the 18th century to 1918, Schönbrunn was the residence of the Habsburg emperors. It was designed by the architects Johann Bernhard Fischer von Erlach and Nicolaus Pacassi and is full of outstanding examples of decorative art.",
      "realityCheck": "The park is free during opening hours, but palace admission and the special garden attractions are ticketed and follow separate seasonal schedules. Schönbrunn is heavily visited, so pre-book the palace on busy days.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/786/"
      },
      "map": {
          "name": "Palace and Gardens of Schönbrunn",
          "formattedAddress": "Austria",
          "location": {
              "lat": 48.18666667,
              "lng": 16.31333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Palace+and+Gardens+of+Sch%C3%B6nbrunn+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-806-hallstatt-dachstein-salzkammergut-cultural-landscape",
      "name": "Hallstatt-Dachstein / Salzkammergut Cultural Landscape",
      "countries": [
          "Austria"
      ],
      "area": "Austria",
      "kind": "UNESCO cultural landscape",
      "access": "Train, bus or car access; Hallstatt village has limited parking and the train station requires a ferry connection.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 7,
        "lowTouristCrowds": 3,
      },
      "uniqueness": "A preserved Alpine cultural landscape shaped by more than 2,500 years of salt mining, timber production and transhumance.",
      "why": "Systematic salt production began in the late 2nd millennium BC. Salt mining underpinned the region's prosperity into the 20th century and is visible in Hallstatt's architecture.",
      "realityCheck": "Salzwelten Hallstatt and its Skywalk are closed for construction through 28 August 2026, with reopening scheduled for 29 August. Hallstatt can see up to 10,000 visitors on peak days, so check attraction hours, parking and crowd conditions before planning around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/806/"
      },
      "map": {
          "name": "Hallstatt-Dachstein / Salzkammergut Cultural Landscape",
          "formattedAddress": "Austria",
          "location": {
              "lat": 47.55944444,
              "lng": 13.64638889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Hallstatt-Dachstein+%2F+Salzkammergut+Cultural+Landscape+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-931-city-of-graz-historic-centre-and-schloss-eggenberg",
      "name": "City of Graz – Historic Centre and Schloss Eggenberg",
      "countries": [
          "Austria"
      ],
      "area": "Austria",
      "kind": "UNESCO historic place",
      "access": "Walkable historic centre; tram and a short walk to Schloss Eggenberg",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed urban ensemble joining Graz's historic centre with Schloss Eggenberg, a 17th-century palace and its gardens",
      "why": "Graz's historic centre and Schloss Eggenberg combine architectural styles from the Middle Ages through the 18th century. The Habsburgs and major aristocratic families shaped the city's political and artistic history.",
      "realityCheck": "The historic centre is easy to walk, but Schloss Eggenberg is about 3 km west. Its state rooms are seasonal and accessible only by guided tour, so check current hours before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/931/"
      },
      "map": {
          "name": "City of Graz – Historic Centre and Schloss Eggenberg",
          "formattedAddress": "Austria",
          "location": {
              "lat": 47.07305556,
              "lng": 15.43861111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=City+of+Graz+%E2%80%93+Historic+Centre+and+Schloss+Eggenberg+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-970-wachau-cultural-landscape",
      "name": "Wachau Cultural Landscape",
      "countries": [
          "Austria"
      ],
      "area": "Lower Austria",
      "kind": "UNESCO cultural landscape",
      "access": "Train to Melk or Krems, then regional buses, ferries and seasonal river boats",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 8,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A UNESCO-listed Danube valley where medieval settlements and vineyard terraces remain part of a working landscape",
      "why": "The Wachau is a stretch of the Danube between Melk and Krems, with medieval towns, monasteries, castle ruins and steep vineyard terraces. UNESCO describes intact architectural, urban and agricultural traces of the valley's evolution since prehistoric times.",
      "realityCheck": "Public transport works without a car, but schedules are seasonal: north-bank buses run hourly, south-bank buses every two hours and two of the three ferries operate only from spring to autumn. River cruises can be reduced by low water, so check the timetable before relying on a boat.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/970/"
      },
      "map": {
          "name": "Wachau Cultural Landscape",
          "formattedAddress": "Austria",
          "location": {
              "lat": 48.36444444,
              "lng": 15.43416667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wachau+Cultural+Landscape+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1033-historic-centre-of-vienna",
      "name": "Historic Centre of Vienna",
      "countries": [
          "Austria"
      ],
      "area": "Austria",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 8,
          "easeOfAccess": 10,
          "lowTouristCrowds": 3
        },
      "uniqueness": "A UNESCO-listed city centre with a medieval core, Baroque palace ensembles and the late-19th-century Ringstrasse",
      "why": "Vienna developed from early Celtic and Roman settlements into a medieval and Baroque city and later became the capital of the Austro-Hungarian Empire. It was a leading European music centre from the age of Viennese Classicism through the early 20th century.",
      "realityCheck": "The 371 ha property is a working city centre, not a single gated sight. UNESCO lists it as World Heritage in Danger for 2017–2026 because of development pressures, while Vienna’s Tourist Board says most museums open around 10:00–17:00 with some weekly closures.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1033/"
      },
      "map": {
          "name": "Historic Centre of Vienna",
          "formattedAddress": "Austria",
          "location": {
              "lat": 48.2094,
              "lng": 16.3699
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Vienna+Austria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-958-walled-city-of-baku-with-the-shirvanshah-s-palace-and-maiden-tower",
      "name": "Walled City of Baku with the Shirvanshah's Palace and Maiden Tower",
      "countries": [
          "Azerbaijan"
      ],
      "area": "Azerbaijan",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A rare medieval walled urban ensemble where 12th-century defenses, the Maiden Tower and the Shirvanshahs' Palace remain part of a living city.",
      "why": "The Walled City of Baku occupies a site inhabited since the Palaeolithic period and preserves evidence of Zoroastrian, Sasanian, Arabic, Persian, Shirvani, Ottoman and Russian presence across its history.",
      "realityCheck": "The inner city is walkable, but the Maiden Tower and Shirvanshahs' Palace are ticketed museums listed as open daily from 10:00 to 19:00. Check the official site before visiting for changes or restoration work.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/958/"
      },
      "map": {
          "name": "Walled City of Baku with the Shirvanshah's Palace and Maiden Tower",
          "formattedAddress": "Azerbaijan",
          "location": {
              "lat": 40.36666667,
              "lng": 49.83333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Walled+City+of+Baku+with+the+Shirvanshah%27s+Palace+and+Maiden+Tower+Azerbaijan"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1696-cultural-landscape-of-khinalig-people-and-koc-yolu-transhumance-route",
      "name": "Cultural Landscape of Khinalig People and “Köç Yolu” Transhumance Route",
      "countries": [
          "Azerbaijan"
      ],
      "area": "Greater Caucasus and central Azerbaijan",
      "kind": "UNESCO cultural landscape",
      "access": "Remote mountain access; arrange local transport for the final 55 km from Guba",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 5,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A living UNESCO cultural landscape organized around a 200-kilometre vertical transhumance route",
      "why": "This cultural landscape includes the high-mountain Khinalig village in northern Azerbaijan, high-altitude summer pastures and agricultural terraces in the Greater Caucasus Mountains, winter pastures in the lowland plains in central Azerbaijan and the connecting 200-kilometre-long seasonal transhumance route called Köç Yolu (“Migration Route”).",
      "realityCheck": "Khinalig is 60 km from Guba, and the reserve's visitor guide says to arrange local transport for the final 55 km; mountain permits may be needed in July and August. UNESCO's 2025 conservation review lists tourism and visitor management as active factors, so check seasonal access and local rules before setting out.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1696/"
      },
      "map": {
          "name": "Cultural Landscape of Khinalig People and “Köç Yolu” Transhumance Route",
          "formattedAddress": "Azerbaijan",
          "location": {
              "lat": 40.7059,
              "lng": 48.8854
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cultural+Landscape+of+Khinalig+People+and+%E2%80%9CK%C3%B6%C3%A7+Yolu%E2%80%9D+Transhumance+Route+Azerbaijan"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-625-mir-castle-complex",
      "name": "Mir Castle Complex",
      "countries": [
          "Belarus"
      ],
      "area": "Belarus",
      "kind": "UNESCO fortification",
      "access": "Road or bus access from Minsk; museum entry is ticketed",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 6,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed castle combining Gothic, Renaissance and Baroque architecture",
      "why": "The construction of this castle began at the end of the 15th century, in Gothic style. It was subsequently extended and reconstructed, first in the Renaissance and then in the Baroque style.",
      "realityCheck": "The museum is open daily from 10:00 to 19:00, with ticket sales ending at 18:20; the grounds are free, but museum entry requires a ticket.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/625/"
      },
      "map": {
          "name": "Mir Castle Complex",
          "formattedAddress": "Belarus",
          "location": {
              "lat": 53.45108333,
              "lng": 26.47272222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Mir+Castle+Complex+Belarus"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-856-the-four-lifts-on-the-canal-du-centre-and-their-environs-la-louviere-and",
      "name": "The Four Lifts on the Canal du Centre and their Environs, La Louvière and Le Roeulx (Hainaut)",
      "countries": [
          "Belgium"
      ],
      "area": "Belgium",
      "kind": "UNESCO industrial heritage",
      "access": "RAVeL loop past the four lifts; tourist and educational activities are no longer scheduled.",
      "scores": {
        "globallyUnique": 9,
        "laymenInterest": 6,
        "easeOfAccess": 10,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "The four hydraulic boat-lifts are the only ones among the eight built in the late 19th and early 20th centuries that remain in their original working condition.",
      "why": "Over 7 km of the historic Canal du Centre, four hydraulic lifts each raise boats 15 to 16 metres. The canal, bridges, machinery buildings and staff housing remain together as a well-preserved late-19th-century industrial complex.",
      "realityCheck": "The Canal du Centre website says its sites are closed and its tourist and educational activities ended with the 2025 season, although the lifts continue to operate. Contact Centrissime or Wallonia's waterways service before planning an interior visit; the official RAVeL loop passes the lifts.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/856/"
      },
      "map": {
          "name": "The Four Lifts on the Canal du Centre and their Environs, La Louvière and Le Roeulx (Hainaut)",
          "formattedAddress": "Belgium",
          "location": {
              "lat": 50.48111,
              "lng": 4.13722
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Four+Lifts+on+the+Canal+du+Centre+and+their+Environs%2C+La+Louvi%C3%A8re+and+Le+Roeulx+%28Hainaut%29+Belgium"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-996-historic-centre-of-brugge",
      "name": "Historic Centre of Brugge",
      "countries": [
          "Belgium"
      ],
      "area": "Belgium",
      "kind": "UNESCO historic place",
      "access": "Walkable historic centre; direct trains from Brussels",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A UNESCO-listed medieval city centre where the street plan, canals and brick-Gothic architecture remain legible",
      "why": "Brugge keeps its medieval street pattern, canals and brick-Gothic buildings. The Market Place, belfry, churches and commercial complexes show how the city grew as a trading centre. Brugge was also the birthplace of the Flemish Primitives.",
      "realityCheck": "Bruges is easy to walk but not quiet: Visit Bruges reported eight million day and overnight visitors in the historic centre in 2024, averaging 27,000 a day, with crowd-related pressure at certain times and places. Check current opening hours for museums and landmarks before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/996/"
      },
      "map": {
          "name": "Historic Centre of Brugge",
          "formattedAddress": "Belgium",
          "location": {
              "lat": 51.20891,
              "lng": 3.22527
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Brugge+Belgium"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1009-notre-dame-cathedral-in-tournai",
      "name": "Notre-Dame Cathedral in Tournai",
      "countries": [
          "Belgium"
      ],
      "area": "Belgium",
      "kind": "UNESCO religious heritage",
      "access": "Open to visitors; hours vary by day and restoration work can limit access to some sections.",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A rare Romanesque-Gothic cathedral with a five-tower transept and a 13th-century Gothic choir.",
      "why": "The cathedral was built in the first half of the 12th century. Its Romanesque nave has unusual dimensions and richly sculpted capitals, while the transept carries five towers that anticipate Gothic forms. The choir, rebuilt in the 13th century, is Gothic.",
      "realityCheck": "Hours vary by day, and a floor-renovation project begun in May 2026 is expected to run for two years; check current closures before planning around the interior.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1009/"
      },
      "map": {
          "name": "Notre-Dame Cathedral in Tournai",
          "formattedAddress": "Belgium",
          "location": {
              "lat": 50.60603,
              "lng": 3.38926
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Notre-Dame+Cathedral+in+Tournai+Belgium"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1185-plantin-moretus-house-workshops-museum-complex",
      "name": "Plantin-Moretus House-Workshops-Museum Complex",
      "countries": [
          "Belgium"
      ],
      "area": "Belgium",
      "kind": "UNESCO architectural heritage",
      "access": "Currently closed for renovation through 4 December 2026; normally open Tuesday–Sunday 10:00–17:00 in central Antwerp.",
      "scores": {
        "globallyUnique": 9,
        "laymenInterest": 6,
        "easeOfAccess": 10,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "The world's only surviving Renaissance- and Baroque-era printing workshop and publishing house, with workshop equipment and furnishings kept in situ, an extensive library, business archives and works of art.",
      "why": "The complex preserves the Plantin-Moretus family's home, workshops, library and business archives in the same location where the firm operated from 1576 to 1867. It also holds the world's two oldest printing presses, along with books and art tied to Antwerp's role in early European typography.",
      "realityCheck": "The museum is currently closed for renovation through 4 December 2026 and is scheduled to reopen on 5 December. Outside that closure, the official site lists Tuesday–Sunday hours of 10:00–17:00; check the museum's visitor page before planning a visit.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1185/"
      },
      "map": {
          "name": "Plantin-Moretus House-Workshops-Museum Complex",
          "formattedAddress": "Belgium",
          "location": {
              "lat": 51.21833,
              "lng": 4.39778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Plantin-Moretus+House-Workshops-Museum+Complex+Belgium"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-946-old-bridge-area-of-the-old-city-of-mostar",
      "name": "Old Bridge Area of the Old City of Mostar",
      "countries": [
          "Bosnia and Herzegovina"
      ],
      "area": "Bosnia and Herzegovina",
      "kind": "UNESCO cultural World Heritage site",
      "access": "Walkable old-town site; the train station is five minutes from central Mostar and buses connect to Sarajevo, Split and Dubrovnik.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "Reconstructed 16th-century Ottoman bridge in a historic town with pre-Ottoman, Ottoman, Mediterranean and western European architectural layers",
      "why": "Mostar grew in the 15th and 16th centuries as an Ottoman frontier town in the Neretva valley, then developed further during Austro-Hungarian rule. The Old Bridge and much of the historic town were rebuilt after the 1990s conflict.",
      "realityCheck": "The bridge and old-town streets are open-air public spaces, but the Old Bridge Museum has seasonal hours. UNESCO reports that many visitors arrive for one day, putting pressure on the site.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/946/"
      },
      "map": {
          "name": "Old Bridge Area of the Old City of Mostar",
          "formattedAddress": "Bosnia and Herzegovina",
          "location": {
              "lat": 43.33730556,
              "lng": 17.815
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+Bridge+Area+of+the+Old+City+of+Mostar+Bosnia+and+Herzegovina"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1260-mehmed-pasa-sokolovic-bridge-in-visegrad",
      "name": "Mehmed Paša Sokolović Bridge in Višegrad",
      "countries": [
          "Bosnia and Herzegovina"
      ],
      "area": "Bosnia and Herzegovina",
      "kind": "UNESCO architectural heritage",
      "access": "Pedestrian bridge in Višegrad; daily but limited bus service from Sarajevo",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 6,
        "easeOfAccess": 6,
        "lowTouristCrowds": 5,
      },
      "uniqueness": "UNESCO-listed Ottoman bridge by Mimar Koca Sinan, with 11 masonry arches and a total length of 179.5 m",
      "why": "The Mehmed Paša Sokolović Bridge of Višegrad across the Drina River in the east of Bosnia and Herzegovina was built at the end of the 16th century by the court architect Mimar Koca Sinan on the orders of Grand Vizier Mehmed Paša Sokolović.",
      "realityCheck": "Višegrad is about 130 km from Sarajevo, and the current bus journey takes roughly three hours. Check return transport and local access conditions before building a trip around the bridge.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1260/"
      },
      "map": {
          "name": "Mehmed Paša Sokolović Bridge in Višegrad",
          "formattedAddress": "Bosnia and Herzegovina",
          "location": {
              "lat": 43.78144444,
              "lng": 19.288025
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Mehmed+Pa%C5%A1a+Sokolovi%C4%87+Bridge+in+Vi%C5%A1egrad+Bosnia+and+Herzegovina"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-42-boyana-church",
      "name": "Boyana Church",
      "countries": [
          "Bulgaria"
      ],
      "area": "Bulgaria",
      "kind": "UNESCO religious heritage",
      "access": "Open daily with seasonal hours; organized groups need reservations. Visits are limited to 10 minutes for up to 9 people at a time.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "Three-period church complex with 1259 frescoes and later painted layers",
      "why": "Located on the outskirts of Sofia, Boyana Church consists of three buildings. The eastern church was built in the 10th century and enlarged at the beginning of the 13th century by Sebastocrator Kaloyan, who ordered a second two-storey building beside it; a third church was added at the beginning of the 19th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/42/"
      },
      "map": {
          "name": "Boyana Church",
          "formattedAddress": "Bulgaria",
          "location": {
              "lat": 42.64463194,
              "lng": 23.26618278
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Boyana+Church+Bulgaria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-45-rock-hewn-churches-of-ivanovo",
      "name": "Rock-Hewn Churches of Ivanovo",
      "countries": [
          "Bulgaria"
      ],
      "area": "Bulgaria",
      "kind": "UNESCO religious heritage",
      "access": "Paid, seasonal access by road to the foot of the rocks, with stairs to the churches; a marked path from Ivanovo takes about 40 minutes.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "A medieval monastic complex carved into natural karst cavities, with 13th- and 14th-century churches and frescoes preserved in the rock.",
      "why": "In the Rusenski Lom valley near Ivanovo, hermits first carved cells and churches into the rock in the 12th century. The complex later grew to include chapels and monasteries, with 14th-century murals by the Tarnovo School.",
      "realityCheck": "Access is seasonal and paid. A road reaches the foot of the rocks, followed by stairs; a marked path from Ivanovo takes about 40 minutes. Published official hours differ, so confirm the schedule before going.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/45/"
      },
      "map": {
          "name": "Rock-Hewn Churches of Ivanovo",
          "formattedAddress": "Bulgaria",
          "location": {
              "lat": 43.694858,
              "lng": 25.987893
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Rock-Hewn+Churches+of+Ivanovo+Bulgaria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-216-rila-monastery",
      "name": "Rila Monastery",
      "countries": [
          "Bulgaria"
      ],
      "area": "Bulgaria",
      "kind": "UNESCO religious heritage",
      "access": "Open to visitors year-round; check monastery and museum hours and transport from Sofia",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 8,
        "easeOfAccess": 7,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A UNESCO-listed monastery with a 19th-century Bulgarian Renaissance complex and a functioning monastic community",
      "why": "St John of Rila founded the monastery in the 10th century after living as a hermit in the Rila Mountains. His dwelling and tomb became a holy site, and the monastery became a spiritual and social centre in medieval Bulgaria. After a fire at the beginning of the 19th century, the complex was rebuilt between 1834 and 1862 as a characteristic example of Bulgarian Renaissance architecture.",
      "realityCheck": "The monastery is about 120 km from Sofia and publishes rules on dress, photography and conduct; museum hours vary by season. Check the official site before travelling, especially if you plan to use public transport.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/216/"
      },
      "map": {
          "name": "Rila Monastery",
          "formattedAddress": "Bulgaria",
          "location": {
              "lat": 42.133298,
              "lng": 23.340187
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Rila+Monastery+Bulgaria"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-95-old-city-of-dubrovnik",
      "name": "Old City of Dubrovnik",
      "countries": [
          "Croatia"
      ],
      "area": "Croatia",
      "kind": "UNESCO historic place",
      "access": "Pedestrian old-town access; the city-wall walk requires a ticket.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 8,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "UNESCO-listed walled city with preserved Gothic, Renaissance and Baroque buildings inside its historic fortifications.",
      "why": "On the Dalmatian coast, Dubrovnik became an important Mediterranean sea power from the 13th century. The 1667 earthquake severely damaged the city, but it preserved Gothic, Renaissance and Baroque churches, monasteries, palaces and fountains.",
      "realityCheck": "Cruise-day crowds are a real constraint: Dubrovnik's port recorded more than 625,000 cruise passengers across 433 ship calls in 2025. Check city-wall opening hours and current restoration or access notices before planning around the old town.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/95/"
      },
      "map": {
          "name": "Old City of Dubrovnik",
          "formattedAddress": "Croatia",
          "location": {
              "lat": 42.64142111,
              "lng": 18.10886111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+City+of+Dubrovnik+Croatia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-97-historical-complex-of-split-with-the-palace-of-diocletian",
      "name": "Historical Complex of Split with the Palace of Diocletian",
      "countries": [
          "Croatia"
      ],
      "area": "Croatia",
      "kind": "UNESCO historic place",
      "access": "Walkable public streets in Split's historic centre; the palace itself is free to enter, while paid interiors have separate hours and admission.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A Roman imperial palace whose walls and substructures are part of a living, inhabited historic centre",
      "why": "Built for Emperor Diocletian between the late 3rd and early 4th centuries A.D., the palace now forms the core of Split. The cathedral occupies the ancient mausoleum, and later medieval, Renaissance and Baroque buildings filled out the protected centre.",
      "realityCheck": "Most of the palace is an inhabited city centre with free public streets, not a gated attraction. The cathedral, bell tower and developed substructures have separate hours and admission. Split recorded 3.2 million tourist nights in 2025, so summer visits to the Peristyle are better early in the day.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/97/"
      },
      "map": {
          "name": "Historical Complex of Split with the Palace of Diocletian",
          "formattedAddress": "Croatia",
          "location": {
              "lat": 43.50888889,
              "lng": 16.43916667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historical+Complex+of+Split+with+the+Palace+of+Diocletian+Croatia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-809-episcopal-complex-of-the-euphrasian-basilica-in-the-historic-centre-of-p",
      "name": "Episcopal Complex of the Euphrasian Basilica in the Historic Centre of Poreč",
      "countries": [
          "Croatia"
      ],
      "area": "Croatia",
      "kind": "UNESCO historic place",
      "access": "Walkable from nearby car parks; the old town is mostly closed to traffic.",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 9,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "The most complete surviving early Christian episcopal complex of its type, combining a basilica, atrium, baptistery and episcopal palace in Poreč's historic centre.",
      "why": "Poreč had a Christian community by the 4th century. Its basilica, atrium, baptistery and episcopal palace form the most complete surviving early Christian complex of this type.",
      "realityCheck": "Hours vary by month; the complex is closed on Sundays and Catholic holy days and religious services can interrupt visits. Check the current schedule before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/809/"
      },
      "map": {
          "name": "Episcopal Complex of the Euphrasian Basilica in the Historic Centre of Poreč",
          "formattedAddress": "Croatia",
          "location": {
              "lat": 45.22858333,
              "lng": 13.59333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Episcopal+Complex+of+the+Euphrasian+Basilica+in+the+Historic+Centre+of+Pore%C4%8D+Croatia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-810-historic-city-of-trogir",
      "name": "Historic City of Trogir",
      "countries": [
          "Croatia"
      ],
      "area": "Croatia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "Hellenistic street grid and Romanesque, Renaissance and Baroque buildings survive in a compact island town.",
      "why": "Trogir's historic island still follows a Hellenistic street grid, with Romanesque churches, Venetian Renaissance and Baroque buildings, palaces and fortifications packed into the core.",
      "realityCheck": "The streets are free to enter, but paid sights keep separate hours. Summer cruise excursions crowd the small core, and non-resident cars must stay outside the historic island.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/810/"
      },
      "map": {
          "name": "Historic City of Trogir",
          "formattedAddress": "Croatia",
          "location": {
              "lat": 43.51708333,
              "lng": 16.25136111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+City+of+Trogir+Croatia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-963-the-cathedral-of-st-james-in-sibenik",
      "name": "The Cathedral of St James in Šibenik",
      "countries": [
          "Croatia"
      ],
      "area": "Croatia",
      "kind": "UNESCO religious heritage",
      "access": "Visitor access; hours vary by season and Mass times.",
      "scores": {
        "globallyUnique": 7,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "An all-stone Gothic-Renaissance cathedral with unusual vaulting, a dome and a frieze of 71 sculpted faces.",
      "why": "Built from 1431 to 1535, the cathedral combines Gothic and Renaissance forms in an all-stone structure with unusual vaulting and a dome. UNESCO ties that combination to exchanges among Northern Italy, Dalmatia and Tuscany.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/963/"
      },
      "map": {
          "name": "The Cathedral of St James in Šibenik",
          "formattedAddress": "Croatia",
          "location": {
              "lat": 43.73629,
              "lng": 15.89038
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Cathedral+of+St+James+in+%C5%A0ibenik+Croatia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-616-historic-centre-of-prague",
      "name": "Historic Centre of Prague",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A preserved urban ensemble spanning Prague’s medieval town plan, Gothic monuments, Baroque buildings and modernist architecture",
      "why": "The Old Town, Lesser Town and New Town preserve Prague’s medieval urban plan alongside major monuments such as Prague Castle, St Vitus Cathedral and Charles Bridge. UNESCO says the city’s Gothic, Baroque and modernist architecture influenced Central European architecture.",
      "realityCheck": "Treat it as a working city centre, not a gated attraction. Prague recorded 8.27 million guests in lodging facilities in 2025, and Deutsche Welle reported overtourism pressure in 2024; the metro and tram network makes the central districts easy to reach.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/616/"
      },
      "map": {
          "name": "Historic Centre of Prague",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 50.08972,
              "lng": 14.41944
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Prague+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-617-historic-centre-of-cesky-krumlov",
      "name": "Historic Centre of Český Krumlov",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A medieval town on a Vltava meander where the castle, planned street layout and many historic buildings remain intact",
      "why": "Built around a 13th-century castle on both banks of the Vltava, the town combines Gothic, Renaissance and Baroque elements. Its medieval street layout and many historic buildings remain largely intact, including Renaissance and Baroque facades and original interiors.",
      "realityCheck": "Český Krumlov is heavily visited, and the historic centre is a pedestrian-only zone. Attractions use seasonal schedules, so check current opening hours and arrival or parking rules before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/617/"
      },
      "map": {
          "name": "Historic Centre of Český Krumlov",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 48.81069444,
              "lng": 14.31502778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+%C4%8Cesk%C3%BD+Krumlov+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-621-historic-centre-of-telc",
      "name": "Historic Centre of Telč",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 7,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A triangular market square lined by Renaissance and Baroque burgher houses with continuous arcades, alongside a Renaissance castle and defensive fishponds.",
      "why": "The houses in Telc, which stands on a hilltop, were originally built of wood. After a fire in the late 14th century, the town was rebuilt in stone, surrounded by walls and further strengthened by a network of artificial ponds.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/621/"
      },
      "map": {
          "name": "Historic Centre of Telč",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 49.18413889,
              "lng": 15.45397222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Tel%C4%8D+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-690-pilgrimage-church-of-st-john-of-nepomuk-at-zelena-hora",
      "name": "Pilgrimage Church of St John of Nepomuk at Zelená Hora",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "A five-pointed church with a circular cloister and a layout built around repeated groups of five",
      "why": "Built between 1719 and 1727 near Žďár nad Sázavou, this pilgrimage church has a five-pointed star plan and a circular cloister. Jan Blažej Santini Aichel combined Baroque composition with pointed windows, portals and ribbed vaults drawn from late Gothic architecture.",
      "realityCheck": "Opening hours change by season and holidays, with limited winter access; check the church's current schedule and visiting rules before making it a day-trip stop.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/690/"
      },
      "map": {
          "name": "Pilgrimage Church of St John of Nepomuk at Zelená Hora",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 49.5802,
              "lng": 15.94205833
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Pilgrimage+Church+of+St+John+of+Nepomuk+at+Zelen%C3%A1+Hora+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-732-kutna-hora-historical-town-centre-with-the-church-of-st-barbara-and-the",
      "name": "Kutná Hora: Historical Town Centre with the Church of St Barbara and the Cathedral of Our Lady at Sedlec",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic centre; the Sedlec cathedral is about 1.5 km northeast, so the two UNESCO components are separate stops.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A preserved medieval silver-mining town with a late-Gothic Church of St Barbara and a Cistercian church at Sedlec restored in the early-18th-century Baroque Gothic style.",
      "why": "Kutná Hora grew from silver mining and became a royal city in the 14th century. Its preserved medieval urban plan includes the late-Gothic Church of St Barbara, while the Sedlec cathedral was restored in the early 18th century in the Baroque Gothic style.",
      "realityCheck": "The two UNESCO components are about 1.5 km apart. St Barbara's official hours range from 10:00–16:00 in January–February to 9:00–18:00 in April–October, with event-related closures. 2025 monitoring counted almost 339,000 visitors at the Sedlec site and 296,000 at St Barbara's, so verify schedules and expect busy periods.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/732/"
      },
      "map": {
          "name": "Kutná Hora: Historical Town Centre with the Church of St Barbara and the Cathedral of Our Lady at Sedlec",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 49.95,
              "lng": 15.26666667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Kutn%C3%A1+Hora%3A+Historical+Town+Centre+with+the+Church+of+St+Barbara+and+the+Cathedral+of+Our+Lady+at+Sedlec+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-763-lednice-valtice-cultural-landscape",
      "name": "Lednice-Valtice Cultural Landscape",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "One of Europe's largest designed landscapes, linking Liechtenstein castles, parks and smaller structures with avenues, ponds and long views",
      "why": "Between the 17th and 20th centuries, the ruling dukes of Liechtenstein reshaped their domains in southern Moravia. Valtice's Baroque rebuilding involved Johann Bernhard Fischer von Erlach and other architects, while Lednice was remodeled in Baroque, Classical and Neo-Gothic styles; parks, avenues, ponds and smaller structures follow English Romantic landscape principles.",
      "realityCheck": "Lednice's interiors follow seasonal tour schedules, with several routes closed in winter and shorter hours outside summer. The estate is spread out, so allow time for the parks and smaller structures; some special guided-tour dates sell out, so check the official schedule before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/763/"
      },
      "map": {
          "name": "Lednice-Valtice Cultural Landscape",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 48.77583,
              "lng": 16.775
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Lednice-Valtice+Cultural+Landscape+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-860-gardens-and-castle-at-kromeriz",
      "name": "Gardens and Castle at Kroměříž",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO Baroque garden-and-castle ensemble",
      "access": "Castle tours are seasonal; the Chateau Garden is free and open year-round, while the Flower Garden has separate seasonal hours.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed Baroque princely residence with an almost-intact 17th-century Pleasure Garden",
      "why": "Kroměříž stands on the site of an earlier ford across the River Morava, at the foot of the Chriby mountain range which dominates the central part of Moravia. The gardens and castle of Kroměříž are an exceptionally complete and well-preserved example of a European Baroque princely residence and its gardens.",
      "realityCheck": "The chateau is not fully wheelchair accessible, and the Flower Garden is about a 15-minute walk from the chateau; check current hours before visiting.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/860/"
      },
      "map": {
          "name": "Gardens and Castle at Kroměříž",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 49.3,
              "lng": 17.37722222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Gardens+and+Castle+at+Krom%C4%9B%C5%99%C3%AD%C5%BE+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-861-holasovice-historic-village",
      "name": "Holašovice Historic Village",
      "countries": [
          "Czechia"
      ],
      "area": "South Bohemia",
      "kind": "UNESCO historic place",
      "access": "Regular bus from České Budějovice; walkable village green",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A living South Bohemian village of 23 farmsteads around a rectangular green, with façades in the South Bohemian folk Baroque style and a medieval plan.",
      "why": "Holašovice keeps 23 farmsteads around a rectangular village green, most with U-shaped plans and stucco gables in the South Bohemian folk-Baroque style. The village also retains its medieval layout and land parcelling.",
      "realityCheck": "The village is still inhabited, and its farmhouses are mostly private. The information centre closes from January through March; tourist numbers rise on holidays and weekends, while event notices can close the square.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/861/"
      },
      "map": {
          "name": "Holašovice Historic Village",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 48.96963889,
              "lng": 14.27261111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Hola%C5%A1ovice+Historic+Village+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-901-litomysl-castle",
      "name": "Litomyšl Castle",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO arcaded Renaissance castle",
      "access": "Train/bus or road access; public transport from Prague requires a connection, and tour hours vary by season",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 8,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "Preserved arcaded Renaissance country residence with a second square courtyard unique to Litomyšl and intact ancillary buildings",
      "why": "Litomyšl Castle was originally a Renaissance arcade-castle of the type first developed in Italy and then adopted and greatly developed in central Europe in the 16th century.",
      "realityCheck": "In 2026, the basic Wallenstein Tour is closed for reconstruction, while the remaining tours run on seasonal hours. Check the official schedule before making the castle a fixed stop.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/901/"
      },
      "map": {
          "name": "Litomyšl Castle",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 49.87361,
              "lng": 16.31444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Litomy%C5%A1l+Castle+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1558-zatec-and-the-landscape-of-saaz-hops",
      "name": "Žatec and the Landscape of Saaz Hops",
      "countries": [
          "Czechia"
      ],
      "area": "Czechia",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "The world’s only hop-growing landscape on the UNESCO World Heritage List: Žatec’s medieval centre and industrial Prague Suburb sit alongside rural hop fields and villages.",
      "why": "This cultural landscape has been shaped for centuries by the living tradition of growing and trading Saaz hops, used in beer production around the globe.",
      "realityCheck": "The property has two components: Žatec’s historic centre and industrial Prague Suburb plus rural hop fields and villages around Stekník and Trnovany. Stekník Chateau has seasonal opening hours, so check its schedule before trying to cover the town and landscape in one day.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1558/"
      },
      "map": {
          "name": "Žatec and the Landscape of Saaz Hops",
          "formattedAddress": "Czechia",
          "location": {
              "lat": 50.32027778,
              "lng": 13.62
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=%C5%BDatec+and+the+Landscape+of+Saaz+Hops+Czechia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
    {
      "id": "unesco-695-roskilde-cathedral",
      "name": "Roskilde Cathedral",
      "countries": [
          "Denmark"
      ],
      "area": "Roskilde, Zealand",
      "kind": "UNESCO religious heritage",
      "access": "In central Roskilde; 25 minutes by train from Copenhagen, with almost all westbound trains from Copenhagen Central stopping at Roskilde",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A Gothic brick cathedral that became a Danish royal mausoleum, with chapels and porches added in successive architectural styles.",
      "why": "Built in the 12th and 13th centuries, this was Scandinavia's first Gothic cathedral to be built of brick and it encouraged the spread of this style throughout northern Europe.",
      "realityCheck": "Entry to the royal tombs, chapels, museum and gallery is ticketed, while services and holidays can change visitor hours. Check the cathedral's calendar before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/695/"
      },
      "map": {
          "name": "Roskilde Cathedral",
          "formattedAddress": "Denmark",
          "location": {
              "lat": 55.64266541,
              "lng": 12.07989985
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Roskilde+Cathedral+Denmark"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-696-kronborg-castle",
      "name": "Kronborg Castle",
      "countries": [
          "Denmark"
      ],
      "area": "Denmark",
      "kind": "UNESCO fortification",
      "access": "Paid visitor site; direct train from Copenhagen takes about 46 minutes, followed by a 10-minute walk from Helsingør station; check seasonal hours.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "Preserved Renaissance castle and fortress with a chapel that survived the 1629 fire and the largest Renaissance great hall of its kind in Northern Europe.",
      "why": "Kronborg controlled the narrowest part of the Øresund, where Denmark collected Sound tolls from passing ships from 1429 to 1857. It is also Shakespeare's Elsinore in Hamlet.",
      "realityCheck": "The paid interior has seasonal hours; the castle says mornings are quieter and summer parking fills around midday. From Copenhagen, the direct train takes about 46 minutes, followed by a 10-minute walk.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/696/"
      },
      "map": {
          "name": "Kronborg Castle",
          "formattedAddress": "Denmark",
          "location": {
              "lat": 56.03889,
              "lng": 12.62083333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Kronborg+Castle+Denmark"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1469-the-par-force-hunting-landscape-in-north-zealand",
      "name": "The par force hunting landscape in North Zealand",
      "countries": [
          "Denmark"
      ],
      "area": "Denmark",
      "kind": "UNESCO cultural landscape",
      "access": "Unrestricted public access across three forest areas; plan a route",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "Preserved Baroque hunting landscape with star-and-grid forest roads, numbered stone posts and a hunting lodge",
      "why": "About 30 km northeast of Copenhagen, the site includes Store Dyrehave, Gribskov and Jægersborg Hegn/Jægersborg Dyrehave. Danish kings used these royal forests for par force hunts, whose roads and markers still shape the site.",
      "realityCheck": "The three areas cover more than 4,500 hectares and are open to the public year-round. Jægersborg Dyrehave is Denmark's most visited natural area, so choose a section and route before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1469/"
      },
      "map": {
          "name": "The par force hunting landscape in North Zealand",
          "formattedAddress": "Denmark",
          "location": {
              "lat": 55.91361111,
              "lng": 12.35777778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+par+force+hunting+landscape+in+North+Zealand+Denmark"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-822-historic-centre-old-town-of-tallinn",
      "name": "Historic Centre (Old Town) of Tallinn",
      "countries": [
          "Estonia"
      ],
      "area": "Tallinn, Estonia",
      "kind": "UNESCO historic city centre",
      "access": "Walkable old town; airport buses 2 and 15 stop a five-minute walk away, and the main port terminals are 15–20 minutes on foot",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "An exceptionally complete medieval northern European trading city where the 13th-century street plan, building plots and long sections of the town defences remain legible",
      "why": "Upper Toompea and the lower town preserve Tallinn's medieval urban plan, including narrow streets, churches, the town wall and merchant houses. The lower town's building plots remain virtually intact from the 13th–14th centuries, while the plan shows how a feudal seat and a Hanseatic trading centre shared a common system of walls and fortifications.",
      "realityCheck": "Summer cruise traffic makes the centre busy: ERR reported that the Old Town remained crowded on 24 June 2026 while two ships carrying about 6,700 passengers were docked, and Port of Tallinn recorded nearly 190,000 cruise passengers in 2025. Visit Tallinn recommends early morning or afternoon visits during cruise season; check current hours for towers, churches and museums.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/822/"
      },
      "map": {
          "name": "Historic Centre (Old Town) of Tallinn",
          "formattedAddress": "Estonia",
          "location": {
              "lat": 59.437,
              "lng": 24.74
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+%28Old+Town%29+of+Tallinn+Estonia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-583-fortress-of-suomenlinna",
      "name": "Fortress of Suomenlinna",
      "countries": [
          "Finland"
      ],
      "area": "Finland",
      "kind": "UNESCO fortification",
      "access": "No entrance fee; the year-round HSL ferry from Helsinki Market Square takes about 15 minutes, while museums and services keep separate hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A 210-hectare sea fortress spread across six islands, with 6 km of defensive walls and 200 buildings from the Swedish and Russian periods",
      "why": "Sweden began building Suomenlinna in 1748 on islands at the entrance to Helsinki Harbour. Vauban’s fortification ideas were adapted to the archipelago, and the fortress later served Sweden, Russia and Finland.",
      "realityCheck": "The fortress has no entrance fee, but the HSL ferry from Market Square takes about 15 minutes and museums, cafés and other services keep separate hours. The site receives about one million visitors a year, with summer visitor pressure high enough for UNESCO to note erosion of sandbanks, so check the daily calendar before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/583/"
      },
      "map": {
          "name": "Fortress of Suomenlinna",
          "formattedAddress": "Finland",
          "location": {
              "lat": 60.14722,
              "lng": 24.98722
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Fortress+of+Suomenlinna+Finland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-584-petajavesi-old-church",
      "name": "Petäjävesi Old Church",
      "countries": [
          "Finland"
      ],
      "area": "Finland",
      "kind": "UNESCO religious heritage",
      "access": "Parking by Highway 23; the church is about 200 metres from the lot, with uneven floors and steep steps; no wheelchair access",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 7,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "Preserved pine-log Lutheran church combining Renaissance central planning, Gothic vaulting and Finnish vernacular construction",
      "why": "Petäjävesi Old Church, in central Finland, was built of logs between 1763 and 1765. This Lutheran country church is a typical example of an architectural tradition that is unique to eastern Scandinavia.",
      "realityCheck": "Summer visits run daily from June through August, but weddings and services can interrupt access; winter visits require a reservation at least two weeks ahead. The 200-metre approach has steep steps and the church is not barrier-free.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/584/"
      },
      "map": {
          "name": "Petäjävesi Old Church",
          "formattedAddress": "Finland",
          "location": {
              "lat": 62.25,
              "lng": 25.18333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Pet%C3%A4j%C3%A4vesi+Old+Church+Finland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-751-verla-groundwood-and-board-mill",
      "name": "Verla Groundwood and Board Mill",
      "countries": [
          "Finland"
      ],
      "area": "Kymenlaakso",
      "kind": "UNESCO industrial heritage",
      "access": "32 km from Kouvola by road; a summer weekend bus, car or taxi reaches the site, and mill visits are guided tours only.",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 6,
        "lowTouristCrowds": 7,
      },
      "uniqueness": "A preserved late-19th-century forest-industry village with original machinery, workers' housing, power plants and the surrounding rapids.",
      "why": "The mill, workers' houses, power plants and original machinery remain in a largely intact late-19th-century forest-industry village. The guided tour follows how spruce was turned into groundwood pulp and board.",
      "realityCheck": "The museum has a short summer season and closes in winter, while winter group tours are by request. Mill visits run as guided tours on the hour, so check the official opening-hours page before travelling.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/751/"
      },
      "map": {
          "name": "Verla Groundwood and Board Mill",
          "formattedAddress": "Finland",
          "location": {
              "lat": 61.06194,
              "lng": 26.64083
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Verla+Groundwood+and+Board+Mill+Finland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-81-chartres-cathedral",
      "name": "Chartres Cathedral",
      "countries": [
          "France"
      ],
      "area": "Centre-Val de Loire",
      "kind": "UNESCO religious heritage",
      "access": "Free entry to the cathedral; direct train from Paris Montparnasse (about 1 hour), then a 10-minute walk. Check the daily calendar.",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "An unusually complete early-13th-century Gothic cathedral with much of its 12th- and 13th-century stained glass intact.",
      "why": "Partly built starting in 1145, and then reconstructed over a 26-year period after the fire of 1194, Chartres Cathedral is a high point of French Gothic art.",
      "realityCheck": "Check the cathedral's daily calendar: Mass can restrict movement, while ceremonies or weather can cause partial or full closures and tower or Treasury access can be adjusted.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/81/"
      },
      "map": {
          "name": "Chartres Cathedral",
          "formattedAddress": "France",
          "location": {
              "lat": 48.4475,
              "lng": 1.487222222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Chartres+Cathedral+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-83-palace-and-park-of-versailles",
      "name": "Palace and Park of Versailles",
      "countries": [
          "France"
      ],
      "area": "Yvelines, Île-de-France",
      "kind": "UNESCO cultural landscape",
      "access": "Timed Palace entry; RER C to Versailles Château–Rive Gauche, then a 10-minute walk; Palace closed Mondays, with separate hours for Trianon, Gardens and Park",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 3,
      },
      "uniqueness": "A royal palace, Trianon châteaux and French formal gardens arranged along a five-kilometre royal perspective",
      "why": "The Palace of Versailles was the principal residence of the French kings from the time of Louis XIV to Louis XVI. Embellished by several generations of architects, sculptors, decorators and landscape architects, it provided Europe with a model of the ideal royal residence for over a century.",
      "realityCheck": "Expect crowds: the official ticketing page cites a high number of visitors and requires a timed Palace slot. Gardens, Park and Trianon have separate hours and ticket rules; check the current calendar for closures and seasonal garden charges.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/83/"
      },
      "map": {
          "name": "Palace and Park of Versailles",
          "formattedAddress": "France",
          "location": {
              "lat": 48.805,
              "lng": 2.119444444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Palace+and+Park+of+Versailles+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-84-vezelay-church-and-hill",
      "name": "Vézelay, Church and Hill",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "A 12th-century Romanesque abbey church on a protected hill, with the historic village below included in the UNESCO property",
      "why": "Shortly after its foundation in the 9th century, the Benedictine abbey of Vézelay acquired the relics of St Mary Magdalene and since then it has been an important place of pilgrimage.",
      "realityCheck": "The basilica is open daily from 7:00 (8:00 on Mondays) to 20:00, but visits pause during prayer and Sunday Mass; check the official schedule for changes before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/84/"
      },
      "map": {
          "name": "Vézelay, Church and Hill",
          "formattedAddress": "France",
          "location": {
              "lat": 47.46638889,
              "lng": 3.748333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=V%C3%A9zelay%2C+Church+and+Hill+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-160-palace-and-park-of-fontainebleau",
      "name": "Palace and Park of Fontainebleau",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO cultural landscape",
      "access": "Train from Paris Gare de Lyon to Fontainebleau-Avon, then bus 1 to the château; closed Tuesdays and seasonal hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed royal palace and park where Italian Renaissance artists influenced French Renaissance art",
      "why": "French kings used Fontainebleau as a hunting lodge from the 12th century. François I transformed and enlarged the lodge in the 16th century because he wanted a 'New Rome'; it became a palace that combines Italian Renaissance work with French artistic traditions.",
      "realityCheck": "The château is closed on Tuesdays and has seasonal hours; the park is open 24 hours a day, but some spaces may close early and bad weather can close the gardens.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/160/"
      },
      "map": {
          "name": "Palace and Park of Fontainebleau",
          "formattedAddress": "France",
          "location": {
              "lat": 48.40194444,
              "lng": 2.698055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Palace+and+Park+of+Fontainebleau+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-162-amiens-cathedral",
      "name": "Amiens Cathedral",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO religious heritage",
      "access": "Free cathedral entry; separate paid tower and treasury tours; check seasonal hours and ceremony closures",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "One of the most complete 13th-century Gothic churches, with a coherent plan and extensive medieval sculpture",
      "why": "Amiens Cathedral, in Picardy, is one of the largest 'classic' Gothic churches of the 13th century. Its coherent plan, three-tier interior elevation and sculpture on the principal facade and in the south transept are the features UNESCO identifies in its listing.",
      "realityCheck": "The cathedral interior is free to visit, while the towers and treasury require separate tickets; hours vary by season and religious ceremonies, and tower access can close in bad weather.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/162/"
      },
      "map": {
          "name": "Amiens Cathedral",
          "formattedAddress": "France",
          "location": {
              "lat": 49.895,
              "lng": 2.301666667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Amiens+Cathedral+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-165-cistercian-abbey-of-fontenay",
      "name": "Cistercian Abbey of Fontenay",
      "countries": [
          "France"
      ],
      "area": "Côte-d'Or, Burgundy",
      "kind": "UNESCO religious heritage",
      "access": "Open daily; 66-minute TGV from Paris to Montbard, then 5 km by taxi or bike; hours vary by season",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 8,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "An unusually complete Cistercian complex whose intact site retains its Romanesque church, cloister, monastic buildings and a late-12th-century forge",
      "why": "Fontenay was founded by Saint Bernard in 1118. Its Romanesque church, cloister, dormitory and late-12th-century forge show how a Cistercian community combined worship with agriculture and industry.",
      "realityCheck": "The abbey is open daily, but the schedule changes sharply by season: 10am–6pm from 3 April to 1 November and split hours the rest of the year. Its official site says it welcomes over 100,000 visitors annually, so summer visits can be busy.",
      "source": {
          "label": "Abbaye de Fontenay (official site)",
          "url": "https://www.abbayedefontenay.com/en/"
      },
      "map": {
          "name": "Cistercian Abbey of Fontenay",
          "formattedAddress": "France",
          "location": {
              "lat": 47.63944,
              "lng": 4.38911
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cistercian+Abbey+of+Fontenay+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-203-from-the-great-saltworks-of-salins-les-bains-to-the-royal-saltworks-of-a",
      "name": "From the Great Saltworks of Salins-les-Bains to the Royal Saltworks of Arc-et-Senans, the Production of Open-pan Salt",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO industrial heritage",
      "access": "Paid visitor sites; Arc-et-Senans has a TER station 100 metres from the entrance, while the underground gallery at Salins-les-Bains requires a guided tour and stair access.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 6,
        "easeOfAccess": 8,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A linked pair of saltworks: Salins-les-Bains preserves underground brine extraction and a working 19th-century pump, while Arc-et-Senans preserves Ledoux's semicircular 18th-century factory.",
      "why": "The Royal Saltworks at Arc-et-Senans, 35 km from Besançon, was designed by Claude-Nicolas Ledoux and built from 1775 to 1779 under Louis XVI. UNESCO calls its semicircular complex the first architectural complex of this scale and standard designed as a place of work; Ledoux's planned ideal city around it was never built.",
      "realityCheck": "This is a two-site visit with separate seasonal hours. The underground gallery at Salins-les-Bains is reached by stairs and can only be visited on a guided tour; Arc-et-Senans has a TER station 100 metres from the entrance.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/203/"
      },
      "map": {
          "name": "From the Great Saltworks of Salins-les-Bains to the Royal Saltworks of Arc-et-Senans, the Production of Open-pan Salt",
          "formattedAddress": "France",
          "location": {
              "lat": 46.9375,
              "lng": 5.876388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=From+the+Great+Saltworks+of+Salins-les-Bains+to+the+Royal+Saltworks+of+Arc-et-Senans%2C+the+Production+of+Open-pan+Salt+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-228-historic-centre-of-avignon-papal-palace-episcopal-ensemble-and-avignon-b",
      "name": "Historic Centre of Avignon: Papal Palace, Episcopal Ensemble and Avignon Bridge",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A medieval urban ensemble that brings together the Papal Palace, the episcopal buildings, city ramparts and four surviving arches of the Saint-Bénézet Bridge.",
      "why": "In the 14th century, this city in the South of France was the seat of the papacy. The Palais des Papes, an austere-looking fortress lavishly decorated by Simone Martini and Matteo Giovanetti, dominates the city, the surrounding ramparts and the remains of a 12th-century bridge over the Rhone.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/228/"
      },
      "map": {
          "name": "Historic Centre of Avignon: Papal Palace, Episcopal Ensemble and Avignon Bridge",
          "formattedAddress": "France",
          "location": {
              "lat": 43.95277778,
              "lng": 4.806111111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Avignon%3A+Papal+Palace%2C+Episcopal+Ensemble+and+Avignon+Bridge+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-230-abbey-church-of-saint-savin-sur-gartempe",
      "name": "Abbey Church of Saint-Savin sur Gartempe",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO religious heritage",
      "access": "Near Poitiers; reach it by car or bus, with self-guided visits during opening hours and guided tours varying by season and church activity",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 8,
        "easeOfAccess": 7,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "An extensive ensemble of 11th- and 12th-century Romanesque murals preserved across the church",
      "why": "The church contains an extensive 11th- and 12th-century biblical mural cycle, with scenes from Genesis, Exodus and the Apocalypse. Much of the painted decoration remains in situ.",
      "realityCheck": "Hours vary by season and a religious ceremony can shift a guided visit to the monastic buildings until the church is available. Check the official schedule before going; large bags and suitcases are not allowed inside.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/230/"
      },
      "map": {
          "name": "Abbey Church of Saint-Savin sur Gartempe",
          "formattedAddress": "France",
          "location": {
              "lat": 46.56472,
              "lng": 0.86611
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Abbey+Church+of+Saint-Savin+sur+Gartempe+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-344-pont-du-gard-roman-aqueduct",
      "name": "Pont du Gard (Roman Aqueduct)",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO cultural heritage",
      "access": "Site open year-round; bus links from Nîmes and Avignon, with paid parking.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 8,
        "easeOfAccess": 10,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A well-preserved Roman aqueduct bridge with three levels of arches and a height of nearly 49 m",
      "why": "The Pont du Gard is the three-storey crossing on the roughly 50 km Roman aqueduct that carried water from near Uzès to Nîmes in the first century AD. It rises nearly 49 m above the Gardon River, and its upper level stretches 275 m.",
      "realityCheck": "The Pont du Gard EPCC reports nearly 1 million visitors a year. Cultural venues have seasonal hours and close Monday mornings for maintenance.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/344/"
      },
      "map": {
          "name": "Pont du Gard (Roman Aqueduct)",
          "formattedAddress": "France",
          "location": {
              "lat": 43.94722222,
              "lng": 4.535277778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Pont+du+Gard+%28Roman+Aqueduct%29+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-345-historic-fortified-city-of-carcassonne",
      "name": "Historic Fortified City of Carcassonne",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Free 24-hour access to the Cité; ticketed castle and ramparts",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "Inhabited medieval town with two concentric walls, 52 towers and 3 km of ramparts",
      "why": "A fortified settlement has existed on this hill since the pre-Roman period. The present city has two concentric walls around its streets, castle and Gothic Saint-Nazaire Basilica; Eugène Viollet-le-Duc led a long restoration campaign here from 1853 to 1879.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/345/"
      },
      "map": {
          "name": "Historic Fortified City of Carcassonne",
          "formattedAddress": "France",
          "location": {
              "lat": 43.2070631,
              "lng": 2.3636562
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Fortified+City+of+Carcassonne+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-601-cathedral-of-notre-dame-former-abbey-of-saint-remi-and-palace-of-tau-rei",
      "name": "Cathedral of Notre-Dame, Former Abbey of Saint-Rémi and Palace of Tau, Reims",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO religious heritage",
      "access": "Free cathedral entry; towers require an online-booked guided tour; Palace of Tau closed for renovation until 2027; Saint-Rémi Basilica and museum are about 20 minutes on foot",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "A three-part coronation complex: a Gothic cathedral, the former royal Benedictine Abbey of Saint-Rémi and the archbishop's Palace of Tau",
      "why": "Reims Cathedral combines 13th-century Gothic construction with sculpture integrated into the architecture. The former Abbey of Saint-Rémi and Palace of Tau complete a coronation complex tied to the French monarchy.",
      "realityCheck": "The city reports about 1.5 million visitors a year at Reims Cathedral. The Palace of Tau is closed for renovation until 2027, while the towers run seasonal guided tours with online booking.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/601/"
      },
      "map": {
          "name": "Cathedral of Notre-Dame, Former Abbey of Saint-Rémi and Palace of Tau, Reims",
          "formattedAddress": "France",
          "location": {
              "lat": 49.25333333,
              "lng": 4.032777778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cathedral+of+Notre-Dame%2C+Former+Abbey+of+Saint-R%C3%A9mi+and+Palace+of+Tau%2C+Reims+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-635-bourges-cathedral",
      "name": "Bourges Cathedral",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO religious heritage",
      "access": "Historic-centre site; the crypt is guided-tour only and tower visits use limited seasonal guided slots; check current hours",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 8,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "A five-nave Gothic cathedral with no transept, five sculpted west portals and stained glass dating from the 13th to 17th centuries",
      "why": "Built from 1195 in a single major phase, the cathedral has a five-nave plan without a transept and a five-level structure that brings light into the interior. The ambulatory contains 13th-century stained-glass windows.",
      "realityCheck": "The crypt is guided-tour only and tower visits have limited seasonal slots; the official schedule also lists Sunday-morning and holiday closures. Check current times before planning.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/635/"
      },
      "map": {
          "name": "Bourges Cathedral",
          "formattedAddress": "France",
          "location": {
              "lat": 47.08222222,
              "lng": 2.398333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Bourges+Cathedral+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-770-canal-du-midi",
      "name": "Canal du Midi",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "A 17th-century canal network still in operation, with Pierre-Paul Riquet's original route, water-supply system and many structures intact",
      "why": "Built between 1667 and 1694, this 360-km UNESCO waterway network links the Mediterranean and the Atlantic through 328 structures, including locks, aqueducts, bridges and tunnels.",
      "realityCheck": "Sailing is seasonal, with navigation generally possible from early April to early November; maintenance, weather damage and local access rules can close sections, so check VNF notices first.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/770/"
      },
      "map": {
          "name": "Canal du Midi",
          "formattedAddress": "France",
          "location": {
              "lat": 43.61138889,
              "lng": 1.416388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Canal+du+Midi+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-872-historic-site-of-lyon",
      "name": "Historic Site of Lyon",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The long history of Lyon, which was founded by the Romans in the 1st century B.C. as the capital of the Three Gauls and has continued to play a major role in Europe's political, cultural and economic development ever since, is vividly illustrated by its urban fabric and the many fine historic buildings from all periods.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/872/"
      },
      "map": {
          "name": "Historic Site of Lyon",
          "formattedAddress": "France",
          "location": {
              "lat": 45.76722,
              "lng": 4.83333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Site+of+Lyon+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-873-provins-town-of-medieval-fairs",
      "name": "Provins, Town of Medieval Fairs",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The fortified medieval town of Provins is situated in the former territory of the powerful Counts of Champagne. It bears witness to early developments in the organization of international trading fairs and the wool industry.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/873/"
      },
      "map": {
          "name": "Provins, Town of Medieval Fairs",
          "formattedAddress": "France",
          "location": {
              "lat": 48.55972222,
              "lng": 3.298888889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Provins%2C+Town+of+Medieval+Fairs+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1153-the-causses-and-the-cevennes-mediterranean-agro-pastoral-cultural-landsc",
      "name": "The Causses and the Cévennes, Mediterranean agro-pastoral Cultural Landscape",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO cultural landscape",
      "access": "Regional roads and hiking routes; no single site entrance",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed agro-pastoral landscape with drailles, stone farmhouses and traditional summer transhumance on Mont Lozère",
      "why": "This 302,319 ha property lies in southern central France, where deep mountain valleys, drailles and drove roads show how agro-pastoral systems shaped the terrain.",
      "realityCheck": "There is no single entrance: the property covers 302,319 ha across Aveyron, Gard, Hérault and Lozère, so choose a gateway town or trailhead before planning transport.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1153/"
      },
      "map": {
          "name": "The Causses and the Cévennes, Mediterranean agro-pastoral Cultural Landscape",
          "formattedAddress": "France",
          "location": {
              "lat": 44.22027778,
              "lng": 3.473055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Causses+and+the+C%C3%A9vennes%2C+Mediterranean+agro-pastoral+Cultural+Landscape+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1256-bordeaux-port-of-the-moon",
      "name": "Bordeaux, Port of the Moon",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Walkable city-centre heritage area with a 5 km route; trams and buses connect the centre, while museums and monuments have separate hours and booking rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "An inhabited UNESCO historic city whose early-18th-century plans and classical and neoclassical buildings form a coherent urban ensemble",
      "why": "The UNESCO designation covers an inhabited historic city rather than a single monument. Early-18th-century plans and classical and neoclassical buildings give Bordeaux a coherent urban form, while its port supported cultural and commercial exchange for more than 2,000 years. UNESCO says only Paris has more protected buildings among French cities.",
      "realityCheck": "The UNESCO area is an inhabited city-centre district. Bordeaux Tourism's 5 km route is straightforward, but museums and monuments along it have separate hours, reservations and seasonal closures.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1256/"
      },
      "map": {
          "name": "Bordeaux, Port of the Moon",
          "formattedAddress": "France",
          "location": {
              "lat": 44.83888889,
              "lng": -0.572222222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Bordeaux%2C+Port+of+the+Moon+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
    {
      "id": "unesco-1337-episcopal-city-of-albi",
      "name": "Episcopal City of Albi",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Walkable UNESCO core; daily trains from Toulouse and Paris",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "Rare, unusually complete medieval episcopal ensemble unified by local fired brick",
      "why": "On the Tarn in south-west France, Albi's old city preserves a dense medieval urban ensemble. The Pont-Vieux and the Saint-Salvi quarter with its church preserve evidence of the city's early development in the 10th and 11th centuries.",
      "realityCheck": "The historic centre is easy to walk, but cathedral visits run 10:00–18:00 Monday–Saturday and 13:00–17:15 on Sundays and feast days. Religious celebrations can restrict or interrupt entry, so check the current schedule before planning around an interior visit.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1337/"
      },
      "map": {
          "name": "Episcopal City of Albi",
          "formattedAddress": "France",
          "location": {
              "lat": 43.92916667,
              "lng": 2.144166667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Episcopal+City+of+Albi+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1625-cordouan-lighthouse",
      "name": "Cordouan Lighthouse",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO maritime and architectural heritage",
      "access": "Boat-only access; departures from Royan or Le Verdon-sur-Mer are timed to low tide and may be restricted by weather or sea conditions",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 8,
        "easeOfAccess": 6,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A monumental open-sea lighthouse with a Renaissance royal chapel and apartments that remains an active maritime signal",
      "why": "The Lighthouse of Cordouan rises up on a shallow rocky plateau in the Atlantic Ocean at the mouth of the Gironde estuary in the Nouvelle-Aquitaine region, in a highly exposed and hostile environment.",
      "realityCheck": "Visits are tide-bound boat trips. Opening begins about two hours before low tide and ends no later than one hour after low tide or one hour before sunset; weather, sea conditions and shifting sandbanks can also change access, so check the current schedule before booking.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1625/"
      },
      "map": {
          "name": "Cordouan Lighthouse",
          "formattedAddress": "France",
          "location": {
              "lat": 45.58630556,
              "lng": -1.173333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cordouan+Lighthouse+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1635-nice-winter-resort-town-of-the-riviera",
      "name": "Nice, Winter Resort Town of the Riviera",
      "countries": [
          "France"
      ],
      "area": "France",
      "kind": "UNESCO historic place",
      "access": "Open urban site; central districts are walkable and Nice's tram and bus network connects the wider property",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 6,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "A 522-hectare UNESCO urban property whose hotels, villas, promenades and street plan record the rise of international winter tourism",
      "why": "Nice, located on the Mediterranean, at the foot of the Alps, near the Italian border, in the Provence-Alpes-Côte d’Azur region, grew as a city devoted to winter tourism, making the most of its mild climate and its coastal situation, between sea and mountains.",
      "realityCheck": "Nice is a major tourist city, with 2.2 million hotel and residence stays in 2024. The listed area is a 522-hectare urban district; its interpretation centre lists Monday-Friday, 10am-5pm opening in 2026, so plan around those hours if you want context beyond a walk.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1635/"
      },
      "map": {
          "name": "Nice, Winter Resort Town of the Riviera",
          "formattedAddress": "France",
          "location": {
              "lat": 43.70169444,
              "lng": 7.272305556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Nice%2C+Winter+Resort+Town+of+the+Riviera+France"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-710-gelati-monastery",
      "name": "Gelati Monastery",
      "countries": [
          "Georgia"
      ],
      "area": "Georgia",
      "kind": "UNESCO religious heritage",
      "access": "About 11 km from Kutaisi; marshrutka 33 runs to the monastery, but restoration can restrict entry",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 6,
        "easeOfAccess": 8,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "An Orthodox monastery whose main church has a well-preserved 12th-century apse mosaic and Georgia's largest ensemble of medieval and post-medieval wall paintings, with much of its landscape setting intact",
      "why": "Founded in 1106 near Kutaisi, Gelati grew during Georgia's medieval Golden Age. Its main church was completed in 1130 and contains a 12th-century apse mosaic and murals from the 12th to 17th centuries; the monastery also housed an important academy.",
      "realityCheck": "Restoration is ongoing and parts of the complex may be closed or scaffolded; confirm which buildings are open before visiting rather than relying on standard hours.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/710/"
      },
      "map": {
          "name": "Gelati Monastery",
          "formattedAddress": "Georgia",
          "location": {
              "lat": 42.29472222,
              "lng": 42.76833333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Gelati+Monastery+Georgia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-3-aachen-cathedral",
      "name": "Aachen Cathedral",
      "countries": [
          "Germany"
      ],
      "area": "Aachen, North Rhine-Westphalia",
      "kind": "UNESCO religious heritage",
      "access": "In central Aachen, about a 15-minute walk from the main station; cathedral entry is free, while the choir hall and imperial throne require a guided tour.",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "A Carolingian palatine chapel with a preserved octagonal core, later enlarged by a Gothic choir and medieval chapels.",
      "why": "Construction of this palatine chapel, with its octagonal basilica and cupola, began c. 790–800 under the Emperor Charlemagne.",
      "realityCheck": "Entry to the cathedral is free, but services, concerts and events can change hours at short notice. The choir hall and imperial throne are accessible only on a guided tour; check the cathedral's current calendar before visiting.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/3/"
      },
      "map": {
          "name": "Aachen Cathedral",
          "formattedAddress": "Germany",
          "location": {
              "lat": 50.77474685,
              "lng": 6.083919968
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Aachen+Cathedral+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-168-speyer-cathedral",
      "name": "Speyer Cathedral",
      "countries": [
          "Germany"
      ],
      "area": "Speyer, Rhineland-Palatinate",
      "kind": "UNESCO religious heritage",
      "access": "Open to visitors, with seasonal hours; services and concerts can restrict access, and tower and Imperial Hall visits have separate hours",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "The world's largest Romanesque church, with four towers, two domes and a gallery that encircles the building",
      "why": "Speyer Cathedral was founded by Conrad II in 1030 and remodelled under Henry IV in the 1080s. Its four towers, two domes and encircling gallery define the Romanesque design; German emperors were buried here for almost 300 years.",
      "realityCheck": "The cathedral is an active church: services and concerts can restrict access. Tower and Imperial Hall hours are seasonal, and the Imperial Hall and observation platform close to individual visitors from November through March.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/168/"
      },
      "map": {
          "name": "Speyer Cathedral",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.31722222,
              "lng": 8.442388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Speyer+Cathedral+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-169-wurzburg-residence-with-the-court-gardens-and-residence-square",
      "name": "Würzburg Residence with the Court Gardens and Residence Square",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO cultural landscape",
      "access": "In Würzburg; about 20 minutes on foot from the station, with buses and trams nearby. The palace rooms are ticketed and open daily on seasonal hours; the Court Garden is free until dusk.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "An 18th-century Baroque palace whose architecture and decoration combine French, Italian, Austrian and German work, including Balthasar Neumann’s design and Tiepolo’s staircase fresco.",
      "why": "Begun for Prince-Bishop Johann Philipp Franz von Schönborn in 1720, the Residence was completed under his brother and successor Friedrich Carl and decorated by artists from France, Italy, Austria and Germany. Tiepolo’s 18-by-30-metre staircase fresco and more than 40 visitable rooms are the main reasons to go inside.",
      "realityCheck": "The Court Garden is free and open daily until dusk, while the palace rooms require a ticket and follow seasonal hours. English tours run at 11 am and 3 pm; online tickets let visitors skip the cash-desk queue.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/169/"
      },
      "map": {
          "name": "Würzburg Residence with the Court Gardens and Residence Square",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.79278,
              "lng": 9.93889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=W%C3%BCrzburg+Residence+with+the+Court+Gardens+and+Residence+Square+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-187-st-mary-s-cathedral-and-st-michael-s-church-at-hildesheim",
      "name": "St Mary's Cathedral and St Michael's Church at Hildesheim",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO religious heritage",
      "access": "In central Hildesheim and reachable on foot or by public transport; check seasonal hours and service or concert closures.",
      "scores": {
        "globallyUnique": 8,
        "laymenInterest": 7,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "A rare surviving Ottonian Romanesque complex with Bernward's bronze doors and column, St Michael's painted wooden ceiling and the medieval town layout around both churches.",
      "why": "St Michael's Church was built between 1010 and 1020 on a symmetrical plan with two apses characteristic of Ottonian Romanesque art in Old Saxony. Its painted stucco-work and wooden ceiling, together with St Mary's Cathedral's bronze doors and Bernward's bronze column, are examples of Romanesque churches in the Holy Roman Empire that UNESCO considers of exceptional interest.",
      "realityCheck": "St Michael's is open to visitors from 1 April to 31 October: 10:00–18:00 Monday to Saturday and 12:00–18:00 on Sundays and church holidays. Services, concerts and rehearsals can restrict visits, while St Mary's Cathedral has separate hours.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/187/"
      },
      "map": {
          "name": "St Mary's Cathedral and St Michael's Church at Hildesheim",
          "formattedAddress": "Germany",
          "location": {
              "lat": 52.15278,
              "lng": 9.94389
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=St+Mary%27s+Cathedral+and+St+Michael%27s+Church+at+Hildesheim+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-271-pilgrimage-church-of-wies",
      "name": "Pilgrimage Church of Wies",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO religious heritage",
      "access": "Open daily, but sightseeing is barred during services and may be unavailable during tours or pilgrim masses; check current hours.",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 6,
        "easeOfAccess": 8,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "UNESCO-listed Rococo pilgrimage church with an intact rural Alpine setting",
      "why": "The Church of Wies was built from 1745 to 1754 under Dominikus Zimmermann's direction in an Alpine valley near Steingaden. Its oval plan, stucco work, frescoes and trompe-l'œil ceiling form a unified Bavarian Rococo interior.",
      "realityCheck": "The church attracts roughly one million visitors a year. It is open daily, but sightseeing stops during services and may be restricted during tours or pilgrim masses, so check the current visiting hours.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/271/"
      },
      "map": {
          "name": "Pilgrimage Church of Wies",
          "formattedAddress": "Germany",
          "location": {
              "lat": 47.68127778,
              "lng": 10.90013889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Pilgrimage+Church+of+Wies+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-272-hanseatic-city-of-lubeck",
      "name": "Hanseatic City of Lübeck",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed Old Town island with a largely intact medieval street plan, patrician houses, churches and salt storehouses",
      "why": "Lübeck – the former capital and Queen City of the Hanseatic League – was founded in the 12th century and prospered until the 16th century as the major trading centre for northern Europe.",
      "realityCheck": "The Old Town is walkable, but individual sights have separate hours and closures: St. Mary's Church is scheduled to close for renovation from 1 November 2026 until May 2027.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/272/"
      },
      "map": {
          "name": "Hanseatic City of Lübeck",
          "formattedAddress": "Germany",
          "location": {
              "lat": 53.86667,
              "lng": 10.69167
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Hanseatic+City+of+L%C3%BCbeck+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-292-cologne-cathedral",
      "name": "Cologne Cathedral",
      "countries": [
          "Germany"
      ],
      "area": "Cologne, North Rhine-Westphalia",
      "kind": "UNESCO religious heritage",
      "access": "Beside Cologne Central Station; tourist visits require a ticket, with weekday hours generally 10:00–17:45 and shorter Sunday and holiday hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A 157-metre High Gothic five-aisled basilica with a large medieval stained-glass cycle and the Shrine of the Magi",
      "why": "Construction began in 1248, stopped for more than 300 years and resumed in the 19th century, when builders completed the medieval plan in 1880. The five-aisled basilica holds the Shrine of the Magi, medieval choir fittings and a large cycle of early-14th-century stained glass.",
      "realityCheck": "Tourist entry to the interior became ticketed on 1 July 2026; services, construction work and special events can restrict access. The tower climb requires 533 steps, and the cathedral recommends booking online to avoid waiting times.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/292/"
      },
      "map": {
          "name": "Cologne Cathedral",
          "formattedAddress": "Germany",
          "location": {
              "lat": 50.94111111,
              "lng": 6.957222222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cologne+Cathedral+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-367-roman-monuments-cathedral-of-st-peter-and-church-of-our-lady-in-trier",
      "name": "Roman Monuments, Cathedral of St Peter and Church of Our Lady in Trier",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Trier, which stands on the Moselle River, was a Roman colony from the 1st century AD and then a great trading centre beginning in the next century. It became one of the capitals of the Tetrarchy at the end of the 3rd century, when it was known as the ‘second Rome’.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/367/"
      },
      "map": {
          "name": "Roman Monuments, Cathedral of St Peter and Church of Our Lady in Trier",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.75,
              "lng": 6.633333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Roman+Monuments%2C+Cathedral+of+St+Peter+and+Church+of+Our+Lady+in+Trier+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-515-abbey-and-altenmunster-of-lorsch",
      "name": "Abbey and Altenmünster of Lorsch",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO religious heritage",
      "access": "Train and bus access to Lorsch; the station is about a 10-minute walk from the museum center and grounds. The grounds are free until nightfall, while the Königshalle upper floor requires a public tour and museum hours vary.",
      "scores": {
        "globallyUnique": 7,
        "laymenInterest": 6,
        "easeOfAccess": 10,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A rare surviving Carolingian gatehouse with archaeological remains from more than 800 years of monastic life",
      "why": "The Torhalle, also called the Königshalle, is a rare surviving Carolingian gatehouse whose original appearance is largely intact. The site also preserves Carolingian sculpture and painting and archaeological remains from more than 800 years of monastic life.",
      "realityCheck": "The grounds and Altenmünster are open all year until nightfall, but the Königshalle's upper floor is tour-only and the Museum Center and Zehntscheune have separate seasonal hours and admission.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/515/"
      },
      "map": {
          "name": "Abbey and Altenmünster of Lorsch",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.65369,
              "lng": 8.56858
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Abbey+and+Altenm%C3%BCnster+of+Lorsch+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-532-palaces-and-parks-of-potsdam-and-berlin",
      "name": "Palaces and Parks of Potsdam and Berlin",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO cultural landscape",
      "access": "Public access across Potsdam and Berlin; palace interiors have site-specific hours, and Sanssouci uses fixed admission times with limited daily tickets",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "A cross-city ensemble of Prussian palaces, parks and designed spaces along the Havel, extending across Potsdam and Berlin",
      "why": "The original 500-hectare property included 150 buildings constructed between 1730 and 1916. After extensions in 1992 and 1999, the UNESCO property covers 2,064 hectares across Potsdam and Berlin, including Sanssouci, the New Garden, Babelsberg, Sacrow and Glienicke Park.",
      "realityCheck": "The property spans many sites. Sanssouci Palace drew 291,363 visitors in 2025, uses fixed admission times and limits daily tickets; other interiors have separate hours and restoration closures, so check the SPSG schedule before you go.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/532/"
      },
      "map": {
          "name": "Palaces and Parks of Potsdam and Berlin",
          "formattedAddress": "Germany",
          "location": {
              "lat": 52.4,
              "lng": 13.03333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Palaces+and+Parks+of+Potsdam+and+Berlin+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-534-garden-kingdom-of-dessau-worlitz",
      "name": "Garden Kingdom of Dessau-Wörlitz",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO cultural landscape",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The Garden Kingdom of Dessau-Wörlitz is an exceptional example of landscape design and planning of the Age of the Enlightenment, the 18th century. Its diverse components - outstanding buildings, landscaped parks and gardens in the English style, and subtly modified expanses of agricultural land - serve aesthetic, educational, and economic purposes in an.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/534/"
      },
      "map": {
          "name": "Garden Kingdom of Dessau-Wörlitz",
          "formattedAddress": "Germany",
          "location": {
              "lat": 51.8425,
              "lng": 12.42083
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Garden+Kingdom+of+Dessau-W%C3%B6rlitz+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-535-collegiate-church-castle-and-old-town-of-quedlinburg",
      "name": "Collegiate Church, Castle and Old Town of Quedlinburg",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed medieval town with more than 2,000 half-timbered houses, a preserved medieval town plan and the Romanesque Collegiate Church of St Servatius",
      "why": "Quedlinburg, in the Land of Sachsen-Anhalt, was a capital of the East Franconian German Empire at the time of the Saxonian-Ottonian ruling dynasty. It has been a prosperous trading town since the Middle Ages.",
      "realityCheck": "The castle museum is closed for renovation until 3 October 2026. The collegiate church is closed on Mondays and has scheduled visiting hours, so check current access before planning around the Stiftsberg.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/535/"
      },
      "map": {
          "name": "Collegiate Church, Castle and Old Town of Quedlinburg",
          "formattedAddress": "Germany",
          "location": {
              "lat": 51.78333,
              "lng": 11.15
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Collegiate+Church%2C+Castle+and+Old+Town+of+Quedlinburg+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-546-maulbronn-monastery-complex",
      "name": "Maulbronn Monastery Complex",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Founded in 1147, the Cistercian Maulbronn Monastery is considered the most complete and best-preserved medieval monastic complex north of the Alps. Surrounded by fortified walls, the main buildings were constructed between the 12th and 16th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/546/"
      },
      "map": {
          "name": "Maulbronn Monastery Complex",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.00083,
              "lng": 8.81306
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Maulbronn+Monastery+Complex+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-623-mines-of-rammelsberg-historic-town-of-goslar-and-upper-harz-water-manage",
      "name": "Mines of Rammelsberg, Historic Town of Goslar and Upper Harz Water Management System",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
        },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Upper Harz mining water management system, which lies south of the Rammelsberg mines and the town of Goslar, has been developed over a period of some 800 years to assist in the process of extracting ore for the production of non-ferrous metals.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/623/"
      },
      "map": {
          "name": "Mines of Rammelsberg, Historic Town of Goslar and Upper Harz Water Management System",
          "formattedAddress": "Germany",
          "location": {
              "lat": 51.82,
              "lng": 10.34
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Mines+of+Rammelsberg%2C+Historic+Town+of+Goslar+and+Upper+Harz+Water+Management+System+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-624-town-of-bamberg",
      "name": "Town of Bamberg",
      "countries": [
          "Germany"
      ],
      "area": "Bamberg, Bavaria",
      "kind": "UNESCO historic place",
      "access": "Walkable historic centre; take bus 901 or another bus from Bamberg station to the ZOB, then walk 5–10 minutes",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "Early-medieval town plan with three historic settlement areas and surviving medieval ecclesiastical and secular buildings",
      "why": "From the 10th century onwards, this town became an important link with the Slav peoples, especially those of Poland and Pomerania. During its period of greatest prosperity, from the 12th century onwards, the architecture of Bamberg strongly influenced northern Germany and Hungary.",
      "realityCheck": "The historic centre is walkable, but summer afternoons can be crowded around the Old Town Hall and cathedral. Check attraction hours before visiting.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/624/"
      },
      "map": {
          "name": "Town of Bamberg",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.89166667,
              "lng": 10.88888889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Town+of+Bamberg+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-729-bauhaus-and-its-sites-in-weimar-dessau-and-bernau",
      "name": "Bauhaus and its Sites in Weimar, Dessau and Bernau",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO architectural heritage",
      "access": "Three-city serial site; access varies by component, with paid tickets at major Dessau interiors, seasonal opening at Weimar's Haus Am Horn and guided tours required for Bernau's inhabited Trade Union School.",
      "scores": {
        "globallyUnique": 7,
        "laymenInterest": 6,
        "easeOfAccess": 8,
        "lowTouristCrowds": 6,
      },
      "uniqueness": "A serial property of seven component parts across three cities, including Haus Am Horn in Weimar, the Bauhaus Building and Masters' Houses in Dessau and the ADGB Trade Union School in Bernau.",
      "why": "The Bauhaus began in Weimar in 1919, moved to Dessau in 1925 and closed in 1933. Its surviving sites across Weimar, Dessau and Bernau show the school's use of reinforced concrete, glass and steel, along with functional planning and social-housing experiments.",
      "realityCheck": "Treat it as a multi-city itinerary. Dessau's major buildings have fixed opening hours and paid admission, Haus Am Horn in Weimar is open only in the summer season and Bernau's inhabited Trade Union School requires a guided tour; the historic Employment Office in Dessau is currently closed to visitors.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/729/"
      },
      "map": {
          "name": "Bauhaus and its Sites in Weimar, Dessau and Bernau",
          "formattedAddress": "Germany",
          "location": {
              "lat": 50.97477778,
              "lng": 11.3295
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Bauhaus+and+its+Sites+in+Weimar%2C+Dessau+and+Bernau+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-896-museumsinsel-museum-island-berlin",
      "name": "Museumsinsel (Museum Island), Berlin",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO architectural heritage",
      "access": "Central Berlin; U5 Museumsinsel or S-Bahn Friedrichstraße/Hackescher Markt; museum hours vary and the Pergamonmuseum is closed for construction",
      "scores": {
        "globallyUnique": 6,
        "laymenInterest": 6,
        "easeOfAccess": 10,
        "lowTouristCrowds": 4,
      },
      "uniqueness": "A planned ensemble of five museums built between 1824 and 1930, with each building designed in relation to its collections",
      "why": "The idea of the public museum emerged from the 18th-century Enlightenment. Five museums were built on the Museumsinsel between 1824 and 1930, and each was designed in relation to its collections. Together they show how museum design changed over more than a century.",
      "realityCheck": "Expect a busy central-city complex: 2,573,641 people visited its five buildings in 2023. Hours vary by museum, most close on Mondays and the Pergamonmuseum is closed for construction, with a partial reopening planned for 2027.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/896/"
      },
      "map": {
          "name": "Museumsinsel (Museum Island), Berlin",
          "formattedAddress": "Germany",
          "location": {
              "lat": 52.51972222,
              "lng": 13.39861111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Museumsinsel+%28Museum+Island%29%2C+Berlin+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-897-wartburg-castle",
      "name": "Wartburg Castle",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO fortification",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed fortification with preserved cultural fabric",
      "why": "Wartburg Castle blends superbly into its forest surroundings and is in many ways 'the ideal castle'. Although it has retained some original sections from the feudal period, the form it acquired during the 19th-century reconstitution gives a good idea of what this fortress might have been at the height of its military and seigneurial power.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/897/"
      },
      "map": {
          "name": "Wartburg Castle",
          "formattedAddress": "Germany",
          "location": {
              "lat": 50.96677778,
              "lng": 10.307
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wartburg+Castle+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-975-zollverein-coal-mine-industrial-complex-in-essen",
      "name": "Zollverein Coal Mine Industrial Complex in Essen",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The Zollverein industrial complex in Land Nordrhein-Westfalen consists of the complete infrastructure of a historical coal-mining site, with some 20th-century buildings of outstanding architectural merit.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/975/"
      },
      "map": {
          "name": "Zollverein Coal Mine Industrial Complex in Essen",
          "formattedAddress": "Germany",
          "location": {
              "lat": 51.49138889,
              "lng": 7.046111111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Zollverein+Coal+Mine+Industrial+Complex+in+Essen+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1067-historic-centres-of-stralsund-and-wismar",
      "name": "Historic Centres of Stralsund and Wismar",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The medieval towns of Wismar and Stralsund, on the Baltic coast of northern Germany, were major trading centres of the Hanseatic League in the 14th and 15th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1067/"
      },
      "map": {
          "name": "Historic Centres of Stralsund and Wismar",
          "formattedAddress": "Germany",
          "location": {
              "lat": 54.3025,
              "lng": 13.08527778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centres+of+Stralsund+and+Wismar+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1087-town-hall-and-roland-on-the-marketplace-of-bremen",
      "name": "Town Hall and Roland on the Marketplace of Bremen",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO architectural heritage",
      "access": "Walkable city-centre access; town hall interior by guided tour",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "A Gothic and Weser Renaissance town hall beside the 1404 Roland, with its historic relationship to the market square still intact",
      "why": "The Town Hall and the statue of Roland on the marketplace of Bremen in north-west Germany are outstanding representations of civic autonomy and sovereignty, as these developed in the Holy Roman Empire in Europe.",
      "realityCheck": "The square and Roland are easy to see, but the town hall interior is guided-only. The standard tour is scheduled daily at noon, dates are released about a month ahead and official events can close the building.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1087/"
      },
      "map": {
          "name": "Town Hall and Roland on the Marketplace of Bremen",
          "formattedAddress": "Germany",
          "location": {
              "lat": 53.07597222,
              "lng": 8.807472222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Town+Hall+and+Roland+on+the+Marketplace+of+Bremen+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1155-old-town-of-regensburg-with-stadtamhof",
      "name": "Old town of Regensburg with Stadtamhof",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Located on the Danube River in Bavaria, this medieval town contains many buildings of exceptional quality that testify to its history as a trading centre and to its influence on the region from the 9th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1155/"
      },
      "map": {
          "name": "Old town of Regensburg with Stadtamhof",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.02055556,
              "lng": 12.09916667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+town+of+Regensburg+with+Stadtamhof+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1368-fagus-factory-in-alfeld",
      "name": "Fagus Factory in Alfeld",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "Fagus Factory in Alfeld is a 10-building complex - began around 1910 to the design of Walter Gropius, which is a landmark in the development of modern architecture and industrial design.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1368/"
      },
      "map": {
          "name": "Fagus Factory in Alfeld",
          "formattedAddress": "Germany",
          "location": {
              "lat": 51.98388889,
              "lng": 9.812222222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Fagus+Factory+in+Alfeld+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1379-margravial-opera-house-bayreuth",
      "name": "Margravial Opera House Bayreuth",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO architectural heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "A masterpiece of Baroque theatre architecture, built between 1745 and 1750, the Opera House is the only entirely preserved example of its type where an audience of 500 can experience Baroque court opera culture and acoustics authentically, as its auditorium retains its original materials, i.e.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1379/"
      },
      "map": {
          "name": "Margravial Opera House Bayreuth",
          "formattedAddress": "Germany",
          "location": {
              "lat": 49.94439311,
              "lng": 11.57849794
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Margravial+Opera+House+Bayreuth+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1470-naumburg-cathedral",
      "name": "Naumburg Cathedral",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Located in the eastern part of the Thuringian Basin, the Cathedral of Naumburg, whose construction began in 1028, is an outstanding testimony to medieval art and architecture.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1470/"
      },
      "map": {
          "name": "Naumburg Cathedral",
          "formattedAddress": "Germany",
          "location": {
              "lat": 51.15480556,
              "lng": 11.804
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Naumburg+Cathedral+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1580-water-management-system-of-augsburg",
      "name": "Water Management System of Augsburg",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The water management system of the city of Augsburg has evolved in successive phases from the 14th century to the present day. It includes a network of canals, water towers dating from the 15th to 17th centuries, which housed pumping machinery, a water-cooled butchers’ hall, a system of three monumental fountains and hydroelectric power stations, which.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1580/"
      },
      "map": {
          "name": "Water Management System of Augsburg",
          "formattedAddress": "Germany",
          "location": {
              "lat": 48.36547222,
              "lng": 10.902
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Water+Management+System+of+Augsburg+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1705-schwerin-residence-ensemble",
      "name": "Schwerin Residence Ensemble",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO architectural heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "Established on the shores of Lake Schwerin in northeast Germany, the Schwerin Residence Ensemble is an architectural and landscape ensemble, which fits very precisely within the context of the emergence and development of the historicist style in Europe.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1705/"
      },
      "map": {
          "name": "Schwerin Residence Ensemble",
          "formattedAddress": "Germany",
          "location": {
              "lat": 53.62416667,
              "lng": 11.41888889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Schwerin+Residence+Ensemble+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1726-the-palaces-of-king-ludwig-ii-of-bavaria-neuschwanstein-linderhof-schach",
      "name": "The Palaces of King Ludwig II of Bavaria: Neuschwanstein, Linderhof, Schachen and Herrenchiemsee",
      "countries": [
          "Germany"
      ],
      "area": "Germany",
      "kind": "UNESCO architectural heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "This serial property consists of four grand palace complexes in Bavaria’s alpine region, built under King Ludwig II between 1864 and 1886. Designed as personal retreats and imaginative escapes, they use the romantic and eclectic language of the era.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1726/"
      },
      "map": {
          "name": "The Palaces of King Ludwig II of Bavaria: Neuschwanstein, Linderhof, Schachen and Herrenchiemsee",
          "formattedAddress": "Germany",
          "location": {
              "lat": 47.5575,
              "lng": 10.74944444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Palaces+of+King+Ludwig+II+of+Bavaria%3A+Neuschwanstein%2C+Linderhof%2C+Schachen+and+Herrenchiemsee+Germany"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-392-temple-of-apollo-epicurius-at-bassae",
      "name": "Temple of Apollo Epicurius at Bassae",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "This famous temple to the god of healing and the sun was built towards the middle of the 5th century B.C. in the lonely heights of the Arcadian mountains.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/392/"
      },
      "map": {
          "name": "Temple of Apollo Epicurius at Bassae",
          "formattedAddress": "Greece",
          "location": {
              "lat": 37.43498,
              "lng": 21.89694
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Temple+of+Apollo+Epicurius+at+Bassae+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-491-sanctuary-of-asklepios-at-epidaurus",
      "name": "Sanctuary of Asklepios at Epidaurus",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "In a small valley in the Peloponnesus, the shrine of Asklepios, the god of medicine, developed out of a much earlier cult of Apollo (Maleatas), during the 6th century BC at the latest, as the official cult of the city state of Epidaurus.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/491/"
      },
      "map": {
          "name": "Sanctuary of Asklepios at Epidaurus",
          "formattedAddress": "Greece",
          "location": {
              "lat": 37.6,
              "lng": 23.08055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Sanctuary+of+Asklepios+at+Epidaurus+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-493-medieval-city-of-rhodes",
      "name": "Medieval City of Rhodes",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Order of St John of Jerusalem occupied Rhodes from 1309 to 1523 and set about transforming the city into a stronghold. It subsequently came under Turkish and Italian rule.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/493/"
      },
      "map": {
          "name": "Medieval City of Rhodes",
          "formattedAddress": "Greece",
          "location": {
              "lat": 36.44722,
              "lng": 28.22778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Medieval+City+of+Rhodes+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-537-monasteries-of-daphni-hosios-loukas-and-nea-moni-of-chios",
      "name": "Monasteries of Daphni, Hosios Loukas and Nea Moni of Chios",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO cultural heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural heritage with preserved cultural fabric",
      "why": "Although geographically distant from each other, these three monasteries (the first is in Attica, near Athens, the second in Phocida near Delphi, and the third on an island in the Aegean Sea, near Asia Minor) belong to the same typological series and share the same aesthetic characteristics.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/537/"
      },
      "map": {
          "name": "Monasteries of Daphni, Hosios Loukas and Nea Moni of Chios",
          "formattedAddress": "Greece",
          "location": {
              "lat": 38.39527778,
              "lng": 22.74666667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monasteries+of+Daphni%2C+Hosios+Loukas+and+Nea+Moni+of+Chios+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-942-the-historic-centre-chora-with-the-monastery-of-saint-john-the-theologia",
      "name": "The Historic Centre (Chorá) with the Monastery of Saint-John the Theologian and the Cave of the Apocalypse on the Island of Pátmos",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The small island of Pátmos in the Dodecanese is reputed to be where St John the Theologian wrote both his Gospel and the Apocalypse. A monastery dedicated to the ‘beloved disciple’ was founded there in the late 10th century and it has been a place of pilgrimage and Greek Orthodox learning ever since.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/942/"
      },
      "map": {
          "name": "The Historic Centre (Chorá) with the Monastery of Saint-John the Theologian and the Cave of the Apocalypse on the Island of Pátmos",
          "formattedAddress": "Greece",
          "location": {
              "lat": 37.3,
              "lng": 26.55
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Historic+Centre+%28Chor%C3%A1%29+with+the+Monastery+of+Saint-John+the+Theologian+and+the+Cave+of+the+Apocalypse+on+the+Island+of+P%C3%A1tmos+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-978-old-town-of-corfu",
      "name": "Old Town of Corfu",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Old Town of Corfu, on the Island of Corfu off the western coasts of Albania and Greece, is located in a strategic position at the entrance of the Adriatic Sea, and has its roots in the 8th century BC.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/978/"
      },
      "map": {
          "name": "Old Town of Corfu",
          "formattedAddress": "Greece",
          "location": {
              "lat": 39.62394139,
              "lng": 19.9275
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+Town+of+Corfu+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1695-zagori-cultural-landscape",
      "name": "Zagori Cultural Landscape",
      "countries": [
          "Greece"
      ],
      "area": "Greece",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Located in a remote rural landscape in northwestern Greece, small stone villages known as Zagorochoria extend along the western slopes of the northern part of the Pindus mountain range.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1695/"
      },
      "map": {
          "name": "Zagori Cultural Landscape",
          "formattedAddress": "Greece",
          "location": {
              "lat": 39.90527778,
              "lng": 20.81972222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Zagori+Cultural+Landscape+Greece"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-400-budapest-including-the-banks-of-the-danube-the-buda-castle-quarter-and-a",
      "name": "Budapest, including the Banks of the Danube, the Buda Castle Quarter and Andrássy Avenue",
      "countries": [
          "Hungary"
      ],
      "area": "Hungary",
      "kind": "UNESCO historic place",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 8,
          "easeOfAccess": 10,
          "lowTouristCrowds": 3
        },
      "uniqueness": "UNESCO-listed fortification with preserved cultural fabric",
      "why": "This site has the remains of monuments such as the Roman city of Aquincum and the Gothic castle of Buda, which have had a considerable influence on the architecture of various periods.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/400/"
      },
      "map": {
          "name": "Budapest, including the Banks of the Danube, the Buda Castle Quarter and Andrássy Avenue",
          "formattedAddress": "Hungary",
          "location": {
              "lat": 47.48242,
              "lng": 19.07067
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Budapest%2C+including+the+Banks+of+the+Danube%2C+the+Buda+Castle+Quarter+and+Andr%C3%A1ssy+Avenue+Hungary"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-758-millenary-benedictine-abbey-of-pannonhalma-and-its-natural-environment",
      "name": "Millenary Benedictine Abbey of Pannonhalma and its Natural Environment",
      "countries": [
          "Hungary"
      ],
      "area": "Hungary",
      "kind": "UNESCO religious heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The first Benedictine monks settled here in 996. They went on to convert the Hungarians, to found the country's first school and, in 1055, to write the first document in Hungarian.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/758/"
      },
      "map": {
          "name": "Millenary Benedictine Abbey of Pannonhalma and its Natural Environment",
          "formattedAddress": "Hungary",
          "location": {
              "lat": 47.55889,
              "lng": 17.78444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Millenary+Benedictine+Abbey+of+Pannonhalma+and+its+Natural+Environment+Hungary"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1063-tokaj-wine-region-historic-cultural-landscape",
      "name": "Tokaj Wine Region Historic Cultural Landscape",
      "countries": [
          "Hungary"
      ],
      "area": "Hungary",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
        },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The cultural landscape of Tokaj graphically demonstrates the long tradition of wine production in this region of low hills and river valleys. The intricate pattern of vineyards, farms, villages and small towns, with their historic networks of deep wine cellars, illustrates every facet of the production of the famous Tokaj wines, the quality and management.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1063/"
      },
      "map": {
          "name": "Tokaj Wine Region Historic Cultural Landscape",
          "formattedAddress": "Hungary",
          "location": {
              "lat": 48.15,
              "lng": 21.35
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Tokaj+Wine+Region+Historic+Cultural+Landscape+Hungary"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-93-church-and-dominican-convent-of-santa-maria-delle-grazie-with-the-last-s",
      "name": "Church and Dominican Convent of Santa Maria delle Grazie with “The Last Supper” by Leonardo da Vinci",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The refectory of the Convent of Santa Maria delle Grazie forms an integral part of this architectural complex, begun in Milan in 1463 and reworked at the end of the 15th century by Bramante.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/93/"
      },
      "map": {
          "name": "Church and Dominican Convent of Santa Maria delle Grazie with “The Last Supper” by Leonardo da Vinci",
          "formattedAddress": "Italy",
          "location": {
              "lat": 45.466,
              "lng": 9.171
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Church+and+Dominican+Convent+of+Santa+Maria+delle+Grazie+with+%E2%80%9CThe+Last+Supper%E2%80%9D+by+Leonardo+da+Vinci+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-174-historic-centre-of-florence",
      "name": "Historic Centre of Florence",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 8,
          "laymenInterest": 9,
          "easeOfAccess": 10,
          "lowTouristCrowds": 2
        },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Built on the site of an Etruscan settlement, Florence, the symbol of the Renaissance, rose to economic and cultural pre-eminence under the Medici in the 15th and 16th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/174/"
      },
      "map": {
          "name": "Historic Centre of Florence",
          "formattedAddress": "Italy",
          "location": {
              "lat": 43.77306,
              "lng": 11.25611
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Florence+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-175-medici-villas-and-gardens-in-tuscany",
      "name": "Medici Villas and Gardens in Tuscany",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO cultural landscape",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Twelve villas and two gardens spread across the Tuscan landscape make up this site which bears testimony to the influence the Medici family exerted over modern European culture through its patronage of the arts.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/175/"
      },
      "map": {
          "name": "Medici Villas and Gardens in Tuscany",
          "formattedAddress": "Italy",
          "location": {
              "lat": 43.85777778,
              "lng": 11.30416667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Medici+Villas+and+Gardens+in+Tuscany+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-549-18th-century-royal-palace-at-caserta-with-the-park-the-aqueduct-of-vanvi",
      "name": "18th-Century Royal Palace at Caserta with the Park, the Aqueduct of Vanvitelli, and the San Leucio Complex",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO cultural landscape",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The monumental complex at Caserta, created by the Bourbon king Charles III in the mid-18th century to rival Versailles and the Royal Palace in Madrid, is exceptional for the way in which it brings together a magnificent palace with its park and gardens, as well as natural woodland, hunting lodges and a silk factory.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/549/"
      },
      "map": {
          "name": "18th-Century Royal Palace at Caserta with the Park, the Aqueduct of Vanvitelli, and the San Leucio Complex",
          "formattedAddress": "Italy",
          "location": {
              "lat": 41.07333,
              "lng": 14.32639
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=18th-Century+Royal+Palace+at+Caserta+with+the+Park%2C+the+Aqueduct+of+Vanvitelli%2C+and+the+San+Leucio+Complex+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-550-historic-centre-of-san-gimignano",
      "name": "Historic Centre of San Gimignano",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "'San Gimignano delle belle Torri' is in Tuscany, 56 km south of Florence. It served as an important relay point for pilgrims travelling to or from Rome on the Via Francigena.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/550/"
      },
      "map": {
          "name": "Historic Centre of San Gimignano",
          "formattedAddress": "Italy",
          "location": {
              "lat": 43.46806,
              "lng": 11.04167
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+San+Gimignano+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-712-city-of-vicenza-and-the-palladian-villas-of-the-veneto",
      "name": "City of Vicenza and the Palladian Villas of the Veneto",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded in the 2nd century B.C. in northern Italy, Vicenza prospered under Venetian rule from the early 15th to the end of the 18th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/712/"
      },
      "map": {
          "name": "City of Vicenza and the Palladian Villas of the Veneto",
          "formattedAddress": "Italy",
          "location": {
              "lat": 45.54916667,
              "lng": 11.54944444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=City+of+Vicenza+and+the+Palladian+Villas+of+the+Veneto+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-717-historic-centre-of-siena",
      "name": "Historic Centre of Siena",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Siena is the embodiment of a medieval city. Its inhabitants pursued their rivalry with Florence right into the area of urban planning.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/717/"
      },
      "map": {
          "name": "Historic Centre of Siena",
          "formattedAddress": "Italy",
          "location": {
              "lat": 43.31861111,
              "lng": 11.33166667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Siena+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-726-historic-centre-of-naples",
      "name": "Historic Centre of Naples",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "From the Neapolis founded by Greek settlers in 470 B.C. to the city of today, Naples has retained the imprint of the successive cultures that emerged in Europe and the Mediterranean basin.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/726/"
      },
      "map": {
          "name": "Historic Centre of Naples",
          "formattedAddress": "Italy",
          "location": {
              "lat": 40.85138889,
              "lng": 14.26277778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Naples+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-733-ferrara-city-of-the-renaissance-and-its-po-delta",
      "name": "Ferrara, City of the Renaissance, and its Po Delta",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Ferrara, which grew up around a ford over the River Po, became an intellectual and artistic centre that attracted the greatest minds of the Italian Renaissance in the 15th and 16th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/733/"
      },
      "map": {
          "name": "Ferrara, City of the Renaissance, and its Po Delta",
          "formattedAddress": "Italy",
          "location": {
              "lat": 44.83777778,
              "lng": 11.61944444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Ferrara%2C+City+of+the+Renaissance%2C+and+its+Po+Delta+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-789-historic-centre-of-the-city-of-pienza",
      "name": "Historic Centre of the City of Pienza",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "It was in this Tuscan town that Renaissance town-planning concepts were first put into practice after Pope Pius II decided, in 1459, to transform the look of his birthplace.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/789/"
      },
      "map": {
          "name": "Historic Centre of the City of Pienza",
          "formattedAddress": "Italy",
          "location": {
              "lat": 43.07694444,
              "lng": 11.67861111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+the+City+of+Pienza+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-797-city-of-verona",
      "name": "City of Verona",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The historic city of Verona was founded in the 1st century B.C. It particularly flourished under the rule of the Scaliger family in the 13th and 14th centuries and as part of the Republic of Venice from the 15th to 18th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/797/"
      },
      "map": {
          "name": "City of Verona",
          "formattedAddress": "Italy",
          "location": {
              "lat": 45.43861111,
              "lng": 10.99388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=City+of+Verona+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-824-botanical-garden-orto-botanico-padua",
      "name": "Botanical Garden (Orto Botanico), Padua",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO cultural landscape",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The world's first botanical garden was created in Padua in 1545. It still preserves its original layout – a circular central plot, laid out as a world diagram and surrounded by a ring of water.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/824/"
      },
      "map": {
          "name": "Botanical Garden (Orto Botanico), Padua",
          "formattedAddress": "Italy",
          "location": {
              "lat": 45.39911111,
              "lng": 11.88066667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Botanical+Garden+%28Orto+Botanico%29%2C+Padua+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-827-cathedral-torre-civica-and-piazza-grande-modena",
      "name": "Cathedral, Torre Civica and Piazza Grande, Modena",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The magnificent 12th-century cathedral at Modena, the work of two great artists (Lanfranco and Wiligelmus), is a supreme example of early Romanesque art. With its piazza and soaring tower, it testifies to the faith of its builders and the power of the Canossa dynasty who commissioned it.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/827/"
      },
      "map": {
          "name": "Cathedral, Torre Civica and Piazza Grande, Modena",
          "formattedAddress": "Italy",
          "location": {
              "lat": 44.64624,
              "lng": 10.92568
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cathedral%2C+Torre+Civica+and+Piazza+Grande%2C+Modena+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-828-historic-centre-of-urbino",
      "name": "Historic Centre of Urbino",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The small hill town of Urbino, in the Marche, experienced a great cultural flowering in the 15th century, attracting artists and scholars from all over Italy and beyond, and influencing cultural developments elsewhere in Europe.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/828/"
      },
      "map": {
          "name": "Historic Centre of Urbino",
          "formattedAddress": "Italy",
          "location": {
              "lat": 43.725,
              "lng": 12.63333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Urbino+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1390-vineyard-landscape-of-piedmont-langhe-roero-and-monferrato",
      "name": "Vineyard Landscape of Piedmont: Langhe-Roero and Monferrato",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "This landscape covers five distinct wine-growing areas with outstanding landscapes and the Castle of Cavour, an emblematic name both in the development of vineyards and in Italian history.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1390/"
      },
      "map": {
          "name": "Vineyard Landscape of Piedmont: Langhe-Roero and Monferrato",
          "formattedAddress": "Italy",
          "location": {
              "lat": 44.60861111,
              "lng": 7.963611111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Vineyard+Landscape+of+Piedmont%3A+Langhe-Roero+and+Monferrato+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1487-arab-norman-palermo-and-the-cathedral-churches-of-cefalu-and-monreale",
      "name": "Arab-Norman Palermo and the Cathedral Churches of Cefalú and Monreale",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Located on the northern coast of Sicily, Arab-Norman Palermo includes a series of nine civil and religious structures dating from the era of the Norman kingdom of Sicily (1130-1194): two palaces, three churches, a cathedral, a bridge, as well as the cathedrals of Cefalú and Monreale.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1487/"
      },
      "map": {
          "name": "Arab-Norman Palermo and the Cathedral Churches of Cefalú and Monreale",
          "formattedAddress": "Italy",
          "location": {
              "lat": 38.11083333,
              "lng": 13.35305556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Arab-Norman+Palermo+and+the+Cathedral+Churches+of+Cefal%C3%BA+and+Monreale+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1538-ivrea-industrial-city-of-the-20th-century",
      "name": "Ivrea, industrial city of the 20th century",
      "countries": [
          "Italy"
      ],
      "area": "Italy",
      "kind": "UNESCO industrial heritage",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
        },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The industrial city of Ivrea is located in the Piedmont region and developed as the testing ground for Olivetti, manufacturer of typewriters, mechanical calculators and office computers.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1538/"
      },
      "map": {
          "name": "Ivrea, industrial city of the 20th century",
          "formattedAddress": "Italy",
          "location": {
              "lat": 45.4575,
              "lng": 7.869166667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Ivrea%2C+industrial+city+of+the+20th+century+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
      {
      "id": "unesco-852-historic-centre-of-riga",
      "name": "Historic Centre of Riga",
      "countries": [
          "Latvia"
      ],
      "area": "Latvia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Riga was a major centre of the Hanseatic League, deriving its prosperity in the 13th–15th centuries from the trade with central and eastern Europe. The urban fabric of its medieval centre comes from this prosperity, though most of the earliest buildings were destroyed by fire or war.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/852/"
      },
      "map": {
          "name": "Historic Centre of Riga",
          "formattedAddress": "Latvia",
          "location": {
              "lat": 56.95417,
              "lng": 24.11667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Riga+Latvia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1658-old-town-of-kuldiga",
      "name": "Old town of Kuldīga",
      "countries": [
          "Latvia"
      ],
      "area": "Latvia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Located in the western part of Latvia, the town of Kuldīga is an exceptionally well-preserved example of a traditional urban settlement, which developed from a small medieval hamlet into an important administrative centre of the Duchy of Courland and Semigallia between the 16th and 18th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1658/"
      },
      "map": {
          "name": "Old town of Kuldīga",
          "formattedAddress": "Latvia",
          "location": {
              "lat": 56.96775,
              "lng": 21.97152778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+town+of+Kuld%C4%ABga+Latvia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-541-vilnius-historic-centre",
      "name": "Vilnius Historic Centre",
      "countries": [
          "Lithuania"
      ],
      "area": "Lithuania",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Political centre of the Grand Duchy of Lithuania from the 13th to the end of the 18th century, Vilnius influenced the cultural and architectural development of much of eastern Europe.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/541/"
      },
      "map": {
          "name": "Vilnius Historic Centre",
          "formattedAddress": "Lithuania",
          "location": {
              "lat": 54.68667,
              "lng": 25.29306
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Vilnius+Historic+Centre+Lithuania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1661-modernist-kaunas-architecture-of-optimism-1919-1939",
      "name": "Modernist Kaunas: Architecture of Optimism, 1919-1939",
      "countries": [
          "Lithuania"
      ],
      "area": "Lithuania",
      "kind": "UNESCO architectural heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "This property testifies to the rapid urbanization that transformed the provincial town of Kaunas into a modern city that became Lithuania’s provisional capital between the First and Second World Wars.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1661/"
      },
      "map": {
          "name": "Modernist Kaunas: Architecture of Optimism, 1919-1939",
          "formattedAddress": "Lithuania",
          "location": {
              "lat": 54.89694444,
              "lng": 23.92916667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Modernist+Kaunas%3A+Architecture+of+Optimism%2C+1919-1939+Lithuania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-699-city-of-luxembourg-its-old-quarters-and-fortifications",
      "name": "City of Luxembourg: its Old Quarters and Fortifications",
      "countries": [
          "Luxembourg"
      ],
      "area": "Luxembourg",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Because of its strategic position, Luxembourg was, from the 16th century until 1867, when its walls were dismantled, one of Europe's greatest fortified sites. It was repeatedly reinforced as it passed from one great European power to another: the Holy Roman Emperors, the House of Burgundy, the Habsburgs, the French and Spanish kings, and finally the.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/699/"
      },
      "map": {
          "name": "City of Luxembourg: its Old Quarters and Fortifications",
          "formattedAddress": "Luxembourg",
          "location": {
              "lat": 49.61,
              "lng": 6.13333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=City+of+Luxembourg%3A+its+Old+Quarters+and+Fortifications+Luxembourg"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-131-city-of-valletta",
      "name": "City of Valletta",
      "countries": [
          "Malta"
      ],
      "area": "Malta",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The capital of Malta is inextricably linked to the history of the military and charitable Order of St John of Jerusalem. It was ruled successively by the Phoenicians, Greeks, Carthaginians, Romans, Byzantines, Arabs and the Order of the Knights of St John.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/131/"
      },
      "map": {
          "name": "City of Valletta",
          "formattedAddress": "Malta",
          "location": {
              "lat": 35.90056,
              "lng": 14.51444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=City+of+Valletta+Malta"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-818-mill-network-at-kinderdijk-elshout",
      "name": "Mill Network at Kinderdijk-Elshout",
      "countries": [
          "Netherlands (Kingdom of the)"
      ],
      "area": "Netherlands (Kingdom of the)",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The outstanding contribution made by the people of the Netherlands to the technology of handling water is admirably demonstrated by the installations in the Kinderdijk-Elshout area.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/818/"
      },
      "map": {
          "name": "Mill Network at Kinderdijk-Elshout",
          "formattedAddress": "Netherlands (Kingdom of the)",
          "location": {
              "lat": 51.8825,
              "lng": 4.649444444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Mill+Network+at+Kinderdijk-Elshout+Netherlands+%28Kingdom+of+the%29"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1349-seventeenth-century-canal-ring-area-of-amsterdam-inside-the-singelgracht",
      "name": "Seventeenth-Century Canal Ring Area of Amsterdam inside the Singelgracht",
      "countries": [
          "Netherlands (Kingdom of the)"
      ],
      "area": "Netherlands (Kingdom of the)",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The historic urban ensemble of the canal district of Amsterdam was a project for a new ‘port city’ built at the end of the 16th and beginning of the 17th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1349/"
      },
      "map": {
          "name": "Seventeenth-Century Canal Ring Area of Amsterdam inside the Singelgracht",
          "formattedAddress": "Netherlands (Kingdom of the)",
          "location": {
              "lat": 52.365,
              "lng": 4.887777778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Seventeenth-Century+Canal+Ring+Area+of+Amsterdam+inside+the+Singelgracht+Netherlands+%28Kingdom+of+the%29"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-58-urnes-stave-church",
      "name": "Urnes Stave Church",
      "countries": [
          "Norway"
      ],
      "area": "Norway",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The wooden church of Urnes (the stavkirke ) stands in the natural setting of Sogn og Fjordane. It was built in the 12th and 13th centuries and is an outstanding example of traditional Scandinavian wooden architecture.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/58/"
      },
      "map": {
          "name": "Urnes Stave Church",
          "formattedAddress": "Norway",
          "location": {
              "lat": 61.29825949,
              "lng": 7.322678289
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Urnes+Stave+Church+Norway"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1486-rjukan-notodden-industrial-heritage-site",
      "name": "Rjukan-Notodden Industrial Heritage Site",
      "countries": [
          "Norway"
      ],
      "area": "Norway",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "Located in a dramatic landscape of mountains, waterfalls and river valleys, the site comprises hydroelectric power plants, transmission lines, factories, transport systems and towns.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1486/"
      },
      "map": {
          "name": "Rjukan-Notodden Industrial Heritage Site",
          "formattedAddress": "Norway",
          "location": {
              "lat": 59.87861111,
              "lng": 8.593611111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Rjukan-Notodden+Industrial+Heritage+Site+Norway"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-29-historic-centre-of-krakow",
      "name": "Historic Centre of Kraków",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Historic Centre of Kraków, the former capital of Poland, is situated at the foot of the Royal Wawel Castle. The 13th-century merchants' town has Europe's largest market square and numerous historical houses, palaces and churches with their magnificent interiors.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/29/"
      },
      "map": {
          "name": "Historic Centre of Kraków",
          "formattedAddress": "Poland",
          "location": {
              "lat": 50.06138889,
              "lng": 19.93722222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Krak%C3%B3w+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-30-historic-centre-of-warsaw",
      "name": "Historic Centre of Warsaw",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "During the Warsaw Uprising in August 1944, more than 85% of Warsaw's historic centre was destroyed by Nazi troops. After the war, a five-year reconstruction campaign by its citizens resulted in today's careful restoration of the Old Town, with its churches, palaces and market-place.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/30/"
      },
      "map": {
          "name": "Historic Centre of Warsaw",
          "formattedAddress": "Poland",
          "location": {
              "lat": 52.25,
              "lng": 21.013
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Warsaw+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-32-wieliczka-and-bochnia-royal-salt-mines",
      "name": "Wieliczka and Bochnia Royal Salt Mines",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The deposit of rock salt in Wieliczka and Bochnia has been mined since the 13th century. This major industrial undertaking has royal status and is the oldest of its type in Europe.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/32/"
      },
      "map": {
          "name": "Wieliczka and Bochnia Royal Salt Mines",
          "formattedAddress": "Poland",
          "location": {
              "lat": 49.97916667,
              "lng": 20.06388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wieliczka+and+Bochnia+Royal+Salt+Mines+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-564-old-city-of-zamosc",
      "name": "Old City of Zamość",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Zamosc was founded in the 16th century by the chancellor Jan Zamoysky on the trade route linking western and northern Europe with the Black Sea. Modelled on Italian theories of the 'ideal city' and built by the architect Bernando Morando, a native of Padua, Zamosc is a perfect example of a late-16th-century Renaissance town.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/564/"
      },
      "map": {
          "name": "Old City of Zamość",
          "formattedAddress": "Poland",
          "location": {
              "lat": 50.71694444,
              "lng": 23.25277778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+City+of+Zamo%C5%9B%C4%87+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-835-medieval-town-of-torun",
      "name": "Medieval Town of Toruń",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Torun owes its origins to the Teutonic Order, which built a castle there in the mid-13th century as a base for the conquest and evangelization of Prussia. It soon developed a commercial role as part of the Hanseatic League.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/835/"
      },
      "map": {
          "name": "Medieval Town of Toruń",
          "formattedAddress": "Poland",
          "location": {
              "lat": 53.01055556,
              "lng": 18.60416667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Medieval+Town+of+Toru%C5%84+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-847-castle-of-the-teutonic-order-in-malbork",
      "name": "Castle of the Teutonic Order in Malbork",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO fortification",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed fortification with preserved cultural fabric",
      "why": "This 13th-century fortified monastery belonging to the Teutonic Order was substantially enlarged and embellished after 1309, when the seat of the Grand Master moved here from Venice.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/847/"
      },
      "map": {
          "name": "Castle of the Teutonic Order in Malbork",
          "formattedAddress": "Poland",
          "location": {
              "lat": 54.041,
              "lng": 19.02972222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Castle+of+the+Teutonic+Order+in+Malbork+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-905-kalwaria-zebrzydowska-the-mannerist-architectural-and-park-landscape-com",
      "name": "Kalwaria Zebrzydowska: the Mannerist Architectural and Park Landscape Complex and Pilgrimage Park",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Kalwaria Zebrzydowska is a breathtaking cultural landscape of great spiritual significance. Its natural setting – in which a series of symbolic places of worship relating to the Passion of Jesus Christ and the life of the Virgin Mary was laid out at the beginning of the 17th century – has remained virtually unchanged.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/905/"
      },
      "map": {
          "name": "Kalwaria Zebrzydowska: the Mannerist Architectural and Park Landscape Complex and Pilgrimage Park",
          "formattedAddress": "Poland",
          "location": {
              "lat": 49.86668,
              "lng": 19.676361
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Kalwaria+Zebrzydowska%3A+the+Mannerist+Architectural+and+Park+Landscape+Complex+and+Pilgrimage+Park+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1053-wooden-churches-of-southern-maopolska",
      "name": "Wooden Churches of Southern Małopolska",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The wooden churches of southern Little Poland are strong examples of medieval church-building traditions in Roman Catholic culture.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1053/"
      },
      "map": {
          "name": "Wooden Churches of Southern Małopolska",
          "formattedAddress": "Poland",
          "location": {
              "lat": 49.75,
              "lng": 21.23333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wooden+Churches+of+Southern+Ma%C5%82opolska+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1054-churches-of-peace-in-jawor-and-swidnica",
      "name": "Churches of Peace in Jawor and Świdnica",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The Churches of Peace in Jawor and Świdnica, the largest timber-framed religious buildings in Europe, were built in the former Silesia in the mid-17th century, amid the religious strife that followed the Peace of Westphalia.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1054/"
      },
      "map": {
          "name": "Churches of Peace in Jawor and Świdnica",
          "formattedAddress": "Poland",
          "location": {
              "lat": 51.05427778,
              "lng": 16.19594444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Churches+of+Peace+in+Jawor+and+%C5%9Awidnica+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1165-centennial-hall-in-wrocaw",
      "name": "Centennial Hall in Wrocław",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO architectural heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "The Centennial Hall, a landmark in the history of reinforced concrete architecture, was erected in 1911-1913 by the architect Max Berg as a multi-purpose recreational building, situated in the Exhibition Grounds.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1165/"
      },
      "map": {
          "name": "Centennial Hall in Wrocław",
          "formattedAddress": "Poland",
          "location": {
              "lat": 51.10694722,
              "lng": 17.07701389
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Centennial+Hall+in+Wroc%C5%82aw+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1539-tarnowskie-gory-lead-silver-zinc-mine-and-its-underground-water-manageme",
      "name": "Tarnowskie Góry Lead-Silver-Zinc Mine and its Underground Water Management System",
      "countries": [
          "Poland"
      ],
      "area": "Poland",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "Located in Upper Silesia, in southern Poland, one of the main mining areas of central Europe, the property includes the entire underground mine with adits, shafts, galleries and other features of the water management system.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1539/"
      },
      "map": {
          "name": "Tarnowskie Góry Lead-Silver-Zinc Mine and its Underground Water Management System",
          "formattedAddress": "Poland",
          "location": {
              "lat": 50.44269722,
              "lng": 18.85122778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Tarnowskie+G%C3%B3ry+Lead-Silver-Zinc+Mine+and+its+Underground+Water+Management+System+Poland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-206-central-zone-of-the-town-of-angra-do-heroismo-in-the-azores",
      "name": "Central Zone of the Town of Angra do Heroismo in the Azores",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Situated on one of the islands in the Azores archipelago, this was an obligatory port of call from the 15th century until the advent of the steamship in the 19th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/206/"
      },
      "map": {
          "name": "Central Zone of the Town of Angra do Heroismo in the Azores",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.655,
              "lng": -27.22
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Central+Zone+of+the+Town+of+Angra+do+Heroismo+in+the+Azores+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-263-monastery-of-the-hieronymites-and-tower-of-belem-in-lisbon",
      "name": "Monastery of the Hieronymites and Tower of Belém in Lisbon",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Standing at the entrance to Lisbon harbour, the Monastery of the Hieronymites – construction of which began in 1502 – is a major work of Portuguese art. The nearby Tower of Belém, built to commemorate Vasco da Gama's expedition, records Portugal's maritime expeditions around the time of Vasco da Gama.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/263/"
      },
      "map": {
          "name": "Monastery of the Hieronymites and Tower of Belém in Lisbon",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.69194,
              "lng": -9.21583
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monastery+of+the+Hieronymites+and+Tower+of+Bel%C3%A9m+in+Lisbon+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-264-monastery-of-batalha",
      "name": "Monastery of Batalha",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The Monastery of the Dominicans of Batalha was built to commemorate the victory of the Portuguese over the Castilians at the battle of Aljubarrota in 1385. It was to be the Portuguese monarchy's main building project for the next two centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/264/"
      },
      "map": {
          "name": "Monastery of Batalha",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 39.65778,
              "lng": -8.82694
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monastery+of+Batalha+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-361-historic-centre-of-evora",
      "name": "Historic Centre of Évora",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "This museum-city, whose roots go back to Roman times, reached its golden age in the 15th century, when it became the residence of the Portuguese kings. Its unique quality stems from the whitewashed houses decorated with azulejos and wrought-iron balconies dating from the 16th to the 18th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/361/"
      },
      "map": {
          "name": "Historic Centre of Évora",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.57306,
              "lng": -7.90778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+%C3%89vora+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-505-monastery-of-alcobaca",
      "name": "Monastery of Alcobaça",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The Monastery of Santa Maria d'Alcobaça, north of Lisbon, was founded in the 12th century by King Alfonso I. Its size, the purity of its architectural style, the beauty of the materials and the care with which it was built make this a masterpiece of Cistercian Gothic art.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/505/"
      },
      "map": {
          "name": "Monastery of Alcobaça",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 39.55,
              "lng": -8.97667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monastery+of+Alcoba%C3%A7a+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-723-cultural-landscape-of-sintra",
      "name": "Cultural Landscape of Sintra",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "In the 19th century Sintra became the first centre of European Romantic architecture. Ferdinand II turned a ruined monastery into a castle where this new sensitivity was displayed in the use of Gothic, Egyptian, Moorish and Renaissance elements and in the creation of a park blending local and exotic species of trees.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/723/"
      },
      "map": {
          "name": "Cultural Landscape of Sintra",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.78333,
              "lng": -9.41667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cultural+Landscape+of+Sintra+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-755-historic-centre-of-oporto-luiz-i-bridge-and-monastery-of-serra-do-pilar",
      "name": "Historic Centre of Oporto, Luiz I Bridge and Monastery of Serra do Pilar",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The city of Oporto, built along the hillsides overlooking the mouth of the Douro river, is an outstanding urban landscape with a 2,000-year history. Its continuous growth, linked to the sea (the Romans gave it the name Portus, or port), can be seen in the many and varied monuments, from the cathedral with its Romanesque choir, to the neoclassical Stock.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/755/"
      },
      "map": {
          "name": "Historic Centre of Oporto, Luiz I Bridge and Monastery of Serra do Pilar",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 41.14166667,
              "lng": -8.616666667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Oporto%2C+Luiz+I+Bridge+and+Monastery+of+Serra+do+Pilar+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1031-historic-centre-of-guimaraes-and-couros-zone",
      "name": "Historic Centre of Guimarães and Couros Zone",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The historic town of Guimarães is associated with the emergence of the Portuguese national identity in the 12th century. An exceptionally well-preserved and authentic example of the evolution of a medieval settlement into a modern town, its building types show the development of Portuguese architecture from the 15th to 19th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1031/"
      },
      "map": {
          "name": "Historic Centre of Guimarães and Couros Zone",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 41.443,
              "lng": -8.292777778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Guimar%C3%A3es+and+Couros+Zone+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1046-alto-douro-wine-region",
      "name": "Alto Douro Wine Region",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO cultural landscape",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Wine has been produced by traditional landholders in the Alto Douro region for some 2,000 years. Since the 18th century, its main product, port wine, has been world famous for its quality.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1046/"
      },
      "map": {
          "name": "Alto Douro Wine Region",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 41.10166667,
              "lng": -7.798888889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Alto+Douro+Wine+Region+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1117-landscape-of-the-pico-island-vineyard-culture",
      "name": "Landscape of the Pico Island Vineyard Culture",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The 987-ha site on the volcanic island of Pico, the second largest in the Azores archipelago, consists of a remarkable pattern of spaced-out, long linear walls running inland from, and parallel to, the rocky shore.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1117/"
      },
      "map": {
          "name": "Landscape of the Pico Island Vineyard Culture",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.51344444,
              "lng": -28.54116667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Landscape+of+the+Pico+Island+Vineyard+Culture+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1367-garrison-border-town-of-elvas-and-its-fortifications",
      "name": "Garrison Border Town of Elvas and its Fortifications",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The site, extensively fortified from the 17 th to 19 th centuries, is the largest bulwarked dry-ditch system in the world. Within its walls, the town contains barracks and other military buildings as well as churches and monasteries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1367/"
      },
      "map": {
          "name": "Garrison Border Town of Elvas and its Fortifications",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.88061944,
              "lng": -7.163322222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Garrison+Border+Town+of+Elvas+and+its+Fortifications+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1387-university-of-coimbra-alta-and-sofia",
      "name": "University of Coimbra – Alta and Sofia",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO architectural heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "Situated on a hill overlooking the city, the University of Coimbra with its colleges grew and evolved over more than seven centuries within the old town. Notable university buildings include the 12 th century Cathedral of Santa Cruz and a number of 16 th century colleges, the Royal Palace of Alcáçova, which has housed the University since 1537, the Joanine.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1387/"
      },
      "map": {
          "name": "University of Coimbra – Alta and Sofia",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 40.20781111,
              "lng": -8.425775
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=University+of+Coimbra+%E2%80%93+Alta+and+Sofia+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1573-royal-building-of-mafra-palace-basilica-convent-cerco-garden-and-hunting",
      "name": "Royal Building of Mafra – Palace, Basilica, Convent, Cerco Garden and Hunting Park ( Tapada )",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO cultural landscape",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Located 30 km northwest of Lisbon, the property was conceived by King João V in 1711 as a tangible representation of his conception of the monarchy and the State.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1573/"
      },
      "map": {
          "name": "Royal Building of Mafra – Palace, Basilica, Convent, Cerco Garden and Hunting Park ( Tapada )",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 38.93716667,
              "lng": -9.325527778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Royal+Building+of+Mafra+%E2%80%93+Palace%2C+Basilica%2C+Convent%2C+Cerco+Garden+and+Hunting+Park+%28+Tapada+%29+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1590-sanctuary-of-bom-jesus-do-monte-in-braga",
      "name": "Sanctuary of Bom Jesus do Monte in Braga",
      "countries": [
          "Portugal"
      ],
      "area": "Portugal",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Located on the slopes of Mount Espinho, overlooking the city of Braga in the north of Portugal, this cultural landscape evokes Christian Jerusalem, recreating a sacred mount crowned with a church.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1590/"
      },
      "map": {
          "name": "Sanctuary of Bom Jesus do Monte in Braga",
          "formattedAddress": "Portugal",
          "location": {
              "lat": 41.55494444,
              "lng": -8.377027778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Sanctuary+of+Bom+Jesus+do+Monte+in+Braga+Portugal"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-596-villages-with-fortified-churches-in-transylvania",
      "name": "Villages with Fortified Churches in Transylvania",
      "countries": [
          "Romania"
      ],
      "area": "Romania",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "These Transylvanian villages with their fortified churches provide a vivid picture of the cultural landscape of southern Transylvania. The seven villages inscribed, founded by the Transylvanian Saxons, are characterized by a specific land-use system, settlement pattern and organization of the family farmstead that have been preserved since the late Middle.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/596/"
      },
      "map": {
          "name": "Villages with Fortified Churches in Transylvania",
          "formattedAddress": "Romania",
          "location": {
              "lat": 46.13583333,
              "lng": 24.77305556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Villages+with+Fortified+Churches+in+Transylvania+Romania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-597-monastery-of-horezu",
      "name": "Monastery of Horezu",
      "countries": [
          "Romania"
      ],
      "area": "Romania",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Founded in 1690 by Prince Constantine Brancovan, the monastery of Horezu, in Walachia, is a masterpiece of the 'Brancovan' style. It is known for its architectural purity and balance, the richness of its sculptural detail, the treatment of its religious compositions, its votive portraits and its painted decorative works.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/597/"
      },
      "map": {
          "name": "Monastery of Horezu",
          "formattedAddress": "Romania",
          "location": {
              "lat": 45.16972222,
              "lng": 24.00722222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monastery+of+Horezu+Romania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-598-churches-of-moldavia",
      "name": "Churches of Moldavia",
      "countries": [
          "Romania"
      ],
      "area": "Romania",
      "kind": "UNESCO religious heritage",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "These eight churches of northern Moldavia, built from the late 15th century to the late 16th century, their external walls covered in fresco paintings, are masterpieces inspired by Byzantine art.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/598/"
      },
      "map": {
          "name": "Churches of Moldavia",
          "formattedAddress": "Romania",
          "location": {
              "lat": 47.77833333,
              "lng": 25.71277778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Churches+of+Moldavia+Romania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-902-historic-centre-of-sighisoara",
      "name": "Historic Centre of Sighişoara",
      "countries": [
          "Romania"
      ],
      "area": "Romania",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded by German craftsmen and merchants known as the Saxons of Transylvania, Sighişoara is a fine example of a small, fortified medieval town which played an important strategic and commercial role on the fringes of central Europe for several centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/902/"
      },
      "map": {
          "name": "Historic Centre of Sighişoara",
          "formattedAddress": "Romania",
          "location": {
              "lat": 46.21777778,
              "lng": 24.79222222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Sighi%C5%9Foara+Romania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-904-wooden-churches-of-maramures",
      "name": "Wooden Churches of Maramureş",
      "countries": [
          "Romania"
      ],
      "area": "Romania",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "These eight churches are outstanding examples of a range of architectural solutions from different periods and areas. They show the variety of designs and craftsmanship adopted in these narrow, high, timber constructions with their characteristic tall, slim clock towers at the western end of the building, either single- or double-roofed and covered by.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/904/"
      },
      "map": {
          "name": "Wooden Churches of Maramureş",
          "formattedAddress": "Romania",
          "location": {
              "lat": 47.82083333,
              "lng": 24.05583333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wooden+Churches+of+Maramure%C5%9F+Romania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1552-rosia-montana-mining-landscape",
      "name": "Roșia Montană Mining Landscape",
      "countries": [
          "Romania"
      ],
      "area": "Romania",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Located in the Metalliferous range of the Apuseni Mountains in the west of Romania, Roșia Montană has the largest and most technically varied underground Roman gold mining complex known at the time of inscription.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1552/"
      },
      "map": {
          "name": "Roșia Montană Mining Landscape",
          "formattedAddress": "Romania",
          "location": {
              "lat": 46.30611111,
              "lng": 23.13055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Ro%C8%99ia+Montan%C4%83+Mining+Landscape+Romania"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1245-san-marino-historic-centre-and-mount-titano",
      "name": "San Marino Historic Centre and Mount Titano",
      "countries": [
          "San Marino"
      ],
      "area": "San Marino",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "San Marino Historic Centre and Mount Titano covers 55 ha, including Mount Titano and the historic centre of the city which dates back to the foundation of the republic as a city-state in the 13th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1245/"
      },
      "map": {
          "name": "San Marino Historic Centre and Mount Titano",
          "formattedAddress": "San Marino",
          "location": {
              "lat": 43.93277778,
              "lng": 12.45194444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=San+Marino+Historic+Centre+and+Mount+Titano+San+Marino"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-389-studenica-monastery",
      "name": "Studenica Monastery",
      "countries": [
          "Serbia"
      ],
      "area": "Serbia",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The Studenica Monastery was established in the late 12th century by Stevan Nemanja, founder of the medieval Serb state, shortly after his abdication. It is the largest and richest of Serbia’s Orthodox monasteries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/389/"
      },
      "map": {
          "name": "Studenica Monastery",
          "formattedAddress": "Serbia",
          "location": {
              "lat": 43.48652778,
              "lng": 20.53166667
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Studenica+Monastery+Serbia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1253-gamzigrad-romuliana-palace-of-galerius",
      "name": "Gamzigrad-Romuliana, Palace of Galerius",
      "countries": [
          "Serbia"
      ],
      "area": "Serbia",
      "kind": "UNESCO architectural heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "The Late Roman fortified palace compound and memorial complex of Gamzigrad-Romuliana, Palace of Galerius, in the east of Serbia, was commissioned by Emperor Caius Valerius Galerius Maximianus, in the late 3rd and early 4th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1253/"
      },
      "map": {
          "name": "Gamzigrad-Romuliana, Palace of Galerius",
          "formattedAddress": "Serbia",
          "location": {
              "lat": 43.89930556,
              "lng": 22.18611111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Gamzigrad-Romuliana%2C+Palace+of+Galerius+Serbia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-618-historic-town-of-banska-stiavnica-and-the-technical-monuments-in-its-vic",
      "name": "Historic Town of Banská Štiavnica and the Technical Monuments in its Vicinity",
      "countries": [
          "Slovakia"
      ],
      "area": "Slovakia",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Over the centuries, the town of Banská Štiavnica was visited by many outstanding engineers and scientists who contributed to its fame. The old medieval mining centre grew into a town with Renaissance palaces, 16th-century churches, elegant squares and castles.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/618/"
      },
      "map": {
          "name": "Historic Town of Banská Štiavnica and the Technical Monuments in its Vicinity",
          "formattedAddress": "Slovakia",
          "location": {
              "lat": 48.46111,
              "lng": 18.9
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Town+of+Bansk%C3%A1+%C5%A0tiavnica+and+the+Technical+Monuments+in+its+Vicinity+Slovakia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1273-wooden-churches-of-the-slovak-part-of-the-carpathian-mountain-area",
      "name": "Wooden Churches of the Slovak part of the Carpathian Mountain Area",
      "countries": [
          "Slovakia"
      ],
      "area": "Slovakia",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The Wooden Churches of the Slovak part of Carpathian Mountain Area inscribed on the World Heritage List consist of two Roman Catholic, three Protestant and three Greek Orthodox churches built between the 16th and 18th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1273/"
      },
      "map": {
          "name": "Wooden Churches of the Slovak part of the Carpathian Mountain Area",
          "formattedAddress": "Slovakia",
          "location": {
              "lat": 49.33611111,
              "lng": 19.55833333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Wooden+Churches+of+the+Slovak+part+of+the+Carpathian+Mountain+Area+Slovakia"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-311-old-town-of-segovia-and-its-aqueduct",
      "name": "Old Town of Segovia and its Aqueduct",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Roman aqueduct of Segovia, probably built c. A.D.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/311/"
      },
      "map": {
          "name": "Old Town of Segovia and its Aqueduct",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.94847222,
              "lng": -4.11675
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+Town+of+Segovia+and+its+Aqueduct+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-313-historic-centre-of-cordoba",
      "name": "Historic Centre of Cordoba",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Cordoba's period of greatest glory began in the 8th century after the Moorish conquest, when some 300 mosques and innumerable palaces and public buildings were built to rival the splendours of Constantinople, Damascus and Baghdad.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/313/"
      },
      "map": {
          "name": "Historic Centre of Cordoba",
          "formattedAddress": "Spain",
          "location": {
              "lat": 37.87919444,
              "lng": -4.779722222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Cordoba+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-316-burgos-cathedral",
      "name": "Burgos Cathedral",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Our Lady of Burgos was begun in the 13th century at the same time as the great cathedrals of the Ile-de-France and was completed in the 15th and 16th centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/316/"
      },
      "map": {
          "name": "Burgos Cathedral",
          "formattedAddress": "Spain",
          "location": {
              "lat": 42.34073333,
              "lng": -3.704011111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Burgos+Cathedral+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-318-monastery-and-site-of-the-escurial-madrid",
      "name": "Monastery and Site of the Escurial, Madrid",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Built at the end of the 16th century on a plan in the form of a grill, the instrument of the martyrdom of St Lawrence, the Escurial Monastery stands in an exceptionally beautiful site in Castile.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/318/"
      },
      "map": {
          "name": "Monastery and Site of the Escurial, Madrid",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.58911111,
              "lng": -4.14775
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Monastery+and+Site+of+the+Escurial%2C+Madrid+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-347-santiago-de-compostela-old-town",
      "name": "Santiago de Compostela (Old Town)",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "This famous pilgrimage site in north-west Spain became a symbol in the Spanish Christians' struggle against Islam. Destroyed by the Muslims at the end of the 10th century, it was completely rebuilt in the following century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/347/"
      },
      "map": {
          "name": "Santiago de Compostela (Old Town)",
          "formattedAddress": "Spain",
          "location": {
              "lat": 42.88076,
              "lng": -8.54468
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Santiago+de+Compostela+%28Old+Town%29+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-348-old-town-of-avila-with-its-extra-muros-churches",
      "name": "Old Town of Ávila with its Extra-Muros Churches",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded in the 11th century to protect the Spanish territories from the Moors, this 'City of Saints and Stones', the birthplace of St Teresa and the burial place of the Grand Inquisitor Torquemada, has kept its medieval austerity.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/348/"
      },
      "map": {
          "name": "Old Town of Ávila with its Extra-Muros Churches",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.65645,
              "lng": -4.70012
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+Town+of+%C3%81vila+with+its+Extra-Muros+Churches+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-378-mudejar-architecture-of-aragon",
      "name": "Mudejar Architecture of Aragon",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO architectural heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "The development in the 12th century of Mudejar art in Aragon resulted from the particular political, social and cultural conditions that prevailed in Spain after the Reconquista.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/378/"
      },
      "map": {
          "name": "Mudejar Architecture of Aragon",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.34389,
              "lng": -1.10722
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Mudejar+Architecture+of+Aragon+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-379-historic-city-of-toledo",
      "name": "Historic City of Toledo",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Successively a Roman municipium, the capital of the Visigothic Kingdom, a fortress of the Emirate of Cordoba, an outpost of the Christian kingdoms fighting the Moors and, in the 16th century, the temporary seat of supreme power under Charles V, Toledo is the repository of more than 2,000 years of history.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/379/"
      },
      "map": {
          "name": "Historic City of Toledo",
          "formattedAddress": "Spain",
          "location": {
              "lat": 39.85694444,
              "lng": -4.024444444
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+City+of+Toledo+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-381-old-city-of-salamanca",
      "name": "Old City of Salamanca",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "This ancient university town north-west of Madrid was first conquered by the Carthaginians in the 3rd century B.C. It then became a Roman settlement before being ruled by the Moors until the 11th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/381/"
      },
      "map": {
          "name": "Old City of Salamanca",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.96525,
              "lng": -5.6645
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+City+of+Salamanca+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-383-cathedral-alcazar-and-archivo-de-indias-in-seville",
      "name": "Cathedral, Alcázar and Archivo de Indias in Seville",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Together these three buildings form a monumental complex in central Seville. The cathedral and the Alcázar – dating from the Reconquest of 1248 to the 16th century and imbued with Moorish influences – are an exceptional testimony to the civilization of the Almohads as well as that of Christian Andalusia.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/383/"
      },
      "map": {
          "name": "Cathedral, Alcázar and Archivo de Indias in Seville",
          "formattedAddress": "Spain",
          "location": {
              "lat": 37.38384,
              "lng": -5.99155
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cathedral%2C+Alc%C3%A1zar+and+Archivo+de+Indias+in+Seville+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-384-old-town-of-caceres",
      "name": "Old Town of Cáceres",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The city's history of battles between Moors and Christians is reflected in its architecture, which is a blend of Roman, Islamic, Northern Gothic and Italian Renaissance styles.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/384/"
      },
      "map": {
          "name": "Old Town of Cáceres",
          "formattedAddress": "Spain",
          "location": {
              "lat": 39.47444,
              "lng": -6.37
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+Town+of+C%C3%A1ceres+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-518-poblet-monastery",
      "name": "Poblet Monastery",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "This Cistercian abbey in Catalonia is one of the largest in Spain. At its centre is a 12th-century church.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/518/"
      },
      "map": {
          "name": "Poblet Monastery",
          "formattedAddress": "Spain",
          "location": {
              "lat": 41.38083,
              "lng": 1.0825
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Poblet+Monastery+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-665-royal-monastery-of-santa-maria-de-guadalupe",
      "name": "Royal Monastery of Santa María de Guadalupe",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The monastery is an outstanding repository of four centuries of Spanish religious architecture. It is tied to two events from 1492: the Reconquest of the Iberian peninsula by the Catholic Kings and Christopher Columbus' arrival in the Americas.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/665/"
      },
      "map": {
          "name": "Royal Monastery of Santa María de Guadalupe",
          "formattedAddress": "Spain",
          "location": {
              "lat": 39.45285,
              "lng": -5.3275
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Royal+Monastery+of+Santa+Mar%C3%ADa+de+Guadalupe+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-781-historic-walled-town-of-cuenca",
      "name": "Historic Walled Town of Cuenca",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Built by the Moors in a defensive position at the heart of the Caliphate of Cordoba, Cuenca is an unusually well-preserved medieval fortified city. Conquered by the Castilians in the 12th century, it became a royal town and bishopric endowed with important buildings, such as Spain's first Gothic cathedral, and the famous casas colgadas (hanging houses).",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/781/"
      },
      "map": {
          "name": "Historic Walled Town of Cuenca",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.07662,
              "lng": -2.13174
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Walled+Town+of+Cuenca+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-805-san-millan-yuso-and-suso-monasteries",
      "name": "San Millán Yuso and Suso Monasteries",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
        },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The monastic community founded by St Millán in the mid-6th century became a place of pilgrimage. A fine Romanesque church built in honour of the holy man still stands at the site of Suso.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/805/"
      },
      "map": {
          "name": "San Millán Yuso and Suso Monasteries",
          "formattedAddress": "Spain",
          "location": {
              "lat": 42.32586,
              "lng": -2.86496
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=San+Mill%C3%A1n+Yuso+and+Suso+Monasteries+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-876-university-and-historic-precinct-of-alcala-de-henares",
      "name": "University and Historic Precinct of Alcalá de Henares",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded by Cardinal Jiménez de Cisneros in the early 16th century, Alcalá de Henares was the world's first planned university city. It was the original model for the Civitas Dei (City of God), the ideal urban community which Spanish missionaries brought to the Americas.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/876/"
      },
      "map": {
          "name": "University and Historic Precinct of Alcalá de Henares",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.48138889,
              "lng": -3.368055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=University+and+Historic+Precinct+of+Alcal%C3%A1+de+Henares+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-988-catalan-romanesque-churches-of-the-vall-de-boi",
      "name": "Catalan Romanesque Churches of the Vall de Boí",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The narrow Vall de Boí is situated in the high Pyrénées, in the Alta Ribagorça region and is surrounded by steep mountains. Each village in the valley contains a Romanesque church, and is surrounded by a pattern of enclosed fields.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/988/"
      },
      "map": {
          "name": "Catalan Romanesque Churches of the Vall de Boí",
          "formattedAddress": "Spain",
          "location": {
              "lat": 42.50472222,
              "lng": 0.803611111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Catalan+Romanesque+Churches+of+the+Vall+de+Bo%C3%AD+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1044-aranjuez-cultural-landscape",
      "name": "Aranjuez Cultural Landscape",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The Aranjuez cultural landscape is an entity of complex relationships: between nature and human activity, between sinuous watercourses and geometric landscape design, between the rural and the urban, between forest landscape and the delicately modulated architecture of its palatial buildings.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1044/"
      },
      "map": {
          "name": "Aranjuez Cultural Landscape",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.03645,
              "lng": -3.60934
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Aranjuez+Cultural+Landscape+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1217-vizcaya-bridge",
      "name": "Vizcaya Bridge",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "Vizcaya Bridge straddles the mouth of the Ibaizabal estuary, west of Bilbao. It was designed by the Basque architect Alberto de Palacio and completed in 1893.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1217/"
      },
      "map": {
          "name": "Vizcaya Bridge",
          "formattedAddress": "Spain",
          "location": {
              "lat": 43.323175,
              "lng": -3.016833333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Vizcaya+Bridge+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1371-cultural-landscape-of-the-serra-de-tramuntana",
      "name": "Cultural Landscape of the Serra de Tramuntana",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The Cultural Landscape of the Serra de Tramuntana located on a sheer-sided mountain range parallel to the north-western coast of the island of Mallorca. Millennia of agriculture in an environment with scarce resources has transformed the terrain and displays an articulated network of devices for the management of water revolving around farming units of.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1371/"
      },
      "map": {
          "name": "Cultural Landscape of the Serra de Tramuntana",
          "formattedAddress": "Spain",
          "location": {
              "lat": 39.73083333,
              "lng": 2.694722222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cultural+Landscape+of+the+Serra+de+Tramuntana+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
      {
      "id": "unesco-1618-paseo-del-prado-and-buen-retiro-a-landscape-of-arts-and-sciences",
      "name": "Paseo del Prado and Buen Retiro, a landscape of Arts and Sciences",
      "countries": [
          "Spain"
      ],
      "area": "Spain",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Located at the urban heart of Madrid, this cultural landscape evolved since the creation of the tree-lined Paseo del Prado avenue, a prototype of the Hispanic alameda, in the 16th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1618/"
      },
      "map": {
          "name": "Paseo del Prado and Buen Retiro, a landscape of Arts and Sciences",
          "formattedAddress": "Spain",
          "location": {
              "lat": 40.41533333,
              "lng": -3.687055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Paseo+del+Prado+and+Buen+Retiro%2C+a+landscape+of+Arts+and+Sciences+Spain"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
          {
      "id": "unesco-731-hanseatic-town-of-visby",
      "name": "Hanseatic Town of Visby",
      "countries": [
          "Sweden"
      ],
      "area": "Sweden",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "A former Viking site on the island of Gotland, Visby was the main centre of the Hanseatic League in the Baltic from the 12th to the 14th century. Its 13th-century ramparts and more than 200 warehouses and wealthy merchants' dwellings from the same period make it the best-preserved fortified commercial city in northern Europe.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/731/"
      },
      "map": {
          "name": "Hanseatic Town of Visby",
          "formattedAddress": "Sweden",
          "location": {
              "lat": 57.64167,
              "lng": 18.29583
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Hanseatic+Town+of+Visby+Sweden"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-762-church-town-of-gammelstad-lulea",
      "name": "Church Town of Gammelstad, Luleå",
      "countries": [
          "Sweden"
      ],
      "area": "Sweden",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Gammelstad, at the head of the Gulf of Bothnia, is the best-preserved example of a 'church village', a unique kind of village formerly found throughout northern Scandinavia.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/762/"
      },
      "map": {
          "name": "Church Town of Gammelstad, Luleå",
          "formattedAddress": "Sweden",
          "location": {
              "lat": 65.64611,
              "lng": 22.02861
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Church+Town+of+Gammelstad%2C+Lule%C3%A5+Sweden"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-871-naval-port-of-karlskrona",
      "name": "Naval Port of Karlskrona",
      "countries": [
          "Sweden"
      ],
      "area": "Sweden",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "Karlskrona is an outstanding example of a late-17th-century European planned naval city. The original plan and many of the buildings have survived intact, along with installations that illustrate its subsequent development up to the present day.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/871/"
      },
      "map": {
          "name": "Naval Port of Karlskrona",
          "formattedAddress": "Sweden",
          "location": {
              "lat": 56.16667,
              "lng": 15.58333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Naval+Port+of+Karlskrona+Sweden"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-968-agricultural-landscape-of-southern-oland",
      "name": "Agricultural Landscape of Southern Öland",
      "countries": [
          "Sweden"
      ],
      "area": "Sweden",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The southern part of the island of Öland in the Baltic Sea is dominated by a vast limestone plateau. Human beings have lived here for some five thousand years and adapted their way of life to the physical constraints of the island.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/968/"
      },
      "map": {
          "name": "Agricultural Landscape of Southern Öland",
          "formattedAddress": "Sweden",
          "location": {
              "lat": 56.325,
              "lng": 16.48333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Agricultural+Landscape+of+Southern+%C3%96land+Sweden"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-267-old-city-of-berne",
      "name": "Old City of Berne",
      "countries": [
          "Switzerland"
      ],
      "area": "Switzerland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded in the 12th century on a hill site surrounded by the Aare River, Berne developed over the centuries in line with a an exceptionally coherent planning concept.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/267/"
      },
      "map": {
          "name": "Old City of Berne",
          "formattedAddress": "Switzerland",
          "location": {
              "lat": 46.94806,
              "lng": 7.45028
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Old+City+of+Berne+Switzerland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-268-abbey-of-st-gall",
      "name": "Abbey of St Gall",
      "countries": [
          "Switzerland"
      ],
      "area": "Switzerland",
      "kind": "UNESCO religious heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "The Convent of St Gall, a perfect example of a great Carolingian monastery, was, from the 8th century to its secularization in 1805, one of the most important in Europe.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/268/"
      },
      "map": {
          "name": "Abbey of St Gall",
          "formattedAddress": "Switzerland",
          "location": {
              "lat": 47.42333,
              "lng": 9.37778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Abbey+of+St+Gall+Switzerland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-884-three-castles-defensive-wall-and-ramparts-of-the-market-town-of-bellinzo",
      "name": "Three Castles, Defensive Wall and Ramparts of the Market-Town of Bellinzona",
      "countries": [
          "Switzerland"
      ],
      "area": "Switzerland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Bellinzona site consists of a group of fortifications grouped around the castle of Castelgrande, which stands on a rocky peak looking out over the entire Ticino valley.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/884/"
      },
      "map": {
          "name": "Three Castles, Defensive Wall and Ramparts of the Market-Town of Bellinzona",
          "formattedAddress": "Switzerland",
          "location": {
              "lat": 46.19314,
              "lng": 9.02242
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Three+Castles%2C+Defensive+Wall+and+Ramparts+of+the+Market-Town+of+Bellinzona+Switzerland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1243-lavaux-vineyard-terraces",
      "name": "Lavaux, Vineyard Terraces",
      "countries": [
          "Switzerland"
      ],
      "area": "Switzerland",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The Lavaux Vineyard Terraces, stretching for about 30 km along the south-facing northern shores of Lake Geneva from the Chateau de Chillon to the eastern outskirts of Lausanne in the Vaud region, cover the lower slopes of the mountainside between the villages and the lake.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1243/"
      },
      "map": {
          "name": "Lavaux, Vineyard Terraces",
          "formattedAddress": "Switzerland",
          "location": {
              "lat": 46.49194444,
              "lng": 6.746111111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Lavaux%2C+Vineyard+Terraces+Switzerland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-527-kyiv-saint-sophia-cathedral-and-related-monastic-buildings-kyiv-pechersk",
      "name": "Kyiv: Saint-Sophia Cathedral and Related Monastic Buildings, Kyiv-Pechersk Lavra",
      "countries": [
          "Ukraine"
      ],
      "area": "Ukraine",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Designed to rival Hagia Sophia in Constantinople, Kyiv's Saint-Sophia Cathedral was designed as a 'new Constantinople', capital of the Christian principality of Kyiv, which was created in the 11th century in a region evangelized after the baptism of St Vladimir in 988.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/527/"
      },
      "map": {
          "name": "Kyiv: Saint-Sophia Cathedral and Related Monastic Buildings, Kyiv-Pechersk Lavra",
          "formattedAddress": "Ukraine",
          "location": {
              "lat": 50.45258,
              "lng": 30.51686
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Kyiv%3A+Saint-Sophia+Cathedral+and+Related+Monastic+Buildings%2C+Kyiv-Pechersk+Lavra+Ukraine"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-865-l-viv-the-ensemble-of-the-historic-centre",
      "name": "L'viv – the Ensemble of the Historic Centre",
      "countries": [
          "Ukraine"
      ],
      "area": "Ukraine",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The city of L''viv, founded in the late Middle Ages, was a flourishing administrative, religious and commercial centre for several centuries. The medieval urban topography has been preserved virtually intact (in particular, there is evidence of the different ethnic communities who lived there), along with many fine Baroque and later buildings.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/865/"
      },
      "map": {
          "name": "L'viv – the Ensemble of the Historic Centre",
          "formattedAddress": "Ukraine",
          "location": {
              "lat": 49.84163,
              "lng": 24.03198
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=L%27viv+%E2%80%93+the+Ensemble+of+the+Historic+Centre+Ukraine"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1330-residence-of-bukovinian-and-dalmatian-metropolitans",
      "name": "Residence of Bukovinian and Dalmatian Metropolitans",
      "countries": [
          "Ukraine"
      ],
      "area": "Ukraine",
      "kind": "UNESCO architectural heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "The Residence of Bukovinian and Dalmatian Metropolitans mixes architectural styles in a complex built by Czech architect Josef Hlavka from 1864 to 1882.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1330/"
      },
      "map": {
          "name": "Residence of Bukovinian and Dalmatian Metropolitans",
          "formattedAddress": "Ukraine",
          "location": {
              "lat": 48.29666667,
              "lng": 25.92472222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Residence+of+Bukovinian+and+Dalmatian+Metropolitans+Ukraine"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1703-the-historic-centre-of-odesa",
      "name": "The Historic Centre of Odesa",
      "countries": [
          "Ukraine"
      ],
      "area": "Ukraine",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "The Historic Center of Odesa, part of the Black Sea port city developed on the site of Khadzhybei, is a densely built-up area, planned according to classicism canons, characterized by two- to four-storey buildings and wide perpendicular streets lined with trees.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1703/"
      },
      "map": {
          "name": "The Historic Centre of Odesa",
          "formattedAddress": "Ukraine",
          "location": {
              "lat": 46.48645,
              "lng": 30.74161389
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Historic+Centre+of+Odesa+Ukraine"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-370-durham-castle-and-cathedral",
      "name": "Durham Castle and Cathedral",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Durham Cathedral was built in the late 11th and early 12th centuries to house the relics of St Cuthbert (evangelizer of Northumbria) and the Venerable Bede. It attests to the importance of the early Benedictine monastic community and is the largest and finest example of Norman architecture in England.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/370/"
      },
      "map": {
          "name": "Durham Castle and Cathedral",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 54.77472222,
              "lng": -1.576111111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Durham+Castle+and+Cathedral+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-425-blenheim-palace",
      "name": "Blenheim Palace",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO architectural heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed architectural heritage with preserved cultural fabric",
      "why": "Blenheim Palace, near Oxford, stands in a romantic park created by the famous landscape gardener 'Capability' Brown. It was presented by the English nation to John Churchill, first Duke of Marlborough, in recognition of his victory in 1704 over French and Bavarian troops.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/425/"
      },
      "map": {
          "name": "Blenheim Palace",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 51.84194444,
              "lng": -1.361388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Blenheim+Palace+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 1,
          "costUsd": 100,
          "note": "Assumes travel from London: rail/bus or car to Oxford/Woodstock, palace ticket, meals and local transit."
      }
  },
  {
      "id": "unesco-426-palace-of-westminster-and-westminster-abbey-including-saint-margarets-ch",
      "name": "Palace of Westminster and Westminster Abbey including Saint Margaret’s Church",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Westminster Palace, rebuilt from the year 1840 on the site of important medieval remains, is a fine example of neo-Gothic architecture. The site – which also comprises the small medieval Church of Saint Margaret, built in Perpendicular Gothic style, and Westminster Abbey, where all the sovereigns since the 11th century have been crowned – is of great.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/426/"
      },
      "map": {
          "name": "Palace of Westminster and Westminster Abbey including Saint Margaret’s Church",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 51.499,
              "lng": -0.127
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Palace+of+Westminster+and+Westminster+Abbey+including+Saint+Margaret%E2%80%99s+Church+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 1,
          "costUsd": 50,
          "note": "Assumes travel from London: local Tube/bus access, Westminster Abbey ticket if visiting inside, meals and timing around security/opening hours."
      }
  },
  {
      "id": "unesco-428-city-of-bath",
      "name": "City of Bath",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded by the Romans as a thermal spa, Bath became an important centre of the wool industry in the Middle Ages. In the 18th century, under George III, it developed into an elegant town with neoclassical Palladian buildings, which blend harmoniously with the Roman baths.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/428/"
      },
      "map": {
          "name": "City of Bath",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 51.38130556,
              "lng": -2.359055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=City+of+Bath+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-496-canterbury-cathedral-st-augustine-s-abbey-and-st-martin-s-church",
      "name": "Canterbury Cathedral, St Augustine's Abbey, and St Martin's Church",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO religious heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 7,
          "easeOfAccess": 7,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed religious heritage with preserved cultural fabric",
      "why": "Canterbury, in Kent, has been the seat of the spiritual head of the Church of England for nearly five centuries. Canterbury's other important monuments are the modest Church of St Martin, the oldest church in England; the ruins of the Abbey of St Augustine, evidence of Augustine's evangelizing role in the Heptarchy from 597; and Christ Church Cathedral, a.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/496/"
      },
      "map": {
          "name": "Canterbury Cathedral, St Augustine's Abbey, and St Martin's Church",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 51.28,
              "lng": 1.083333333
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Canterbury+Cathedral%2C+St+Augustine%27s+Abbey%2C+and+St+Martin%27s+Church+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-984-blaenavon-industrial-landscape",
      "name": "Blaenavon Industrial Landscape",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The area around Blaenavon is evidence of the pre-eminence of South Wales as the world's major producer of iron and coal in the 19th century. All the necessary elements can still be seen - coal and ore mines, quarries, a primitive railway system, furnaces, workers' homes, and the social infrastructure of their community.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/984/"
      },
      "map": {
          "name": "Blaenavon Industrial Landscape",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 51.77638889,
              "lng": -3.088055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Blaenavon+Industrial+Landscape+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1030-derwent-valley-mills",
      "name": "Derwent Valley Mills",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO industrial heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "The Derwent Valley in central England contains a series of 18th- and 19th- century cotton mills and an industrial landscape of high historical and technological interest.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1030/"
      },
      "map": {
          "name": "Derwent Valley Mills",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 53.02888889,
              "lng": -1.488055556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Derwent+Valley+Mills+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1084-royal-botanic-gardens-kew",
      "name": "Royal Botanic Gardens, Kew",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO cultural landscape",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
        },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "This historic landscape garden has elements from several periods of garden design from the 18th to the 20th centuries. The gardens house botanic collections (conserved plants, living plants and documents) that have been considerably enriched through the centuries.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1084/"
      },
      "map": {
          "name": "Royal Botanic Gardens, Kew",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 51.48194444,
              "lng": -0.294027778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Royal+Botanic+Gardens%2C+Kew+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 1,
          "costUsd": 45,
          "note": "Assumes travel from London: Tube/rail to Kew, garden ticket, meals and local transit."
      }
  },
  {
      "id": "unesco-1215-cornwall-and-west-devon-mining-landscape",
      "name": "Cornwall and West Devon Mining Landscape",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 6,
          "easeOfAccess": 7,
          "lowTouristCrowds": 6
        },
      "uniqueness": "UNESCO-listed fortification with preserved cultural fabric",
      "why": "Much of the landscape of Cornwall and West Devon was transformed in the 18th and early 19th centuries as a result of the rapid growth of pioneering copper and tin mining.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1215/"
      },
      "map": {
          "name": "Cornwall and West Devon Mining Landscape",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 50.13611111,
              "lng": -5.383611111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Cornwall+and+West+Devon+Mining+Landscape+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1303-pontcysyllte-aqueduct-and-canal",
      "name": "Pontcysyllte Aqueduct and Canal",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO industrial heritage",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed industrial heritage with preserved cultural fabric",
      "why": "Situated in north-eastern Wales, the 18 kilometre long Pontcysyllte Aqueduct and Canal is a feat of civil engineering of the Industrial Revolution, completed in the early years of the 19th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1303/"
      },
      "map": {
          "name": "Pontcysyllte Aqueduct and Canal",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 52.97027778,
              "lng": -3.087777778
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Pontcysyllte+Aqueduct+and+Canal+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1485-the-forth-bridge",
      "name": "The Forth Bridge",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO industrial heritage",
      "access": "Visitor-site access; check hours",
      "scores": {
          "globallyUnique": 8,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
        },
      "uniqueness": "UNESCO-listed fortification with preserved cultural fabric",
      "why": "This railway bridge, crossing the Forth estuary in Scotland, had the world’s longest spans ( 541 m ) when i t opened in 1890 . It remains one of the greatest cantilever trussed bridges and continues to carry passengers and freight.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1485/"
      },
      "map": {
          "name": "The Forth Bridge",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 56.00111111,
              "lng": -3.388888889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Forth+Bridge+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1594-jodrell-bank-observatory",
      "name": "Jodrell Bank Observatory",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO cultural heritage",
      "access": "UNESCO site access; check local rules",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural heritage with preserved cultural fabric",
      "why": "Located in a rural area of northwest England, free from radio interference, Jodrell Bank is one of the world's leading radio astronomy observatories. At the beginning of its use, in 1945, the property housed research on cosmic rays detected by radar echoes.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1594/"
      },
      "map": {
          "name": "Jodrell Bank Observatory",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 53.23391667,
              "lng": -2.303861111
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Jodrell+Bank+Observatory+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1633-the-slate-landscape-of-northwest-wales",
      "name": "The Slate Landscape of Northwest Wales",
      "countries": [
          "UK"
      ],
      "area": "United Kingdom of Great Britain and Northern Ireland",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The Slate Landscape of Northwest Wales illustrates the transformation that industrial slate quarrying and mining brought about in the traditional rural environment of the mountains and valleys of the Snowdon massif.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1633/"
      },
      "map": {
          "name": "The Slate Landscape of Northwest Wales",
          "formattedAddress": "United Kingdom of Great Britain and Northern Ireland",
          "location": {
              "lat": 53.12083333,
              "lng": -4.115
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=The+Slate+Landscape+of+Northwest+Wales+United+Kingdom+of+Great+Britain+and+Northern+Ireland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-772-ferto-neusiedlersee-cultural-landscape",
      "name": "Fertö / Neusiedlersee Cultural Landscape",
      "countries": [
          "Austria",
          "Hungary"
      ],
      "area": "Austria / Hungary",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 10,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "The Fertö/Neusiedler Lake area has been the meeting place of different cultures for eight millennia. This is graphically demonstrated by its varied landscape, the result of an evolutionary symbiosis between human activity and the physical environment.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/772/"
      },
      "map": {
          "name": "Fertö / Neusiedlersee Cultural Landscape",
          "formattedAddress": "Austria / Hungary",
          "location": {
              "lat": 47.71927778,
              "lng": 16.72272222
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Fert%C3%B6+%2F+Neusiedlersee+Cultural+Landscape+Austria+%2F+Hungary"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
      {
      "id": "unesco-91-historic-centre-of-rome-the-properties-of-the-holy-see-in-that-city-enjo",
      "name": "Historic Centre of Rome, the Properties of the Holy See in that City Enjoying Extraterritorial Rights and San Paolo Fuori le Mura",
      "countries": [
          "Holy See",
          "Italy"
      ],
      "area": "Holy See / Italy",
      "kind": "UNESCO historic place",
      "access": "Walkable historic-area access",
      "scores": {
          "globallyUnique": 7,
          "laymenInterest": 7,
          "easeOfAccess": 10,
          "lowTouristCrowds": 4
      },
      "uniqueness": "UNESCO-listed historic place with preserved cultural fabric",
      "why": "Founded, according to legend, by Romulus and Remus in 753 BC, Rome was first the centre of the Roman Republic, then of the Roman Empire, and it became the capital of the Christian world in the 4th century.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/91/"
      },
      "map": {
          "name": "Historic Centre of Rome, the Properties of the Holy See in that City Enjoying Extraterritorial Rights and San Paolo Fuori le Mura",
          "formattedAddress": "Holy See / Italy",
          "location": {
              "lat": 41.89022222,
              "lng": 12.49230556
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Historic+Centre+of+Rome%2C+the+Properties+of+the+Holy+See+in+that+City+Enjoying+Extraterritorial+Rights+and+San+Paolo+Fuori+le+Mura+Holy+See+%2F+Italy"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  },
  {
      "id": "unesco-1276-rhaetian-railway-in-the-albula-bernina-landscapes",
      "name": "Rhaetian Railway in the Albula / Bernina Landscapes",
      "countries": [
          "Italy",
          "Switzerland"
      ],
      "area": "Italy / Switzerland",
      "kind": "UNESCO cultural landscape",
      "access": "Regional route or landscape access",
      "scores": {
          "globallyUnique": 6,
          "laymenInterest": 6,
          "easeOfAccess": 6,
          "lowTouristCrowds": 6
      },
      "uniqueness": "UNESCO-listed cultural landscape with preserved cultural fabric",
      "why": "Rhaetian Railway in the Albula / Bernina Landscapes, brings together two historic railway lines that cross the Swiss Alps through two passes. Opened in 1904, the Albula line in the north western part of the property is 67 km long.",
      "realityCheck": "UNESCO status does not make it effortless: check opening hours, restoration closures, crowd patterns and local access rules before building a trip around it.",
      "source": {
          "label": "UNESCO World Heritage Centre",
          "url": "https://whc.unesco.org/en/list/1276/"
      },
      "map": {
          "name": "Rhaetian Railway in the Albula / Bernina Landscapes",
          "formattedAddress": "Italy / Switzerland",
          "location": {
              "lat": 46.49833333,
              "lng": 9.846388889
          },
          "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Rhaetian+Railway+in+the+Albula+%2F+Bernina+Landscapes+Italy+%2F+Switzerland"
      },
      "trip": {
          "days": 4,
          "costUsd": 600,
          "note": "Assumes travel from London: economy flights or regional rail/road links where needed, midrange lodging, meals, local transfers, entrance fees and a practical buffer for UNESCO-site access."
      }
  }] satisfies TravelSpot[];
