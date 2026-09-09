import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { verifyStudentTestExportAccess } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const access = await verifyStudentTestExportAccess(session.id, id);

    if (!access.allowed) {
      if (access.reason === "TEST_NOT_FOUND") {
        return apiNotFound("Mock test not found");
      }
      if (access.reason === "NOT_SUBSCRIBED") {
        return apiForbidden(
          "Subscription required: You must be subscribed to this Test Series to download test questions in PDF format."
        );
      }
      if (access.reason === "NOT_ATTEMPTED") {
        return apiForbidden(
          "Test attempt required: You must attempt and submit this mock test at least once before downloading the question paper & solutions PDF."
        );
      }
      return apiForbidden("You do not have permission to export this test.");
    }

    return apiSuccess({
      test: access.test,
      attempt: access.attempt,
      allowed: true,
    });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden(err.message);
    return apiError(err.message || "Failed to process test export verification", 500);
  }
}
