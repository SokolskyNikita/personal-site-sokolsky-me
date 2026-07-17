/**
 * Quiz data for "Which cishet male archetypes are you?"
 * Scoring: each answer boosts section clusters, explicit term matches, and a
 * small lexical overlap signal between the answer and each label/gloss.
 * Every question offers six poles that together span the full archetype list.
 */
import raw from "./cishet-male-archetypes.json";

export type Archetype = {
  id: number;
  terms: string;
  gloss: string;
  sectionId: string;
  sectionTitle: string;
  subsectionId: string | null;
  subsectionTitle: string | null;
};

type EntryItem = { kind: "entry"; terms: string | null; gloss: string };
type AsideItem = { kind: "aside"; text: string };
type Item = EntryItem | AsideItem;
type Subsection = {
  id: string;
  title: string;
  note: string | null;
  items: Item[];
};
type Section = {
  id: string;
  title: string;
  note: string | null;
  items: Item[];
  subsections: Subsection[];
};

const sections = (raw as { sections: Section[] }).sections;

export const ARCHETYPES: Archetype[] = (() => {
  const out: Archetype[] = [];
  let id = 0;
  for (const section of sections) {
    for (const item of section.items) {
      if (item.kind !== "entry" || !item.terms) continue;
      out.push({
        id: id++,
        terms: item.terms,
        gloss: item.gloss,
        sectionId: section.id,
        sectionTitle: section.title,
        subsectionId: null,
        subsectionTitle: null,
      });
    }
    for (const sub of section.subsections ?? []) {
      for (const item of sub.items) {
        if (item.kind !== "entry" || !item.terms) continue;
        out.push({
          id: id++,
          terms: item.terms,
          gloss: item.gloss,
          sectionId: section.id,
          sectionTitle: section.title,
          subsectionId: sub.id,
          subsectionTitle: sub.title,
        });
      }
    }
  }
  return out;
})();

export const SECTION_IDS = sections.map((s) => s.id);

/** Six poles that, together, touch every section in the field guide. */
const POLES = {
  /** Normie / regional / social default */
  default: {
    "normie-default-guys": 3,
    "regional-english-language-types": 2,
    "music-and-nightlife-men": 1,
    "dating-app-personas-and-behaviors": 1,
    "male-hierarchy-and-status-memes": 1,
  },
  /** Domestic / dad / household hobbies */
  domestic: {
    "life-stage-and-domestic-men": 3,
    "dad-daddy": 3,
    "food-drink-and-domestic-hobby-men": 2,
    "regional-english-language-types": 1,
    "internet-boyfriend-zoology": 1,
  },
  /** Sports / fitness / gear / body protocols */
  body: {
    "sports-fitness-and-gear-men": 3,
    "wellness-longevity-and-optimization-men": 2,
    "looksmaxxing-and-the-psl-extended-universe": 1,
    "normie-default-guys": 1,
    "psychonauts-and-consciousness-explorers": 1,
  },
  /** Money / career / tech / ideology-of-work */
  capital: {
    "professional-and-money-men": 3,
    "tech-ai-and-futurist-men": 2,
    "political-and-ideological-men": 1,
    "think-boys-and-intellectual-capital-men": 1,
    "wellness-longevity-and-optimization-men": 1,
  },
  /** Soft / aesthetic / romance-coded / female-gaze */
  soft: {
    "emotional-soft-boys": 3,
    "internet-boyfriend-zoology": 2,
    "female-gaze-and-fandom-men": 2,
    "fashion-and-aesthetic-men": 2,
    "music-and-nightlife-men": 1,
  },
  /** Terminally online / hierarchy / manosphere / niche internet */
  online: {
    "wojaks-and-terminally-online-men": 3,
    "male-hierarchy-and-status-memes": 2,
    "manosphere-factions-and-masculinity-entrepreneurs": 2,
    "looksmaxxing-and-the-psl-extended-universe": 2,
    "gaming-and-fandom-men": 2,
    "think-boys-and-intellectual-capital-men": 1,
    "dating-app-personas-and-behaviors": 1,
    "political-and-ideological-men": 1,
    "autists-special-interest-men": 1,
    "psychonauts-and-consciousness-explorers": 1,
  },
} as const;

type SectionWeights = Record<string, number>;
type Boost = { match: string; w: number };

const sectionBaselineMax = new Map<string, number>();
for (const weights of Object.values(POLES)) {
  for (const [sectionId, weight] of Object.entries(weights)) {
    sectionBaselineMax.set(
      sectionId,
      Math.max(sectionBaselineMax.get(sectionId) ?? 0, weight),
    );
  }
}

const LEXICAL_STOP_WORDS = new Set(
  "about after again against almost also always among around because before being between both could default does doing down during each enough every first from further have having here honestly into just maybe more most much myself next only other over same should some still such than that their them then there these they this those through under until very what when where which while with would your youre guy guys male man mostly energy mode thing stuff vibe vibes looks like".split(
    " ",
  ),
);

function lexicalTokens(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 4 && !LEXICAL_STOP_WORDS.has(token))
      .map((token) => token.replace(/(ies|ing|ers|er|ed|s)$/, "")),
  );
}

const optionTokenCache = new WeakMap<QuizOption, Set<string>>();
const archetypeTokenCache = new Map<number, Set<string>>();

function lexicalWeight(option: QuizOption, archetype: Archetype): number {
  let optionTokens = optionTokenCache.get(option);
  if (!optionTokens) {
    optionTokens = lexicalTokens(option.t);
    optionTokenCache.set(option, optionTokens);
  }

  let archetypeTokens = archetypeTokenCache.get(archetype.id);
  if (!archetypeTokens) {
    archetypeTokens = lexicalTokens(`${archetype.terms} ${archetype.gloss}`);
    archetypeTokenCache.set(archetype.id, archetypeTokens);
  }

  let overlaps = 0;
  for (const token of optionTokens) {
    if (token.length >= 3 && archetypeTokens.has(token)) overlaps += 1;
  }
  return Math.min(2.4, overlaps * 0.6);
}

export type QuizOption = {
  t: string;
  sections: SectionWeights;
  boosts?: Boost[];
  skip?: true;
};

export type QuizQuestion = {
  topic: string;
  q: string;
  opts: QuizOption[];
};

function pole(
  key: keyof typeof POLES,
  extras: SectionWeights = {},
  boosts: Boost[] = [],
): Pick<QuizOption, "sections" | "boosts"> {
  const sections: SectionWeights = {};
  for (const [sectionId, weight] of Object.entries(POLES[key])) {
    const max = sectionBaselineMax.get(sectionId) ?? weight;
    sections[sectionId] = (weight * 3) / max;
  }
  for (const [id, w] of Object.entries(extras)) {
    sections[id] = (sections[id] ?? 0) + w;
  }
  return boosts.length ? { sections, boosts } : { sections };
}

function opt(
  t: string,
  key: keyof typeof POLES,
  extras: SectionWeights = {},
  boosts: Boost[] = [],
): QuizOption {
  return { t, ...pole(key, extras, boosts) };
}

function mappedOpt(
  t: string,
  sections: SectionWeights,
  boosts: Boost[] = [],
): QuizOption {
  return boosts.length ? { t, sections, boosts } : { t, sections };
}

/**
 * The six recurring poles make the quiz scorable, but they leave ordinary
 * middle cases out. These options cover the common gaps without making every
 * question a wall of near-duplicates. Their section weights are deliberately
 * narrow: choosing "quiet night alone" should not also imply fashion, dating
 * and fandom just because it sits near the soft pole.
 */
