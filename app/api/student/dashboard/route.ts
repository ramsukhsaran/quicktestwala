import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getStudentDashboardStats, getUserById } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const [stats, user] = await Promise.all([
      getStudentDashboardStats(session.id),
      getUserById(session.id),
    ]);

    return apiSuccess({
      stats,
      student: {
        id: user?.id || session.id,
        name: user?.name || session.name,
        email: user?.email || session.email,
        targetExam: user?.profile?.targetExam || "SSC CGL 2026",
      },
    });
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve student dashboard stats", 500);
  }
}
