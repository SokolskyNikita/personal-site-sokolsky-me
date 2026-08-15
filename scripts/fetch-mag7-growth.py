#!/usr/bin/env python3
"""Build year-end top-10 tech scatter data (revenue growth vs NTM-like P/E)."""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

UA = "sokolsky.me mag7-growth research (sokolx@gmail.com)"
YF_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

UNIVERSE = [
    {"id": "AAPL", "ticker": "AAPL", "name": "Apple", "cik": "0000320193"},
    {"id": "MSFT", "ticker": "MSFT", "name": "Microsoft", "cik": "0000789019"},
    {"id": "GOOGL", "ticker": "GOOGL", "name": "Alphabet", "cik": "0001652044"},
    {"id": "AMZN", "ticker": "AMZN", "name": "Amazon", "cik": "0001018724"},
    {"id": "META", "ticker": "META", "name": "Meta", "cik": "0001326801"},
    {"id": "NVDA", "ticker": "NVDA", "name": "Nvidia", "cik": "0001045810"},
    {"id": "TSLA", "ticker": "TSLA", "name": "Tesla", "cik": "0001318605"},
    {"id": "TSM", "ticker": "TSM", "name": "TSMC", "cik": "0001046179"},
    {"id": "AVGO", "ticker": "AVGO", "name": "Broadcom", "cik": "0001730168"},
    {"id": "ORCL", "ticker": "ORCL", "name": "Oracle", "cik": "0001341439"},
    {"id": "INTC", "ticker": "INTC", "name": "Intel", "cik": "0000050863"},
    {"id": "CSCO", "ticker": "CSCO", "name": "Cisco", "cik": "0000858877"},
    {"id": "IBM", "ticker": "IBM", "name": "IBM", "cik": "0000051143"},
    {"id": "ADBE", "ticker": "ADBE", "name": "Adobe", "cik": "0000796343"},
    {"id": "CRM", "ticker": "CRM", "name": "Salesforce", "cik": "0001108524"},
    {"id": "QCOM", "ticker": "QCOM", "name": "Qualcomm", "cik": "0000804328"},
    {"id": "NFLX", "ticker": "NFLX", "name": "Netflix", "cik": "0001065280"},
    {"id": "AMD", "ticker": "AMD", "name": "AMD", "cik": "0000002488"},
    {"id": "ASML", "ticker": "ASML", "name": "ASML", "cik": "0000937966"},
    {"id": "SAP", "ticker": "SAP", "name": "SAP", "cik": "0000949158"},
    {"id": "BABA", "ticker": "BABA", "name": "Alibaba", "cik": "0001577552"},
    {"id": "TCEHY", "ticker": "TCEHY", "name": "Tencent", "cik": None},
    {"id": "SMSN", "ticker": "005930.KS", "name": "Samsung", "cik": None},
    {"id": "ACN", "ticker": "ACN", "name": "Accenture", "cik": "0001467373"},
    {"id": "INTU", "ticker": "INTU", "name": "Intuit", "cik": "0000896878"},
    {"id": "TXN", "ticker": "TXN", "name": "Texas Instruments", "cik": "0000097476"},
    {"id": "NOW", "ticker": "NOW", "name": "ServiceNow", "cik": "0001373715"},
    {"id": "SONY", "ticker": "SONY", "name": "Sony", "cik": "0000313838"},
]

YEARS = list(range(2016, 2027))
REVENUE_TAGS = [
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "SalesRevenueNet",
    "Revenues",
    "RevenueFromContractWithCustomerIncludingAssessedTax",
]
EPS_TAGS = ["EarningsPerShareDiluted", "EarningsPerShareBasic"]
SHARES_TAGS = [
    "WeightedAverageNumberOfDilutedSharesOutstanding",
    "CommonStockSharesOutstanding",
    "EntityCommonStockSharesOutstanding",
]


def http_json(url: str, headers: dict[str, str] | None = None, retries: int = 3) -> dict:
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as err:  # noqa: BLE001
            last_err = err
            time.sleep(0.6 * (attempt + 1))
    raise RuntimeError(f"GET failed {url}: {last_err}")


