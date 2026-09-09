import { requireAdmin } from "@/lib/auth/session";
import { getAllStudents } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function GET() {
  try {
    await requireAdmin();
    const students = await getAllStudents();
    return apiSuccess(students);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to retrieve students", 500);
  }
}
