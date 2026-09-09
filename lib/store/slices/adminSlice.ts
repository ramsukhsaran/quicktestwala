import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

export interface QuestionBankFilters {
  category: string;
  subject: string;
  difficulty: string;
  search: string;
}

export interface BulkImportState {
  isParsing: boolean;
  isImporting: boolean;
  totalRows: number;
  validCount: number;
  invalidCount: number;
}

export interface AdminState {
  activeTab: string;
  questionFilters: QuestionBankFilters;
  bulkImport: BulkImportState;
  selectedStudentId: string | null;
}

const initialState: AdminState = {
  activeTab: "overview",
  questionFilters: {
    category: "all",
    subject: "all",
    difficulty: "all",
    search: "",
  },
  bulkImport: {
    isParsing: false,
    isImporting: false,
    totalRows: 0,
    validCount: 0,
    invalidCount: 0,
  },
  selectedStudentId: null,
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveAdminTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setQuestionFilter: (
      state,
      action: PayloadAction<Partial<QuestionBankFilters>>
    ) => {
      state.questionFilters = {
        ...state.questionFilters,
        ...action.payload,
      };
    },
    resetQuestionFilters: (state) => {
      state.questionFilters = initialState.questionFilters;
    },
    setBulkImportProgress: (
      state,
      action: PayloadAction<Partial<BulkImportState>>
    ) => {
      state.bulkImport = {
        ...state.bulkImport,
        ...action.payload,
      };
    },
    resetBulkImport: (state) => {
      state.bulkImport = initialState.bulkImport;
    },
    setSelectedStudentId: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentId = action.payload;
    },
  },
});

// Actions
export const {
  setActiveAdminTab,
  setQuestionFilter,
  resetQuestionFilters,
  setBulkImportProgress,
  resetBulkImport,
  setSelectedStudentId,
} = adminSlice.actions;

// Selectors
export const selectAdminState = (state: { admin: AdminState }) => state.admin;
export const selectActiveAdminTab = createSelector(
  [selectAdminState],
  (admin) => admin.activeTab
);
export const selectQuestionFilters = createSelector(
  [selectAdminState],
  (admin) => admin.questionFilters
);
export const selectBulkImportState = createSelector(
  [selectAdminState],
  (admin) => admin.bulkImport
);
export const selectSelectedStudentId = createSelector(
  [selectAdminState],
  (admin) => admin.selectedStudentId
);

export default adminSlice.reducer;
