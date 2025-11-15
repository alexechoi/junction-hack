"""VirusTotal File Analysis Tool for file security scanning."""

import asyncio
import logging
from typing import Annotated

import aiohttp
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import InjectedToolArg, tool

from open_deep_research.utils import get_virustotal_api_key

##########################
# VirusTotal File Analysis Tool
##########################

VIRUSTOTAL_SCAN_DESCRIPTION = (
    "Analyze a file using VirusTotal by its hash (SHA-256, SHA-1, or MD5). "
    "Retrieves security analysis results from multiple antivirus engines. "
    "Returns detection statistics, file information, signature details, and threat assessment."
)


@tool(description=VIRUSTOTAL_SCAN_DESCRIPTION)
async def virustotal_scan(
    file_hash: str,
    config: RunnableConfig = None
) -> str:
    """Get VirusTotal analysis report for a file by its hash.

    Args:
        file_hash: SHA-256, SHA-1, or MD5 hash identifying the file
        config: Runtime configuration for API key access

    Returns:
        Formatted string containing file analysis results including detection stats,
        file information, signature details, and security assessment
    """
    try:
        # Step 1: Prepare the API request
        base_url = f"https://www.virustotal.com/api/v3/files/{file_hash}"

        # Step 2: Set up headers with API key (required)
        api_key = get_virustotal_api_key(config)
        if not api_key:
            return "VirusTotal API Error: VIRUSTOTAL_API_KEY not found. Please configure the API key."

        headers = {
            "x-apikey": api_key
        }

        # Step 3: Execute the API request with timeout
        timeout = aiohttp.ClientTimeout(total=60.0)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(base_url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                elif response.status == 403:
                    return "VirusTotal API Error: Rate limit exceeded or unauthorized. Please check your API key and rate limits."
                elif response.status == 404:
                    return f"VirusTotal API Error: File with hash '{file_hash}' not found in VirusTotal database."
                else:
                    error_text = await response.text()
                    return f"VirusTotal API Error: Received status {response.status}. {error_text}"

        # Step 4: Parse the response
        attributes = data.get("data", {}).get("attributes", {})
        if not attributes:
            return f"VirusTotal API Error: Invalid response format for hash '{file_hash}'"

        # Step 5: Extract key information
        # File identifiers
        sha256 = attributes.get("sha256", "Unknown")
        sha1 = attributes.get("sha1", "Unknown")
        md5 = attributes.get("md5", "Unknown")
        meaningful_name = attributes.get("meaningful_name", "Unknown")
        size = attributes.get("size", 0)
        file_type = attributes.get("type_description", "Unknown")
        magic = attributes.get("magic", "Unknown")

        # Analysis statistics
        last_analysis_stats = attributes.get("last_analysis_stats", {})
        malicious = last_analysis_stats.get("malicious", 0)
        suspicious = last_analysis_stats.get("suspicious", 0)
        undetected = last_analysis_stats.get("undetected", 0)
        harmless = last_analysis_stats.get("harmless", 0)
        total_engines = malicious + suspicious + undetected + harmless

        # Signature information
        signature_info = attributes.get("signature_info", {})
        is_signed = signature_info.get("verified") == "Signed"
        signer_name = signature_info.get("product", "Not signed")
        signers = signature_info.get("signers", "N/A")

        # Detection results (get first few malicious/suspicious detections)
        last_analysis_results = attributes.get("last_analysis_results", {})
        detections = []
        for engine_name, result in last_analysis_results.items():
            category = result.get("category", "")
            if category in ["malicious", "suspicious"]:
                detection_name = result.get("result", "Unknown threat")
                detections.append(f"{engine_name}: {detection_name}")

        # Tags
        tags = attributes.get("tags", [])
        tags_str = ", ".join(tags) if tags else "None"

        # Step 6: Format output
        formatted_output = f"VirusTotal Analysis Report for '{meaningful_name}':\n"
        formatted_output += "=" * 80 + "\n\n"

        # File Information
        formatted_output += "FILE INFORMATION:\n"
        formatted_output += f"  Name: {meaningful_name}\n"
        formatted_output += f"  Type: {file_type}\n"
        formatted_output += f"  Magic: {magic}\n"
        formatted_output += f"  Size: {size:,} bytes\n"
        formatted_output += f"  SHA-256: {sha256}\n"
        formatted_output += f"  SHA-1: {sha1}\n"
        formatted_output += f"  MD5: {md5}\n"
        formatted_output += f"  Tags: {tags_str}\n\n"

        # Security Assessment
        formatted_output += "SECURITY ASSESSMENT:\n"
        formatted_output += f"  Total Engines Scanned: {total_engines}\n"
        formatted_output += f"  Malicious Detections: {malicious}\n"
        formatted_output += f"  Suspicious Detections: {suspicious}\n"
        formatted_output += f"  Harmless: {harmless}\n"
        formatted_output += f"  Undetected: {undetected}\n\n"

        # Risk assessment
        if malicious > 0:
            risk_level = "HIGH RISK"
            risk_color = "⚠️"
        elif suspicious > 0:
            risk_level = "MODERATE RISK"
            risk_color = "⚠️"
        elif harmless > 0 and malicious == 0 and suspicious == 0:
            risk_level = "LOW RISK"
            risk_color = "✓"
        else:
            risk_level = "UNKNOWN"
            risk_color = "?"

        formatted_output += f"  Risk Level: {risk_color} {risk_level}\n\n"

        # Signature Information
        formatted_output += "SIGNATURE INFORMATION:\n"
        formatted_output += f"  Signed: {'Yes' if is_signed else 'No'}\n"
        if is_signed:
            formatted_output += f"  Signer: {signer_name}\n"
            formatted_output += f"  Signers: {signers}\n"
        formatted_output += "\n"

        # Detection Details (if any)
        if detections:
            formatted_output += "DETECTION DETAILS:\n"
            for i, detection in enumerate(detections[:10], 1):  # Limit to first 10
                formatted_output += f"  {i}. {detection}\n"
            if len(detections) > 10:
                formatted_output += f"  ... and {len(detections) - 10} more detections\n"
            formatted_output += "\n"

        formatted_output += "=" * 80 + "\n"

        return formatted_output

    except asyncio.TimeoutError:
        logging.warning("VirusTotal API request timed out after 60 seconds")
        return f"VirusTotal API Error: Request timed out. The VirusTotal API may be experiencing high load. Please try again later."
    except Exception as e:
        logging.error(f"VirusTotal API scan failed with error: {str(e)}")
        return f"VirusTotal API Error: {str(e)}"
