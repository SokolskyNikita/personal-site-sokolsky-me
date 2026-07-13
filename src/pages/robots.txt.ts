import type { APIRoute } from "astro";

export const prerender = true;

/** Known AI search and training crawlers — explicitly allowed. */
const AI_BOTS = [
  // OpenAI
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "OAI-AdsBot",
  // Anthropic
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "Claude-Web",
  "anthropic-ai",
  // Google AI
  "Google-Extended",
  "Google-CloudVertexBot",
  "Google-Agent",
  "GoogleAgent-Mariner",
  "GoogleAgent-URLContext",
  "Google-NotebookLM",
  "Gemini-Deep-Research",
  "Google-Firebase",
  "GoogleOther",
  // Apple
  "Applebot-Extended",
  // Common Crawl
  "CCBot",
  // Meta
  "FacebookBot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "meta-webindexer",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Amazon
  "Amazonbot",
  "Amzn-SearchBot",
  "bedrockbot",
  // ByteDance / TikTok
  "Bytespider",
  "TikTokSpider",
  // Cohere
  "cohere-ai",
  "cohere-training-data-crawler",
  // Mistral
  "MistralAI-User",
  // DeepSeek
  "DeepSeekBot",
  // DuckDuckGo AI
  "DuckAssistBot",
  // Allen AI
  "AI2Bot",
  "AI2Bot-Dolma",
  "Ai2Bot-Dolma",
  // Others (search / training / RAG)
  "YouBot",
  "Diffbot",
  "omgili",
  "omgilibot",
  "Webzio-Extended",
  "webzio-extended",
  "ImagesiftBot",
  "PetalBot",
  "Timpibot",
  "PanguBot",
  "ICC-Crawler",
  "img2dataset",
  "FriendlyCrawler",
  "VelenPublicWebCrawler",
  "SBIntuitionsBot",
  "YandexAdditional",
  "YandexAdditionalBot",
  "Kangaroo Bot",
  "AddSearchBot",
  "AwarioBot",
  "AwarioSmartBot",
  "bigsur.ai",
  "Brightbot",
  "Crawlspace",
  "Cotoyogi",
  "aiHitBot",
  "FirecrawlAgent",
  "LinerBot",
  "Panscient",
  "panscient.com",
  "Poseidon Research Crawler",
  "TerraCotta",
  "Thinkbot",
  "YaK",
  "iAskBot",
  "PhindBot",
  "TavilyBot",
  "ExaBot",
  "Andibot",
  "ChatGLM-Spider",
  "TongyiBot",
  "YiyanBot",
  "Kimi-User",
] as const;

export const GET: APIRoute = ({ site, url }) => {
  const origin = site?.toString().replace(/\/$/, "") ?? url.origin;

  const aiAllowRules = AI_BOTS.flatMap((bot) => [
    `User-agent: ${bot}`,
    "Allow: /",
    "",
  ]);

  const body = [
    "# Allow all crawlers by default",
    "User-agent: *",
    "Allow: /",
    // Explicit opt-in for AI search, grounding/RAG, and training (Content Signals)
    "Content-Signal: search=yes, ai-input=yes, ai-train=yes",
    "Content-Usage: ai=y",
    "",
    "# Explicitly allow AI search and training bots",
    ...aiAllowRules,
    `Sitemap: ${origin}/sitemap-index.xml`,
    "",
    "# HTML sitemap (human- and bot-readable page index)",
    `# ${origin}/sitemap/`,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
