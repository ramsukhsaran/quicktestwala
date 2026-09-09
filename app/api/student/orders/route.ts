import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function GET() {
  try {
    const session = await requireAuth();
    const orders = await getUserOrders(session.id);
    return apiSuccess(orders);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve student orders", 500);
  }
}