const SUPPLEMENTAL_OPTIONS: Record<string, QuizOption[]> = {
  Saturday: [
    mappedOpt(
      "Coursework, a shift or errands first. I relax once the week is under control.",
      {
        "professional-and-money-men": 2,
        "normie-default-guys": 2,
      },
      [
        { match: "Corporate drone", w: 1 },
        { match: "Green-flag", w: 1 },
      ],
    ),
    mappedOpt(
      "Coffee, errands and seeing whoever is around. Nothing becomes a project.",
      {
        "normie-default-guys": 3,
        "regional-english-language-types": 1,
      },
      [
        { match: "Chill guy", w: 2 },
        { match: "High-tier normie", w: 1 },
      ],
    ),
    mappedOpt(
      "Outside, if the weather cooperates: a hike, fishing, surfing or a long drive.",
      {
        "sports-fitness-and-gear-men": 3,
        "regional-english-language-types": 2,
      },
      [
        { match: "Surf bro", w: 2 },
        { match: "Country boy", w: 1 },
        { match: "Car guy", w: 1 },
      ],
    ),
  ],
  "Friday night": [
    mappedOpt(
      "Recovering from class or work with takeout, a show and maybe a roommate or friend.",
      {
        "normie-default-guys": 3,
        "life-stage-and-domestic-men": 1,
      },
      [
        { match: "Chill guy", w: 2 },
        { match: "High-tier normie", w: 1 },
      ],
    ),
    mappedOpt(
      "A quiet night alone. I cook, read or watch something and go to bed early.",
      {
        "food-drink-and-domestic-hobby-men": 2,
        "think-boys-and-intellectual-capital-men": 1,
        "normie-default-guys": 1,
      },
    ),
    mappedOpt(
      "Live music, dancing or a crowded bar. I want some noise.",
      { "music-and-nightlife-men": 4 },
      [
        { match: "Raver", w: 2 },
        { match: "Boiler Room", w: 1 },
        { match: "Metalhead", w: 1 },
      ],
    ),
  ],
  Body: [
    mappedOpt(
      "I move because I like a sport or being outside. I do not track it.",
      { "sports-fitness-and-gear-men": 4 },
      [
        { match: "Skater", w: 1 },
        { match: "Surf bro", w: 1 },
        { match: "Functional-fitness", w: 1 },
      ],
    ),
    mappedOpt(
      "Complicated. Pain, illness or body image takes up more room than I would like.",
      {
        "emotional-soft-boys": 3,
        "wellness-longevity-and-optimization-men": 1,
      },
    ),
  ],
  Money: [
    mappedOpt(
      "Tuition, debt, rent and savings come first. I am still trying to get established.",
      {
        "professional-and-money-men": 3,
        "normie-default-guys": 2,
      },
      [
        { match: "Corporate drone", w: 1 },
        { match: "Boglehead", w: 1 },
      ],
    ),
    mappedOpt(
      "Automate the savings, buy boring funds and stop checking.",
      {
        "professional-and-money-men": 4,
        "life-stage-and-domestic-men": 1,
      },
      [
        { match: "Boglehead", w: 3 },
        { match: "FIRE", w: 1 },
      ],
    ),
    mappedOpt(
      "It makes me anxious, so I put off looking until I have to.",
      {
        "emotional-soft-boys": 2,
        "normie-default-guys": 2,
      },
    ),
  ],
  Dating: [
    mappedOpt(
      "I have little experience, use apps only occasionally or do not have a repeated pattern yet.",
      {
        "dating-app-personas-and-behaviors": 2,
        "normie-default-guys": 3,
      },
      [
        { match: "Chill guy", w: 1 },
        { match: "Green-flag", w: 1 },
      ],
    ),
    mappedOpt(
      "I am married or in a long-term relationship. Apps are not part of my life.",
      {
        "life-stage-and-domestic-men": 3,
        "dating-app-personas-and-behaviors": 1,
        "female-gaze-and-fandom-men": 1,
      },
      [
        { match: "Wife guy", w: 2 },
        { match: "Serial monogamist", w: 1 },
      ],
    ),
    mappedOpt(
      "I text a lot, get attached quickly and start imagining a relationship early.",
      {
        "dating-app-personas-and-behaviors": 3,
        "emotional-soft-boys": 2,
      },
      [
        { match: "Good-morning texter", w: 2 },
        { match: "Anxious king", w: 2 },
      ],
    ),
    mappedOpt(
      "I keep several conversations alive and decide late whom I actually want to see.",
      { "dating-app-personas-and-behaviors": 4 },
      [
        { match: "Roster guy", w: 3 },
        { match: "Bencher", w: 2 },
        { match: "Breadcrumber", w: 1 },
      ],
    ),
  ],
  Conflict: [
    mappedOpt(
      "I go quiet and need space before I can say anything useful.",
      {
        "emotional-soft-boys": 3,
        "dating-app-personas-and-behaviors": 1,
      },
      [{ match: "Avoidant king", w: 3 }],
    ),
    mappedOpt(
      "I defend what I meant first. The apology may arrive after the argument.",
      {
        "normie-default-guys": 2,
        "dating-app-personas-and-behaviors": 2,
      },
      [{ match: "Devil's-advocate date", w: 2 }],
    ),
  ],
  Feed: [
    mappedOpt(
      "Friends, humor, school or career posts, and whatever the algorithm serves me.",
      {
        "normie-default-guys": 3,
        "professional-and-money-men": 1,
      },
      [{ match: "High-tier normie", w: 2 }],
    ),
    mappedOpt(
      "News and politics, including people arguing about both.",
      {
        "political-and-ideological-men": 4,
        "wojaks-and-terminally-online-men": 1,
      },
    ),
    mappedOpt(
      "I barely have a feed. Messages and links from friends are enough.",
      { "normie-default-guys": 4 },
      [{ match: "30-Year-Old Boomer", w: 1 }],
    ),
  ],
  Clothes: [
    mappedOpt(
      "Practical clothes for class, a shift, errands or a long day on my feet.",
      {
        "normie-default-guys": 3,
        "professional-and-money-men": 1,
      },
      [
        { match: "High-tier normie", w: 1 },
        { match: "Clean boy", w: 1 },
      ],
    ),
    mappedOpt(
      "Jeans, T-shirt, hoodie. It is basically the same rotation every week.",
      { "normie-default-guys": 4 },
    ),
    mappedOpt(
      "Workwear, good denim or boots that I have opinions about.",
      {
        "fashion-and-aesthetic-men": 4,
        "food-drink-and-domestic-hobby-men": 1,
      },
      [
        { match: "Workwear guy", w: 3 },
        { match: "Selvedge-denim guy", w: 3 },
        { match: "Heritage-menswear guy", w: 2 },
      ],
    ),
  ],
  Mind: [
    mappedOpt(
      "History, politics or religion. I want to know how people ended up believing this.",
      {
        "think-boys-and-intellectual-capital-men": 3,
        "political-and-ideological-men": 2,
      },
      [
        { match: "History buff", w: 2 },
        { match: "Roman-Empire", w: 1 },
      ],
    ),
    mappedOpt(
      "One practical hobby at a time. I learn enough to make or repair the thing.",
      {
        "food-drink-and-domestic-hobby-men": 3,
        "autists-special-interest-men": 2,
      },
      [{ match: "YouTube-research dad", w: 1 }],
    ),
  ],
  Politics: [
    mappedOpt(
      "Conventional center-left politics. Elections and public services matter more than posting.",
      { "political-and-ideological-men": 4 },
      [
        { match: "Brunch liberal", w: 2 },
        { match: "Resistance lib", w: 1 },
      ],
    ),
    mappedOpt(
      "Conventional center-right politics. Taxes, public order and local control.",
      { "political-and-ideological-men": 4 },
      [
        { match: "Barstool conservative", w: 1 },
        { match: "Localist", w: 2 },
      ],
    ),
    mappedOpt(
      "One issue has most of my attention. The usual left-right package does not fit.",
      {
        "political-and-ideological-men": 3,
        "think-boys-and-intellectual-capital-men": 1,
      },
      [{ match: "Heterodox guy", w: 2 }],
    ),
  ],
  Work: [
    mappedOpt(
      "I am still studying, training or starting out. I want useful work, stability and room to grow.",
      {
        "professional-and-money-men": 3,
        "think-boys-and-intellectual-capital-men": 1,
        "normie-default-guys": 1,
      },
      [
        { match: "Corporate drone", w: 2 },
        { match: "Green-flag", w: 1 },
      ],
    ),
    mappedOpt(
      "Teaching, care or public service. The useful part is working with people.",
      {
        "professional-and-money-men": 2,
        "emotional-soft-boys": 2,
      },
    ),
    mappedOpt(
      "I do what the job requires and protect the rest of my time.",
      {
        "professional-and-money-men": 2,
        "normie-default-guys": 3,
      },
      [
        { match: "Email-job", w: 2 },
        { match: "Corporate drone", w: 1 },
      ],
    ),
  ],
  Friends: [
    mappedOpt(
      "We study, run errands, eat at home or hang out between other commitments.",
      {
        "normie-default-guys": 3,
        "emotional-soft-boys": 1,
      },
      [
        { match: "High-tier normie", w: 1 },
        { match: "Green-flag", w: 1 },
      ],
    ),
    mappedOpt(
      "One or two close friends. We can talk honestly without turning it into a group event.",
      { "emotional-soft-boys": 4 },
      [{ match: "Green-flag", w: 1 }],
    ),
    mappedOpt(
      "A shared hobby keeps us together: games, music, cars or making things.",
      {
        "gaming-and-fandom-men": 2,
        "music-and-nightlife-men": 2,
        "autists-special-interest-men": 2,
      },
    ),
  ],
  Music: [
    mappedOpt(
      "Guitar music, from classic rock to metal or punk.",
      { "music-and-nightlife-men": 4 },
      [
        { match: "Metalhead", w: 3 },
        { match: "Punk guy", w: 2 },
        { match: "Guitar guy", w: 1 },
      ],
    ),
    mappedOpt(
      "Hip-hop and R&B. The aux is not getting a lecture.",
      { "music-and-nightlife-men": 4 },
    ),
    mappedOpt(
      "Country, folk or Americana.",
      {
        "music-and-nightlife-men": 3,
        "regional-english-language-types": 2,
      },
      [{ match: "Country boy", w: 1 }],
    ),
    mappedOpt(
      "Classical, ambient or electronic music with few words.",
      {
        "music-and-nightlife-men": 3,
        "think-boys-and-intellectual-capital-men": 1,
      },
    ),
    mappedOpt(
      "I do not listen to music at all. I usually prefer silence.",
      {
        "normie-default-guys": 2,
        "professional-and-money-men": 1,
      },
    ),
    mappedOpt(
      "Podcasts only. I almost never put on music.",
      {
        "think-boys-and-intellectual-capital-men": 3,
        "professional-and-money-men": 1,
      },
      [{ match: "Podcast intellectual", w: 3 }],
    ),
  ],
  Games: [
    mappedOpt(
      "Tabletop games. I will learn the rules and probably end up running the campaign.",
      {
        "gaming-and-fandom-men": 4,
        "autists-special-interest-men": 2,
      },
      [
        { match: "TTRPG lorekeeper", w: 3 },
        { match: "Forever DM", w: 3 },
        { match: "Board-game", w: 2 },
      ],
    ),
    mappedOpt(
      "I mostly watch: streams, esports or somebody else's playthrough.",
      {
        "gaming-and-fandom-men": 4,
        "wojaks-and-terminally-online-men": 1,
      },
      [
        { match: "Twitch streamer", w: 2 },
        { match: "Gen-Z speedrunner", w: 1 },
      ],
    ),
  ],
  Food: [
    mappedOpt(
      "I balance cost, convenience and feeling decent through a busy day.",
      {
        "normie-default-guys": 3,
        "wellness-longevity-and-optimization-men": 1,
      },
      [{ match: "Meal-prep", w: 1 }],
    ),
    mappedOpt(
      "I like cooking and will lose an afternoon to one recipe.",
      { "food-drink-and-domestic-hobby-men": 4 },
      [
        { match: "Cast-iron", w: 1 },
        { match: "Sourdough", w: 1 },
      ],
    ),
    mappedOpt(
      "Vegetarian, vegan or restricted by what my body will tolerate.",
      {
        "food-drink-and-domestic-hobby-men": 2,
        "wellness-longevity-and-optimization-men": 2,
      },
    ),
  ],
  Home: [
    mappedOpt(
      "I live with family or roommates, so my own room or corner is the part that feels like me.",
      {
        "normie-default-guys": 3,
        "life-stage-and-domestic-men": 1,
      },
      [{ match: "High-tier normie", w: 1 }],
    ),
    mappedOpt(
      "Clean and ordinary. I want to find my keys and sit down without moving anything.",
      {
        "life-stage-and-domestic-men": 3,
        "normie-default-guys": 2,
      },
    ),
    mappedOpt(
      "Books, collections and half-finished projects have taken most of the surfaces.",
      {
        "autists-special-interest-men": 3,
        "think-boys-and-intellectual-capital-men": 2,
      },
    ),
  ],
  "Self-improve": [
    mappedOpt(
      "Learn a skill, finish a course or become less bad at something I care about.",
      {
        "think-boys-and-intellectual-capital-men": 3,
        "professional-and-money-men": 1,
      },
    ),
    mappedOpt(
      "The basics: sleep better, drink less and call people back.",
      {
        "wellness-longevity-and-optimization-men": 2,
        "emotional-soft-boys": 2,
        "normie-default-guys": 1,
      },
    ),
  ],
  Masculinity: [
    mappedOpt(
      "A cultural or religious duty. Provider, husband and father come with rules.",
      {
        "dad-daddy": 3,
        "political-and-ideological-men": 2,
      },
      [
        { match: "Trad husband", w: 3 },
        { match: "Tradcath guy", w: 1 },
      ],
    ),
    mappedOpt(
      "Masculinity is a minor part of how I see myself.",
      {
        "normie-default-guys": 3,
        "emotional-soft-boys": 2,
      },
    ),
  ],
  "Online self": [
    mappedOpt(
      "I post about one hobby and become much more talkative when it comes up.",
      {
        "autists-special-interest-men": 3,
        "gaming-and-fandom-men": 1,
      },
    ),
    mappedOpt(
      "My real name, strong political opinions and no instinct to log off.",
      {
        "political-and-ideological-men": 3,
        "wojaks-and-terminally-online-men": 2,
      },
      [{ match: "Reply guy", w: 1 }],
    ),
  ],
  "Romance code": [
    mappedOpt(
      "An equal partnership with no animal metaphor. We like each other and split the work.",
      {
        "life-stage-and-domestic-men": 3,
        "emotional-soft-boys": 2,
      },
      [
        { match: "Green-flag", w: 2 },
        { match: "Man written by a woman", w: 1 },
      ],
    ),
    mappedOpt(
      "I fall first and make it obvious. Subtlety has never helped me.",
      {
        "female-gaze-and-fandom-men": 4,
        "emotional-soft-boys": 1,
      },
      [
        { match: "He-falls-first", w: 3 },
        { match: "Good-morning texter", w: 1 },
      ],
    ),
  ],
  Risk: [
    mappedOpt(
      "Mostly cannabis. Familiar, low-key and not a spiritual project.",
      {
        "psychonauts-and-consciousness-explorers": 2,
        "normie-default-guys": 2,
      },
    ),
    mappedOpt(
      "Drinks and party drugs when the night calls for them.",
      {
        "music-and-nightlife-men": 3,
        "psychonauts-and-consciousness-explorers": 1,
      },
      [
        { match: "Raver", w: 2 },
        { match: "Euro trash", w: 1 },
      ],
    ),
    mappedOpt(
      "Sober now. I learned that moderation was not going to happen.",
      {
        "emotional-soft-boys": 2,
        "wellness-longevity-and-optimization-men": 2,
      },
    ),
  ],
  Travel: [
    mappedOpt(
      "Something affordable that fits around school or work, with a good mix of rest and things to do.",
      {
        "normie-default-guys": 3,
        "professional-and-money-men": 1,
      },
      [
        { match: "Chill guy", w: 1 },
        { match: "High-tier normie", w: 1 },
      ],
    ),
    mappedOpt(
      "A resort or cruise. I want the decisions made before I arrive.",
      {
        "normie-default-guys": 3,
        "professional-and-money-men": 1,
      },
    ),
    mappedOpt(
      "A road trip or campsite. The route matters more than the hotel.",
      {
        "sports-fitness-and-gear-men": 2,
        "regional-english-language-types": 3,
      },
      [
        { match: "Country boy", w: 1 },
        { match: "Car guy", w: 1 },
      ],
    ),
    mappedOpt(
      "Visit family, return somewhere familiar or stay home and save the money.",
      {
        "life-stage-and-domestic-men": 3,
        "normie-default-guys": 2,
      },
    ),
  ],
  Status: [
    mappedOpt(
      "Respect from people who know the craft better than I do.",
      {
        "think-boys-and-intellectual-capital-men": 3,
        "professional-and-money-men": 2,
      },
    ),
    mappedOpt(
      "Trust. I want friends and neighbors to call me when something matters.",
      {
        "emotional-soft-boys": 2,
        "life-stage-and-domestic-men": 3,
      },
      [{ match: "Green-flag", w: 1 }],
    ),
  ],
  "Special interest": [
    mappedOpt(
      "Vehicles, tools, maps or transit systems.",
      {
        "autists-special-interest-men": 4,
        "sports-fitness-and-gear-men": 1,
      },
      [
        { match: "Car guy", w: 2 },
        { match: "Map guy", w: 2 },
        { match: "Transit guy", w: 2 },
      ],
    ),
    mappedOpt(
      "Music or film. Credits, scenes and release histories stick in my head.",
      {
        "music-and-nightlife-men": 2,
        "think-boys-and-intellectual-capital-men": 3,
      },
      [
        { match: "Film bro", w: 2 },
        { match: "Vinyl", w: 1 },
      ],
    ),
    mappedOpt(
      "History and politics, including arguments that ended before I was born.",
      {
        "political-and-ideological-men": 2,
        "think-boys-and-intellectual-capital-men": 3,
      },
      [
        { match: "History buff", w: 2 },
        { match: "Roman-Empire", w: 1 },
      ],
    ),
    mappedOpt(
      "Plants, animals or whatever is living outside nearby.",
      {
        "dad-daddy": 2,
        "food-drink-and-domestic-hobby-men": 2,
        "autists-special-interest-men": 1,
      },
      [{ match: "Plant dad", w: 2 }],
    ),
  ],
  Reputation: [
    mappedOpt(
      "“Busy, dependable and still there when somebody actually needs him.”",
      {
        "professional-and-money-men": 2,
        "life-stage-and-domestic-men": 2,
        "emotional-soft-boys": 1,
      },
      [{ match: "Green-flag", w: 3 }],
    ),
    mappedOpt(
      "“Dependable. Quiet life, shows up every time.”",
      {
        "life-stage-and-domestic-men": 3,
        "professional-and-money-men": 1,
      },
      [{ match: "Green-flag", w: 2 }],
    ),
    mappedOpt(
      "“Very funny. Bad at knowing when the joke is over.”",
      {
        "normie-default-guys": 3,
        "wojaks-and-terminally-online-men": 1,
      },
      [{ match: "Unserious", w: 2 }],
    ),
    mappedOpt(
      "“Intense. Ask one question and you may get a lecture.”",
      {
        "think-boys-and-intellectual-capital-men": 3,
        "autists-special-interest-men": 2,
      },
      [{ match: "Actually", w: 1 }],
    ),
    mappedOpt(
      "“Private. We have known him for years and still do not know what he is thinking.”",
      {
        "emotional-soft-boys": 2,
        "internet-boyfriend-zoology": 2,
      },
      [{ match: "Black cat boyfriend", w: 2 }],
    ),
  ],
};

