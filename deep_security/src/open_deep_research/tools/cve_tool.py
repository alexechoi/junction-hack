"""CVE Search Tool for vulnerability database queries."""

import asyncio
import logging
from typing import Annotated, List

import aiohttp
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from open_deep_research.utils import get_nvd_api_key

##########################
# CVE API Search Tool
##########################

CVE_SEARCH_DESCRIPTION = (
    "Search the National Vulnerability Database (NVD) for CVE records by keywords. "
    "Useful for finding security vulnerabilities related to specific software, vendors, or technologies. "
    "Returns CVE IDs, descriptions, severity scores, and reference links."
)


@tool(description=CVE_SEARCH_DESCRIPTION)
async def cve_search(
    keywords: List[str],
    max_results: Annotated[int, InjectedToolArg] = 20,
    config: RunnableConfig = None
) -> str:
    """Search the NVD CVE database for vulnerabilities matching keywords.

    Args:
        keywords: List of keywords to search for (e.g., ["Apache", "Log4j"])
        max_results: Maximum number of CVE results to return (default: 20, max: 100)
        config: Runtime configuration for API key access

    Returns:
        Formatted string containing CVE details including IDs, descriptions, scores, and references
    """
    try:
        # Step 1: Prepare the API request
        base_url = "https://services.nvd.nist.gov/rest/json/cves/2.0"

        # Combine keywords into search string (multiple keywords work as AND)
        keyword_search = " ".join(keywords)

        # Limit max_results to API maximum
        max_results = min(max_results, 100)

        # Prepare request parameters
        params = {
            "keywordSearch": keyword_search,
            "resultsPerPage": max_results,
            "startIndex": 0
        }

        # Step 2: Set up headers with optional API key
        headers = {}
        nvd_api_key = get_nvd_api_key(config)
        if nvd_api_key:
            headers["apiKey"] = nvd_api_key

        # Step 3: Execute the API request with timeout
        timeout = aiohttp.ClientTimeout(total=60.0)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(base_url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                elif response.status == 403:
                    return "CVE API Error: Rate limit exceeded. Please wait 30 seconds before retrying or add an NVD_API_KEY to increase rate limits."
                elif response.status == 404:
                    return f"CVE API Error: No results found for keywords: {keyword_search}"
                else:
                    error_text = await response.text()
                    return f"CVE API Error: Received status {response.status}. {error_text}"

        # Step 4: Parse and format the results
        vulnerabilities = data.get("vulnerabilities", [])
        total_results = data.get("totalResults", 0)

        if not vulnerabilities:
            return f"No CVE records found for keywords: {keyword_search}"

        # Step 5: Format output
        formatted_output = f"CVE Search Results for '{keyword_search}':\n"
        formatted_output += f"Found {total_results} total results (showing {len(vulnerabilities)})\n\n"

        for vuln_item in vulnerabilities:
            cve = vuln_item.get("cve", {})
            cve_id = cve.get("id", "Unknown")

            # Extract description (prefer English)
            descriptions = cve.get("descriptions", [])
            description = "No description available"
            for desc in descriptions:
                if desc.get("lang") == "en":
                    description = desc.get("value", "No description available")
                    break

            # Extract CVSS scores (prefer v3.1, then v3.0, then v2.0)
            metrics = cve.get("metrics", {})
            cvss_score = "Not scored"
            cvss_severity = "Unknown"

            if "cvssMetricV31" in metrics and metrics["cvssMetricV31"]:
                cvss_data = metrics["cvssMetricV31"][0].get("cvssData", {})
                cvss_score = cvss_data.get("baseScore", "N/A")
                cvss_severity = cvss_data.get("baseSeverity", "Unknown")
            elif "cvssMetricV30" in metrics and metrics["cvssMetricV30"]:
                cvss_data = metrics["cvssMetricV30"][0].get("cvssData", {})
                cvss_score = cvss_data.get("baseScore", "N/A")
                cvss_severity = cvss_data.get("baseSeverity", "Unknown")
            elif "cvssMetricV2" in metrics and metrics["cvssMetricV2"]:
                cvss_data = metrics["cvssMetricV2"][0].get("cvssData", {})
                cvss_score = cvss_data.get("baseScore", "N/A")
                cvss_severity = metrics["cvssMetricV2"][0].get("baseSeverity", "Unknown")

            # Extract dates
            published = cve.get("published", "Unknown")
            last_modified = cve.get("lastModified", "Unknown")

            # Extract references (limit to first 3)
            references = cve.get("references", [])
            ref_urls = [ref.get("url") for ref in references[:3] if ref.get("url")]
            ref_string = "\n  ".join(ref_urls) if ref_urls else "No references available"

            # Format this CVE entry
            formatted_output += f"--- {cve_id} ---\n"
            formatted_output += f"Description: {description[:300]}{'...' if len(description) > 300 else ''}\n"
            formatted_output += f"CVSS Score: {cvss_score} ({cvss_severity})\n"
            formatted_output += f"Published: {published}\n"
            formatted_output += f"Last Modified: {last_modified}\n"
            formatted_output += f"References:\n  {ref_string}\n"
            formatted_output += "\n" + "-" * 80 + "\n\n"

        return formatted_output

    except asyncio.TimeoutError:
        logging.warning("CVE API request timed out after 60 seconds")
        return f"CVE API Error: Request timed out. The NVD API may be experiencing high load. Please try again later."
    except Exception as e:
        logging.error(f"CVE API search failed with error: {str(e)}")
        return f"CVE API Error: {str(e)}"
