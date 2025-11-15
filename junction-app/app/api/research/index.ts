// when the user enters something we need to do the following:
// we need to forward the message to an LLM to extract the primary entity
// we then need to similarity match that entity to a list of our firestore entities
// if a firestore entity is found, the client should then redirect to that entity page
// if no firestore entity is found, then we should trigger the deep_security endpoint
// we should then redirect the user to the reports page while we wait the result

import { ai } from "@/lib/gemini";

export async function POST(request: Request) {
  const { message } = await request.json();

  const entity = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
    You are a helpful assistant that extracts the primary entity from a message.
    In this case the primary entity is expected to be a software or tool that our user wants to know is safe or not.
    The message is: ${message}
    Using just the entity, return the name of the primary entity.
    `,
  });

  // fuzzy match the entity to a list of our firestore entities
  const firestoreEntities = await firestore.collection("entities").get();
  const entities = firestoreEntities.docs.map((doc) => doc.data());
  const matchedEntity = entities.find((entity) => entity.name === entity);

  if (matchedEntity) {
    return Response.json({ entity: matchedEntity.name });
  }

  // since no entity was found, we should then call the deep_security endpoint
  const deepSecurityResponse = await fetch(
    `${process.env.DEEP_SECURITY_API_URL}/api/v1/entities:check`,
    {
      method: "POST",
      body: JSON.stringify({ entity: entity.text }),
    }
  );

  const deepSecurityData = await deepSecurityResponse.json();
  return Response.json(deepSecurityData);
}
