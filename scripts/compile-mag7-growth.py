#!/usr/bin/env python3
"""Compile cleaned top-10 tech scatter data from scraped CMC tables + Yahoo 2026."""

from __future__ import annotations

import json
import re
from pathlib import Path

AGENT_TOOLS = Path(
    "/Users/nsokolsky/.cursor/projects/Users-nsokolsky-projects-personal-site-sokolsky-me/agent-tools"
)

META = {
    "apple": {"id": "AAPL", "ticker": "AAPL", "name": "Apple", "region": "us"},
    "microsoft": {"id": "MSFT", "ticker": "MSFT", "name": "Microsoft", "region": "us"},
    "alphabet-google": {"id": "GOOGL", "ticker": "GOOGL", "name": "Alphabet", "region": "us"},
    "amazon": {"id": "AMZN", "ticker": "AMZN", "name": "Amazon", "region": "us"},
    "meta-platforms": {"id": "META", "ticker": "META", "name": "Meta", "region": "us"},
    "nvidia": {"id": "NVDA", "ticker": "NVDA", "name": "Nvidia", "region": "us"},
    "tesla": {"id": "TSLA", "ticker": "TSLA", "name": "Tesla", "region": "us"},
    "tsmc": {"id": "TSM", "ticker": "TSM", "name": "TSMC", "region": "nonus"},
    "broadcom": {"id": "AVGO", "ticker": "AVGO", "name": "Broadcom", "region": "us"},
    "oracle": {"id": "ORCL", "ticker": "ORCL", "name": "Oracle", "region": "us"},
    "intel": {"id": "INTC", "ticker": "INTC", "name": "Intel", "region": "us"},
    "cisco": {"id": "CSCO", "ticker": "CSCO", "name": "Cisco", "region": "us"},
    "ibm": {"id": "IBM", "ticker": "IBM", "name": "IBM", "region": "us"},
    "tencent": {"id": "TCEHY", "ticker": "TCEHY", "name": "Tencent", "region": "nonus"},
    "alibaba": {"id": "BABA", "ticker": "BABA", "name": "Alibaba", "region": "nonus"},
    "samsung": {"id": "SMSN", "ticker": "005930.KS", "name": "Samsung", "region": "nonus"},
    "asml": {"id": "ASML", "ticker": "ASML", "name": "ASML", "region": "nonus"},
    "sk-hynix": {"id": "SKH", "ticker": "000660.KS", "name": "SK Hynix", "region": "nonus"},
    "sap": {"id": "SAP", "ticker": "SAP", "name": "SAP", "region": "nonus"},
    "shopify": {"id": "SHOP", "ticker": "SHOP", "name": "Shopify", "region": "nonus"},
    "mediatek": {"id": "MTK", "ticker": "2454.TW", "name": "MediaTek", "region": "nonus"},
    "tokyo-electron": {"id": "TOEL", "ticker": "8035.T", "name": "Tokyo Electron", "region": "nonus"},
    "sony": {"id": "SONY", "ticker": "SONY", "name": "Sony", "region": "nonus"},
    "keyence": {"id": "KEYN", "ticker": "6861.T", "name": "Keyence", "region": "nonus"},
    "pinduoduo": {"id": "PDD", "ticker": "PDD", "name": "PDD", "region": "nonus"},
    "baidu": {"id": "BIDU", "ticker": "BIDU", "name": "Baidu", "region": "nonus"},
    "foxconn": {"id": "FOXN", "ticker": "2317.TW", "name": "Foxconn", "region": "nonus"},
    "nintendo": {"id": "NTDOY", "ticker": "7974.T", "name": "Nintendo", "region": "nonus"},
    "advantest": {"id": "ADVT", "ticker": "6857.T", "name": "Advantest", "region": "nonus"},
}

# Tencent USD series after 2022, scaled from CMC 2022 USD with CNY YoY.
TENCENT_FILL = {
    "revenue": {
        2023: 90.15e9,
        2024: 97.75e9,
        2025: 111.3e9,
    },
    "earnings": {
        2023: 15.7e9,
        2024: 27.1e9,
        2025: 30.9e9,
    },
}

YAHOO_2026 = {
    "AAPL": {"pe": 32.18, "growth": 0.1476},
    "MSFT": {"pe": 21.03, "growth": 0.1788},
    "GOOGL": {"pe": 23.47, "growth": 0.2355},
    "AMZN": {"pe": 25.30, "growth": 0.1553},
    "META": {"pe": 16.91, "growth": 0.2655},
    "NVDA": {"pe": 17.47, "growth": 0.8239},
    "TSLA": {"pe": 154.23, "growth": 0.1164},
    "TSM": {"pe": 19.59, "growth": 0.4245},
    "AVGO": {"pe": 20.12, "growth": 0.6598},
    "ORCL": {"pe": 13.82, "growth": 0.3260},
    "INTC": {"pe": 49.79, "growth": 0.1929},
    "CSCO": {"pe": 20.40, "growth": 0.1430},
    "IBM": {"pe": 17.79, "growth": 0.0421},
    "SMSN": {"pe": None, "growth": None},  # KRW quote is not usable
    "TCEHY": {"pe": None, "growth": 0.0938},
}

