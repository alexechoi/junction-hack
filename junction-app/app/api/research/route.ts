// when the user enters something we need to do the following:
// we need to forward the message to an LLM to extract the primary entity
// we then need to similarity match that entity to a list of our firestore entities
// if a firestore entity is found, the client should then redirect to that entity page
// if no firestore entity is found, then we should trigger the deep_security endpoint
// we should then redirect the user to the reports page while we wait the result

import { ai } from "@/lib/gemini";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message is required and must be a string" },
        { status: 400 },
      );
    }

    // Step 1: Extract the primary entity or detect hash using Gemini
    const entityExtractionPrompt = `You are a helpful assistant that extracts the primary entity from a message or detects file hashes.

Message: ${message}

Instructions:
- First, check if the message is a file hash (SHA-256, SHA-1, or MD5):
  * SHA-256: exactly 64 hexadecimal characters (0-9, a-f, A-F)
  * SHA-1: exactly 40 hexadecimal characters (0-9, a-f, A-F)
  * MD5: exactly 32 hexadecimal characters (0-9, a-f, A-F)
- If the message is a hash, return it EXACTLY as provided, without any modifications
- If the message is NOT a hash, extract the primary software/tool/package/library name
- Extract ONLY the name of the primary software/tool/package
- Return ONLY the entity name or hash, nothing else
- If multiple entities are mentioned, return the primary one
- Do not include version numbers, descriptions, or explanations

Entity name or hash:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: entityExtractionPrompt,
    });

    if (!result.text) {
      return Response.json(
        { error: "Could not extract entity from message" },
        { status: 400 },
      );
    }

    const entityName = result.text.trim();

    if (!entityName) {
      return Response.json(
        { error: "Could not extract entity from message" },
        { status: 400 },
      );
    }

    // Step 2: Check if the report already exists in cache
    const entityNameLower = entityName.toLowerCase();
    const cacheCollection = adminDb.collection("cache");
    const directCacheDoc = await cacheCollection.doc(entityNameLower).get();

    if (directCacheDoc.exists) {
      const cachedData = directCacheDoc.data();
      return Response.json({
        found: true,
        reportId: directCacheDoc.id,
        cachedAt: cachedData?.cached_at || null,
        entityName,
      });
    }

    // Step 3: Query Firestore entities for case-insensitive fuzzy match
    const entitiesRef = adminDb.collection("entities");
    const snapshot = await entitiesRef.get();

    let matchedEntity: Record<string, any> | null = null;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const storedName = data.name?.toLowerCase() || "";

      // Exact match
      if (storedName === entityNameLower) {
        matchedEntity = { id: doc.id, ...data };
        break;
      }

      // Fuzzy match: check if one contains the other
      if (
        storedName.includes(entityNameLower) ||
        entityNameLower.includes(storedName)
      ) {
        matchedEntity = { id: doc.id, ...data };
        break;
      }
    }

    // Step 4: If entity maps to a cached report, return it
    if (matchedEntity) {
      const possibleCacheIds = [
        matchedEntity.cacheId,
        matchedEntity.cache_id,
        matchedEntity.cacheDocId,
        matchedEntity.cache_doc_id,
        matchedEntity.id,
        matchedEntity.name,
      ]
        .filter(Boolean)
        .map((value: string) => value.toLowerCase());

      for (const cacheId of possibleCacheIds) {
        const cacheDoc = await cacheCollection.doc(cacheId).get();
        if (cacheDoc.exists) {
          const cachedData = cacheDoc.data();
          return Response.json({
            found: true,
            reportId: cacheDoc.id,
            cachedAt: cachedData?.cached_at || null,
            entityName,
            entity: matchedEntity,
          });
        }
      }
    }

    // Step 5: Entity not found in cache, return entity name for client to trigger deep_security
    // The client will call the deep_security endpoint
    return Response.json({
      found: false,
      entityName,
    });
  } catch (error) {
    console.error("Research endpoint error:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
