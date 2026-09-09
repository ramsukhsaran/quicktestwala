import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MarkingConfig = {
  marksPerQuestion: number;
  negativeMarkingRate: number;
  totalMarks: number;
};

type TestAppState = {
  tests: Array<{
    id: string;
    title: string;
    marksPerQuestion: number;
    negativeMarkingRate: number;
    totalMarks: number;
  }>;
  selectedTestId: string | null;
  defaultMarking: MarkingConfig;
};

const initialState: TestAppState = {
  tests: [],
  selectedTestId: null,
  defaultMarking: {
    marksPerQuestion: 0,
    negativeMarkingRate: 0,
    totalMarks: 0,
  },
};

const testAppSlice = createSlice({
  name: "testApp",
  initialState,
  reducers: {
    setTests: (
      state,
      action: PayloadAction<Array<{
        id: string;
        title: string;
        marksPerQuestion: number;
        negativeMarkingRate: number;
        totalMarks: number;
      }>>,
    ) => {
      state.tests = action.payload;
      if (action.payload.length > 0 && !state.selectedTestId) {
        state.selectedTestId = action.payload[0].id;
      }

      const firstTest = action.payload[0];
      if (firstTest) {
        state.defaultMarking = {
          marksPerQuestion: firstTest.marksPerQuestion,
          negativeMarkingRate: firstTest.negativeMarkingRate,
          totalMarks: firstTest.totalMarks,
        };
      }
    },
    setSelectedTestId: (state, action: PayloadAction<string | null>) => {
      state.selectedTestId = action.payload;
      const selectedTest = state.tests.find((test) => test.id === action.payload);
      if (selectedTest) {
        state.defaultMarking = {
          marksPerQuestion: selectedTest.marksPerQuestion,
          negativeMarkingRate: selectedTest.negativeMarkingRate,
          totalMarks: selectedTest.totalMarks,
        };
      }
    },
    updateDefaultMarking: (state, action: PayloadAction<Partial<MarkingConfig>>) => {
      state.defaultMarking = {
        ...state.defaultMarking,
        ...action.payload,
      };
    },
  },
});

export const { setTests, setSelectedTestId, updateDefaultMarking } = testAppSlice.actions;
export default testAppSlice.reducer;