ADVANTEST_EARNINGS = {
    2016: 0.14e9,
    2017: 0.13e9,
    2018: 0.63e9,
    2019: 0.53e9,
    2020: 0.51e9,
    2021: 0.95e9,
    2022: 1.25e9,
    2023: 0.70e9,
}


def parse_usd(value: str) -> float | None:
    match = re.search(r"\$([\d.]+)\s*([TBM])", value.replace(",", ""))
    if not match:
        return None
    number = float(match.group(1))
    return number * {"T": 1e12, "B": 1e9, "M": 1e6}[match.group(2)]


def load_tables() -> dict[str, dict[str, dict[int, dict]]]:
    found: dict[str, dict[str, dict[int, dict]]] = {
        "revenue": {},
        "earnings": {},
        "marketcap": {},
    }
    for path in AGENT_TOOLS.glob("*.txt"):
        try:
            payload = json.loads(path.read_text())
        except json.JSONDecodeError:
            continue
        if not isinstance(payload, list):
            continue
        for item in payload:
            value = item.get("value") if isinstance(item, dict) else None
            if not isinstance(value, dict):
                continue
            url = value.get("url") or ""
            content = value.get("content") or ""
            if "companiesmarketcap.com" not in url:
                continue
            slug, kind = url.rstrip("/").split("/")[-2:]
            if kind not in found:
                continue
            text = content.replace("&#x20;", " ").replace("&nbsp;", " ")
            rows = re.findall(
                r"(20\d{2})(?:\s*\(TTM\))?\s*\n+\s*(\$[0-9.]+ [TBM]|N/A)\s*\n+\s*([-\d.]+%|)",
                text,
            )
            parsed: dict[int, dict] = {}
            for year_s, amount, change in rows:
                year = int(year_s)
                if year < 2014 or year > 2026:
                    continue
                parsed[year] = {
                    "value": parse_usd(amount),
                    "change": float(change[:-1]) / 100 if change.endswith("%") else None,
                }
            if parsed and len(parsed) >= len(found[kind].get(slug, {})):
                found[kind][slug] = parsed
    for year, amount in TENCENT_FILL["revenue"].items():
        found["revenue"].setdefault("tencent", {}).setdefault(
            year, {"value": amount, "change": None}
        )
    for year, amount in TENCENT_FILL["earnings"].items():
        found["earnings"].setdefault("tencent", {}).setdefault(
            year, {"value": amount, "change": None}
        )
    for year, amount in ADVANTEST_EARNINGS.items():
        found["earnings"].setdefault("advantest", {}).setdefault(
            year, {"value": amount, "change": None}
        )
    return found


def ratio(numer: float | None, denom: float | None) -> float | None:
    if not numer or not denom or denom <= 0:
        return None
    return numer / denom - 1


def pe_ratio(market_cap: float, earnings: float | None) -> float | None:
    if not earnings or earnings <= 0:
        return None
    return market_cap / earnings


def build_point(
    year: int,
    market_cap: float,
    slug: str,
    info: dict,
    tables: dict,
    rank: int,
) -> dict:
    revenues = tables["revenue"].get(slug, {})
    earnings = tables["earnings"].get(slug, {})
    growth = pe = None
    growth_basis = pe_basis = None
    if year <= 2024:
        growth = ratio(
            revenues.get(year + 1, {}).get("value"),
            revenues.get(year, {}).get("value"),
        )
        if growth is not None:
            growth_basis = f"realized revenue, FY{year + 1} vs FY{year}"
        pe = pe_ratio(market_cap, earnings.get(year + 1, {}).get("value"))
        if pe is not None:
            pe_basis = f"year-end cap / FY{year + 1} earnings"
    elif year == 2025:
        growth = ratio(
            revenues.get(2026, {}).get("value"),
            revenues.get(2025, {}).get("value"),
        )
        if growth is not None:
            growth_basis = "2026 TTM revenue vs FY2025"
        pe = pe_ratio(market_cap, earnings.get(2026, {}).get("value"))
        if pe is not None:
            pe_basis = "year-end 2025 cap / 2026 TTM earnings"
    yahoo = YAHOO_2026.get(info["id"], {})
    if year == 2025 and growth is None and yahoo.get("growth") is not None:
        growth = yahoo["growth"]
        growth_basis = "consensus FY2026 revenue growth"
    if year == 2026:
        growth = yahoo.get("growth")
        pe = yahoo.get("pe")
        if growth is not None:
            growth_basis = "consensus current-FY revenue growth"
        if pe is not None:
            pe_basis = "NTM / forward P/E"
    if growth is None and year == 2026:
        growth = ratio(
            revenues.get(2026, {}).get("value"),
            revenues.get(2025, {}).get("value"),
        )
        if growth is not None:
            growth_basis = "2026 TTM revenue vs FY2025"
    if pe is None and year == 2026:
        pe = pe_ratio(market_cap, earnings.get(2026, {}).get("value"))
        if pe is not None:
            pe_basis = "latest cap / 2026 TTM earnings"
    if pe is None:
        for prior in range(year, 2013, -1):
            pe = pe_ratio(market_cap, earnings.get(prior, {}).get("value"))
            if pe is not None:
                pe_basis = (
                    f"year-end cap / FY{prior} earnings"
                    if prior == year
                    else f"latest cap / FY{prior} earnings"
                )
                break
    if growth is None and year >= 2024:
        for prior in range(year, 2013, -1):
            change = revenues.get(prior, {}).get("change")
            if change is not None:
                growth = change
                growth_basis = f"latest reported revenue change (FY{prior})"
                break
    return {
        "id": info["id"],
        "ticker": info["ticker"],
        "name": info["name"],
        "region": info["region"],
        "rank": rank,
        "marketCap": int(round(market_cap)),
        "revenueGrowth": None if growth is None else round(growth, 4),
        "pe": None if pe is None else round(pe, 2),
        "growthBasis": growth_basis,
        "peBasis": pe_basis,
    }


