import { ai } from "@/lib/gemini";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { question } = await request.json();

    if (!id) {
      return Response.json({ error: "Report ID is required" }, { status: 400 });
    }

    if (!question || typeof question !== "string") {
      return Response.json(
        { error: "Question is required and must be a string" },
        { status: 400 },
      );
    }

    const cacheDoc = await adminDb
      .collection("cache")
      .doc(id.toLowerCase())
      .get();

    if (!cacheDoc.exists) {
      return Response.json(
        { error: "Report not found", id: id.toLowerCase() },
        { status: 404 },
      );
    }

    const docData = cacheDoc.data();
    const contextPayload = {
      id: cacheDoc.id,
      cached_at: docData?.cached_at ?? null,
      query: docData?.query ?? id,
      report: docData?.report ?? null,
    };

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert security analyst. Rely ONLY on the context provided below when answering the user's question. 
If the context does not contain the requested information, reply exactly with "I don't have information about that in this report." 
Do not speculate, hallucinate, or reference external knowledge. Keep answers to 2-4 concise sentences and reference concrete values from the context when available.

Context (JSON):
${JSON.stringify(contextPayload, null, 2)}

Question: ${question}`,
            },
          ],
        },
      ],
    });

    const answer = result.text?.trim();

    if (!answer) {
      return Response.json(
        { error: "The analyst could not generate an answer." },
        { status: 502 },
      );
    }

    return Response.json({
      answer,
      reportId: cacheDoc.id,
      question,
    });
  } catch (error) {
    console.error("Error answering report question:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
