"""Mozilla Observatory Tool for website security scanning."""

import asyncio
import logging

import aiohttp
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

##########################
# Mozilla Observatory API Tool
##########################

OBSERVATORY_SCAN_DESCRIPTION = (
    "Scan a website's security headers and configurations using Mozilla Observatory. "
    "Returns a security grade (A+ to F), numerical score, and test results. "
    "Useful for assessing web security posture and identifying security header issues."
)


@tool(description=OBSERVATORY_SCAN_DESCRIPTION)
async def observatory_scan(
    domain: str,
    config: RunnableConfig = None
) -> str:
    """Scan a website using Mozilla Observatory API to assess security headers.

    Args:
        domain: Domain name to scan (e.g., "example.com")
        config: Runtime configuration for API key access

    Returns:
        Formatted string containing security grade, score, test results, and details URL
    """
    try:
        # Step 1: Prepare the API request
        base_url = "https://observatory-api.mdn.mozilla.net/api/v2/scan"

        # Prepare request parameters
        params = {
            "host": domain
        }

        # Step 2: Execute the API request with timeout
        timeout = aiohttp.ClientTimeout(total=60.0)
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.post(base_url, params=params, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                else:
                    error_text = await response.text()
                    try:
                        error_json = await response.json()
                        if error_json.get("error") == "scan-failed":
                            return f"Observatory Scan Error for '{domain}': {error_json.get('message', 'Unknown error')}"
                    except:
                        pass
                    return f"Observatory API Error: Received status {response.status}. {error_text}"

        # Step 3: Check for error in response
        if data.get("error"):
            error_msg = data.get("message", "Unknown error")
            return f"Observatory Scan Error for '{domain}': {error_msg}"

        # Step 4: Parse and format the results
        scan_id = data.get("id", "Unknown")
        grade = data.get("grade", "N/A")
        score = data.get("score", "N/A")
        tests_passed = data.get("tests_passed", 0)
        tests_failed = data.get("tests_failed", 0)
        tests_quantity = data.get("tests_quantity", 0)
        details_url = data.get("details_url", "N/A")
        scanned_at = data.get("scanned_at", "Unknown")
        status_code = data.get("status_code", "N/A")

        # Step 5: Format output
        formatted_output = f"Mozilla Observatory Security Scan Results for '{domain}':\n\n"
        formatted_output += f"--- OVERALL ASSESSMENT ---\n"
        formatted_output += f"Grade: {grade}\n"
        formatted_output += f"Score: {score}/100\n"
        formatted_output += f"HTTP Status: {status_code}\n\n"

        formatted_output += f"--- TEST RESULTS ---\n"
        formatted_output += f"Tests Passed: {tests_passed}\n"
        formatted_output += f"Tests Failed: {tests_failed}\n"
        formatted_output += f"Total Tests: {tests_quantity}\n\n"

        formatted_output += f"--- SCAN DETAILS ---\n"
        formatted_output += f"Scan ID: {scan_id}\n"
        formatted_output += f"Scanned At: {scanned_at}\n"
        formatted_output += f"Full Report: {details_url}\n\n"

        formatted_output += "Note: For detailed per-test breakdowns, visit the full report URL above.\n"
        formatted_output += "-" * 80 + "\n"

        return formatted_output

    except asyncio.TimeoutError:
        logging.warning("Observatory API request timed out after 60 seconds")
        return f"Observatory API Error: Request timed out for '{domain}'. The API may be experiencing high load. Please try again later."
    except Exception as e:
        logging.error(f"Observatory API scan failed with error: {str(e)}")
        return f"Observatory API Error for '{domain}': {str(e)}"
