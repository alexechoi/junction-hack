"""Firestore cache for storing completed deep research reports."""

import asyncio
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize logging
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
_db: Optional[firestore.Client] = None
_initialization_lock = asyncio.Lock()


def _initialize_firebase_sync() -> Optional[firestore.Client]:
    """Synchronous Firebase initialization helper.

    This function contains the blocking I/O operations and should only
    be called from within asyncio.to_thread().

    Returns:
        Firestore client instance or None if initialization fails.
    """
    global _db

    try:
        # Initialize the Firebase app if not already initialized
        if not firebase_admin._apps:
            # Try to get credentials from environment variable first
            firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

            if firebase_credentials_json:
                # Parse JSON from environment variable
                import json
                credentials_dict = json.loads(firebase_credentials_json)
                cred = credentials.Certificate(credentials_dict)
                logger.info("Firebase credentials loaded from FIREBASE_CREDENTIALS_JSON environment variable")
            else:
                # Fallback to file for local development
                module_dir = Path(__file__).parent
                project_root = module_dir.parent.parent
                credentials_path = project_root / "firebase_key.json"

                if not credentials_path.exists():
                    logger.warning(
                        "Firebase credentials not found. Set FIREBASE_CREDENTIALS_JSON environment variable "
                        f"or provide firebase_key.json at {credentials_path}"
                    )
                    return None

                cred = credentials.Certificate(str(credentials_path))
                logger.info("Firebase credentials loaded from firebase_key.json file")

            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialized successfully")

        _db = firestore.client()
        return _db

    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}", exc_info=True)
        return None


async def _initialize_firebase() -> Optional[firestore.Client]:
    """Initialize Firebase Admin SDK with service account credentials (async).

    Uses asyncio.to_thread() to run blocking I/O operations in a separate thread,
    which is required for LangGraph's async environment.

    Returns:
        Firestore client instance or None if initialization fails.
    """
    global _db

    # Return cached client if already initialized
    if _db is not None:
        return _db

    # Use a lock to prevent multiple concurrent initializations
    async with _initialization_lock:
        # Check again after acquiring lock
        if _db is not None:
            return _db

        # Run the blocking initialization in a separate thread
        _db = await asyncio.to_thread(_initialize_firebase_sync)
        return _db


async def save_to_cache(query: str, report_data: dict) -> bool:
    """Save a completed research report to Firestore cache (async).

    Args:
        query: The original query string (e.g., "slack") used as document ID
        report_data: The full SecurityAssessmentReport as a dictionary

    Returns:
        True if save was successful, False otherwise
    """
    try:
        db = await _initialize_firebase()
        if db is None:
            logger.warning("Firestore not available, skipping cache save")
            return False

        # Prepare the cache document
        cache_doc = {
            "query": query,
            "report": report_data,
            "cached_at": datetime.utcnow().isoformat() + "Z"
        }

        # Save to the "cache" collection using query as document ID
        # Use set() to create or overwrite the document
        # Run the blocking Firestore write in a separate thread
        doc_ref = db.collection("cache").document(query.lower().strip())
        await asyncio.to_thread(doc_ref.set, cache_doc)

        logger.info(f"Successfully cached research report for query: {query}")
        return True

    except Exception as e:
        # Graceful degradation - log error but don't fail the request
        logger.error(f"Failed to save to Firestore cache: {e}", exc_info=True)
        return False


async def get_from_cache(query: str) -> Optional[dict]:
    """Retrieve a cached research report from Firestore (async).

    Args:
        query: The original query string used as document ID

    Returns:
        The cached report data or None if not found/error
    """
    try:
        db = await _initialize_firebase()
        if db is None:
            return None

        doc_ref = db.collection("cache").document(query.lower().strip())
        # Run the blocking Firestore read in a separate thread
        doc = await asyncio.to_thread(doc_ref.get)

        if doc.exists:
            logger.info(f"Cache hit for query: {query}")
            return doc.to_dict()
        else:
            logger.info(f"Cache miss for query: {query}")
            return None

    except Exception as e:
        logger.error(f"Failed to retrieve from Firestore cache: {e}", exc_info=True)
        return None
