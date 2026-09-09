import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiNotFound,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: {
        answers: true,
        test: {
          include: {
            testSeries: true,
            testQuestions: {
              include: {
                question: {
                  include: {
                    options: {
                      orderBy: { orderIndex: "asc" },
                    },
                  },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!attempt) {
      return apiNotFound("Test attempt not found");
    }

    if (attempt.userId !== session.id && session.role !== "ADMIN") {
      return apiError("Unauthorized access to this test attempt", 403);
    }

    return apiSuccess(attempt);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve attempt", 500);
  }
}
