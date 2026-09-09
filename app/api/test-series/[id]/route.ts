import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  getTestSeriesById,
  getTestSeriesBySlug,
  updateTestSeries,
  deleteTestSeries,
} from "@/lib/data/store";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let series = await getTestSeriesById(id);
    if (!series) {
      series = await getTestSeriesBySlug(id);
    }

    if (!series) {
      return apiNotFound("Test series not found");
    }

    return apiSuccess(series);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve test series", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateTestSeries(id, body);
    if (!updated) {
      return apiNotFound("Test series not found for update");
    }

    return apiSuccess(updated, "Test series updated successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to update test series", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await deleteTestSeries(id);
    return apiSuccess({ id }, "Test series deleted successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to delete test series", 400);
  }
}
