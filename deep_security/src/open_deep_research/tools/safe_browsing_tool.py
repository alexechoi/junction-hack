"""Google Safe Browsing Tool for URL threat checking."""

import asyncio
import logging

import aiohttp
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from open_deep_research.utils import get_google_api_key

##########################
# Google Safe Browsing API Tool
##########################

SAFE_BROWSING_CHECK_DESCRIPTION = (
    "Check if a URL is flagged by Google Safe Browsing as malicious, "
    "social engineering, unwanted software, or potentially harmful application. "
    "Returns threat information including threat type, platform, metadata, and cache duration."
)


@tool(description=SAFE_BROWSING_CHECK_DESCRIPTION)
async def safe_browsing_check(
    url: str,
    config: RunnableConfig = None
) -> str:
    """Check a URL against Google Safe Browsing threat lists.

    Args:
        url: URL to check (must be valid per RFC 2396)
        config: Runtime configuration for API key access

    Returns:
        Formatted string containing threat match information if found,
        or confirmation that the URL is safe
    """
    try:
        # Step 1: Prepare the API request
        api_key = get_google_api_key(config)
        if not api_key:
            return "Safe Browsing API Error: GOOGLE_API_KEY not found. Please configure the API key."

        base_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"

        # Step 2: Prepare request body
        request_body = {
            "client": {
                "clientId": "deep-security",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes": [
                    "MALWARE",
                    "SOCIAL_ENGINEERING",
                    "UNWANTED_SOFTWARE",
                    "POTENTIALLY_HARMFUL_APPLICATION"
                ],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [
                    {"url": url}
                ]
            }
        }

        # Step 3: Set up headers
        headers = {
            "Content-Type": "application/json"
        }

        # Step 4: Execute the API request with timeout
        timeout = aiohttp.ClientTimeout(total=60.0)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(base_url, json=request_body, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                elif response.status == 400:
                    error_text = await response.text()
                    return f"Safe Browsing API Error: Bad request. {error_text}"
                elif response.status == 403:
                    return "Safe Browsing API Error: Rate limit exceeded or unauthorized. Please check your API key and rate limits."
                else:
                    error_text = await response.text()
                    return f"Safe Browsing API Error: Received status {response.status}. {error_text}"

        # Step 5: Parse the response
        # Empty response body or no matches means URL is safe
        matches = data.get("matches", [])

        if not matches:
            formatted_output = f"Safe Browsing Check Results for '{url}':\n"
            formatted_output += "=" * 80 + "\n\n"
            formatted_output += "STATUS: ✓ SAFE\n\n"
            formatted_output += "The URL is not flagged on any Google Safe Browsing threat lists.\n"
            formatted_output += "=" * 80 + "\n"
            return formatted_output

        # Step 6: Format output for matches
        formatted_output = f"Safe Browsing Check Results for '{url}':\n"
        formatted_output += "=" * 80 + "\n\n"
        formatted_output += "STATUS: ⚠️ THREAT DETECTED\n\n"

        for i, match in enumerate(matches, 1):
            threat_type = match.get("threatType", "Unknown")
            platform_type = match.get("platformType", "Unknown")
            threat_entry_type = match.get("threatEntryType", "Unknown")
            threat_url = match.get("threat", {}).get("url", url)
            cache_duration = match.get("cacheDuration", "Unknown")

            # Extract metadata if available
            metadata = match.get("threatEntryMetadata", {})
            metadata_entries = metadata.get("entries", [])

            formatted_output += f"--- THREAT MATCH #{i} ---\n"
            formatted_output += f"Threat Type: {threat_type}\n"
            formatted_output += f"Platform Type: {platform_type}\n"
            formatted_output += f"Threat Entry Type: {threat_entry_type}\n"
            formatted_output += f"URL: {threat_url}\n"
            formatted_output += f"Cache Duration: {cache_duration}\n"

            if metadata_entries:
                formatted_output += "Metadata:\n"
                for entry in metadata_entries:
                    key = entry.get("key", "Unknown")
                    value = entry.get("value", "Unknown")
                    formatted_output += f"  - {key}: {value}\n"

            formatted_output += "\n"

        formatted_output += "=" * 80 + "\n"
        formatted_output += "WARNING: This URL has been flagged by Google Safe Browsing.\n"
        formatted_output += "Do not visit this URL or download content from it.\n"
        formatted_output += "=" * 80 + "\n"

        return formatted_output

    except asyncio.TimeoutError:
        logging.warning("Safe Browsing API request timed out after 60 seconds")
        return f"Safe Browsing API Error: Request timed out. The API may be experiencing high load. Please try again later."
    except Exception as e:
        logging.error(f"Safe Browsing API check failed with error: {str(e)}")
        return f"Safe Browsing API Error: {str(e)}"
