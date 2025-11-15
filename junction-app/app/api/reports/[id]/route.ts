import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json({ error: "Report ID is required" }, { status: 400 });
    }

    console.log("Fetching report for ID:", id);

    // Fetch report from cache collection
    const cacheDoc = await adminDb
      .collection("cache")
      .doc(id.toLowerCase())
      .get();

    console.log("Cache doc exists:", cacheDoc.exists);

    if (!cacheDoc.exists) {
      return Response.json(
        { error: "Report not found", id: id.toLowerCase() },
        { status: 404 },
      );
    }

    const data = cacheDoc.data();

    return Response.json({
      cached_at: data?.cached_at || null,
      query: data?.query || id,
      report: data?.report || {},
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