/**
 * 25 questions. Each starts with the same six poles, then adds common middle
 * cases that need narrower mappings.
 */
export const DECK: QuizQuestion[] = [
  {
    topic: "Saturday",
    q: "Which of these are usually part of a free Saturday morning?",
    opts: [
      opt("Still horizontal. Maybe brunch later if someone else plans it.", "default", {}, [
        { match: "Chill guy", w: 2 },
        { match: "Unserious", w: 1 },
      ]),
      opt("Hardware store first. Then the lawn, the kids or Costco.", "domestic", {}, [
        { match: "Suburban", w: 2 },
        { match: "Costco dad", w: 2 },
        { match: "DIY dad", w: 1 },
      ]),
      opt("Already training. Lifting, running, zone 2. Whatever the plan says.", "body", {}, [
        { match: "Gym bro", w: 2 },
        { match: "Run-club", w: 1 },
        { match: "Huberman", w: 1 },
      ]),
      opt("I check the inbox and somehow end up working on a pitch or side business.", "capital", {}, [
        { match: "Hustle bro", w: 2 },
        { match: "Indie hacker", w: 1 },
        { match: "Finance bro", w: 1 },
      ]),
      opt("Museum or farmers market, tote bag in hand.", "soft", {}, [
        { match: "Tote-bag", w: 2 },
        { match: "Museum-date", w: 2 },
        { match: "Soft boy", w: 1 },
      ]),
      opt("Phone in hand: Discord, the timeline and a four-hour YouTube hole.", "online", {}, [
        { match: "Terminally online", w: 2 },
        { match: "NEET", w: 1 },
        { match: "Discord mod", w: 1 },
      ]),
    ],
  },
  {
    topic: "Friday night",
    q: "No one is making you go out. What does your ideal Friday night look like?",
    opts: [
      opt("Drinks with the boys. Volume up, stakes low.", "default", {}, [
        { match: "Bro", w: 2 },
        { match: "Lad", w: 1 },
        { match: "Euro trash", w: 1 },
      ]),
      opt("Home. Grill on, kids in bed, thermostat under my control.", "domestic", {}, [
        { match: "Grill dad", w: 2 },
        { match: "Thermostat dad", w: 2 },
        { match: "Dadcore", w: 1 },
      ]),
      opt("Climbing gym or a pickup game, followed by an earnest recovery routine.", "body", {}, [
        { match: "Boulder", w: 1 },
        { match: "Pickleball", w: 1 },
        { match: "Sauna bro", w: 1 },
      ]),
      opt("Dinner with people who may become customers, investors or useful contacts.", "capital", {}, [
        { match: "VC bro", w: 2 },
        { match: "LinkedIn", w: 1 },
        { match: "Founder", w: 1 },
      ]),
      opt("A date somewhere dim enough to flatter both of us.", "soft", {}, [
        { match: "Playlist boyfriend", w: 1 },
        { match: "Indie boy", w: 1 },
        { match: "Golden retriever", w: 1 },
        { match: "Black cat boyfriend", w: 1 },
      ]),
      opt("Raid night. If that falls through, ranked games and scrolling until 3 a.m.", "online", {}, [
        { match: "Console warrior", w: 1 },
        { match: "Twitch", w: 1 },
        { match: "Coomer", w: 1 },
      ]),
    ],
  },
  {
    topic: "Body",
    q: "Which sentence best describes how you relate to your body?",
    opts: [
      opt("Fine. I exist in it. Next question.", "default", {}, [
        { match: "Dad-bod", w: 2 },
        { match: "Normal guy from", w: 1 },
        { match: "Chill guy", w: 1 },
      ]),
      opt("It works. I can carry the groceries and keep up with the kids.", "domestic", {}, [
        { match: "Functional-fitness", w: 2 },
        { match: "Stay-at-home dad", w: 1 },
      ]),
      opt("It is a project. I track PRs, macros and whether my form is slipping.", "body", {}, [
        { match: "Powerlifter", w: 2 },
        { match: "Never-skips-leg-day", w: 2 },
        { match: "Natty", w: 1 },
      ]),
      opt("I track sleep and HRV because I want my brain to work tomorrow.", "capital", {
        "wellness-longevity-and-optimization-men": 2,
      }, [
        { match: "Wearable-data", w: 2 },
        { match: "Optimization addict", w: 2 },
        { match: "Attia", w: 1 },
      ]),
      opt("I want to look good on my own terms. Painted nails are not off the table.", "soft", {
        "fashion-and-aesthetic-men": 1,
      }, [
        { match: "Soft boy", w: 2 },
        { match: "Clean boy", w: 1 },
        { match: "Painted-nails", w: 1 },
      ]),
      opt("I have opinions about my angles, canthal tilt and whether mewing works.", "online", {}, [
        { match: "Lookmaxxing", w: 3 },
        { match: "Mewer", w: 2 },
        { match: "Canthal-tilt", w: 2 },
        { match: "Heightcel", w: 1 },
      ]),
    ],
  },
  {
    topic: "Money",
    q: "When money comes up, which version of you appears?",
    opts: [
      opt("I make enough. I’m not building a personality around it.", "default", {}, [
        { match: "Corporate drone", w: 1 },
        { match: "Wagecuck", w: 1 },
        { match: "Chill guy", w: 1 },
      ]),
      opt("I think about the mortgage rate, Costco bill and whether the 529 is on track.", "domestic", {}, [
        { match: "Costco dad", w: 2 },
        { match: "Boglehead", w: 1 },
        { match: "FIRE", w: 1 },
      ]),
      opt("Protein budget and gym membership before brunch.", "body", {}, [
        { match: "Protein guy", w: 2 },
        { match: "Gym bro", w: 1 },
        { match: "Meal-prep", w: 1 },
      ]),
      opt("Equity, allocation, deal flow. I enjoy this conversation more than I should.", "capital", {}, [
        { match: "Finance bro", w: 2 },
        { match: "Cryptobros", w: 2 },
        { match: "Options guy", w: 1 },
        { match: "VC bro", w: 1 },
      ]),
      opt("I would rather spend on a trip. If I buy something flashy, it should not look flashy.", "soft", {
        "fashion-and-aesthetic-men": 1,
      }, [
        { match: "Quiet-luxury", w: 2 },
        { match: "Old-money", w: 2 },
        { match: "Beige boyfriend", w: 1 },
      ]),
      opt("Money is a scoreboard. I know the words moneymaxxing and SMV.", "online", {}, [
        { match: "High-value man", w: 2 },
        { match: "Sigma grindset", w: 2 },
        { match: "Moneymaxxing", w: 2 },
        { match: "Top G", w: 1 },
      ]),
    ],
  },
  {
    topic: "Dating",
    q: "On dating apps or during the first few dates, which pattern is closest to yours?",
    opts: [
      opt("Casual and inconsistent, but charming enough that plans still happen.", "default", {}, [
        { match: "Fuck boy", w: 2 },
        { match: "Situationship", w: 1 },
        { match: "Unserious", w: 1 },
      ]),
      opt("I am looking for a partner, not building a roster.", "domestic", {}, [
        { match: "Trad husband", w: 1 },
        { match: "Serial monogamist", w: 2 },
        { match: "Green-flag", w: 1 },
      ]),
      opt("The profile has a gym photo, a fish photo or both.", "body", {}, [
        { match: "Gym-selfie", w: 3 },
        { match: "Beefcake", w: 1 },
        { match: "Gym bro", w: 1 },
      ]),
      opt("My job leaks into the prompts. There may be a podcast in the bio.", "capital", {}, [
        { match: "Man in finance", w: 2 },
        { match: "First-date podcaster", w: 2 },
        { match: "LinkedIn", w: 1 },
      ]),
      opt("The prompts are soft and there is probably a playlist. People want to fix me.", "soft", {}, [
        { match: "Golden retriever", w: 2 },
        { match: "Performative reader", w: 1 },
        { match: "Therapy-speak", w: 1 },
        { match: "Cinnamon roll", w: 1 },
      ]),
      opt("Mostly watching from the sidelines, with too much theory about how dating works.", "online", {}, [
        { match: "Orbiter", w: 2 },
        { match: "Simp", w: 1 },
        { match: "Incel", w: 2 },
        { match: "Hypergamy", w: 1 },
      ]),
    ],
  },
  {
    topic: "Conflict",
    q: "A partner or close friend says you hurt them. What is your first instinct?",
    opts: [
      opt("Joke it off. Seriousness is a trap.", "default", {}, [
        { match: "Unserious", w: 2 },
        { match: "Chill guy", w: 1 },
        { match: "Dramaqueens", w: 1 },
        { match: "Chihuahua boyfriend", w: 1 },
      ]),
      opt("Hear them out, apologize for the part I own and ask how to fix it.", "domestic", {}, [
        { match: "Green-flag", w: 3 },
        { match: "Man written by a woman", w: 1 },
      ]),
      opt("Train harder. Anger becomes a workout.", "body", {}, [
        { match: "Locked-in", w: 1 },
        { match: "BJJ", w: 1 },
      ]),
      opt("Work out what went wrong and make a rule so it does not happen again.", "capital", {}, [
        { match: "Therapy-speak", w: 1 },
        { match: "Actually", w: 1 },
        { match: "Product guy", w: 1 },
      ]),
      opt("Stay with the feelings. This may involve a long text or tears.", "soft", {}, [
        { match: "Sad bois", w: 2 },
        { match: "Anxious king", w: 2 },
        { match: "Sad wet cat", w: 2 },
        { match: "Babygirl", w: 1 },
        { match: "Crying Wojak", w: 1 },
      ]),
      opt("Post about it anonymously or turn it into a theory of women.", "online", {}, [
        { match: "Male manipulator", w: 2 },
        { match: "Edgelord", w: 1 },
        { match: "Manosphere", w: 1 },
        { match: "Schizoposter", w: 1 },
        { match: "Travis Bickle", w: 1 },
      ]),
    ],
  },
  {
    topic: "Feed",
    q: "Open your most-used feed. What is it mostly serving you?",
    opts: [
      opt("Sports, memes and whatever the group chat is yelling about.", "default", {}, [
        { match: "Bro", w: 1 },
        { match: "Fantasy-football", w: 1 },
        { match: "Normal guy from", w: 1 },
      ]),
      opt("Home-project videos and local Facebook arguments I pretend only my neighbors care about.", "domestic", {}, [
        { match: "YouTube-research dad", w: 3 },
        { match: "Facebook dad", w: 2 },
        { match: "DIY dad", w: 1 },
      ]),
      opt("Form checks and race recaps, with Huberman clips sneaking in.", "body", {}, [
        { match: "Huberman", w: 2 },
        { match: "Form-police", w: 1 },
        { match: "Supplement stacker", w: 1 },
      ]),
      opt("Markets, founder gossip and new AI demos.", "capital", {
        "tech-ai-and-futurist-men": 2,
      }, [
        { match: "Tech bro", w: 2 },
        { match: "Thought leader", w: 1 },
        { match: "Substack", w: 1 },
      ]),
      opt("Letterboxd, sad songs and attractive people holding books.", "soft", {}, [
        { match: "Letterboxd", w: 2 },
        { match: "Booktok", w: 1 },
        { match: "Male-manipulator-music", w: 1 },
        { match: "Soft boy", w: 1 },
      ]),
      opt("Anon boards or a wiki hole so narrow that I cannot explain how I got there.", "online", {}, [
        { match: "4chaners", w: 2 },
        { match: "Reddit", w: 1 },
        { match: "Wikipedia guy", w: 1 },
        { match: "Terminally online", w: 1 },
      ]),
    ],
  },
  {
    topic: "Clothes",
    q: "You have five minutes to get dressed. What do you reach for?",
    opts: [
      opt("Whatever is clean. Brand logos optional, vibes mandatory.", "default", {}, [
        { match: "Bro", w: 1 },
        { match: "Frat bro", w: 1 },
      ]),
      opt("New Balance, fleece and enough pockets to be useful.", "domestic", {}, [
        { match: "Dadcore", w: 3 },
        { match: "Gorp dad", w: 1 },
        { match: "Coastal grandpa", w: 1 },
      ]),
      opt("Technical fabric. The shoes imply either a trail or a squat rack.", "body", {}, [
        { match: "Gorpcore", w: 2 },
        { match: "Techwear", w: 1 },
        { match: "Gym bro", w: 1 },
      ]),
      opt("Business casual: chinos, an Oxford shirt and a quarter-zip or unstructured blazer.", "capital", {
        "fashion-and-aesthetic-men": 1,
      }, [
        { match: "Finance bro", w: 2 },
        { match: "Quarter-zip", w: 3 },
        { match: "Quiet-luxury", w: 1 },
      ]),
      opt("Classic formalwear: a well-cut suit, crisp shirt and proper leather shoes.", "soft", {
        "fashion-and-aesthetic-men": 2,
      }, [
        { match: "Heritage-menswear guy", w: 2 },
        { match: "Old-money", w: 2 },
        { match: "Quiet-luxury", w: 1 },
      ]),
      opt("The mess is planned. The clothes may be archive, indie sleaze or last decade's mistake.", "soft", {}, [
        { match: "Eboyz", w: 1 },
        { match: "Indie-sleaze", w: 2 },
        { match: "Hypebeast", w: 1 },
        { match: "Dark-academia", w: 1 },
        { match: "Broccoli head", w: 1 },
      ]),
      opt("A uniform that people in my niche recognize immediately and everyone else finds odd.", "online", {
        "fashion-and-aesthetic-men": 1,
      }, [
        { match: "Techwear ninja", w: 1 },
        { match: "Cosplay", w: 1 },
        { match: "Warrior-skull", w: 1 },
      ]),
    ],
  },
  {
    topic: "Mind",
    q: "When you learn for pleasure, where does your attention go?",
    opts: [
      opt("I know enough to argue at dinner. Depth is optional.", "default", {}, [
        { match: "NPC", w: 1 },
        { match: "Brainlet", w: 1 },
        { match: "Pseudo-intellectual", w: 1 },
      ]),
      opt("Things I can use: taxes, schools, appliance repair and the fastest route.", "domestic", {}, [
        { match: "Airport dad", w: 1 },
        { match: "YouTube-research dad", w: 1 },
        { match: "Map guy", w: 1 },
      ]),
      opt("Studies and protocols. I am the person asking what the literature says.", "body", {
        "think-boys-and-intellectual-capital-men": 1,
      }, [
        { match: "Science bro", w: 2 },
        { match: "Biohacker", w: 2 },
        { match: "Form-police", w: 1 },
      ]),
      opt("Markets and AI, usually through a framework someone posted in a long thread.", "capital", {}, [
        { match: "Substack", w: 2 },
        { match: "Podcast intellectual", w: 2 },
        { match: "Pseudo-intellectual", w: 1 },
      ]),
      opt("Novels and films. I have had feelings about a museum label.", "soft", {
        "think-boys-and-intellectual-capital-men": 2,
      }, [
        { match: "Film bro", w: 2 },
        { match: "Lit bro", w: 2 },
        { match: "Infinite Jest", w: 1 },
        { match: "Bukowski", w: 1 },
      ]),
      opt("Lore wikis, old forum arguments and ideological reading lists.", "online", {}, [
        { match: "Actually", w: 2 },
        { match: "History buff", w: 1 },
        { match: "Roman-Empire", w: 1 },
        { match: "Stoicism", w: 1 },
        { match: "Schizoposter", w: 1 },
      ]),
    ],
  },
  {
    topic: "Politics",
    q: "Ignoring your voting record, where does your political attention naturally go?",
    opts: [
      opt("Mostly checked out. Grill first, discourse never.", "default", {}, [
        { match: "Grillpilled", w: 3 },
        { match: "Normal guy from", w: 1 },
      ]),
      opt("Whatever reaches my front door: schools, zoning, the HOA, crime nearby.", "domestic", {
        "political-and-ideological-men": 1,
      }, [
        { match: "HOA", w: 2 },
        { match: "Father-rights", w: 1 },
        { match: "Suburban", w: 1 },
      ]),
      opt("Food, hormones, public health and suspicion of official advice.", "body", {
        "political-and-ideological-men": 1,
      }, [
        { match: "Carnivore", w: 2 },
        { match: "Raw-milk", w: 1 },
        { match: "Meatfluencer", w: 1 },
        { match: "Ecofascist", w: 1 },
      ]),
      opt("Markets, new technology and whether the government can still do anything properly.", "capital", {}, [
        { match: "EAs", w: 2 },
        { match: "RATS", w: 1 },
        { match: "Tech bro", w: 1 },
      ]),
      opt("Care, identity and climate. I want institutions to be less cruel.", "soft", {
        "political-and-ideological-men": 2,
      }, [
        { match: "Proto-woke", w: 2 },
        { match: "Performative feminist", w: 2 },
        { match: "Soy boy", w: 1 },
      ]),
      opt("Pills, manosphere charts and anonymous culture-war posting.", "online", {}, [
        { match: "Red-pilled", w: 3 },
        { match: "Save-the-West", w: 2 },
        { match: "Daily Wire", w: 1 },
        { match: "MGTOW", w: 1 },
        { match: "Tankie", w: 1 },
        { match: "Ecofascist", w: 1 },
      ]),
    ],
  },
  {
    topic: "Work",
    q: "Which description fits your relationship to work?",
    opts: [
      opt("Competent enough. Personality not defined by the job.", "default", {}, [
        { match: "Corporate drone", w: 2 },
        { match: "Email-job", w: 2 },
      ]),
      opt("It pays for a stable life, decent benefits and the right school district.", "domestic", {}, [
        { match: "Trad dad", w: 1 },
        { match: "Corporate drone", w: 1 },
        { match: "Wagecuck", w: 1 },
      ]),
      opt("I like work where you can see whether I did it well.", "body", {}, [
        { match: "Oilrigman", w: 1 },
        { match: "Blue-collar", w: 2 },
        { match: "Trades bro", w: 2 },
      ]),
      opt("I want to build, sell or run the thing. A title would be nice too.", "capital", {}, [
        { match: "Founder-mode", w: 2 },
        { match: "Hustle bro", w: 2 },
        { match: "SaaS bro", w: 1 },
        { match: "Course seller", w: 1 },
        { match: "Don Draper", w: 1 },
      ]),
      opt("I make things. The job may involve design, writing or music.", "soft", {}, [
        { match: "Art boi", w: 1 },
        { match: "Band guy", w: 1 },
        { match: "Malewife", w: 1 },
      ]),
      opt("My real workplace is Discord, if I am working at all.", "online", {}, [
        { match: "NEET", w: 2 },
        { match: "Discord mod", w: 2 },
        { match: "Laptop-class", w: 1 },
        { match: "Digital-nomad", w: 1 },
      ]),
    ],
  },
  {
    topic: "Friends",
    q: "What mainly holds your closest friendships with men together?",
    opts: [
      opt("We met years ago and still call ourselves “the boys.” Maintenance is minimal.", "default", {}, [
        { match: "Bro", w: 2 },
        { match: "Frat bro", w: 1 },
        { match: "Lad", w: 1 },
      ]),
      opt("Other dads. Conversations about schools and sleep.", "domestic", {}, [
        { match: "Sports dad", w: 1 },
        { match: "Suburban", w: 1 },
        { match: "Dad / Dad-jokes", w: 1 },
      ]),
      opt("Training partners. Friendship is a shared PR.", "body", {}, [
        { match: "Gym bro", w: 2 },
        { match: "Run-club", w: 2 },
        { match: "CrossFit", w: 1 },
      ]),
      opt("Work brought us together. Some of us can also open doors for each other.", "capital", {}, [
        { match: "LinkedIn", w: 2 },
        { match: "Consultant bro", w: 1 },
        { match: "VC bro", w: 1 },
      ]),
      opt("An artsy mixed group, often with couples and soft boys in the same orbit.", "soft", {}, [
        { match: "Internet boyfriend", w: 1 },
        { match: "Himbo", w: 1 },
        { match: "Theatre", w: 1 },
        { match: "Poly pals", w: 1 },
      ]),
      opt("Mostly online. I trust a few usernames more than most neighbors.", "online", {}, [
        { match: "Terminally online", w: 2 },
        { match: "Discord", w: 1 },
        { match: "Anon", w: 1 },
        { match: "Furries", w: 1 },
      ]),
    ],
  },
  {
    topic: "Music",
    q: "If you control the speakers for an hour, what comes on?",
    opts: [
      opt("Whatever the aux dictates. Chart stuff, party stuff.", "default", {}, [
        { match: "Playlist boyfriend", w: 2 },
        { match: "Euro trash", w: 1 },
        { match: "Boiler Room", w: 1 },
      ]),
      opt("Dad rock until a child's playlist takes over.", "domestic", {}, [
        { match: "Festival dad", w: 1 },
        { match: "Guitar guy", w: 1 },
        { match: "Wonderwall", w: 2 },
      ]),
      opt("Something fast enough to train to, or a podcast in one ear.", "body", {}, [
        { match: "Phonk", w: 1 },
        { match: "Run-club", w: 1 },
        { match: "Podcast", w: 1 },
      ]),
      opt("Instrumental playlists or podcasts. Silence makes it harder to work.", "capital", {}, [
        { match: "Productivity bro", w: 1 },
        { match: "Hustle bro", w: 1 },
      ]),
      opt("Indie, jazz and music made by sad men. The collection is a little too deliberate.", "soft", {}, [
        { match: "Male-manipulator-music", w: 2 },
        { match: "Vinyl", w: 2 },
        { match: "Indie boy", w: 1 },
        { match: "Radiohead", w: 1 },
      ]),
      opt("Phonk edits, hyperpop and audio that makes no sense off the internet.", "online", {}, [
        { match: "Hyperpop", w: 2 },
        { match: "Drainer", w: 2 },
        { match: "DJ boyfriend", w: 1 },
        { match: "Boiler Room", w: 1 },
      ]),
    ],
  },
  {
    topic: "Games",
    q: "Which answer best describes your relationship to games and fandom?",
    opts: [
      opt("Casual: FIFA, Mario Kart, whatever friends are on.", "default", {}, [
        { match: "Console warrior", w: 1 },
        { match: "Fantasy-football", w: 1 },
      ]),
      opt("I mostly stopped, though Nintendo with the kids still counts.", "domestic", {}, [
        { match: "Toy trains", w: 1 },
        { match: "Retro-gaming", w: 1 },
        { match: "Dad", w: 1 },
      ]),
      opt("I would rather climb, skate or ride than simulate any of them.", "body", {}, [
        { match: "Skater", w: 1 },
        { match: "Surf bro", w: 1 },
        { match: "Fantasy-football", w: 1 },
      ]),
      opt("Mostly strategy. Chess and board games scratch the same itch.", "capital", {
        "think-boys-and-intellectual-capital-men": 1,
      }, [
        { match: "Chess nerd", w: 2 },
        { match: "Board-game", w: 1 },
      ]),
      opt("Story games, cozy games or watching someone else play from the sofa.", "soft", {}, [
        { match: "Twitch streamer", w: 1 },
        { match: "VTuber", w: 1 },
        { match: "Waifu", w: 1 },
      ]),
      opt("Deep enough to explain Souls lore, Warhammer rules or why the gacha pull was rational.", "online", {}, [
        { match: "Soulsborne", w: 2 },
        { match: "Warhammer", w: 2 },
        { match: "Gacha", w: 1 },
        { match: "Weeb", w: 1 },
        { match: "Forever DM", w: 1 },
      ]),
    ],
  },
  {
    topic: "Food",
    q: "Which food routine sounds most like your real life?",
    opts: [
      opt("Whatever’s easy. Wings, delivery, no manifesto.", "default", {}, [
        { match: "Unserious", w: 1 },
        { match: "Hot-sauce", w: 1 },
      ]),
      opt("I can run the grill and get dinner on the table without making it a personality.", "domestic", {}, [
        { match: "Grill dad", w: 3 },
        { match: "BBQ dad", w: 2 },
        { match: "Cast-iron", w: 1 },
        { match: "Air-fryer", w: 1 },
      ]),
      opt("Chicken and rice. The shaker has creatine in it.", "body", {}, [
        { match: "Chicken-and-rice", w: 3 },
        { match: "Protein guy", w: 2 },
        { match: "Meal-prep", w: 2 },
      ]),
      opt("Expense-account spots or “interesting” wine lists.", "capital", {}, [
        { match: "Michelin", w: 2 },
        { match: "Natural-wine", w: 1 },
        { match: "Steak guy", w: 1 },
      ]),
      opt("A cute café, good sourdough and a date who notices the plates.", "soft", {}, [
        { match: "Coffee snob", w: 2 },
        { match: "Sourdough", w: 2 },
        { match: "Home-barista boyfriend", w: 1 },
      ]),
      opt("Carnivore phase, raw milk argument, ancestral-diet manifesto.", "online", {
        "wellness-longevity-and-optimization-men": 2,
      }, [
        { match: "Carnivore", w: 3 },
        { match: "Raw egg", w: 2 },
        { match: "Raw-milk", w: 2 },
        { match: "Meatfluencer", w: 1 },
      ]),
    ],
  },
  {
    topic: "Home",
    q: "What would a visitor notice first about your living space?",
    opts: [
      opt("Lived-in chaos. Fine enough. Don’t open that closet.", "default", {}, [
        { match: "Manchild", w: 2 },
        { match: "Man-cave", w: 1 },
      ]),
      opt("A family command center. Calendars visible, bins labeled, thermostat contested.", "domestic", {}, [
        { match: "Suburban", w: 2 },
        { match: "Home-automation", w: 1 },
        { match: "Thermostat dad", w: 2 },
      ]),
      opt("A wall of gear and shoes lined up by what they are for.", "body", {}, [
        { match: "Watch guy", w: 1 },
        { match: "EDC", w: 1 },
        { match: "Car guy", w: 1 },
        { match: "MAMIL", w: 1 },
      ]),
      opt("Minimal, expensive-looking emptiness. Zoom background ready.", "capital", {}, [
        { match: "Quiet-luxury", w: 1 },
        { match: "Laptop-class", w: 1 },
        { match: "Digital-nomad", w: 1 },
      ]),
      opt("Plants and art books. The lighting has been considered.", "soft", {}, [
        { match: "Plant dad", w: 2 },
        { match: "Architecture", w: 1 },
        { match: "Design guy", w: 1 },
        { match: "Clean boy", w: 1 },
      ]),
      opt("The battlestation: RGB, figures and at least one sticker I should explain.", "online", {}, [
        { match: "Mechanical-keyboard", w: 2 },
        { match: "Basement dweller", w: 2 },
        { match: "Anime-PFP", w: 1 },
        { match: "Wojak", w: 1 },
      ]),
    ],
  },
  {
    topic: "Self-improve",
    q: "If you are trying to improve yourself right now, what is the project?",
    opts: [
      opt("Not in one. Improvement is a scam / I’m fine.", "default", {}, [
        { match: "Grillpilled", w: 2 },
        { match: "Chill guy", w: 1 },
      ]),
      opt("Be less difficult to live with and more useful to the people I love.", "domestic", {}, [
        { match: "Trad dad", w: 1 },
        { match: "Girl dad", w: 1 },
        { match: "Green-flag", w: 2 },
      ]),
      opt("75 Hard or a cold plunge. My mouth may be taped while I sleep.", "body", {}, [
        { match: "75 Hard", w: 3 },
        { match: "Wim Hof", w: 2 },
        { match: "Mouth-tape", w: 2 },
        { match: "Cold-plunge", w: 2 },
      ]),
      opt("A better job, more money or a side business that might escape containment.", "capital", {}, [
        { match: "Productivity bro", w: 2 },
        { match: "5 a.m.", w: 2 },
        { match: "Thought leader", w: 1 },
      ]),
      opt("Therapy. I now know my attachment style and wish I did not.", "soft", {
        "wellness-longevity-and-optimization-men": 1,
      }, [
        { match: "Therapy-speak", w: 2 },
        { match: "Polyvagal", w: 2 },
        { match: "Trauma-informed", w: 2 },
        { match: "Soft boy", w: 1 },
      ]),
      opt("Monk mode, NoFap or looksmaxxing. The advice probably came from a man with a microphone.", "online", {}, [
        { match: "Monk-mode", w: 3 },
        { match: "NoFap", w: 2 },
        { match: "Lookmaxxing", w: 2 },
        { match: "Alpha coach", w: 1 },
      ]),
    ],
  },
  {
    topic: "Masculinity",
    q: "When someone says “be a man,” what does the phrase mean to you?",
    opts: [
      opt("Shrug. Be decent, don’t overthink the costume.", "default", {}, [
        { match: "Normal guy from", w: 2 },
        { match: "King", w: 1 },
      ]),
      opt("Show up for your family and do the jobs nobody wants.", "domestic", {}, [
        { match: "Trad dad", w: 2 },
        { match: "Trad husband", w: 2 },
        { match: "Daddy", w: 1 },
      ]),
      opt("Be strong enough to help and tough enough not to fold immediately.", "body", {}, [
        { match: "Chad", w: 2 },
        { match: "Gigachad", w: 1 },
        { match: "Military", w: 1 },
      ]),
      opt("Make your own choices and keep your options open.", "capital", {}, [
        { match: "High-value man", w: 2 },
        { match: "Sigma male", w: 1 },
        { match: "Founder", w: 1 },
      ]),
      opt("A trap. Softness is allowed. Babygirl rights.", "soft", {}, [
        { match: "Babygirl", w: 2 },
        { match: "Malewife", w: 2 },
        { match: "Femboys", w: 1 },
        { match: "Princess-coded", w: 1 },
      ]),
      opt("A hierarchy lecture: alphas, frames, female nature.", "online", {}, [
        { match: "Alpha male", w: 3 },
        { match: "Sigma male", w: 2 },
        { match: "Red-pilled", w: 2 },
        { match: "Masculinity entrepreneur", w: 2 },
      ]),
    ],
  },
  {
    topic: "Online self",
    q: "When you post, what version of you shows up?",
    opts: [
      opt("Basically offline. Lurk, react, leave.", "default", {}, [
        { match: "NPC", w: 2 },
        { match: "Normal guy from", w: 1 },
        { match: "30-Year-Old Boomer", w: 1 },
      ]),
      opt("The family WhatsApp, neighborhood group or a Facebook post everyone can see.", "domestic", {}, [
        { match: "Facebook dad", w: 3 },
        { match: "Silver surfer", w: 1 },
      ]),
      opt("Workout logs and progress photos with carefully bad lighting.", "body", {}, [
        { match: "Gym-selfie", w: 2 },
        { match: "Run-club", w: 1 },
        { match: "Gymmaxxer", w: 1 },
      ]),
      opt("LinkedIn main character or founder Twitter.", "capital", {}, [
        { match: "LinkedIn lunatic", w: 3 },
        { match: "Thought leader", w: 2 },
        { match: "Tech bro", w: 1 },
      ]),
      opt("Photo dumps, soft captions and posts that make me look like somebody's boyfriend.", "soft", {}, [
        { match: "Instagram boyfriend", w: 2 },
        { match: "Internet boyfriend", w: 2 },
        { match: "White Boy of the Month", w: 1 },
        { match: "Pick-me boy", w: 1 },
        { match: "Rat boyfriend", w: 1 },
        { match: "Officer K", w: 1 },
      ]),
      opt("Anonymous, fluent in wojaks and posting far too often.", "online", {}, [
        { match: "Wojak", w: 2 },
        { match: "Soyjak", w: 1 },
        { match: "Edgelord", w: 2 },
        { match: "Terminally online", w: 2 },
        { match: "Coomer", w: 1 },
        { match: "Doomer", w: 1 },
      ]),
    ],
  },
  {
    topic: "Romance code",
    q: "Which romance trope is least wrong for you?",
    opts: [
      opt("Not applicable. I don’t speak fandom trope.", "default", {}, [
        { match: "Unserious", w: 1 },
        { match: "Chill guy", w: 1 },
      ]),
      opt("Reliable husband. Golden retriever, but house-trained.", "domestic", {}, [
        { match: "Golden retriever husband", w: 3 },
        { match: "Green-flag", w: 2 },
        { match: "DILF", w: 1 },
      ]),
      opt("Looks dangerous, acts soft around the right person.", "body", {
        "female-gaze-and-fandom-men": 2,
        "internet-boyfriend-zoology": 1,
      }, [
        { match: "German shepherd boyfriend", w: 2 },
        { match: "Beefcake", w: 1 },
        { match: "Guts guy", w: 1 },
        { match: "Doberman boyfriend", w: 1 },
        { match: "Wolf / werewolf boyfriend", w: 1 },
      ]),
      opt("Morally gray rich man whose calendar is somehow tragic.", "capital", {
        "female-gaze-and-fandom-men": 2,
      }, [
        { match: "Don Draper", w: 1 },
        { match: "Sugar daddy", w: 1 },
        { match: "Tony Montana", w: 1 },
        { match: "Thomas Shelby", w: 1 },
      ]),
      opt("Cinnamon roll, sad wet cat or a man somebody insists they can fix.", "soft", {}, [
        { match: "Cinnamon roll", w: 3 },
        { match: "Sad wet cat", w: 2 },
        { match: "Poor little meow meow", w: 2 },
        { match: "Babygirl", w: 1 },
        { match: "Pathetic-but-affectionate", w: 2 },
      ]),
      opt("Problematic fave. There is probably a Patrick Bateman edit involved.", "online", {
        "female-gaze-and-fandom-men": 2,
      }, [
        { match: "Patrick Bateman", w: 3 },
        { match: "Problematic fave", w: 2 },
        { match: "Literally Me", w: 2 },
        { match: "Joker guy", w: 1 },
        { match: "Travis Bickle", w: 1 },
        { match: "Homelander", w: 1 },
        { match: "Officer K", w: 1 },
      ]),
    ],
  },
  {
    topic: "Risk",
    q: "Which answer best describes your relationship to altered states?",
    opts: [
      opt("Mostly sober, or a few familiar drinks. I am not collecting experiences.", "default", {}, [
        { match: "Craft-beer", w: 1 },
        { match: "Grillpilled", w: 1 },
      ]),
      opt("Social and occasional. A wedding or dinner is enough.", "domestic", {}, [
        { match: "Festival dad", w: 1 },
      ]),
      opt("Cold plunge and breathwork count as the trip.", "body", {
        "psychonauts-and-consciousness-explorers": 2,
      }, [
        { match: "Wim Hof", w: 3 },
        { match: "Cold-plunge", w: 2 },
        { match: "Breathwork", w: 2 },
      ]),
      opt("Microdosing or nootropics, with the dose written down somewhere.", "capital", {
        "wellness-longevity-and-optimization-men": 2,
      }, [
        { match: "Nootropics", w: 2 },
        { match: "Microdosing dad", w: 3 },
        { match: "Peptide", w: 1 },
        { match: "Optimization", w: 1 },
      ]),
      opt("Festival chemistry and a little spiritual language about connection.", "soft", {
        "psychonauts-and-consciousness-explorers": 3,
      }, [
        { match: "Spiritual", w: 3 },
        { match: "Tantra", w: 2 },
        { match: "Raver", w: 2 },
        { match: "Burner", w: 1 },
      ]),
      opt("Psychedelics and consciousness. Reality seems stranger afterward.", "online", {
        "psychonauts-and-consciousness-explorers": 2,
      }, [
        { match: "Meditation men", w: 1 },
        { match: "Schizoposter", w: 2 },
        { match: "Irony-poisoned", w: 1 },
      ]),
    ],
  },
  {
    topic: "Travel",
    q: "You have a free week and enough money to go somewhere. What's the plan?",
    opts: [
      opt("Cheap flight, friend's couch, plan assembled on arrival.", "default", {}, [
        { match: "Hostel guy", w: 2 },
        { match: "Digital bromad", w: 1 },
      ]),
      opt("The museums have time slots. I packed snacks for everybody.", "domestic", {}, [
        { match: "Airport dad", w: 3 },
        { match: "Disney dad", w: 2 },
      ]),
      opt("The trip is built around a race, trek, ski day or surf break.", "body", {}, [
        { match: "Ski bum", w: 2 },
        { match: "Surf bro", w: 2 },
        { match: "Ironman", w: 1 },
        { match: "Climbing dirtbag", w: 1 },
      ]),
      opt("I use points, fly up front if possible and attach a beach to a work trip.", "capital", {}, [
        { match: "Digital-nomad", w: 2 },
        { match: "Expat entrepreneur", w: 1 },
        { match: "Laptop-class", w: 1 },
      ]),
      opt("A romantic city with slow mornings and photos worth keeping.", "soft", {}, [
        { match: "Euro trash", w: 1 },
        { match: "Internet boyfriend", w: 1 },
        { match: "Museum-date", w: 1 },
      ]),
      opt("A long stay somewhere cheap, with online acquaintances already waiting.", "online", {}, [
        { match: "Passport bro", w: 3 },
        { match: "Expat bro", w: 2 },
        { match: "Digital bromad", w: 1 },
      ]),
    ],
  },
  {
    topic: "Status",
    q: "Whose respect or attention feels most like status to you?",
    opts: [
      opt("Being liked in the room. Low drama, high ease.", "default", {}, [
        { match: "Chill guy", w: 2 },
        { match: "King", w: 1 },
        { match: "Main-character", w: 1 },
      ]),
      opt("Respect from family and people who know your name IRL.", "domestic", {}, [
        { match: "Dad", w: 1 },
        { match: "Trad dad", w: 1 },
        { match: "HOA", w: 1 },
      ]),
      opt("Physical presence. The body is the résumé.", "body", {}, [
        { match: "Chad", w: 2 },
        { match: "Gigachad", w: 2 },
        { match: "BDE", w: 1 },
        { match: "Aura farmer", w: 1 },
      ]),
      opt("Money, a serious title or knowing about the thing before everybody else.", "capital", {}, [
        { match: "Finance bro", w: 1 },
        { match: "Exit guy", w: 1 },
        { match: "Trust-fund", w: 1 },
        { match: "High-value man", w: 1 },
      ]),
      opt("Being wanted and getting your way without pushing.", "soft", {}, [
        { match: "Rizzler", w: 2 },
        { match: "Rizz god", w: 2 },
        { match: "Zaddy", w: 1 },
        { match: "Short king", w: 1 },
      ]),
      opt("A visible place in the hierarchy. Sigma, aura and mogging are useful words here.", "online", {}, [
        { match: "Sigma male", w: 2 },
        { match: "Mogger", w: 2 },
        { match: "Aura farmer", w: 2 },
        { match: "PSL god", w: 1 },
        { match: "Final boss", w: 1 },
      ]),
    ],
  },
  {
    topic: "Special interest",
    q: "When you disappear into a rabbit hole, what kind is it?",
    opts: [
      opt("I don't have one. My attention wanders too much.", "default", {}, [
        { match: "NPC", w: 2 },
        { match: "Consoomer", w: 1 },
      ]),
      opt("Home systems or trains. I can also talk about tools longer than requested.", "domestic", {
        "autists-special-interest-men": 2,
      }, [
        { match: "Toy trains", w: 3 },
        { match: "Home-automation", w: 1 },
        { match: "Watch guy", w: 1 },
      ]),
      opt("Training science, gear reviews and my own race data.", "body", {
        "autists-special-interest-men": 1,
      }, [
        { match: "Hybrid athlete", w: 1 },
        { match: "Watch guy", w: 1 },
        { match: "EDC", w: 1 },
      ]),
      opt("Markets, forecasting or what the next AI model may be able to do.", "capital", {
        "autists-special-interest-men": 1,
        "tech-ai-and-futurist-men": 2,
      }, [
        { match: "RATS", w: 1 },
        { match: "EAs", w: 1 },
      ]),
      opt("Characters and ships. I learned the lore because I got attached.", "soft", {
        "autists-special-interest-men": 1,
        "female-gaze-and-fandom-men": 1,
      }, [
        { match: "Waifu", w: 1 },
        { match: "Cosplay boyfriend", w: 1 },
        { match: "Wolf / werewolf boyfriend", w: 1 },
      ]),
      opt("One tiny subject that I can talk about for hours.", "online", {
        "autists-special-interest-men": 3,
      }, [
        { match: "Nerds", w: 2 },
        { match: "AuADHD", w: 3 },
        { match: "Warhammer", w: 1 },
        { match: "Transit guy", w: 1 },
      ]),
    ],
  },
  {
    topic: "Reputation",
    q: "Which introduction from a close friend would embarrass you by being accurate?",
    opts: [
      opt("“He’s just a normal guy. You’ll get it.”", "default", {}, [
        { match: "Bro", w: 1 },
        { match: "Chill guy", w: 2 },
        { match: "High-tier normie", w: 1 },
      ]),
      opt("“Dad energy. Extremely reliable. Owns a grill.”", "domestic", {}, [
        { match: "Dadcore", w: 2 },
        { match: "Grill dad", w: 1 },
        { match: "DILF", w: 1 },
      ]),
      opt("“Lives in the gym. Will talk about protein unprompted.”", "body", {}, [
        { match: "Gym bro", w: 2 },
        { match: "Protein guy", w: 1 },
        { match: "Gym rat", w: 1 },
      ]),
      opt("“Works in [impressive field]. Always optimizing something.”", "capital", {}, [
        { match: "Finance bro", w: 1 },
        { match: "Tech bro", w: 1 },
        { match: "Productivity bro", w: 1 },
      ]),
      opt("“Soft. Kind of a himbo / cinnamon roll. Women love him.”", "soft", {}, [
        { match: "Himbo", w: 3 },
        { match: "Golden retriever", w: 2 },
        { match: "Cinnamon roll", w: 1 },
      ]),
      opt("“Terminally online. Has opinions about wojaks and jawlines.”", "online", {}, [
        { match: "Terminally online", w: 2 },
        { match: "Lookmaxxing", w: 1 },
        { match: "Sigma", w: 1 },
        { match: "Neckbeard", w: 1 },
      ]),
    ],
  },
].map((q, i) => {
  // Keep the original six positions stable so old saved and shared answers
  // still mean the same thing. New middle cases follow the rotated poles.
  const rot = i % 6;
  const poles = [...q.opts.slice(rot), ...q.opts.slice(0, rot)];
  return {
    ...q,
    opts: [
      ...poles,
      ...(SUPPLEMENTAL_OPTIONS[q.topic] ?? []),
      { t: "None of these describes me.", sections: {}, skip: true },
    ],
  };
});

