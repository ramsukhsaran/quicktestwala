import { apiClient } from "./client";
import { ApiResponse } from "./response";

/**
 * Centralized API Service Layer
 * Wraps apiClient to provide structured, typed methods for all platform REST endpoints.
 */

// -------------------------------------------------------------
// QUESTION BANK SERVICE
// -------------------------------------------------------------
export const questionsApi = {
  list: (params?: {
    subject?: string;
    difficulty?: string;
    search?: string;
    stats?: boolean;
  }) => apiClient.get<any>("/api/questions", params),

  get: (id: string) => apiClient.get<any>(`/api/questions/${id}`),

  create: (data: any) => apiClient.post<any>("/api/questions", data),

  update: (id: string, data: any) => apiClient.put<any>(`/api/questions/${id}`, data),

  delete: (id: string) => apiClient.delete<any>(`/api/questions/${id}`),

  bulkImport: (payload: { rows?: any[]; questions?: any[] }) =>
    apiClient.post<any>("/api/questions/bulk", payload),
};

// -------------------------------------------------------------
// TEST SERIES SERVICE
// -------------------------------------------------------------
export const testSeriesApi = {
  list: (params?: {
    categoryId?: string;
    difficulty?: string;
    search?: string;
  }) => apiClient.get<any[]>("/api/test-series", params),

  get: (id: string) => apiClient.get<any>(`/api/test-series/${id}`),

  create: (data: any) => apiClient.post<any>("/api/test-series", data),

  update: (id: string, data: any) => apiClient.put<any>(`/api/test-series/${id}`, data),

  delete: (id: string) => apiClient.delete<any>(`/api/test-series/${id}`),
};

// -------------------------------------------------------------
// MOCK TESTS & QUESTION LINKING SERVICE
// -------------------------------------------------------------
export const testsApi = {
  list: (params?: { seriesId?: string; status?: string }) =>
    apiClient.get<any[]>("/api/tests", params),

  get: (id: string) => apiClient.get<any>(`/api/tests/${id}`),

  create: (data: any) => apiClient.post<any>("/api/tests", data),

  update: (id: string, data: any) => apiClient.put<any>(`/api/tests/${id}`, data),

  delete: (id: string) => apiClient.delete<any>(`/api/tests/${id}`),

  getQuestions: (testId: string) =>
    apiClient.get<any>(`/api/tests/${testId}/questions`),

  linkQuestions: (testId: string, questionIds: string[], sectionName?: string) =>
    apiClient.post<any>(`/api/tests/${testId}/questions`, { questionIds, sectionName }),

  unlinkQuestion: (testId: string, questionId: string) =>
    apiClient.delete<any>(`/api/tests/${testId}/questions`, { questionId }),

  getExportData: (testId: string) =>
    apiClient.get<any>(`/api/student/tests/${testId}/export`),
};

// -------------------------------------------------------------
// STUDENT PORTAL SERVICE
// -------------------------------------------------------------
export const studentApi = {
  getDashboard: () => apiClient.get<any>("/api/student/dashboard"),

  getProfile: () => apiClient.get<any>("/api/student/profile"),

  updateProfile: (data: {
    name?: string;
    phone?: string;
    targetExam?: string;
    state?: string;
    education?: string;
  }) => apiClient.put<any>("/api/student/profile", data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiClient.post<any>("/api/student/password", data),

  getAvailableTests: (params?: { seriesId?: string }) =>
    apiClient.get<any[]>("/api/student/tests", params),

  getBookmarks: () => apiClient.get<any[]>("/api/student/bookmarks"),

  toggleBookmark: (questionId: string, notes?: string) =>
    apiClient.post<any>("/api/student/bookmarks", { questionId, notes }),

  getOrders: () => apiClient.get<any[]>("/api/student/orders"),
};

// -------------------------------------------------------------
// CBT EXAMINATION & ATTEMPTS SERVICE
// -------------------------------------------------------------
export const attemptsApi = {
  start: (testId: string) =>
    apiClient.post<any>("/api/attempts/start", { testId }),

  get: (attemptId: string) =>
    apiClient.get<any>(`/api/attempts/${attemptId}`),

  saveAnswer: (
    attemptId: string,
    data: {
      questionId: string;
      selectedOptionIds?: string[];
      numericalAnswer?: string;
      isMarkedForReview?: boolean;
      isVisited?: boolean;
      timeSpentSeconds?: number;
      remainingTimeSeconds?: number;
    }
  ) => apiClient.post<any>(`/api/attempts/${attemptId}/answer`, data),

  submit: (attemptId: string, isAutoSubmit: boolean = false) =>
    apiClient.post<any>(`/api/attempts/${attemptId}/submit`, { isAutoSubmit }),

  getResult: (attemptId: string) =>
    apiClient.get<any>(`/api/attempts/${attemptId}/result`),
};

// -------------------------------------------------------------
// ADMIN MANAGEMENT SERVICE
// -------------------------------------------------------------
export const adminApi = {
  getDashboard: () => apiClient.get<any>("/api/admin/dashboard"),

  getStudents: (params?: { search?: string; status?: string }) =>
    apiClient.get<any[]>("/api/admin/students", params),

  updateStudentStatus: (studentId: string, status: "ACTIVE" | "BLOCKED") =>
    apiClient.patch<any>(`/api/admin/students/${studentId}/status`, { status }),
};

// Export consolidated object as default and named
export const api = {
  questions: questionsApi,
  testSeries: testSeriesApi,
  tests: testsApi,
  student: studentApi,
  attempts: attemptsApi,
  admin: adminApi,
};

export default api;
