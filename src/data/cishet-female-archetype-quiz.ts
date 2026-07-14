/**
 * Quiz data for "Which cishet female archetypes are you?"
 *
 * Every answer combines a broad section cluster with direct label boosts.
 * The page adds a lexical-overlap signal and normalizes each archetype against
 * its own maximum possible score.
 */
import raw from "./cishet-female-archetypes.json";

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
    for (const subsection of section.subsections ?? []) {
      for (const item of subsection.items) {
        if (item.kind !== "entry" || !item.terms) continue;
        out.push({
          id: id++,
          terms: item.terms,
          gloss: item.gloss,
          sectionId: section.id,
          sectionTitle: section.title,
          subsectionId: subsection.id,
          subsectionTitle: subsection.title,
        });
      }
    }
  }
  return out;
})();

type SectionWeights = Record<string, number>;
type Boost = { match: string; w: number };

export type QuizOption = {
  t: string;
  sections: SectionWeights;
  boosts?: Boost[];
};

export type QuizQuestion = {
  topic: string;
  q: string;
  opts: QuizOption[];
};

const POLES = {
  neutral: {
    "normie-default-girls": 3,
  },
  social: {
    "normie-default-girls": 2,
    "regional-english-language-types": 2,
    "female-hierarchy-and-status-memes": 2,
    "music-and-nightlife-women": 2,
  },
  domestic: {
    "life-stage-and-domestic-women": 3,
  },
  romantic: {
    "dating-app-personas-and-behaviors": 3,
    "internet-girlfriend-zoology": 3,
    "emotional-soft-girls": 2,
  },
  polished: {
    "aesthetic-tribes-i-soft-romantic-and-polished": 3,
    "beauty-body-and-glow-up-culture": 2,
    "female-hierarchy-and-status-memes": 1,
  },
  alt: {
    "aesthetic-tribes-ii-edgy-luxe-and-retro": 3,
    "music-and-nightlife-women": 2,
    "literally-me-fictional-women": 1,
  },
  wellness: {
    "wellness-and-optimization-women": 3,
    "beauty-body-and-glow-up-culture": 2,
    "spiritual-and-manifestation-women": 1,
  },
  culture: {
    "fandom-and-online-women": 3,
    "think-girls-and-intellectual-capital-women": 2,
    "literally-me-fictional-women": 2,
    "special-interest-and-neurodivergent-women": 2,
  },
  online: {
    "wojaks-and-terminally-online-women": 3,
    "femosphere-and-dating-coach-women": 3,
    "political-and-ideological-women": 2,
    "dating-app-personas-and-behaviors": 1,
    "spiritual-and-manifestation-women": 1,
    "fandom-and-online-women": 1,
  },
} as const;

type PoleKey = keyof typeof POLES;
type BoostInput = string | readonly [match: string, weight: number];
type Choice = [
  text: string,
  pole: PoleKey,
  matches?: BoostInput[],
  extras?: SectionWeights,
];

const sectionBaselineMax = new Map<string, number>();
for (const weights of Object.values(POLES)) {
  for (const [sectionId, weight] of Object.entries(weights)) {
    sectionBaselineMax.set(
      sectionId,
      Math.max(sectionBaselineMax.get(sectionId) ?? 0, weight),
    );
  }
}

function option([t, pole, matches = [], extras = {}]: Choice): QuizOption {
  const sectionWeights: SectionWeights = {};
  for (const [sectionId, weight] of Object.entries(POLES[pole])) {
    const max = sectionBaselineMax.get(sectionId) ?? weight;
    sectionWeights[sectionId] = (weight * 3) / max;
  }
  for (const [sectionId, weight] of Object.entries(extras)) {
    sectionWeights[sectionId] = (sectionWeights[sectionId] ?? 0) + weight;
  }
  const boosts = matches.map((boost) =>
    typeof boost === "string"
      ? { match: boost, w: 2 }
      : { match: boost[0], w: boost[1] },
  );
  return boosts.length
    ? { t, sections: sectionWeights, boosts }
    : { t, sections: sectionWeights };
}

