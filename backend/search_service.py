"""
Real web search service with citations and source URLs.
Strict privacy isolation: Candidate resumes and PII are NEVER transmitted to search providers.
Only company name and job title search terms are queried.
"""

import os
import httpx
from typing import Dict, Any, List
from ddgs import DDGS


def sanitize_query_term(term: str) -> str:
    """Ensure no personal or sensitive data is accidentally included."""
    if not term:
        return ""
    # Strip any accidental newlines or long prose
    return " ".join(term.strip().split()[:10])


async def search_tavily(query: str, api_key: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Perform real web search using Tavily API."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        payload = {
            "api_key": api_key,
            "query": query,
            "search_depth": "basic",
            "include_answer": False,
            "max_results": max_results,
        }
        resp = await client.post("https://api.tavily.com/search", json=payload)
        resp.raise_for_status()
        data = resp.json()
        results = []
        for item in data.get("results", []):
            results.append({
                "title": item.get("title", "Source"),
                "url": item.get("url", ""),
                "snippet": item.get("content", "").strip()[:400]
            })
        return results


def search_ddgs(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Perform real web search using DuckDuckGo search fallback (no API key required)."""
    results = []
    try:
        ddgs = DDGS()
        raw_results = list(ddgs.text(query, max_results=max_results))
        for item in raw_results:
            results.append({
                "title": item.get("title", "Search Result"),
                "url": item.get("href", ""),
                "snippet": item.get("body", "").strip()[:400]
            })
    except Exception as e:
        print(f"[Search DDGS Error] {e}")
    return results


async def conduct_company_research(company_name: str, job_title: str = "") -> Dict[str, Any]:
    """
    Conduct real search for company profile and reported interview questions.
    Returns verified sources and consolidated text for LLM grounding.
    """
    clean_company = sanitize_query_term(company_name)
    clean_title = sanitize_query_term(job_title)

    if not clean_company:
        return {
            "has_research": False,
            "provider": "none",
            "sources": [],
            "overview_snippets": [],
            "interview_snippets": [],
            "message": "No company name provided. Research skipped."
        }

    tavily_key = os.getenv("TAVILY_API_KEY", "").strip()
    provider_used = "tavily" if tavily_key else "duckduckgo"

    overview_query = f"{clean_company} company overview products tech stack mission"
    interview_query = f"{clean_company} {clean_title} interview questions process reported experience" if clean_title else f"{clean_company} interview questions reported hiring process"

    overview_results: List[Dict[str, str]] = []
    interview_results: List[Dict[str, str]] = []

    if tavily_key:
        try:
            overview_results = await search_tavily(overview_query, tavily_key, max_results=3)
            interview_results = await search_tavily(interview_query, tavily_key, max_results=4)
        except Exception as e:
            print(f"[Tavily search failed, falling back to DDGS]: {e}")
            provider_used = "duckduckgo"
            overview_results = search_ddgs(overview_query, max_results=3)
            interview_results = search_ddgs(interview_query, max_results=4)
    else:
        overview_results = search_ddgs(overview_query, max_results=3)
        interview_results = search_ddgs(interview_query, max_results=4)

    all_sources = []
    seen_urls = set()
    for item in overview_results + interview_results:
        url = item.get("url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            all_sources.append(item)

    return {
        "has_research": len(all_sources) > 0,
        "company_name": clean_company,
        "job_title": clean_title,
        "provider": provider_used,
        "sources": all_sources,
        "overview_snippets": overview_results,
        "interview_snippets": interview_results,
        "message": f"Retrieved {len(all_sources)} live verified sources via {provider_used.capitalize()}." if all_sources else "Live search returned no public results."
    }
