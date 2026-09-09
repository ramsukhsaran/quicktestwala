import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getTestsForStudent } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const url = new URL(req.url);
    const seriesId = url.searchParams.get("seriesId") || undefined;

    const tests = await getTestsForStudent({ seriesId });
    return apiSuccess(tests);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve student tests", 500);
  }
}
