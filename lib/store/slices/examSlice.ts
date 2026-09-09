import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

export type PaletteFilterStatus = "all" | "answered" | "unanswered" | "marked" | "notVisited";

export interface QuestionAnswerState {
  selectedOptionIds: string[];
  numericalAnswer: string;
  isMarkedForReview: boolean;
  isVisited: boolean;
  timeSpentSeconds: number;
}

export interface TestMeta {
  id: string;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  negativeMarkingRate: number;
  marksPerQuestion: number;
  totalQuestions: number;
}

export interface ExamState {
  attemptId: string | null;
  testMeta: TestMeta | null;
  sections: string[];
  activeSection: string;
  currentQuestionIndex: number;
  timeLeft: number;
  answers: Record<string, QuestionAnswerState>;
  paletteFilter: PaletteFilterStatus;
  isSubmitting: boolean;
  submitDialogOpen: boolean;
}

const initialState: ExamState = {
  attemptId: null,
  testMeta: null,
  sections: [],
  activeSection: "",
  currentQuestionIndex: 0,
  timeLeft: 0,
  answers: {},
  paletteFilter: "all",
  isSubmitting: false,
  submitDialogOpen: false,
};

export const examSlice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    initializeExam: (
      state,
      action: PayloadAction<{
        attemptId: string;
        testMeta: TestMeta;
        sections: string[];
        initialAnswers?: Record<string, Partial<QuestionAnswerState>>;
        questionIds: string[];
        remainingSeconds?: number;
      }>
    ) => {
      const { attemptId, testMeta, sections, initialAnswers = {}, questionIds, remainingSeconds } =
        action.payload;

      state.attemptId = attemptId;
      state.testMeta = testMeta;
      state.sections = sections.length > 0 ? sections : ["General Section"];
      state.activeSection = state.sections[0];
      state.currentQuestionIndex = 0;
      state.timeLeft =
        typeof remainingSeconds === "number" && remainingSeconds > 0
          ? remainingSeconds
          : testMeta.durationMinutes * 60;
      state.paletteFilter = "all";
      state.isSubmitting = false;
      state.submitDialogOpen = false;

      // Populate base answer map
      const newAnswers: Record<string, QuestionAnswerState> = {};
      questionIds.forEach((qId, idx) => {
        const existing = initialAnswers[qId] || {};
        newAnswers[qId] = {
          selectedOptionIds: existing.selectedOptionIds || [],
          numericalAnswer: existing.numericalAnswer || "",
          isMarkedForReview: existing.isMarkedForReview || false,
          isVisited: existing.isVisited !== undefined ? existing.isVisited : idx === 0,
          timeSpentSeconds: existing.timeSpentSeconds || 0,
        };
      });
      state.answers = newAnswers;
    },

    setActiveSection: (state, action: PayloadAction<string>) => {
      state.activeSection = action.payload;
      state.currentQuestionIndex = 0;
    },

    setCurrentQuestionIndex: (state, action: PayloadAction<number>) => {
      state.currentQuestionIndex = action.payload;
    },

    nextQuestion: (state, action: PayloadAction<{ maxIndex: number }>) => {
      if (state.currentQuestionIndex < action.payload.maxIndex) {
        state.currentQuestionIndex += 1;
      }
    },

    prevQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },

    selectOption: (
      state,
      action: PayloadAction<{
        questionId: string;
        optionId: string;
        isMultiple?: boolean;
      }>
    ) => {
      const { questionId, optionId, isMultiple = false } = action.payload;
      const current = state.answers[questionId];
      if (!current) return;

      current.isVisited = true;
      if (isMultiple) {
        const exists = current.selectedOptionIds.includes(optionId);
        current.selectedOptionIds = exists
          ? current.selectedOptionIds.filter((id) => id !== optionId)
          : [...current.selectedOptionIds, optionId];
      } else {
        current.selectedOptionIds = [optionId];
      }
    },

    setNumericalAnswer: (
      state,
      action: PayloadAction<{ questionId: string; answer: string }>
    ) => {
      const { questionId, answer } = action.payload;
      const current = state.answers[questionId];
      if (!current) return;

      current.isVisited = true;
      current.numericalAnswer = answer;
    },

    clearResponse: (state, action: PayloadAction<{ questionId: string }>) => {
      const current = state.answers[action.payload.questionId];
      if (!current) return;

      current.selectedOptionIds = [];
      current.numericalAnswer = "";
    },

    toggleMarkForReview: (state, action: PayloadAction<{ questionId: string }>) => {
      const current = state.answers[action.payload.questionId];
      if (!current) return;

      current.isVisited = true;
      current.isMarkedForReview = !current.isMarkedForReview;
    },

    markVisited: (state, action: PayloadAction<{ questionId: string }>) => {
      const current = state.answers[action.payload.questionId];
      if (current) {
        current.isVisited = true;
      }
    },

    decrementTimer: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },

    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },

    setPaletteFilter: (state, action: PayloadAction<PaletteFilterStatus>) => {
      state.paletteFilter = action.payload;
    },

    setSubmitDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.submitDialogOpen = action.payload;
    },

    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },

    resetExamState: () => initialState,
  },
});