function question(topic: string, q: string, choices: Choice[]): QuizQuestion {
  return { topic, q, opts: choices.map(option) };
}

export const DECK: QuizQuestion[] = [
  question("Saturday", "You wake up with nothing planned. What happens before lunch?", [
    ["Coffee, errands and brunch if the group chat reaches consensus.", "default", ["Basic", "Brunch girl", "Girl's girl"]],
    ["Groceries, laundry and checking what everyone else in the house needs.", "domestic", ["Stay-at-home girlfriend", "Soccer mom", "Girl mom"]],
    ["Outfit first, destination second. Somewhere photogenic will materialize.", "aesthetic", ["It girl", "Baddie", "Clean girl"]],
    ["Workout, matcha and enough steps to make the day count.", "wellness", ["That girl", "Pilates princess", "Hot-girl-walk girl"]],
    ["Bookstore, museum or several hours with the current obsession.", "culture", ["BookTok girlie", "Letterboxd girl", "Hyperfixation girlie"]],
    ["Still in bed, phone six inches away, aware of three discourses already.", "online", ["Terminally online girl", "Doomer girl", "Delulu"]],
  ]),
  question("Friday night", "Your ideal Friday night requires no compromise. What is it?", [
    ["Dinner and drinks with friends; home late enough to count.", "default", ["City girl", "Girl's girl", "Hot mess"]],
    ["A calm night in with my partner, pets or family.", "domestic", ["Dog mom", "Cat lady", "Wifey"]],
    ["A reservation, a look and photos that imply the night was effortless.", "aesthetic", ["It girl", "Mob wife", "Baddie"]],
    ["Early dinner, skincare and sleep that protects tomorrow's routine.", "wellness", ["Wellness girlie", "Clean girl", "That girl"]],
    ["Concert, movie, reading or fandom plans with people who understand.", "culture", ["Concert girlie", "Swiftie", "Fangirl"]],
    ["Posting, lurking, gaming or watching a four-hour analysis no one requested.", "online", ["Gamer girl", "NPC girl", "Girlblogger"]],
  ]),
  question("Clothes", "You have five minutes to get dressed. What do you reach for?", [
    ["Jeans, a decent top and whatever shoes everyone is wearing now.", "default", ["Basic", "Cheugy", "Sorority girl"]],
    ["Something practical, washable and compatible with carrying six things.", "domestic", ["Soccer mom", "Dog mom", "Cool aunt"]],
    ["The silhouette is intentional: coquette, office siren, goth or quiet luxury.", "aesthetic", ["Coquette", "Office siren", "Goth GF", "Quiet luxury"]],
    ["Matching activewear. It may technically be rest day.", "wellness", ["Pilates princess", "Wellness girlie", "Clean girl"]],
    ["A tote bag and one item that quietly identifies the fandom or book.", "culture", ["BookTok girlie", "Art hoe", "Disney adult"]],
    ["An outfit legible only to people who know the current micro-aesthetic.", "online", ["E-girl", "Trad girl", "Quirk Chungus"]],
  ]),
  question("Beauty", "Which line is closest to your beauty routine?", [
    ["Enough to look awake and put together; no manifesto attached.", "default", ["Basic", "Stacy", "Girl's girl"]],
    ["Fast, durable and interrupted at least once.", "domestic", ["Momfluencer", "Boy mom", "Wine mom"]],
    ["The face, hair and accessories are part of the art direction.", "aesthetic", ["Baddie", "Coquette", "Mob wife"]],
    ["I have researched ingredients, devices, hormones or facial structure.", "wellness", ["Looksmaxxer", "Cortisol girlie", "GLP-1 girlie"]],
    ["I borrow references from characters, musicians and eras I love.", "culture", ["Lana-coded", "Jennifer's Body girl", "Y2K girl"]],
    ["I know exactly which look starts an argument online.", "online", ["TradCath e-girl", "E-thot", "Stacy"]],
  ]),
  question("Wellness", "What does 'taking care of yourself' usually mean?", [
    ["Seeing friends, drinking water and not making this another job.", "default", ["Chill girl", "Girl's girl", "City girl"]],
    ["Making life calmer and more functional for the people I love.", "domestic", ["Soft girl (temperament)", "Cool aunt", "Wifey"]],
    ["A bath, a beautiful room and a routine worth filming.", "aesthetic", ["Vanilla girl", "Clean girl", "Soft girl"]],
    ["Metrics, classes, supplements, cycle phases and a suspicious amount of matcha.", "wellness", ["Wellness girlie", "Cycle syncer", "Matcha girlie"]],
    ["Therapy, journaling, reading and naming what I feel.", "culture", ["Healing girlie", "Recovering people-pleaser", "Fleabag girl"]],
    ["Protecting my peace, blocking strategically and reposting the right vocabulary.", "online", ["Therapy-speak girl", "Avoidant queen", "Empath"]],
  ]),
  question("Work", "Which description best fits your relationship to work?", [
    ["I want competence, decent pay and a life after logging off.", "default", ["Corporate girlie", "Chill girl"]],
    ["Work supports the home and the people in it; that is the point.", "domestic", ["Tradwife", "Stay-at-home girlfriend", "Soccer mom"]],
    ["My job, desk and commute can all become part of the personal brand.", "aesthetic", ["Girlboss", "It girl", "Office siren"]],
    ["Work should leave enough energy for the body and life I actually care about.", "wellness", ["Wellness girlie", "Pilates princess"]],
    ["I want to make, write, teach or obsess over something meaningful.", "culture", ["Art hoe", "Performative reader girl", "Hyperfixation girlie"]],
    ["I am building the brand, selling the course or explaining why ordinary jobs are a trap.", "online", ["Boss babe", "High-value woman coach", "Level-up girl"]],
  ]),
  question("Money", "When money comes up, which version of you appears?", [
    ["I like nice things, but I am not opening a spreadsheet at dinner.", "default", ["Basic", "City girl"]],
    ["Security first: rent, home, family and the emergency fund.", "domestic", ["Soccer mom", "Tradwife", "Wifey"]],
    ["Spend on fewer, better-looking things; logos should whisper.", "aesthetic", ["Quiet luxury", "Old money", "Vanilla girl"]],
    ["Classes, food and health purchases feel easier to justify than random stuff.", "wellness", ["Pilates princess", "Wellness girlie"]],
    ["Books, tickets, hobbies and trips consume the supposedly disposable part.", "culture", ["Concert girlie", "BookTok girlie", "Travel girl"]],
    ["Money is leverage. Provider standards, lifestyle elevation and never chasing.", "online", ["High-value woman", "Sprinkle-sprinkle girl", "Sugar baby"]],
  ]),
  question("Dating profile", "If you had to make a dating profile tonight, what would leak through?", [
    ["Friends, travel, brunch and one answer everyone else also chose.", "default", ["Travel girl", "Brunch girl", "\"Never on here\" girl"]],
    ["I am looking for commitment and will not pretend otherwise.", "domestic", ["Dating-to-marry girl", "Wife material", "Wifey"]],
    ["The photos are excellent and reveal almost nothing accidental.", "aesthetic", ["Baddie", "Black cat girlfriend", "It girl"]],
    ["A hike, class, race or wellness habit appears somewhere.", "wellness", ["Pilates princess", "Granola girl", "Hot-girl-walk girl"]],
    ["A book, film, fandom or niche joke is doing most of the filtering.", "culture", ["Letterboxd girl", "BookTok girlie", "Gamer girl"]],
    ["The bio routes elsewhere, makes demands or says I am never on here.", "online", ["Instagram-in-bio girl", "\"Never on here\" girl", "\"No broke boys\" girl"]],
  ]),
  question("Relationship", "Inside a relationship, which role feels most familiar?", [
    ["Affectionate, social and basically normal until proven otherwise.", "default", ["Girlfriend material", "Girl's girl", "Chill girl"]],
    ["Reliable partner energy: plans, home, future, all discussed directly.", "domestic", ["Wifey", "Dating-to-marry girl", "Tradwife"]],
    ["Selective affection and excellent mystique.", "aesthetic", ["Black cat girlfriend", "Femme fatale", "Candid girl"]],
    ["I improve the routine, snacks, sleep and calendar.", "wellness", ["That girl", "Wellness girlie", "Cycle syncer"]],
    ["I make playlists, references and emotional subtext part of the relationship.", "culture", ["Manic pixie dream girl", "Lana-coded", "Fleabag girl"]],
    ["Either analyzing every signal or insisting I need absolutely nothing.", "online", ["Anxious queen", "Avoidant queen", "\"I hate drama\" girl"]],
  ]),
  question("Conflict", "A partner or friend says you hurt them. What is your first instinct?", [
    ["Talk it out, apologize if needed and move on without a summit.", "default", ["Girl's girl", "Chill girl"]],
    ["Fix the practical issue and make sure the relationship is secure.", "domestic", ["Wifey", "Recovering people-pleaser"]],
    ["Remain composed. Looking rattled would make the situation worse.", "aesthetic", ["Black cat girlfriend", "Cool girl", "Queen bee"]],
    ["Regulate first: walk, breathe, journal, then answer.", "wellness", ["Healing girlie", "Hot-girl-walk girl"]],
    ["Feel everything, explain everything and possibly turn it into art.", "culture", ["Fleabag girl", "Sad girl", "Female manipulator"]],
    ["Deploy boundaries, attachment styles, screenshots and the advisory group chat.", "online", ["Therapy-speak girl", "Group-chat dater", "Attachment-style diagnostician"]],
  ]),
  question("Friends", "What best describes your closest female friendships?", [
    ["A busy group chat, recurring plans and fierce loyalty.", "default", ["Girl's girl", "Queen bee", "Brunch girl"]],
    ["We help each other move, parent, cook and survive actual emergencies.", "domestic", ["Cool aunt", "Soccer mom", "Girl mom"]],
    ["We exchange clothes, photos and recommendations with ruthless accuracy.", "aesthetic", ["It girl", "Baddie", "Coquette"]],
    ["Classes, walks, matcha and mutual accountability.", "wellness", ["Pilates princess", "Wellness girlie", "Hot-girl-walk girl"]],
    ["Our shared language is books, films, music or fandom.", "culture", ["Fangirl", "BookTok girlie", "Letterboxd girl"]],
    ["They are an advisory board that receives every ambiguous text as evidence.", "online", ["Group-chat dater", "\"If he wanted to, he would\" girl", "Attachment-style diagnostician"]],
  ]),
  question("Feed", "Open your most-used feed. What is it serving you?", [
    ["Friends, celebrities, restaurants, outfits and ordinary memes.", "default", ["Basic", "City girl", "Baddie"]],
    ["Homes, parenting, pets, recipes and neighborhood outrage.", "domestic", ["Momfluencer", "Dog mom", "Sad beige mom"]],
    ["Runways, rooms, beauty and a new aesthetic every ten days.", "aesthetic", ["Clean girl", "Coquette", "Cluttercore"]],
    ["Hormones, workouts, sleep, supplements and one alarming symptom theory.", "wellness", ["Cortisol girlie", "Cycle syncer", "Wellness girlie"]],
    ["Books, films, concerts, fictional women and edits.", "culture", ["Girlblogger", "Swiftie", "AO3"]],
    ["Discourse, dating rules, wojaks and posts incomprehensible outside the app.", "online", ["Terminally online girl", "Doomer girl", "NPC girl"]],
  ]),
  question("Reading", "What are you most likely to read voluntarily?", [
    ["A popular novel everyone is discussing or a celebrity profile.", "default", ["Basic", "It girl"]],
    ["Practical advice about relationships, children, homes or money.", "domestic", ["Momfluencer", "Dating-to-marry girl"]],
    ["Fashion history, interiors or a beautiful magazine I may mostly display.", "aesthetic", ["Performative reader girl", "Old money"]],
    ["Health research, habit books or an extremely specific symptom thread.", "wellness", ["Wellness girlie", "High-masking woman"]],
    ["Literary fiction with an unstable woman and no uplifting lesson.", "culture", ["Sad lit girl", "Joan Didion girl", "\"My Year of Rest and Relaxation\" girl"]],
    ["A 200-post argument, leaked screenshots or doctrine from a strange forum.", "online", ["FDS woman", "Femcel", "Terminally online girl"]],
  ]),
  question("Fandom", "What kind of fan are you?", [
    ["I enjoy popular things at a socially acceptable intensity.", "default", ["Basic", "Concert girlie"]],
    ["Family traditions and shared favorites matter more than lore.", "domestic", ["Disney adult", "Girl mom"]],
    ["The artist or character influences how I dress.", "aesthetic", ["Lana-coded", "Barbiecore", "Rockstar girlfriend"]],
    ["I follow athletes, wellness creators or people whose routines motivate me.", "wellness", ["WAG", "Wellness girlie"]],
    ["I know the canon, the fanon and which adaptation betrayed us.", "culture", ["Fangirl", "AO3", "K-pop stan"]],
    ["I can move a hashtag, defend a stranger and produce receipts by sunrise.", "online", ["Stan", "Swiftie", "K-pop stan"]],
  ]),
  question("Music", "You control the speakers for an hour. What comes on?", [
    ["Current pop, familiar throwbacks and songs people can actually sing.", "default", ["Basic", "Concert girlie"]],
    ["Comfort music everyone in the car can tolerate.", "domestic", ["Soccer mom", "Wine mom"]],
    ["The playlist matches the outfit and the room.", "aesthetic", ["It-girl DJ", "Indie sleaze girl", "Rockstar girlfriend"]],
    ["Workout music, walking music or something soothing enough to lower cortisol.", "wellness", ["Pilates princess", "Hot-girl-walk girl", "Cortisol girlie"]],
    ["Taylor, Lana, K-pop or a soundtrack tied to a fictional universe.", "culture", ["Swiftie", "Lana-coded", "K-pop stan"]],
    ["Audio that escaped TikTok, a fancam or something enjoyed partly as a meme.", "online", ["Stan", "E-girl", "Terminally online girl"]],
  ]),
  question("Home", "Your living space naturally drifts toward which look?", [
    ["Comfortable, recognizable and decorated mostly from normal stores.", "default", ["Basic", "Cheugy"]],
    ["Functional home base for people, pets and a frightening number of bags.", "domestic", ["Plant mom", "Dog mom", "Soccer mom"]],
    ["Cream, linen and objects arranged to look accidentally perfect.", "aesthetic", ["Vanilla girl", "Coastal grandmother", "Quiet luxury"]],
    ["A calm recovery zone with supplements visible somewhere.", "wellness", ["Wellness girlie", "Matcha girlie"]],
    ["Books, prints, records and evidence of several rotating interests.", "culture", ["Art hoe", "Cluttercore", "Hyperfixation girlie"]],
    ["Screens, merch and references that require explanatory lore.", "online", ["Gamer girl", "Hello Kitty girl", "Quirk Chungus"]],
  ]),
  question("Motherhood", "Whether or not you want children, which maternal stereotype is closest?", [
    ["Organized enough for carpools, snacks and one firm email to the school.", "default", ["Soccer mom", "PTA mom"]],
    ["Deeply involved; everyone will be fed, monitored and pushed toward success.", "domestic", ["Tiger mom", "Helicopter mom", "Boy mom"]],
    ["The nursery would be beautiful, coordinated and almost colorless.", "aesthetic", ["Sad beige mom", "Momfluencer"]],
    ["Organic food, natural products and extensive birth-plan research.", "wellness", ["Crunchy mom", "Almond mom"]],
    ["The children inherit my books, fandoms and extremely specific enthusiasm.", "culture", ["Disney adult", "Horse girl"]],
    ["No children, but strong opinions about every parenting discourse.", "online", ["Sanctimommy", "Terminally online girl"]],
  ]),
  question("Spirituality", "Which sentence is least wrong?", [
    ["I believe in luck and vibes without needing a system.", "default", ["Lucky girl", "Delulu"]],
    ["Ritual is about family, tradition and belonging.", "domestic", ["TradCath e-girl", "Tradwife"]],
    ["Candles and symbolism improve any room, belief optional.", "aesthetic", ["Whimsigoth", "Coquette"]],
    ["Birth charts, crystals, energy and manifestation are practical tools.", "wellness", ["Astrology girlie", "Crystal girlie", "Manifestation girl"]],
    ["Stories, art and psychology provide most of the meaning I need.", "culture", ["Joan Didion girl", "Fleabag girl"]],
    ["I have encountered at least one pipeline from wellness into conspiracy.", "online", ["Conspiritualist", "MAHA mom", "Divine feminine"]],
  ]),
  question("Politics", "Ignoring your vote, what kind of political content holds your attention?", [
    ["News when it matters; otherwise I would like everyone to calm down.", "default", ["Chill girl", "Basic"]],
    ["Schools, family policy, food and what reaches the household.", "domestic", ["MAHA mom", "Soccer mom", "Tradwife"]],
    ["Power, status and the visual language politicians use.", "aesthetic", ["Girlboss feminist", "Old money"]],
    ["Health institutions, ingredients, hormones and environmental exposure.", "wellness", ["Conspiritualist", "Crunchy mom", "MAHA mom"]],
    ["Essays, history and cultural criticism from people with good prose.", "culture", ["Joan Didion girl", "Dirtbag-left girl"]],
    ["Gender wars, reactionary aesthetics or a discourse cycle already eating itself.", "online", ["TERF", "\"Based\" trad girl", "TradCath e-girl"]],
  ]),
  question("Self-image", "Which private story about yourself sounds most familiar?", [
    ["I am likable, capable and more normal than this quiz allows.", "default", ["Girl's girl", "It girl"]],
    ["I am the reliable one; people would notice immediately if I stopped.", "domestic", ["Recovering people-pleaser", "Wifey"]],
    ["I can become the version of myself I picture.", "aesthetic", ["Bimbo (reclaimed)", "Baddie", "It girl"]],
    ["I am a project, but a lovingly optimized one.", "wellness", ["Looksmaxxer", "That girl", "Wellness girlie"]],
    ["My flaws would be compelling if the right writer handled them.", "culture", ["Female manipulator", "Lady Bird girl", "Fleabag girl"]],
    ["I am either uniquely doomed or one breakthrough away from everything working.", "online", ["Femcel", "Delulu", "Lucky girl"]],
  ]),
  question("Travel", "How do you travel when you get to choose?", [
    ["Popular destination, good hotel, restaurant reservations and friends.", "default", ["Travel girl", "Brunch girl"]],
    ["Detailed itinerary, practical luggage and responsibility for everyone else's documents.", "domestic", ["Soccer mom", "Girl mom"]],
    ["The place must have a visual identity worth dressing for.", "aesthetic", ["Tomato girl", "Coastal grandmother", "It girl"]],
    ["Walkable, restorative and compatible with the routine.", "wellness", ["Hot-girl-walk girl", "Wellness girlie"]],
    ["Museums, bookstores, filming locations or an event I care about.", "culture", ["Letterboxd girl", "BookTok girlie", "Concert girlie"]],
    ["The trip is content, lore or a decision made explicitly for the plot.", "online", ["\"For the plot\" dater", "Relationship-content girl", "Delulu"]],
  ]),
  question("Texting", "What does your phone reveal about how you communicate?", [
    ["Several active group chats and a healthy amount of gossip.", "default", ["Girl's girl", "Queen bee"]],
    ["Good-morning texts, check-ins and practical coordination.", "domestic", ["Good-morning texter", "Wifey"]],
    ["Carefully timed replies; mystery cannot maintain itself.", "aesthetic", ["Black cat girlfriend", "Cool girl"]],
    ["Voice notes while walking and reminders for every habit.", "wellness", ["Voice-note girl", "Hot-girl-walk girl"]],
    ["Long messages, references and emotional precision.", "culture", ["Fleabag girl", "AO3", "Anxious queen"]],
    ["Screenshots, story watching and forensic analysis of punctuation.", "online", ["Story watcher", "Group-chat dater", "\"If he wanted to, he would\" girl"]],
  ]),
  question("Food and drink", "Which order sounds most like you?", [
    ["Aperol spritz and whatever restaurant everyone saved this week.", "default", ["Brunch girl", "City girl", "Basic"]],
    ["Something comforting, enough for everyone and probably leftovers.", "domestic", ["Wine mom", "Tradwife"]],
    ["Tomatoes, good bread and a table that looks like a campaign shoot.", "aesthetic", ["Tomato girl", "Coastal grandmother"]],
    ["Matcha, protein and a meal selected partly for hormonal consequences.", "wellness", ["Matcha girlie", "Cycle syncer", "Cortisol girlie"]],
    ["Coffee next to a book, movie or annotation project.", "culture", ["Performative reader girl", "BookTok girlie"]],
    ["Raw milk, a viral supplement or dinner acquired through dating strategy.", "online", ["MAHA mom", "Foodie caller", "Sprinkle-sprinkle girl"]],
  ]),
  question("Obsession", "When an interest takes hold, what happens?", [
    ["I enjoy it normally and tell friends they should try it.", "default", ["Basic", "Concert girlie"]],
    ["It becomes useful: a household system, recipe or plan.", "domestic", ["Momfluencer", "Plant mom"]],
    ["It changes my clothes, room or visual identity.", "aesthetic", ["Barbiecore", "Dark academia", "Hello Kitty girl"]],
    ["I track it, optimize it and buy equipment.", "wellness", ["Wellness girlie", "Pilates princess"]],
    ["I learn the history, canon and every adjacent work.", "culture", ["Hyperfixation girlie", "Fangirl", "Horse girl"]],
    ["I join the discourse community and acquire enemies.", "online", ["Stan", "Terminally online girl", "NPC girl"]],
  ]),
  question("Reputation", "Which introduction from a close friend would embarrass you by being accurate?", [
    ["'She knows everyone, has a plan for tonight and will get the group home.'", "default", ["Girl's girl", "City girl", "Queen bee"]],
    ["'She has wife energy and emergency snacks.'", "domestic", ["Wifey", "Soccer mom", "Cool aunt"]],
    ["'Every photo looks editorial, including the accidental ones.'", "aesthetic", ["It girl", "Candid girl", "Baddie"]],
    ["'She has a protocol for this. Give her a minute.'", "wellness", ["Wellness girlie", "Cortisol girlie", "That girl"]],
    ["'She will recommend a book, film and fictional woman for your exact problem.'", "culture", ["Letterboxd girl", "BookTok girlie", "Fleabag girl"]],
    ["'She knows every discourse and should not be encouraged.'", "online", ["Terminally online girl", "Quirk Chungus", "Doomer girl"]],
  ]),
].map((quizQuestion, index) => {
  // Rotate answer positions so a pole cannot be selected by memorizing a number.
  const rotation = index % 6;
  return {
    ...quizQuestion,
    opts: [
      ...quizQuestion.opts.slice(rotation),
      ...quizQuestion.opts.slice(0, rotation),
    ],
  };
});