def yahoo_session() -> tuple[str, str]:
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor())
    req = urllib.request.Request("https://fc.yahoo.com", headers={"User-Agent": YF_UA})
    try:
        opener.open(req, timeout=20)
    except Exception:
        pass
    crumb_req = urllib.request.Request(
        "https://query1.finance.yahoo.com/v1/test/getcrumb",
        headers={"User-Agent": YF_UA},
    )
    crumb = opener.open(crumb_req, timeout=20).read().decode("utf-8")
    cookie = ""
    for handler in opener.handlers:
        if hasattr(handler, "cookiejar"):
            cookie = "; ".join(f"{c.name}={c.value}" for c in handler.cookiejar)
    return crumb, cookie


def yf_headers(crumb_cookie: str) -> dict[str, str]:
    return {"User-Agent": YF_UA, "Cookie": crumb_cookie}


def fetch_chart(ticker: str, headers: dict[str, str]) -> dict:
    url = (
        "https://query1.finance.yahoo.com/v8/finance/chart/"
        f"{urllib.parse.quote(ticker)}?interval=1mo&range=12y&includeAdjustedClose=true"
    )
    return http_json(url, headers)


def year_end_closes(chart: dict) -> dict[int, float]:
    result = chart.get("chart", {}).get("result") or []
    if not result:
        return {}
    ts = result[0].get("timestamp") or []
    closes = (result[0].get("indicators", {}).get("quote") or [{}])[0].get("close") or []
    by_year: dict[int, tuple[int, float]] = {}
    for t, close in zip(ts, closes):
        if close is None:
            continue
        dt = datetime.fromtimestamp(t, tz=timezone.utc)
        year = dt.year
        prev = by_year.get(year)
        if prev is None or t >= prev[0]:
            by_year[year] = (t, float(close))
    latest_price = result[0].get("meta", {}).get("regularMarketPrice")
    if latest_price is not None:
        by_year[2026] = (int(time.time()), float(latest_price))
    return {year: price for year, (_t, price) in by_year.items()}


def fetch_timeseries(ticker: str, headers: dict[str, str]) -> dict[str, list[dict]]:
    types = "annualTotalRevenue,annualDilutedEPS,annualDilutedAverageShares,annualNetIncome"
    url = (
        "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/timeseries/"
        f"{urllib.parse.quote(ticker)}?type={types}&period1=1262304000&period2=1893456000"
    )
    data = http_json(url, headers)
    out: dict[str, list[dict]] = {}
    for row in data.get("timeseries", {}).get("result") or []:
        for key, values in row.items():
            if key in {"meta", "timestamp"} or not isinstance(values, list):
                continue
            out[key] = values
    return out


def series_by_end_year(rows: list[dict], field: str = "reportedValue") -> dict[int, float]:
    out: dict[int, float] = {}
    for row in rows:
        date = row.get("asOfDate")
        raw = (row.get(field) or {}).get("raw")
        if not date or raw is None:
            continue
        year = int(date[:4])
        out[year] = float(raw)
    return out


def fetch_quote_summary(ticker: str, crumb: str, headers: dict[str, str]) -> dict:
    url = (
        "https://query2.finance.yahoo.com/v10/finance/quoteSummary/"
        f"{urllib.parse.quote(ticker)}?modules=defaultKeyStatistics,financialData,earningsTrend"
        f"&crumb={urllib.parse.quote(crumb)}"
    )
    data = http_json(url, headers)
    results = data.get("quoteSummary", {}).get("result") or []
    return results[0] if results else {}


def raw(node: dict | None, *path: str) -> float | None:
    cur: object = node
    for key in path:
        if not isinstance(cur, dict) or key not in cur:
            return None
        cur = cur[key]
    if isinstance(cur, dict) and "raw" in cur:
        cur = cur["raw"]
    if isinstance(cur, (int, float)):
        return float(cur)
    return None