// Actions
export const {
  initializeExam,
  setActiveSection,
  setCurrentQuestionIndex,
  nextQuestion,
  prevQuestion,
  selectOption,
  setNumericalAnswer,
  clearResponse,
  toggleMarkForReview,
  markVisited,
  decrementTimer,
  setTimeLeft,
  setPaletteFilter,
  setSubmitDialogOpen,
  setSubmitting,
  resetExamState,
} = examSlice.actions;

// Base Selector
export const selectExamState = (state: { exam: ExamState }) => state.exam;

// Memoized Selectors
export const selectTestMeta = createSelector([selectExamState], (exam) => exam.testMeta);
export const selectAttemptId = createSelector([selectExamState], (exam) => exam.attemptId);
export const selectSections = createSelector([selectExamState], (exam) => exam.sections);
export const selectActiveSection = createSelector([selectExamState], (exam) => exam.activeSection);
export const selectCurrentQuestionIndex = createSelector(
  [selectExamState],
  (exam) => exam.currentQuestionIndex
);
export const selectExamTimeLeft = createSelector([selectExamState], (exam) => exam.timeLeft);
export const selectAllAnswers = createSelector([selectExamState], (exam) => exam.answers);
export const selectPaletteFilter = createSelector([selectExamState], (exam) => exam.paletteFilter);
export const selectIsSubmitting = createSelector([selectExamState], (exam) => exam.isSubmitting);
export const selectSubmitDialogOpen = createSelector(
  [selectExamState],
  (exam) => exam.submitDialogOpen
);

// Answer state for a specific question
export const selectQuestionAnswer = (questionId: string) =>
  createSelector([selectAllAnswers], (answers) => answers[questionId] || null);

// Full Question Palette Summary (Answered, Unanswered, Marked, Marked & Answered, Not Visited)
export const selectPaletteSummary = createSelector([selectAllAnswers], (answers) => {
  let answered = 0;
  let unanswered = 0;
  let markedForReview = 0;
  let markedAndAnswered = 0;
  let notVisited = 0;

  Object.values(answers).forEach((ans) => {
    const hasAnswer = ans.selectedOptionIds.length > 0 || ans.numericalAnswer.trim() !== "";
    if (ans.isMarkedForReview) {
      if (hasAnswer) {
        markedAndAnswered += 1;
      } else {
        markedForReview += 1;
      }
    } else if (hasAnswer) {
      answered += 1;
    } else if (ans.isVisited) {
      unanswered += 1;
    } else {
      notVisited += 1;
    }
  });

  const total = Object.keys(answers).length;
  return {
    total,
    answered,
    unanswered,
    markedForReview,
    markedAndAnswered,
    notVisited,
  };
});

export default examSlice.reducer;
