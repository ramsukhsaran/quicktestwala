import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";

export interface TestSeriesFilters {
  category: string | null;
  difficulty: string | null;
  searchQuery: string;
  sortBy: "popular" | "price-asc" | "price-desc" | "tests-count";
}

export interface TestSeriesState {
  filters: TestSeriesFilters;
  viewMode: "grid" | "list";
  selectedSeriesId: string | null;
}

const initialState: TestSeriesState = {
  filters: {
    category: null,
    difficulty: null,
    searchQuery: "",
    sortBy: "popular",
  },
  viewMode: "grid",
  selectedSeriesId: null,
};

export const testSeriesSlice = createSlice({
  name: "testSeries",
  initialState,
  reducers: {
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setDifficultyFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.difficulty = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<"popular" | "price-asc" | "price-desc" | "tests-count">
    ) => {
      state.filters.sortBy = action.payload;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    setSelectedSeriesId: (state, action: PayloadAction<string | null>) => {
      state.selectedSeriesId = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

// Actions
export const {
  setCategoryFilter,
  setDifficultyFilter,
  setSearchQuery,
  setSortBy,
  setViewMode,
  setSelectedSeriesId,
  resetFilters,
} = testSeriesSlice.actions;

// Selectors
export const selectTestSeriesState = (state: { testSeries: TestSeriesState }) => state.testSeries;
export const selectTestSeriesFilters = createSelector(
  [selectTestSeriesState],
  (series) => series.filters
);
export const selectTestSeriesViewMode = createSelector(
  [selectTestSeriesState],
  (series) => series.viewMode
);
export const selectSelectedSeriesId = createSelector(
  [selectTestSeriesState],
  (series) => series.selectedSeriesId
);
export const selectCategoryFilter = createSelector(
  [selectTestSeriesFilters],
  (filters) => filters.category
);
export const selectSearchQuery = createSelector(
  [selectTestSeriesFilters],
  (filters) => filters.searchQuery
);

export default testSeriesSlice.reducer;
