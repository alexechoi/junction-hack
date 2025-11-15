"""Tests for the Mozilla Observatory API tool."""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from aiohttp import ClientTimeout

from open_deep_research.utils import observatory_scan


@pytest.mark.asyncio
async def test_observatory_scan_success():
    """Test successful observatory scan with a good domain."""
    # Mock response data
    mock_response_data = {
        "id": 78030199,
        "details_url": "https://developer.mozilla.org/en-US/observatory/analyze?host=example.com",
        "algorithm_version": 4,
        "scanned_at": "2025-11-15T13:08:33.700Z",
        "error": None,
        "grade": "F",
        "score": 10,
        "status_code": 200,
        "tests_failed": 5,
        "tests_passed": 5,
        "tests_quantity": 10
    }

    # Create mock response
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_response_data)
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=None)

    # Create mock session
    mock_session = AsyncMock()
    mock_session.post = MagicMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "example.com"})

    # Verify the result
    assert "Mozilla Observatory Security Scan Results for 'example.com'" in result
    assert "Grade: F" in result
    assert "Score: 10/100" in result
    assert "Tests Passed: 5" in result
    assert "Tests Failed: 5" in result
    assert "Total Tests: 10" in result
    assert "https://developer.mozilla.org/en-US/observatory/analyze?host=example.com" in result


@pytest.mark.asyncio
async def test_observatory_scan_site_down():
    """Test error handling when the target site is down."""
    # Mock error response data
    mock_error_data = {
        "error": "scan-failed",
        "message": "The site seems to be down."
    }

    # Create mock response for non-200 status
    mock_response = AsyncMock()
    mock_response.status = 500
    mock_response.json = AsyncMock(return_value=mock_error_data)
    mock_response.text = AsyncMock(return_value=json.dumps(mock_error_data))
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=None)

    # Create mock session
    mock_session = AsyncMock()
    mock_session.post = MagicMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "mdn.net"})

    # Verify the error message is in the result
    assert "Observatory Scan Error for 'mdn.net'" in result
    assert "The site seems to be down" in result


@pytest.mark.asyncio
async def test_observatory_scan_error_in_response():
    """Test handling of error field in successful API response."""
    # Mock response data with error field
    mock_response_data = {
        "error": "invalid-host",
        "message": "Invalid hostname provided."
    }

    # Create mock response
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_response_data)
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=None)

    # Create mock session
    mock_session = AsyncMock()
    mock_session.post = MagicMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "invalid-domain"})

    # Verify the error message is in the result
    assert "Observatory Scan Error for 'invalid-domain'" in result
    assert "Invalid hostname provided" in result


@pytest.mark.asyncio
async def test_observatory_scan_timeout():
    """Test timeout handling."""
    # Create mock session that raises timeout
    mock_session = AsyncMock()
    mock_session.post = MagicMock(side_effect=asyncio.TimeoutError())
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "slow-domain.com"})

    # Verify timeout error message
    assert "Observatory API Error" in result
    assert "Request timed out for 'slow-domain.com'" in result
    assert "high load" in result


@pytest.mark.asyncio
async def test_observatory_scan_general_exception():
    """Test handling of general exceptions."""
    # Create mock session that raises a general exception
    mock_session = AsyncMock()
    mock_session.post = MagicMock(side_effect=Exception("Network error"))
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "error-domain.com"})

    # Verify error message
    assert "Observatory API Error for 'error-domain.com'" in result
    assert "Network error" in result


@pytest.mark.asyncio
async def test_observatory_scan_api_parameters():
    """Test that correct parameters are sent to the API."""
    # Mock response data
    mock_response_data = {
        "id": 123,
        "grade": "A+",
        "score": 95,
        "tests_failed": 0,
        "tests_passed": 10,
        "tests_quantity": 10,
        "status_code": 200,
        "details_url": "https://example.com/report",
        "scanned_at": "2025-11-15T13:08:33.700Z"
    }

    # Create mock response
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_response_data)
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=None)

    # Create mock session
    mock_session = AsyncMock()
    mock_session.post = MagicMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "mozilla.org"})

    # Verify the API was called with correct parameters
    mock_session.post.assert_called_once()
    call_args = mock_session.post.call_args
    assert call_args[0][0] == "https://observatory-api.mdn.mozilla.net/api/v2/scan"
    assert call_args[1]["params"]["host"] == "mozilla.org"
    assert call_args[1]["headers"]["Content-Type"] == "application/x-www-form-urlencoded"

    # Verify successful result formatting
    assert "Grade: A+" in result
    assert "Score: 95/100" in result


@pytest.mark.asyncio
async def test_observatory_scan_response_formatting():
    """Test that all response fields are properly formatted in the output."""
    # Mock response with all fields
    mock_response_data = {
        "id": 12345,
        "details_url": "https://developer.mozilla.org/en-US/observatory/analyze?host=test.com",
        "algorithm_version": 4,
        "scanned_at": "2025-11-15T10:30:00.000Z",
        "error": None,
        "grade": "B+",
        "score": 80,
        "status_code": 200,
        "tests_failed": 2,
        "tests_passed": 8,
        "tests_quantity": 10
    }

    # Create mock response
    mock_response = AsyncMock()
    mock_response.status = 200
    mock_response.json = AsyncMock(return_value=mock_response_data)
    mock_response.__aenter__ = AsyncMock(return_value=mock_response)
    mock_response.__aexit__ = AsyncMock(return_value=None)

    # Create mock session
    mock_session = AsyncMock()
    mock_session.post = MagicMock(return_value=mock_response)
    mock_session.__aenter__ = AsyncMock(return_value=mock_session)
    mock_session.__aexit__ = AsyncMock(return_value=None)

    # Patch aiohttp.ClientSession
    with patch('aiohttp.ClientSession', return_value=mock_session):
        result = await observatory_scan.ainvoke({"domain": "test.com"})

    # Verify all fields are present in output
    assert "Scan ID: 12345" in result
    assert "Grade: B+" in result
    assert "Score: 80/100" in result
    assert "HTTP Status: 200" in result
    assert "Tests Passed: 8" in result
    assert "Tests Failed: 2" in result
    assert "Total Tests: 10" in result
    assert "Scanned At: 2025-11-15T10:30:00.000Z" in result
    assert "https://developer.mozilla.org/en-US/observatory/analyze?host=test.com" in result
    assert "For detailed per-test breakdowns" in result
