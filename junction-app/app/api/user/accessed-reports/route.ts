import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  try {
    const { userId, entityName } = await request.json();

    if (!userId || !entityName) {
      return Response.json(
        { error: "userId and entityName are required" },
        { status: 400 },
      );
    }

    // Get the cached report from the cache collection
    const cacheDoc = await adminDb
      .collection("cache")
      .doc(entityName.toLowerCase())
      .get();

    if (!cacheDoc.exists) {
      return Response.json(
        { error: "Report not found in cache" },
        { status: 404 },
      );
    }

    const cacheData = cacheDoc.data();

    // Add to user's accessed_reports array
    const userRef = adminDb.collection("users").doc(userId);

    await userRef.set(
      {
        accessed_reports: FieldValue.arrayUnion({
          entity_name: entityName.toLowerCase(),
          accessed_at: new Date().toISOString(),
          trust_score: cacheData?.report?.trust_score?.score || null,
          product_name: cacheData?.report?.product_name || entityName,
          vendor: cacheData?.report?.vendor || null,
        }),
      },
      { merge: true },
    );

    return Response.json({
      success: true,
      message: "Accessed report saved successfully",
    });
  } catch (error) {
    console.error("Error saving accessed report:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET endpoint to fetch user's accessed reports
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const userDoc = await adminDb.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return Response.json({
        accessed_reports: [],
      });
    }

    const userData = userDoc.data();
    const accessedReports = userData?.accessed_reports || [];

    // Fetch full report details from cache for each accessed report
    const reportsWithDetails = await Promise.all(
      accessedReports.map(async (access: any) => {
        const cacheDoc = await adminDb
          .collection("cache")
          .doc(access.entity_name)
          .get();

        if (cacheDoc.exists) {
          return {
            ...access,
            report: cacheDoc.data()?.report,
            cached_at: cacheDoc.data()?.cached_at,
          };
        }

        return access;
      }),
    );

    return Response.json({
      accessed_reports: reportsWithDetails,
    });
  } catch (error) {
    console.error("Error fetching accessed reports:", error);
    return Response.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
