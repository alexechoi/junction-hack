"""Google Web Risk Tool for URL threat checking."""

import asyncio
import logging
from urllib.parse import quote

import aiohttp
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from open_deep_research.utils import get_google_api_key

##########################
# Google Web Risk API Tool
##########################

SAFE_BROWSING_CHECK_DESCRIPTION = (
    "Check if a URL is flagged by Google Web Risk as malware, "
    "social engineering, or unwanted software. "
    "Returns threat information including threat types and cache expiration."
)


@tool(description=SAFE_BROWSING_CHECK_DESCRIPTION)
async def safe_browsing_check(
    url: str,
    config: RunnableConfig = None
) -> str:
    """Check a URL against Google Web Risk threat lists.

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
            return "Web Risk API Error: GOOGLE_API_KEY not found. Please configure the API key."

        # Step 2: Build the GET request URL with query parameters
        # URL-encode the URI parameter
        encoded_uri = quote(url, safe='')

        # Build threat types query parameters
        # Web Risk API supports: MALWARE, SOCIAL_ENGINEERING, UNWANTED_SOFTWARE
        threat_types = [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE"
        ]
        threat_params = "&".join([f"threatTypes={t}" for t in threat_types])

        # Construct the full URL
        request_url = f"https://webrisk.googleapis.com/v1/uris:search?{threat_params}&uri={encoded_uri}&key={api_key}"

        # Step 3: Execute the GET request with timeout
        timeout = aiohttp.ClientTimeout(total=60.0)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(request_url) as response:
                if response.status == 200:
                    data = await response.json()
                elif response.status == 400:
                    error_text = await response.text()
                    return f"Web Risk API Error: Bad request. {error_text}"
                elif response.status == 403:
                    return "Web Risk API Error: Rate limit exceeded or unauthorized. Please check your API key and rate limits."
                else:
                    error_text = await response.text()
                    return f"Web Risk API Error: Received status {response.status}. {error_text}"

        # Step 4: Parse the response
        # Empty response {} means URL is safe
        # Response with "threat" object means threat detected
        threat = data.get("threat")

        if not threat:
            formatted_output = f"Web Risk Check Results for '{url}':\n"
            formatted_output += "=" * 80 + "\n\n"
            formatted_output += "STATUS: ✓ SAFE\n\n"
            formatted_output += "The URL is not flagged on any Google Web Risk threat lists.\n"
            formatted_output += "=" * 80 + "\n"
            return formatted_output

        # Step 5: Format output for threats
        formatted_output = f"Web Risk Check Results for '{url}':\n"
        formatted_output += "=" * 80 + "\n\n"
        formatted_output += "STATUS: ⚠️ THREAT DETECTED\n\n"

        # Get threat types and expiration time
        threat_types_list = threat.get("threatTypes", [])
        expire_time = threat.get("expireTime", "Unknown")

        formatted_output += "--- THREAT INFORMATION ---\n"
        formatted_output += f"URL: {url}\n"
        formatted_output += f"Threat Types: {', '.join(threat_types_list)}\n"
        formatted_output += f"Cache Expiration: {expire_time}\n"
        formatted_output += "\n"

        # Provide detailed description of each threat type
        if threat_types_list:
            formatted_output += "Threat Descriptions:\n"
            for threat_type in threat_types_list:
                if threat_type == "MALWARE":
                    formatted_output += "  - MALWARE: The URL hosts or distributes malicious software\n"
                elif threat_type == "SOCIAL_ENGINEERING":
                    formatted_output += "  - SOCIAL_ENGINEERING: The URL attempts to trick users into sharing personal information\n"
                elif threat_type == "UNWANTED_SOFTWARE":
                    formatted_output += "  - UNWANTED_SOFTWARE: The URL hosts software that may be deceptive or unwanted\n"
            formatted_output += "\n"

        formatted_output += "=" * 80 + "\n"
        formatted_output += "WARNING: This URL has been flagged by Google Web Risk.\n"
        formatted_output += "Do not visit this URL or download content from it.\n"
        formatted_output += "=" * 80 + "\n"

        return formatted_output

    except asyncio.TimeoutError:
        logging.warning("Web Risk API request timed out after 60 seconds")
        return f"Web Risk API Error: Request timed out. The API may be experiencing high load. Please try again later."
    except Exception as e:
        logging.error(f"Web Risk API check failed with error: {str(e)}")
        return f"Web Risk API Error: {str(e)}"