def compile_universe(tables: dict) -> list[dict]:
    years = []
    for year in range(2016, 2027):
        ranked = []
        for slug, info in META.items():
            market_cap = tables["marketcap"].get(slug, {}).get(year, {}).get("value")
            if market_cap:
                ranked.append((market_cap, slug, info))
        ranked.sort(reverse=True)
        points = [
            build_point(year, market_cap, slug, info, tables, rank)
            for rank, (market_cap, slug, info) in enumerate(ranked, start=1)
        ]
        years.append(
            {
                "year": year,
                "asOf": "2026-08-14" if year == 2026 else f"{year}-12-31",
                "label": "2026 YTD" if year == 2026 else str(year),
                "companies": points,
            }
        )
    return years


def scope_years(universe: list[dict], region: str | None) -> list[dict]:
    scoped = []
    for row in universe:
        if region in {"us", "nonus"}:
            eligible = [
                company for company in row["companies"] if company["region"] == region
            ]
        else:
            eligible = row["companies"]
        companies = []
        for rank, company in enumerate(eligible[:10], start=1):
            item = dict(company)
            item["rank"] = rank
            companies.append(item)
        scoped.append({**row, "companies": companies})
    return scoped


def main() -> None:
    tables = load_tables()
    universe = compile_universe(tables)
    us_years = scope_years(universe, "us")
    global_years = scope_years(universe, None)
    nonus_years = scope_years(universe, "nonus")
    payload = {
        "title": "Top 10 tech: revenue (+1Y growth) vs P/E",
        "generatedAt": "2026-08-15",
        "asOf": "2026-08-14",
        "defaultScope": "us",
        "scopes": {
            "us": {"id": "us", "label": "USA", "years": us_years},
            "global": {"id": "global", "label": "Global", "years": global_years},
            "nonus": {"id": "nonus", "label": "Non-USA", "years": nonus_years},
        },
        "methodology": {
            "universe": "Public technology companies in the usual market sense: GICS information technology, plus internet platforms, Amazon, and Tesla. Non-USA uses headquarters outside the United States, including TSMC, Samsung, SK Hynix, ASML, Tencent, Alibaba, SAP, MediaTek, Shopify, and Tokyo Electron.",
            "ranking": "Each view’s top 10 is ranked by year-end market cap from CompaniesMarketCap. 2026 uses the latest available cap (14 Aug 2026).",
            "x": "For 2016–2024, realized next-year revenue growth. For 2025, 2026 TTM vs 2025. For 2026 YTD, consensus current-fiscal-year revenue growth (Yahoo Finance) when available, otherwise the latest reported revenue change.",
            "y": "For completed years, year-end market cap divided by the next year's earnings (realized forward P/E, a stand-in for NTM). For 2026 YTD, Yahoo Finance forward P/E. Unprofitable next years are omitted from the plot.",
        },
    }
    out = Path("src/data/mag7-growth.json")
    out.write_text(json.dumps(payload, indent=2) + "\n")
    print("wrote", out)
    for scope_id, years in (
        ("us", us_years),
        ("global", global_years),
        ("nonus", nonus_years),
    ):
        print(f"\n=== {scope_id} ===")
        for year in years:
            row = ", ".join(
                f"{c['rank']}.{c['name']} {c['revenueGrowth'] if c['revenueGrowth'] is not None else '—':>6} {c['pe'] if c['pe'] is not None else 'n/m'}"
                for c in year["companies"]
            )
            print(year["label"], row)


if __name__ == "__main__":
    main()
