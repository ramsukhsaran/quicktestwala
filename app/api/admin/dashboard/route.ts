import { requireAdmin } from "@/lib/auth/session";
import { getAdminDashboardStats } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminDashboardStats();
    return apiSuccess(stats);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to retrieve admin dashboard stats", 500);
  }
}
