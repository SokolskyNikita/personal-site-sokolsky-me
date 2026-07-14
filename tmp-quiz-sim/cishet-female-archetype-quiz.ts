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
  question("Saturday morning", "You have Saturday morning free. What do you usually do first?", [
    ["Nothing in particular. I sleep in and decide later.", "neutral", ["Chill girl", "Basic"]],
    ["Text friends and make a brunch or shopping plan.", "social", ["Brunch girl", "City girl", "Girl's girl", "Main-character girl"]],
    ["Do groceries, laundry or something another person is counting on.", "domestic", ["Soccer mom", "Cool aunt", "Wifey"]],
    ["See the person I am dating or check whether they have texted.", "romantic", ["Good-morning texter", "Anxious queen", "Girlfriend material"]],
    ["Get dressed properly and go somewhere I can take a good photo.", "polished", ["It girl", "Baddie", "Candid girl"]],
    ["Thrift, browse records or work on an outfit.", "alt", ["Downtown girl", "Indie sleaze girl", "Alt girl"]],
    ["Work out, walk or make the breakfast I planned.", "wellness", ["Pilates princess", "Hot-girl-walk girl", "That girl"]],
    ["Read, play a game or spend time on my current interest.", "culture", ["BookTok girlie", "Gamer girl", "Hyperfixation girlie"]],
    ["Stay in bed and scroll until I know what everyone is arguing about.", "online", ["Terminally online girl", "Doomer girl", "Girlblogger"]],
  ]),
  question("Friday night", "If nobody else gets a vote, how do you spend Friday night?", [
    ["At home with no plan. I may watch something and go to bed.", "neutral", ["Chill girl", "Basic"]],
    ["At dinner, a bar or a party with a group.", "social", ["City girl", "Sorority girl", "Hot mess"]],
    ["At home with my partner, relatives, children or pets.", "domestic", ["Dog mom", "Cat lady", "Wifey"]],
    ["On a date or talking to someone I want to date.", "romantic", ["Dating-to-marry girl", "Situationship girl", "Delulu"]],
    ["At a restaurant or event where I can dress up.", "polished", ["It girl", "Mob wife", "Baddie"]],
    ["At a small show, club night or dive bar.", "alt", ["Festival girl", "Indie sleaze girl", "Rockstar girlfriend"]],
    ["Eating early, doing skincare and protecting my sleep.", "wellness", ["Wellness girlie", "Clean girl", "That girl"]],
    ["At a concert, cinema, bookstore event or fandom meetup.", "culture", ["Concert girlie", "Fangirl", "Letterboxd girl"]],
    ["Gaming, posting or watching videos alone.", "online", ["Gamer girl", "E-girl", "Terminally online girl"]],
  ]),
  question("Everyday clothes", "What do you wear on an ordinary day when you are not dressing for work?", [
    ["Jeans or leggings and a plain top. I do not think about it much.", "neutral", ["Basic", "Chill girl"]],
    ["A current, recognizable outfit that works for lunch or drinks.", "social", ["City girl", "Sorority girl", "VSCO girl", "Jersey girl", "ABG"]],
    ["Something washable, comfortable and easy to move in.", "domestic", ["Soccer mom", "Dog mom", "Cool aunt"]],
    ["Something soft, fitted or date-ready.", "romantic", ["Soft girl", "Coquette", "Girlfriend material", "Balletcore", "Twee"]],
    ["A coordinated outfit with polished hair, shoes and accessories.", "polished", ["Clean girl", "Old money", "Office siren", "Sloane Ranger"]],
    ["Black, vintage, strange or tied to a subculture.", "alt", ["Goth GF", "Y2K girl", "Weird girl"]],
    ["Matching activewear or clothes I can exercise in.", "wellness", ["Pilates princess", "Hot-girl-walk girl", "Wellness girlie"]],
    ["A tote, merch or something linked to a book, band or character.", "culture", ["Art hoe", "Fangirl", "Hello Kitty girl"]],
    ["Whatever the latest online aesthetic calls for.", "online", ["E-girl", "Trad girl", "Quirk Chungus"]],
  ]),
  question("Beauty routine", "How much time do you spend on hair, makeup and skincare on a normal weekday?", [
    ["Almost none.", "neutral", ["Chill girl", "Basic"]],
    ["Ten to twenty minutes. I use familiar products and stop there.", "social", ["Basic", "Becky", "Valley girl"]],
    ["As little as possible because other tasks come first.", "domestic", ["Soccer mom", "Boy mom", "Dog mom"]],
    ["Enough to look good for a partner or a date.", "romantic", ["Girlfriend material", "Princess-treatment girl", "Black cat girlfriend"]],
    ["A lot. The finished look matters to me.", "polished", ["Baddie", "Clean girl", "Bimbo (reclaimed)", "Stacy"]],
    ["A lot, but I use makeup or hair to look unusual rather than polished.", "alt", ["E-girl", "Goth GF", "Y2K girl"]],
    ["I research products, ingredients, treatments or facial structure.", "wellness", ["Looksmaxxer", "GLP-1 girlie", "Cortisol girlie"]],
    ["I copy looks from a character, artist or earlier decade.", "culture", ["Lana-coded", "Jennifer's Body girl", "Barbiecore"]],
    ["My look is partly for posts, streams or paid content.", "online", ["OnlyFans girl", "E-thot", "Instagram-in-bio girl"]],
  ]),
  question("Health habits", "Which statement best describes your current health routine?", [
    ["I have no routine beyond basic meals, sleep and appointments.", "neutral", ["Basic", "Chill girl"]],
    ["I exercise or eat well when friends make it social.", "social", ["That girl", "City girl"]],
    ["I plan meals and appointments around the needs of my household.", "domestic", ["Soccer mom", "Crunchy mom", "Almond mom"]],
    ["A partner and I share meals, walks or workouts.", "romantic", ["Girlfriend material", "Wifey"]],
    ["I care most about how the routine affects my skin, weight or appearance.", "polished", ["Looksmaxxer", "GLP-1 girlie", "BBL girl"]],
    ["I dislike wellness culture and do my own thing.", "alt", ["Brat", "Dirtbag-left girl"]],
    ["I track workouts, food, sleep, hormones or supplements.", "wellness", ["Wellness girlie", "Cycle syncer", "Cortisol girlie"]],
    ["I research one condition or habit in great depth.", "culture", ["High-masking woman", "Hyperfixation girlie"]],
    ["I follow online health theories that doctors or friends question.", "online", ["MAHA mom", "Conspiritualist", "Divine feminine"]],
  ]),
  question("Work", "What do you want most from paid work?", [
    ["I am not working, or I only want steady pay and clear hours.", "neutral", ["Corporate girlie", "Chill girl"]],
    ["People, status and a reason to be out in the world.", "social", ["Girlboss", "City girl", "Queen bee"]],
    ["Enough security and flexibility to care for a household.", "domestic", ["Tradwife", "Stay-at-home girlfriend", "Dependa"]],
    ["A schedule that leaves room for my relationship and future family.", "romantic", ["Dating-to-marry girl", "Wifey"]],
    ["A polished career and the money to look the part.", "polished", ["Girlboss", "Office siren", "Old money"]],
    ["Creative work with loose rules, even if the pay is uneven.", "alt", ["Art hoe", "It-girl DJ", "Girlblogger"]],
    ["Low stress and enough time for sleep, exercise and food.", "wellness", ["Wellness girlie", "Pilates princess"]],
    ["Work that uses my subject knowledge or lets me make things.", "culture", ["Hyperfixation girlie", "Performative reader girl", "Gamer girl"]],
    ["My own audience, brand, course or online business.", "online", ["Boss babe", "High-value woman coach", "Level-up girl"]],
  ]),
  question("Extra money", "You receive $500 that you do not need for bills. What are you most likely to do with it?", [
    ["Save it or leave it in my account.", "neutral", ["Basic", "Corporate girlie"]],
    ["Use it for dinners, drinks or a weekend with friends.", "social", ["City girl", "Brunch girl", "Hot mess"]],
    ["Buy something for my home, family, children or pets.", "domestic", ["Dog mom", "Plant mom", "Soccer mom"]],
    ["Spend it on a date, gift or trip with my partner.", "romantic", ["Princess-treatment girl", "Wifey", "Travel girl"]],
    ["Buy clothes, beauty work or one expensive accessory.", "polished", ["Baddie", "Old money", "Trophy wife"]],
    ["Buy vintage clothes, records, tattoos or show tickets.", "alt", ["Indie sleaze girl", "Rockstar girlfriend", "Downtown girl"]],
    ["Pay for classes, equipment, supplements or a treatment.", "wellness", ["Pilates princess", "Wellness girlie", "Looksmaxxer"]],
    ["Buy books, games, hobby supplies or event tickets.", "culture", ["BookTok girlie", "Gamer girl", "Concert girlie"]],
    ["Spend it on content, a side hustle or advice about getting richer.", "online", ["Sprinkle-sprinkle girl", "Sugar baby", "Boss babe", "High-value woman"]],
  ]),
  question("Dating apps", "If you were single and using a dating app, how would you use it?", [
    ["I would not use one or would delete it quickly.", "neutral", ["\"Never on here\" girl", "Chill girl"]],
    ["I would match casually and see who seems fun in person.", "social", ["Travel girl", "Brunch girl", "\"Make me laugh\" girl"]],
    ["I would screen for someone who wants marriage and family.", "domestic", ["Dating-to-marry girl", "Wife material", "Checklist dater"]],
    ["I would message often and get attached before meeting.", "romantic", ["Pen-pal dater", "Anxious queen", "Delulu"]],
    ["I would use my best photos and expect the other person to impress me.", "polished", ["Princess-treatment girl", "Six-foot-minimum girl", "\"No broke boys\" girl", "\"Men are intimidated by me\" girl", "MILF", "Cougar"]],
    ["I would use odd photos or jokes to filter out people who do not get me.", "alt", ["Not-like-other-girls girl", "Goth GF", "Weird girl", "Male-best-friend girl"]],
    ["I would look for someone who shares my routines and habits.", "wellness", ["Love-language girl", "Granola girl", "Astrology screener"]],
    ["I would screen by books, games, music or fandom.", "culture", ["Letterboxd girl", "Gamer girl", "Fangirl"]],
    ["I would treat matches as data, content, followers or leverage.", "online", ["Match collector", "Follower farmer", "Group-chat dater"]],
  ]),
  question("Dating pattern", "Which pattern have you followed most often while dating?", [
    ["I have little dating experience or no repeated pattern.", "neutral", ["Chill girl", "Basic"]],
    ["I keep several options open until one relationship becomes serious.", "social", ["Roster girl", "Bencher", "Cushioner", "Roacher", "Monkey-brancher", "Side chick"]],
    ["I move toward sharing a home, money or daily tasks very quickly.", "domestic", ["Hobosexual", "Stay-at-home girlfriend", "Wifey"]],
    ["I become intense quickly and talk about a future together.", "romantic", ["Love bomber", "Future faker", "Overly attached girlfriend"]],
    ["I hide parts of my life or use photos that flatter me too much.", "polished", ["Pocketer", "Stasher", "Kittenfisher"]],
    ["I disappear and return later, or I date in an on-and-off cycle.", "alt", ["Ghoster", "Zombie", "Submariner"]],
    ["I screen people with a long list of habits and requirements.", "wellness", ["Checklist dater", "Astrology screener", "Six-foot-minimum girl"]],
    ["I message for weeks and build a bond before meeting.", "culture", ["Pen-pal dater", "Voice-note girl", "Delulu"]],
    ["I give small signs of interest to keep someone waiting.", "online", ["Breadcrumber", "Paperclipper", "Orbiter"]],
  ]),
  question("Conflict", "A close friend tells you that you hurt her. What do you do first?", [
    ["Ask what happened, apologize if I agree and keep the talk short.", "neutral", ["Chill girl", "Girl's girl"]],
    ["Call another friend before I reply.", "social", ["Group-chat dater", "Queen bee", "Drama queen", "Karen", "Mean girl", "Alpha female"]],
    ["Ask what practical change would fix the problem.", "domestic", ["Wifey", "Recovering people-pleaser"]],
    ["Worry that the friendship is ending and send a long reply.", "romantic", ["Anxious queen", "Overly attached girlfriend"]],
    ["Stay calm and avoid showing that I am upset.", "polished", ["Cool girl", "Black cat girlfriend", "Queen bee"]],
    ["Get angry, withdraw or write something I may regret.", "alt", ["Brat", "Sad girl", "Female manipulator"]],
    ["Take a walk or wait until my body settles before replying.", "wellness", ["Healing girlie", "Hot-girl-walk girl"]],
    ["Think through the exact words and replay the conversation.", "culture", ["High-masking woman", "Fleabag girl"]],
    ["Use therapy terms, attachment labels or posted screenshots to explain it.", "online", ["Therapy-speak girl", "Attachment-style diagnostician", "Terminally online girl"]],
  ]),
  question("Close friends", "What do you do most often with your closest female friends?", [
    ["I do not have close female friends, or we only talk now and then.", "neutral", ["Chill girl", "Basic"]],
    ["We go out, gossip and organize group plans.", "social", ["Girl's girl", "Queen bee", "Brunch girl"]],
    ["We help with children, pets, errands, meals or moving.", "domestic", ["Cool aunt", "Girl mom", "Dog mom"]],
    ["We discuss dating and relationships in detail.", "romantic", ["Group-chat dater", "Anxious queen", "\"If he wanted to, he would\" girl"]],
    ["We shop, get ready together and take photos.", "polished", ["It girl", "Baddie", "Candid girl"]],
    ["We go to shows, thrift stores or late-night bars.", "alt", ["Indie sleaze girl", "Downtown girl", "Festival girl"]],
    ["We take classes, walk or share health habits.", "wellness", ["Pilates princess", "Hot-girl-walk girl", "Matcha girlie"]],
    ["We trade books, games, music and fandom talk.", "culture", ["Fangirl", "BookTok girlie", "Gamer girl"]],
    ["Most of our friendship happens through posts, screenshots and voice notes.", "online", ["Voice-note girl", "Story watcher", "Terminally online girl"]],
  ]),
  question("Social feed", "What takes up the largest share of your main social-media feed?", [
    ["People I know and a mix of ordinary popular posts.", "neutral", ["Basic", "NPC girl"]],
    ["Friends, parties, restaurants, celebrities and gossip.", "social", ["City girl", "Valley girl", "It girl"]],
    ["Homes, children, pets, food and local issues.", "domestic", ["Momfluencer", "Dog mom", "Sad beige mom"]],
    ["Dating advice, relationship stories and attractive couples.", "romantic", ["Relationship-content girl", "Dating-to-marry girl", "Delulu"]],
    ["Fashion, beauty, interiors and luxury.", "polished", ["Clean girl", "Old money", "Baddie"]],
    ["Alternative fashion, nightlife, tattoos and old music.", "alt", ["Goth GF", "Indie sleaze girl", "Y2K girl"]],
    ["Workouts, food, hormones, sleep and supplements.", "wellness", ["Cortisol girlie", "Cycle syncer", "Wellness girlie"]],
    ["Books, films, games, fan edits and niche interests.", "culture", ["Girlblogger", "AO3", "Weeb girl"]],
    ["Political fights, dating wars, wojaks and posts made for one small subculture.", "online", ["Terminally online girl", "Femcel", "Trad girl", "Roastie", "Foid", "THOT"]],
  ]),
  question("Reading and watching", "What do you choose most often when you have two hours alone?", [
    ["A familiar show, a popular movie or nothing at all.", "neutral", ["Basic", "Chill girl"]],
    ["A reality show, celebrity interview or comedy friends are discussing.", "social", ["Valley girl", "Drama queen", "City girl"]],
    ["A home, food, parenting or relationship program.", "domestic", ["Momfluencer", "Tradwife", "Wine mom"]],
    ["A romance, dating show or story about a difficult couple.", "romantic", ["Delulu", "Situationship girl", "Fleabag girl", "Girl written by a man", "Golden retriever girlfriend"]],
    ["Fashion coverage, a makeover or a glossy period drama.", "polished", ["Old money", "Baddie", "Coquette"]],
    ["A cult film, music documentary or messy drama.", "alt", ["Jennifer's Body girl", "Effy Stonem girl", "Lana-coded", "Amy Dunne girl", "Cassie Howard girl", "Lady Bird girl"]],
    ["A health podcast, workout video or long symptom search.", "wellness", ["Wellness girlie", "Cortisol girlie", "High-masking woman"]],
    ["A novel, art film, game or deep dive into a subject.", "culture", ["Sad lit girl", "Letterboxd girl", "Hyperfixation girlie", "\"My Year of Rest and Relaxation\" girl"]],
    ["A long video about internet drama or political subcultures.", "online", ["Terminally online girl", "Girlblogger", "Doomer girl"]],
  ]),
  question("Being a fan", "When you really like an artist, team, series or public figure, what do you do?", [
    ["I enjoy the work and do nothing else.", "neutral", ["Basic", "Chill girl"]],
    ["I go with friends when there is a concert, game or event.", "social", ["Concert girlie", "WAG", "Puck bunny"]],
    ["I make it a family tradition or buy things for the household.", "domestic", ["Disney adult", "Girl mom"]],
    ["I develop a crush and follow the person's relationships.", "romantic", ["Groupie", "Rockstar girlfriend", "WAG", "Dommy mommy"]],
    ["I copy the clothes, hair or makeup.", "polished", ["Lana-coded", "Barbiecore", "It girl"]],
    ["I seek out the obscure work and dress for the scene.", "alt", ["Indie sleaze girl", "Rockstar girlfriend", "It-girl DJ"]],
    ["I follow athletes or creators whose routines I can copy.", "wellness", ["WAG", "Wellness girlie", "That girl"]],
    ["I learn the canon, read fan work and discuss details.", "culture", ["Fangirl", "AO3", "K-pop stan"]],
    ["I defend them online, collect proof and join campaigns.", "online", ["Stan", "Swiftie", "K-pop stan"]],
  ]),
  question("Night out", "When you go out at night, which setting do you choose most often?", [
    ["I rarely go out at night.", "neutral", ["Chill girl", "Basic"]],
    ["A busy bar, birthday party or popular club.", "social", ["City girl", "Hot mess", "Sorority girl", "Florida woman", "Essex girl", "Chavette", "Roadman gyaldem", "Eshay girl", "Hot Cheeto girl", "Ratchet"]],
    ["Dinner near home with relatives or a partner.", "domestic", ["Wine mom", "Wifey", "Soccer mom"]],
    ["A date where we can talk.", "romantic", ["Dating-to-marry girl", "Girlfriend material"]],
    ["A restaurant, hotel bar or event with a dress code.", "polished", ["It girl", "Mob wife", "Trophy wife"]],
    ["A dive bar, warehouse party, DJ set or small show.", "alt", ["Raver girl", "It-girl DJ", "Indie sleaze girl"]],
    ["A class, sauna or early dinner because I want to sleep on time.", "wellness", ["Pilates princess", "Wellness girlie"]],
    ["A concert, screening, reading or game night.", "culture", ["Concert girlie", "Letterboxd girl", "Gamer girl"]],
    ["I stay home and follow the night through other people's posts.", "online", ["Story watcher", "Terminally online girl", "Doomer girl"]],
  ]),
  question("Home", "Which description is closest to your current living space?", [
    ["Mostly functional. I bought what I needed and stopped.", "neutral", ["Basic", "Chill girl"]],
    ["Ready for friends to drop by, with drinks and extra seating.", "social", ["City girl", "Brunch girl"]],
    ["Set up around cooking, children, pets, plants or household routines.", "domestic", ["Plant mom", "Dog mom", "Soccer mom"]],
    ["Shared with a partner or arranged with a future partner in mind.", "romantic", ["Stay-at-home girlfriend", "Wifey", "Tradwife"]],
    ["Coordinated, clean and chosen to photograph well.", "polished", ["Vanilla girl", "Sad beige mom", "Quiet luxury", "Coastal grandmother", "Cottagecore", "Light academia"]],
    ["Full of vintage pieces, dark colors or deliberate clutter.", "alt", ["Cluttercore", "Dark academia", "Whimsigoth", "Cheugy"]],
    ["Calm and uncluttered, with workout or wellness items in sight.", "wellness", ["Clean girl", "Wellness girlie", "Matcha girlie"]],
    ["Full of books, art, games, collections or hobby materials.", "culture", ["Art hoe", "Hyperfixation girlie", "Hello Kitty girl"]],
    ["Full of screens, merch or things that make sense only online.", "online", ["Gamer girl", "E-girl", "Quirk Chungus"]],
  ]),
  question("Caregiving", "When another person depends on you, what are you most likely to do?", [
    ["Help with the immediate problem, then return to my own plans.", "neutral", ["Chill girl", "Cool aunt"]],
    ["Bring in other people and make sure nobody is left alone.", "social", ["Girl's girl", "Cool aunt"]],
    ["Take charge of meals, schedules, transport and follow-up.", "domestic", ["Soccer mom", "Tiger mom", "Wifey", "Dance mom", "Pageant mom", "Sports mom"]],
    ["Check in often and need reassurance that they are all right.", "romantic", ["Overly attached girlfriend", "Anxious queen", "Good-morning texter"]],
    ["Handle it quietly and keep the messy parts private.", "polished", ["Cool girl", "Black cat girlfriend"]],
    ["Offer blunt advice and refuse to hover.", "alt", ["Brat", "Not-like-other-girls girl"]],
    ["Research the problem and set up a routine.", "wellness", ["Crunchy mom", "Cycle syncer", "Wellness girlie"]],
    ["Learn everything about the problem before I act.", "culture", ["Hyperfixation girlie", "High-masking woman"]],
    ["Look for advice online and compare several labels or explanations.", "online", ["Therapy-speak girl", "Attachment-style diagnostician", "Sanctimommy"]],
  ]),
  question("Belief", "Which statement is closest to what you actually believe?", [
    ["I am not religious or spiritual.", "neutral", ["Basic", "Chill girl"]],
    ["I follow the customs I grew up with without thinking about them much.", "social", ["Southern belle", "Christian girl autumn"]],
    ["Religion is tied to family, marriage and how a home should run.", "domestic", ["Tradwife", "TradCath e-girl"]],
    ["I use astrology or compatibility ideas when I date.", "romantic", ["Astrology screener", "Love-language girl"]],
    ["I like religious or mystical symbols mainly for their look.", "polished", ["Coquette", "Whimsigoth"]],
    ["I am drawn to witchcraft, goth ritual or older countercultures.", "alt", ["WitchTok woman", "Whimsigoth", "Goth GF"]],
    ["I use astrology, crystals, manifestation or energy work in daily life.", "wellness", ["Astrology girlie", "Crystal girlie", "Reiki practitioner", "Manifestation girl", "Lucky girl", "Empath"]],
    ["I look for meaning in books, art, psychology or philosophy.", "culture", ["Joan Didion girl", "Fleabag girl", "Art hoe"]],
    ["My beliefs mix spirituality with online health or political claims.", "online", ["Conspiritualist", "MAHA mom", "Divine feminine"]],
  ]),
  question("Politics", "Which political material do you read or watch most often?", [
    ["Almost none.", "neutral", ["Chill girl", "Basic"]],
    ["Mainstream news and posts shared by people I know.", "social", ["Resistance lib wine mom", "Girlboss"]],
    ["Schools, taxes, food, safety and policies that affect a household.", "domestic", ["MAHA mom", "Soccer mom", "Tradwife"]],
    ["Arguments about sex, marriage and what men or women owe each other.", "romantic", ["FDS woman", "High-value woman coach", "TERF"]],
    ["Women in power, workplace equality and respectable liberal politics.", "polished", ["Girlboss", "Resistance lib wine mom"]],
    ["Left-wing criticism, anti-establishment comedy or street politics.", "alt", ["Dirtbag-left girl", "Brat"]],
    ["Food regulation, hormones, medicine and environmental exposure.", "wellness", ["MAHA mom", "Conspiritualist", "Crunchy mom"]],
    ["Long essays, history and cultural criticism.", "culture", ["Joan Didion girl", "Girlblogger", "Performative reader girl"]],
    ["Gender wars, reactionary accounts or constant political fighting.", "online", ["\"Based\" trad girl", "Trad girl", "Terminally online girl"]],
  ]),
  question("Advice", "What do friends ask you for help with most often?", [
    ["Nothing in particular.", "neutral", ["Chill girl", "Basic"]],
    ["Plans, introductions and what is happening this weekend.", "social", ["Girl's girl", "City girl", "Queen bee"]],
    ["Meals, children, pets, errands or keeping a household running.", "domestic", ["Soccer mom", "Cool aunt", "Dog mom"]],
    ["Texts, dates, breakups and whether someone is serious.", "romantic", ["Group-chat dater", "\"If he wanted to, he would\" girl", "Dating-to-marry girl"]],
    ["Clothes, makeup, photos and where to buy something.", "polished", ["It girl", "Baddie", "Clean girl"]],
    ["Music, nightlife and how to make an outfit less boring.", "alt", ["It-girl DJ", "Indie sleaze girl", "Alt girl"]],
    ["Workouts, food, sleep, skincare or supplements.", "wellness", ["Wellness girlie", "Cortisol girlie", "Pilates princess", "Cold-plunge girlie"]],
    ["Books, films, games or a subject I know too much about.", "culture", ["Letterboxd girl", "Hyperfixation girlie", "Gamer girl"]],
    ["Finding old posts, reading screenshots and working out what someone meant.", "online", ["Story watcher", "Terminally online girl", "Attachment-style diagnostician"]],
  ]),
  question("Travel", "When you plan a trip for yourself, what matters most?", [
    ["Price, ease and a comfortable place to sleep.", "neutral", ["Basic", "Chill girl"]],
    ["Going with friends and having restaurants or bars nearby.", "social", ["Travel girl", "City girl", "Brunch girl"]],
    ["A plan that works for my partner, relatives, children or pets.", "domestic", ["Soccer mom", "Girl mom", "Dog mom"]],
    ["Time alone with a partner and a room that feels special.", "romantic", ["Princess-treatment girl", "Girlfriend material", "Soft-launcher"]],
    ["A beautiful hotel, good clothes and places I want in photos.", "polished", ["It girl", "Old money", "Candid girl"]],
    ["Nightlife, vintage shops and places outside the standard itinerary.", "alt", ["Downtown girl", "Indie sleaze girl", "Festival girl"]],
    ["Walkability, sleep, food and access to exercise.", "wellness", ["Hot-girl-walk girl", "Wellness girlie"]],
    ["Museums, bookstores, music, history or a specific event.", "culture", ["Letterboxd girl", "BookTok girlie", "Concert girlie"]],
    ["A story I can post or a reckless choice I can call 'for the plot.'", "online", ["\"For the plot\" dater", "Relationship-content girl", "Delulu"]],
  ]),
  question("Texting", "Which pattern appears most often in your text messages?", [
    ["Short replies when there is something practical to say.", "neutral", ["Chill girl", "Basic"]],
    ["Several group chats with jokes, gossip and plans.", "social", ["Girl's girl", "Queen bee", "Brunch girl"]],
    ["Reminders, check-ins, lists and family logistics.", "domestic", ["Soccer mom", "Girl mom", "Wifey"]],
    ["Good-morning texts, long updates and frequent reassurance.", "romantic", ["Good-morning texter", "Anxious queen", "Overly attached girlfriend"]],
    ["Careful replies sent after a deliberate wait.", "polished", ["Black cat girlfriend", "Cool girl", "Femme fatale"]],
    ["Memes, songs and messages sent at strange hours.", "alt", ["Orange cat girlfriend", "Manic pixie dream girl"]],
    ["Voice notes sent while walking or moving between tasks.", "wellness", ["Voice-note girl", "Hot-girl-walk girl"]],
    ["Long explanations, quotations and links.", "culture", ["Fleabag girl", "Girlblogger", "Hyperfixation girlie"]],
    ["Screenshots, story views and analysis of punctuation.", "online", ["Story watcher", "Group-chat dater", "Attachment-style diagnostician"]],
  ]),
  question("Food", "How do you decide what to eat on a normal day?", [
    ["I eat what is easy and available.", "neutral", ["Basic", "Chill girl"]],
    ["I choose a place friends want to try.", "social", ["Brunch girl", "City girl", "Foodie caller"]],
    ["I cook or order something that works for everyone at home.", "domestic", ["Tradwife", "Wine mom", "Soccer mom"]],
    ["I choose somewhere that works for a date.", "romantic", ["Foodie caller", "Princess-treatment girl"]],
    ["I care about the restaurant, plating and how the table looks.", "polished", ["Tomato girl", "Old money", "It girl"]],
    ["I like late-night food, unusual places or whatever fits the night.", "alt", ["Hot mess", "Indie sleaze girl"]],
    ["I choose by protein, ingredients, calories, hormones or digestion.", "wellness", ["Almond mom", "Cycle syncer", "Cortisol girlie"]],
    ["I cook from a book or get interested in one cuisine for weeks.", "culture", ["Hyperfixation girlie", "BookTok girlie"]],
    ["I follow a diet or ingredient rule I found online.", "online", ["MAHA mom", "Crunchy mom", "Conspiritualist"]],
  ]),
  question("Interests", "What happens when you become interested in something new?", [
    ["I try it once or twice. Most interests stay casual.", "neutral", ["Basic", "Chill girl"]],
    ["I invite friends and turn it into a group plan.", "social", ["Girl's girl", "Concert girlie"]],
    ["I find a practical use for it at home.", "domestic", ["Plant mom", "Momfluencer", "Dog mom"]],
    ["I share it with the person I am dating.", "romantic", ["Girlfriend material", "Relationship-content girl"]],
    ["I change my clothes, room or photos to match it.", "polished", ["Barbiecore", "Coquette", "That girl"]],
    ["I find its stranger, older or less popular version.", "alt", ["Weird girl", "Dark academia", "Indie sleaze girl"]],
    ["I buy equipment and track whether I am improving.", "wellness", ["Wellness girlie", "Pilates princess", "Looksmaxxer"]],
    ["I read everything, learn the terms and talk about it for hours.", "culture", ["Hyperfixation girlie", "AuDHD girlie", "Horse girl"]],
    ["I join its online community and get involved in arguments.", "online", ["Stan", "Terminally online girl", "Quirk Chungus"]],
  ]),
  question("Reputation", "Which sentence would your closest friend be most likely to use about you?", [
    ["'She is easygoing and does not make everything her identity.'", "neutral", ["Chill girl", "Basic"]],
    ["'She knows everyone and can get a group out of the house.'", "social", ["Girl's girl", "City girl", "Queen bee"]],
    ["'She has snacks, a charger and a plan for getting everyone home.'", "domestic", ["Soccer mom", "Cool aunt", "Wifey"]],
    ["'She can turn one text from a man into a two-hour meeting.'", "romantic", ["Group-chat dater", "Anxious queen", "Delulu"]],
    ["'She is ready for a photo even when nobody said there would be one.'", "polished", ["It girl", "Candid girl", "Baddie"]],
    ["'She will take you somewhere loud, dark and not on Google Maps.'", "alt", ["Indie sleaze girl", "Raver girl", "Downtown girl"]],
    ["'She has a routine for this and will send you the link.'", "wellness", ["Wellness girlie", "That girl", "Cortisol girlie"]],
    ["'She knows far too much about one book, game, film or horse.'", "culture", ["Hyperfixation girlie", "Gamer girl", "Horse girl"]],
    ["'She has already seen the post and knows why everyone is angry.'", "online", ["Terminally online girl", "Girlblogger", "Doomer girl"]],
  ]),
].map((quizQuestion, index) => {
  // Rotate answer positions so a profile cannot be selected by memorizing a number.
  const rotation = index % quizQuestion.opts.length;
  return {
    ...quizQuestion,
    opts: [
      ...quizQuestion.opts.slice(rotation),
      ...quizQuestion.opts.slice(0, rotation),
    ],
  };
});
