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
        { status: 400 }
      );
    }

    // Step 1: Extract the primary entity using Gemini
    const entityExtractionPrompt = `You are a helpful assistant that extracts the primary entity from a message.
In this case the primary entity is expected to be a software, tool, package, or library that the user wants to know is safe or not.

Message: ${message}

Instructions:
- Extract ONLY the name of the primary software/tool/package
- Return ONLY the entity name, nothing else
- If multiple entities are mentioned, return the primary one
- Do not include version numbers, descriptions, or explanations

Entity name:`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: entityExtractionPrompt,
    });

    if (!result.text) {
      return Response.json(
        { error: "Could not extract entity from message" },
        { status: 400 }
      );
    }

    const entityName = result.text.trim();

    if (!entityName) {
      return Response.json(
        { error: "Could not extract entity from message" },
        { status: 400 }
      );
    }

    // Step 2: Query Firestore for existing entity (case-insensitive fuzzy match)
    const entitiesRef = adminDb.collection("entities");
    const snapshot = await entitiesRef.get();

    let matchedEntity = null;
    const entityNameLower = entityName.toLowerCase();

    // Try exact match first, then fuzzy match
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

    // Step 3: If entity exists, return it
    if (matchedEntity) {
      return Response.json({
        found: true,
        entity: matchedEntity,
        entityName,
      });
    }

    // Step 4: Entity not found, return entity name for client to trigger deep_security
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
      { status: 500 }
    );
  }
}