def extract_sec_annual(facts: dict, tags: list[str]) -> dict[int, float]:
    us_gaap = (facts.get("facts") or {}).get("us-gaap") or {}
    dei = (facts.get("facts") or {}).get("dei") or {}
    best: dict[int, tuple[str, float]] = {}
    for tag in tags:
        node = us_gaap.get(tag) or dei.get(tag)
        if not node:
            continue
        units = node.get("units") or {}
        values = []
        for unit_values in units.values():
            if isinstance(unit_values, list):
                values.extend(unit_values)
        for item in values:
            form = item.get("form")
            if form not in {"10-K", "10-K/A", "20-F", "20-F/A", "40-F"}:
                continue
            end = item.get("end")
            val = item.get("val")
            if not end or val is None:
                continue
            year = int(end[:4])
            if year < 2014 or year > 2026:
                continue
            filed = item.get("filed") or ""
            prev = best.get(year)
            if prev is None or filed >= prev[0]:
                best[year] = (filed, float(val))
    return {year: value for year, (_filed, value) in best.items()}


def fetch_sec_facts(cik: str) -> dict:
    url = f"https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"
    return http_json(url, {"User-Agent": UA})


def main() -> None:
    crumb, cookie = yahoo_session()
    headers = yf_headers(cookie)
    print("crumb", crumb)

    companies: dict[str, dict] = {}
    for meta in UNIVERSE:
        ticker = meta["ticker"]
        print("fetch", ticker, flush=True)
        try:
            chart = fetch_chart(ticker, headers)
            prices = year_end_closes(chart)
        except Exception as err:  # noqa: BLE001
            print("  chart fail", err)
            prices = {}
        time.sleep(0.15)
        try:
            series = fetch_timeseries(ticker, headers)
        except Exception as err:  # noqa: BLE001
            print("  timeseries fail", err)
            series = {}
        time.sleep(0.15)
        try:
            summary = fetch_quote_summary(ticker, crumb, headers)
        except Exception as err:  # noqa: BLE001
            print("  summary fail", err)
            summary = {}
        time.sleep(0.2)

        revenue = series_by_end_year(series.get("annualTotalRevenue") or [])
        eps = series_by_end_year(series.get("annualDilutedEPS") or [])
        shares = series_by_end_year(series.get("annualDilutedAverageShares") or [])

        if meta["cik"]:
            try:
                facts = fetch_sec_facts(meta["cik"])
                sec_rev = extract_sec_annual(facts, REVENUE_TAGS)
                sec_eps = extract_sec_annual(facts, EPS_TAGS)
                sec_shares = extract_sec_annual(facts, SHARES_TAGS)
                for year, value in sec_rev.items():
                    revenue.setdefault(year, value)
                for year, value in sec_eps.items():
                    eps.setdefault(year, value)
                for year, value in sec_shares.items():
                    shares.setdefault(year, value)
            except Exception as err:  # noqa: BLE001
                print("  SEC fail", err)
            time.sleep(0.2)

        forward_pe = raw(summary, "defaultKeyStatistics", "forwardPE")
        forward_eps = raw(summary, "defaultKeyStatistics", "forwardEps")
        shares_now = raw(summary, "defaultKeyStatistics", "sharesOutstanding")
        trailing_growth = raw(summary, "financialData", "revenueGrowth")
        plus_one_growth = None
        plus_one_rev = None
        current_rev_est = None
        for trend in (summary.get("earningsTrend") or {}).get("trend") or []:
            if trend.get("period") == "+1y":
                plus_one_growth = raw(trend, "revenueEstimate", "growth")
                plus_one_rev = raw(trend, "revenueEstimate", "avg")
            if trend.get("period") == "0y":
                current_rev_est = raw(trend, "revenueEstimate", "avg")

        companies[meta["id"]] = {
            **meta,
            "prices": prices,
            "revenue": {str(k): v for k, v in sorted(revenue.items())},
            "eps": {str(k): v for k, v in sorted(eps.items())},
            "shares": {str(k): v for k, v in sorted(shares.items())},
            "forwardPe": forward_pe,
            "forwardEps": forward_eps,
            "sharesNow": shares_now,
            "trailingRevenueGrowth": trailing_growth,
            "plusOneRevenueGrowth": plus_one_growth,
            "plusOneRevenue": plus_one_rev,
            "currentYearRevenueEst": current_rev_est,
        }

    # Rank and compute chart points.
    years_out = []
    for year in YEARS:
        rows = []
        for company in companies.values():
            price = company["prices"].get(year)
            if price is None:
                continue
            share_count = company["sharesNow"] if year == 2026 else None
            if share_count is None:
                # nearest fiscal-year share count at or before this calendar year
                available = [int(y) for y in company["shares"] if int(y) <= year]
                if available:
                    share_count = company["shares"][str(max(available))]
            if not share_count:
                continue
            market_cap = price * share_count
            rows.append((market_cap, company))
        rows.sort(key=lambda item: item[0], reverse=True)
        top = rows[:10]
        points = []
        for rank, (market_cap, company) in enumerate(top, start=1):
            fy_years = sorted(int(y) for y in company["revenue"])
            next_fys = [y for y in fy_years if y > year]
            base_fys = [y for y in fy_years if y <= year]
            growth = None
            pe = None
            growth_basis = None
            pe_basis = None
            if next_fys and base_fys:
                nxt = min(next_fys)
                base = max(base_fys)
                base_rev = company["revenue"][str(base)]
                next_rev = company["revenue"][str(nxt)]
                if base_rev:
                    growth = next_rev / base_rev - 1
                    growth_basis = f"realized FY{nxt}/FY{base}"
                next_eps = company["eps"].get(str(nxt))
                price = company["prices"][year]
                if next_eps and next_eps > 0:
                    pe = price / next_eps
                    pe_basis = f"year-end price / FY{nxt} EPS"
            if growth is None:
                if year >= 2025 and company["plusOneRevenueGrowth"] is not None:
                    growth = company["plusOneRevenueGrowth"]
                    growth_basis = "consensus +1Y revenue"
                elif company["trailingRevenueGrowth"] is not None:
                    growth = company["trailingRevenueGrowth"]
                    growth_basis = "TTM revenue growth"
            if pe is None:
                if company["forwardPe"] and company["forwardPe"] > 0:
                    pe = company["forwardPe"]
                    pe_basis = "NTM / forward P/E"
            points.append(
                {
                    "id": company["id"],
                    "ticker": company["ticker"],
                    "name": company["name"],
                    "rank": rank,
                    "marketCap": round(market_cap),
                    "revenueGrowth": None if growth is None else round(growth, 4),
                    "pe": None if pe is None else round(pe, 2),
                    "growthBasis": growth_basis,
                    "peBasis": pe_basis,
                }
            )
        years_out.append(
            {
                "year": year,
                "asOf": "2026-08-14" if year == 2026 else f"{year}-12-31",
                "label": "2026 YTD" if year == 2026 else str(year),
                "companies": points,
            }
        )

    payload = {
        "title": "Top 10 tech: revenue (+1Y growth) vs P/E (NTM)",
        "generatedAt": "2026-08-15",
        "methodology": {
            "universe": "Public technology companies: GICS IT plus internet platforms, Amazon, Tesla, TSMC, Samsung, Tencent, Alibaba, ASML, and SAP.",
            "ranking": "Top 10 by year-end market cap (last monthly close × diluted shares). 2026 uses the latest available price (YTD).",
            "x": "Next-fiscal-year revenue growth when the following FY is reported; otherwise consensus +1Y growth.",
            "y": "Year-end price divided by next-FY EPS when available (realized forward P/E, a stand-in for NTM). 2026 uses Yahoo Finance forward P/E.",
        },
        "years": years_out,
        "raw": companies,
    }
    out_path = Path("src/data/mag7-growth-raw.json")
    out_path.write_text(json.dumps(payload, indent=2))
    print("wrote", out_path, "bytes", out_path.stat().st_size)
    for year in years_out:
        names = ", ".join(f"{c['rank']}.{c['name']}" for c in year["companies"])
        print(year["label"], names)


if __name__ == "__main__":
    main()
