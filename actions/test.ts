"use server";

import { requireAuth } from "@/lib/auth/session";
import {
  saveAttemptAnswer,
  submitTestAttempt,
} from "@/lib/data/store";

export async function saveAnswerAction(data: {
  attemptId: string;
  questionId: string;
  selectedOptionIds?: string[];
  numericalAnswer?: string;
  isMarkedForReview?: boolean;
  isVisited?: boolean;
  timeSpentSeconds?: number;
  remainingTimeSeconds?: number;
}) {
  try {
    await requireAuth();
    await saveAttemptAnswer(data);
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to save answer" };
  }
}

export async function submitTestAction(data: {
  attemptId: string;
  isAutoSubmit?: boolean;
}) {
  try {
    await requireAuth();
    const result = await submitTestAttempt(data.attemptId, data.isAutoSubmit);
    return { success: true, attemptId: result.id };
  } catch (err: any) {
    return { error: err.message || "Failed to submit test" };
  }
}