export type MatchResult = {
  archetype: Archetype;
  score: number;
  maxPossible: number;
  matchPct: number;
  fit: number;
  specificFit: number;
  specificScore: number;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function exactPhraseMatch(haystack: string, needle: string): boolean {
  const pattern = new RegExp(
    `(^|[^a-z0-9])${escapeRegExp(needle)}(?=$|[^a-z0-9])`,
    "i",
  );
  return pattern.test(haystack);
}

function specificWeight(option: QuizOption, archetype: Archetype): number {
  let w = lexicalWeight(option, archetype);
  if (option.boosts) {
    const hay = archetype.terms;
    for (const boost of option.boosts) {
      if (exactPhraseMatch(hay, boost.match)) w += boost.w;
    }
  }
  return w;
}

export function optionWeight(option: QuizOption, archetype: Archetype): number {
  return (
    (option.sections[archetype.sectionId] ?? 0) +
    specificWeight(option, archetype)
  );
}

export function maxPossibleForArchetype(archetype: Archetype): number {
  let total = 0;
  for (const q of DECK) {
    let best = 0;
    for (const opt of q.opts) {
      best = Math.max(best, optionWeight(opt, archetype));
    }
    total += best;
  }
  return total;
}

export function scoreAnswers(answerIndexes: (number | number[])[]): MatchResult[] {
  const scores = new Float64Array(ARCHETYPES.length);
  const maxes = new Float64Array(ARCHETYPES.length);
  const specificScores = new Float64Array(ARCHETYPES.length);
  const specificMaxes = new Float64Array(ARCHETYPES.length);

  for (let qi = 0; qi < DECK.length; qi++) {
    const answer = answerIndexes[qi];
    const q = DECK[qi];
    const selection = (Array.isArray(answer) ? answer : [answer]).filter(
      (optionIndex) =>
        optionIndex != null &&
        optionIndex >= 0 &&
        optionIndex < q.opts.length,
    );
    if (selection.length === 0) continue;
    const chosenOptions = selection.map((optionIndex) => q.opts[optionIndex]);

    for (let ai = 0; ai < ARCHETYPES.length; ai++) {
      const arch = ARCHETYPES[ai];
      for (const chosen of chosenOptions) {
        scores[ai] += optionWeight(chosen, arch) / chosenOptions.length;
        specificScores[ai] += specificWeight(chosen, arch) / chosenOptions.length;
      }
      let best = 0;
      let bestSpecific = 0;
      for (const opt of q.opts) {
        best = Math.max(best, optionWeight(opt, arch));
        bestSpecific = Math.max(bestSpecific, specificWeight(opt, arch));
      }
      maxes[ai] += best;
      specificMaxes[ai] += bestSpecific;
    }
  }

  return ARCHETYPES.map((archetype, i) => {
    const score = scores[i];
    const maxPossible = maxes[i];
    const baseFit = maxPossible > 0 ? score / maxPossible : 0;
    const specificFit =
      specificMaxes[i] > 0
        ? specificScores[i] / (specificMaxes[i] + 4)
        : 0;
    const fit = baseFit * 0.25 + specificFit * 0.75;
    const matchPct =
      Math.round(1000 * fit) / 10;
    const specificScore = specificScores[i];
    return {
      archetype,
      score,
      maxPossible,
      matchPct,
      fit,
      specificFit,
      specificScore,
    };
  }).sort(
    (a, b) =>
      b.fit - a.fit ||
      b.specificScore - a.specificScore ||
      a.archetype.terms.localeCompare(b.archetype.terms),
  );
}

/** Dev/test helper: every question’s options should touch every section. */
export function questionSectionCoverage(q: QuizQuestion): string[] {
  const set = new Set<string>();
  for (const opt of q.opts) {
    for (const id of Object.keys(opt.sections)) set.add(id);
  }
  return SECTION_IDS.filter((id) => !set.has(id));
}
