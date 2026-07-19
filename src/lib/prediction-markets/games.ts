import spainArgentinaHistory from "../../data/spain-argentina-kalshi-history-seed.json";

export type PredictionHistoryPoint = {
  at: string;
  spain: number;
  argentina: number;
};

export type PredictionTeamConfig = {
  name: string;
  abbreviation: string;
  color: string;
  softColor: string;
  darkColor: string;
  darkSoftColor: string;
  flagCss: string;
  kalshiTicker: string;
  kalshiLabel: string;
  polymarketLabel: string;
  manifoldLabel: string;
};

export type PredictionGameArchive = {
  endedAtISO: string;
  finalLabel: string;
  finalScore: {
    a: number;
    b: number;
  };
};

export type PredictionGameConfig = {
  slug: string;
  competition: string;
  pageTitle: string;
  description: string;
  kickoffISO: string;
  pollingWindowHours: number;
  refreshIntervalMs: number;
  teams: {
    a: PredictionTeamConfig;
    b: PredictionTeamConfig;
  };
  weights: {
    realMoney: number;
    playMoney: number;
  };
  providers: {
    kalshi: {
      seriesTicker: string;
      eventTicker: string;
      href: string;
    };
    polymarket: {
      eventSlug: string;
      href: string;
    };
    manifold: {
      marketId: string;
      href: string;
    };
  };
  espn: {
    eventId: string;
    league: string;
  };
  chartBreaks: ReadonlyArray<{
    startISO: string;
    endISO: string;
  }>;
  staticHistory: PredictionHistoryPoint[];
  archive?: PredictionGameArchive;
};

export const spainArgentina2026: PredictionGameConfig = {
  slug: "spain-argentina-2026",
  competition: "World Cup final",
  pageTitle: "Spain 1–0 Argentina · final prediction odds",
  description:
    "Archived prediction-market probabilities from Spain's 1–0 extra-time win over Argentina in the 2026 World Cup final.",
  kickoffISO: "2026-07-19T19:00:00Z",
  pollingWindowHours: 4,
  refreshIntervalMs: 5_000,
  teams: {
    a: {
      name: "Spain",
      abbreviation: "ESP",
      color: "oklch(46% 0.18 25)",
      softColor: "oklch(90% 0.045 30)",
      darkColor: "oklch(66% 0.17 27)",
      darkSoftColor: "oklch(30% 0.05 28)",
      flagCss:
        "linear-gradient(#a51f28 0 25%, #f4c644 25% 75%, #a51f28 75%)",
      kalshiTicker: "KXMENWORLDCUP-26-ES",
      kalshiLabel: "spain",
      polymarketLabel: "spain",
      manifoldLabel: "spain",
    },
    b: {
      name: "Argentina",
      abbreviation: "ARG",
      color: "oklch(58% 0.1 225)",
      softColor: "oklch(91% 0.035 225)",
      darkColor: "oklch(72% 0.1 225)",
      darkSoftColor: "oklch(30% 0.035 228)",
      flagCss:
        "linear-gradient(#70b7db 0 33%, #f8f6ec 33% 66%, #70b7db 66%)",
      kalshiTicker: "KXMENWORLDCUP-26-AR",
      kalshiLabel: "argentina",
      polymarketLabel: "argentina",
      manifoldLabel: "argentina",
    },
  },
  weights: {
    realMoney: 5,
    playMoney: 1,
  },
  providers: {
    kalshi: {
      seriesTicker: "KXMENWORLDCUP",
      eventTicker: "KXMENWORLDCUP-26",
      href:
        "https://kalshi.com/markets/kxmenworldcup/mens-world-cup-winner/kxmenworldcup-26",
    },
    polymarket: {
      eventSlug: "world-cup-winner",
      href: "https://polymarket.com/event/world-cup-winner",
    },
    manifold: {
      marketId: "20ACq555CE",
      href:
        "https://manifold.markets/ManifoldSports/esp-vs-arg-world-cup-26",
    },
  },
  espn: {
    eventId: "760517",
    league: "fifa.world",
  },
  chartBreaks: [
    {
      startISO: "2026-07-19T19:55:00Z",
      endISO: "2026-07-19T20:23:00Z",
    },
    {
      startISO: "2026-07-19T21:15:00Z",
      endISO: "2026-07-19T21:23:00Z",
    },
    {
      startISO: "2026-07-19T21:41:00Z",
      endISO: "2026-07-19T21:43:00Z",
    },
  ],
  staticHistory:
    spainArgentinaHistory as PredictionGameConfig["staticHistory"],
  archive: {
    endedAtISO: "2026-07-19T22:05:00.000Z",
    finalLabel: "After extra time",
    finalScore: {
      a: 1,
      b: 0,
    },
  },
};

export const predictionGames: readonly PredictionGameConfig[] = [
  spainArgentina2026,
];

export function getPredictionGame(
  slug: string,
): PredictionGameConfig | undefined {
  return predictionGames.find((game) => game.slug === slug);
}

export function predictionGameApiPath(game: PredictionGameConfig): string {
  return `/api/prediction-markets/${game.slug}`;
}
