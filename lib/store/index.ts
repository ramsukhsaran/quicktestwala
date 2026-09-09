// Redux Store & Typed Hooks
export { store, makeStore } from "./store";
export type { RootState, AppDispatch, AppStore } from "./store";
export { useAppDispatch, useAppSelector, useAppStore } from "./hooks";
export { rootReducer } from "./rootReducer";

// Auth Slice
export * from "./slices/authSlice";

// CBT Exam Engine Slice
export * from "./slices/examSlice";

// Test Series Marketplace Slice
export * from "./slices/testSeriesSlice";

// Cart & Orders Slice
export * from "./slices/cartSlice";

// Admin Management Slice
export * from "./slices/adminSlice";

// Global UI Slice
export * from "./slices/uiSlice";

// Legacy Test App Slice (for backward compatibility)
export * from "./testAppSlice";
